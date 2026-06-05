/**
 * ─────────────────────────────────────────────────────────────
 *  User-side server actions
 * ─────────────────────────────────────────────────────────────
 *
 *  All the writes a signed-in visitor can make:
 *   • submitReview         — leave a star rating + body for a tool
 *   • deleteOwnReview      — delete the visitor's own review
 *   • toggleSave           — save/unsave a tool to their library
 *   • subscribeNewsletter  — add an email to the newsletter list
 *
 *  Each guards on `auth()` where appropriate. The newsletter
 *  signup is public — anyone with an email can subscribe.
 * ─────────────────────────────────────────────────────────────
 */

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  tools,
  reviews,
  savedTools,
  newsletterSubscribers,
} from "@/lib/db/schema";
import { limit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("You need to be signed in.");
  return session.user;
}

// ── Submit a review ──────────────────────────────────────────
const ReviewInput = z.object({
  toolId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  role: z.string().max(80).optional(),
  body: z.string().min(20).max(2000),
});

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Auth failed" };
  }

  let input;
  try {
    input = ReviewInput.parse({
      toolId: formData.get("toolId") as string,
      rating: Number(formData.get("rating")),
      role: (formData.get("role") as string) || undefined,
      body: formData.get("body") as string,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
    }
    return { ok: false, error: "Invalid review" };
  }

  try {
    // Upsert — one review per (tool, user). If exists, update body + rating.
    await db
      .insert(reviews)
      .values({
        toolId: input.toolId,
        authorId: user.id,
        rating: input.rating,
        role: input.role ?? null,
        body: input.body,
        status: "approved",
      })
      .onConflictDoUpdate({
        target: [reviews.toolId, reviews.authorId],
        set: {
          rating: input.rating,
          role: input.role ?? null,
          body: input.body,
          status: "approved",
        },
      });

    // Recompute cached counters on the tool
    const [aggs] = await db
      .select({
        n: sql<number>`count(*)::int`,
        avg10: sql<number>`coalesce(round(avg(${reviews.rating}) * 10), 0)::int`,
      })
      .from(reviews)
      .where(and(eq(reviews.toolId, input.toolId), eq(reviews.status, "approved")));

    await db
      .update(tools)
      .set({ reviewCount: aggs?.n ?? 0, avgRating: aggs?.avg10 ?? 0 })
      .where(eq(tools.id, input.toolId));

    // Bust caches
    const [t] = await db.select({ slug: tools.slug }).from(tools).where(eq(tools.id, input.toolId)).limit(1);
    if (t) revalidatePath(`/ai-tool/${t.slug}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not save review: ${msg}` };
  }
}

export async function deleteOwnReview(reviewId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Auth failed" };
  }

  const [row] = await db.select({ id: reviews.id, authorId: reviews.authorId, toolId: reviews.toolId }).from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!row) return { ok: false, error: "Review not found" };
  if (row.authorId !== user.id && user.role !== "admin") {
    return { ok: false, error: "Not your review" };
  }
  await db.delete(reviews).where(eq(reviews.id, reviewId));

  const [t] = await db.select({ slug: tools.slug }).from(tools).where(eq(tools.id, row.toolId)).limit(1);
  if (t) revalidatePath(`/ai-tool/${t.slug}`);
  return { ok: true };
}

// ── Save / unsave a tool ─────────────────────────────────────
export async function toggleSave(toolId: string): Promise<{ ok: true; saved: boolean } | { ok: false; error: string }> {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Auth failed" };
  }

  const [existing] = await db
    .select({ userId: savedTools.userId })
    .from(savedTools)
    .where(and(eq(savedTools.userId, user.id), eq(savedTools.toolId, toolId)))
    .limit(1);

  if (existing) {
    await db.delete(savedTools).where(and(eq(savedTools.userId, user.id), eq(savedTools.toolId, toolId)));
    await db
      .update(tools)
      .set({ saveCount: sql`greatest(${tools.saveCount} - 1, 0)` })
      .where(eq(tools.id, toolId));
    revalidatePath("/saved");
    return { ok: true, saved: false };
  }

  await db.insert(savedTools).values({ userId: user.id, toolId }).onConflictDoNothing();
  await db
    .update(tools)
    .set({ saveCount: sql`${tools.saveCount} + 1` })
    .where(eq(tools.id, toolId));
  revalidatePath("/saved");
  return { ok: true, saved: true };
}

// ── Newsletter subscribe ─────────────────────────────────────
const SubscribeInput = z.object({
  email: z.string().email().max(320),
  source: z.string().max(40).optional(),
});

export type SubscribeResult = { ok: true; alreadySubscribed?: boolean } | { ok: false; error: string };

export async function subscribeNewsletter(formData: FormData): Promise<SubscribeResult> {
  // Rate limit by IP: 5 signups per 10 min kills bulk enumeration.
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? hdrs.get("x-real-ip") ?? "unknown";
  const rl = limit("newsletter-action", ip, 5, 10 * 60 * 1000);
  if (!rl.success) {
    return { ok: false, error: "Too many requests. Try again in a few minutes." };
  }

  // Turnstile bot check (no-op when not configured).
  const turnstileToken = (formData.get("turnstileToken") as string) ?? "";
  const verified = await verifyTurnstile(turnstileToken, ip);
  if (!verified) {
    return { ok: false, error: "Bot check failed. Refresh and retry." };
  }

  let input;
  try {
    input = SubscribeInput.parse({
      email: (formData.get("email") as string)?.toLowerCase().trim() ?? "",
      source: (formData.get("source") as string) || undefined,
    });
  } catch (err) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    const result = await db
      .insert(newsletterSubscribers)
      .values({
        email: input.email,
        source: input.source ?? null,
        confirmToken: crypto.randomUUID(),
        confirmed: false,
      })
      .onConflictDoNothing()
      .returning({ id: newsletterSubscribers.id });

    return { ok: true, alreadySubscribed: result.length === 0 };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not subscribe: ${msg}` };
  }
}

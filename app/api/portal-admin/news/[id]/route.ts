/**
 * Editorial actions on a news_post — change status, edit headline,
 * tweak the draft. Only editors and admins can hit this.
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsPosts, auditLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api";
import type { EditorialDraft } from "@/lib/news";

export const runtime = "nodejs";

const TopicEnum = z.enum(["llm", "image", "video", "code", "audio", "policy", "research", "cybersecurity", "startup"]);

const PatchSchema = z.object({
  status: z.enum(["draft", "review", "approved", "published"]).optional(),
  headline: z.string().min(8).max(300).optional(),
  description: z.string().max(500).optional(),
  tag: z.string().max(60).optional(),
  topic: TopicEnum.optional(),
  categories: z.array(z.string()).optional(),
  breaking: z.boolean().optional(),
  draft: z
    .object({
      seoTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      introduction: z.string().optional(),
      keyHighlights: z.array(z.string()).optional(),
      body: z.string().optional(),
      expertCommentary: z.string().optional(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      internalLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      citations: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    })
    .optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return fail("Sign in required", 401);
  if (session.user.role !== "editor" && session.user.role !== "admin") {
    return fail("Editor role required", 403);
  }

  const body = await parseBody(req, PatchSchema);
  if (body instanceof Response) return body;

  const updates: Partial<typeof newsPosts.$inferInsert> = {};
  const now = new Date();

  if (body.headline) updates.headline = body.headline;
  if (body.description !== undefined) updates.description = body.description;
  if (body.tag !== undefined) updates.tag = body.tag;
  if (body.topic) updates.topic = body.topic;
  if (body.categories) updates.categories = body.categories;
  if (body.breaking !== undefined) updates.breaking = body.breaking;
  if (body.draft) updates.draft = body.draft as EditorialDraft;

  if (body.status) {
    updates.status = body.status;
    if (body.status === "approved") {
      updates.reviewedBy = session.user.id;
      updates.approvedAt = now;
    }
    if (body.status === "published") {
      updates.publishedLiveAt = now;
    }
  }

  try {
    const [updated] = await db
      .update(newsPosts)
      .set(updates)
      .where(eq(newsPosts.id, id))
      .returning({ id: newsPosts.id, status: newsPosts.status });

    if (!updated) return fail("Not found", 404);

    await db.insert(auditLog).values({
      actorId: session.user.id,
      action: `news.${body.status ?? "edit"}`,
      target: `news:${id}`,
      meta: { updates: Object.keys(updates) },
    });

    return ok(updated);
  } catch (e) {
    console.error("[admin/news] db error:", e);
    return fail("Could not update", 500);
  }
}

/** GET /api/portal-admin/news/[id] — fetch a single post for the editor view. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return fail("Sign in required", 401);
  if (session.user.role !== "editor" && session.user.role !== "admin") {
    return fail("Editor role required", 403);
  }
  const row = await db.query.newsPosts.findFirst({ where: eq(newsPosts.id, id) });
  if (!row) return fail("Not found", 404);
  return ok(row);
}

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { ok, fail, parseBody } from "@/lib/api";
import { limit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SubscribeSchema = z.object({
  email: z.string().email().max(320),
  source: z.string().max(40).optional(), // "footer" | "blog-sidebar" | etc.
});

/**
 * POST /api/newsletter — opt-in to the newsletter.
 * Stores unconfirmed; you'd send a double-opt-in confirmation
 * email here (TODO: wire Resend).
 */
export async function POST(req: Request) {
  // 5 signups per 10 min per IP. Generous for legit forms but
  // kills bulk-enumeration attempts.
  const rl = limit("newsletter", clientIp(req), 5, 10 * 60 * 1000);
  if (!rl.success) {
    return fail("Too many requests. Try again in a few minutes.", 429);
  }

  const body = await parseBody(req, SubscribeSchema);
  if (body instanceof Response) return body;

  try {
    const email = body.email.toLowerCase().trim();
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email),
    });
    if (existing) {
      // Idempotent — treat as success.
      return ok({ subscribed: true, alreadySubscribed: true });
    }
    await db.insert(newsletterSubscribers).values({ email, source: body.source });
    // TODO: enqueue confirmation email via Resend
    return ok({ subscribed: true }, { status: 201 });
  } catch (e) {
    console.error("[newsletter] db error:", e);
    return fail("Could not subscribe", 500);
  }
}

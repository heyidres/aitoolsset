import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews, tools } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api";

export const runtime = "nodejs";

const ReviewSchema = z.object({
  toolId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  role: z.string().max(80).optional(),
  body: z.string().min(20).max(4000),
});

/**
 * POST /api/review — leave a review on a tool.
 * One review per user per tool (uniqueIndex enforces).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return fail("Sign in required", 401);

  const body = await parseBody(req, ReviewSchema);
  if (body instanceof Response) return body;

  try {
    await db.insert(reviews).values({
      toolId: body.toolId,
      authorId: session.user.id,
      rating: body.rating,
      role: body.role,
      body: body.body,
    });

    // Recompute aggregate fields on the tool. Cheap enough for now;
    // a trigger or materialised view would scale better.
    const stats = await db
      .select({
        cnt: sql<number>`count(*)::int`,
        avg: sql<number>`round(avg(${reviews.rating}) * 10)::int`,
      })
      .from(reviews)
      .where(eq(reviews.toolId, body.toolId));

    if (stats[0]) {
      await db
        .update(tools)
        .set({ reviewCount: stats[0].cnt, avgRating: stats[0].avg })
        .where(eq(tools.id, body.toolId));
    }
    return ok({ posted: true }, { status: 201 });
  } catch (e) {
    // Unique-violation on uniqueAuthorPerTool → user already reviewed
    const msg = e instanceof Error ? e.message : String(e);
    if (/duplicate key|unique/i.test(msg)) return fail("You already reviewed this tool", 409);
    console.error("[review] db error:", e);
    return fail("Could not post review", 500);
  }
}

/**
 * GET /api/review?toolId=… — list reviews (newest first).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const toolId = url.searchParams.get("toolId");
  if (!toolId) return fail("toolId is required", 400);

  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.toolId, toolId))
    .orderBy(desc(reviews.createdAt))
    .limit(50);
  return ok({ reviews: rows });
}

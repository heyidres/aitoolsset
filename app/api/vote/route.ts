import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { votes, tools } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api";

export const runtime = "nodejs";

const VoteSchema = z.object({
  toolId: z.string().uuid(),
});

/**
 * POST /api/vote — toggles an upvote (value: 1).
 * Body: { toolId }. Returns { voted: boolean }.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return fail("Sign in required", 401);

  const body = await parseBody(req, VoteSchema);
  if (body instanceof Response) return body;

  try {
    const existing = await db.query.votes.findFirst({
      where: and(eq(votes.userId, session.user.id), eq(votes.toolId, body.toolId)),
    });

    if (existing) {
      await db
        .delete(votes)
        .where(and(eq(votes.userId, session.user.id), eq(votes.toolId, body.toolId)));
      await db
        .update(tools)
        .set({ voteCount: sql`${tools.voteCount} - 1` })
        .where(eq(tools.id, body.toolId));
      return ok({ voted: false });
    }

    await db.insert(votes).values({ userId: session.user.id, toolId: body.toolId, value: 1 });
    await db
      .update(tools)
      .set({ voteCount: sql`${tools.voteCount} + 1` })
      .where(eq(tools.id, body.toolId));
    return ok({ voted: true });
  } catch (e) {
    console.error("[vote] db error:", e);
    return fail("Could not toggle vote", 500);
  }
}

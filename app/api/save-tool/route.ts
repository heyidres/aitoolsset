import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { savedTools, tools } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api";

export const runtime = "nodejs";

const SaveSchema = z.object({
  toolId: z.string().uuid(),
});

/**
 * POST /api/save-tool — toggles save state.
 * Body: { toolId }. Returns { saved: boolean }.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return fail("Sign in required", 401);

  const body = await parseBody(req, SaveSchema);
  if (body instanceof Response) return body;

  try {
    const existing = await db.query.savedTools.findFirst({
      where: and(eq(savedTools.userId, session.user.id), eq(savedTools.toolId, body.toolId)),
    });

    if (existing) {
      await db
        .delete(savedTools)
        .where(and(eq(savedTools.userId, session.user.id), eq(savedTools.toolId, body.toolId)));
      await db
        .update(tools)
        .set({ saveCount: sql`${tools.saveCount} - 1` })
        .where(eq(tools.id, body.toolId));
      return ok({ saved: false });
    }

    await db.insert(savedTools).values({ userId: session.user.id, toolId: body.toolId });
    await db
      .update(tools)
      .set({ saveCount: sql`${tools.saveCount} + 1` })
      .where(eq(tools.id, body.toolId));
    return ok({ saved: true });
  } catch (e) {
    console.error("[save-tool] db error:", e);
    return fail("Could not toggle save", 500);
  }
}

/**
 * GET /api/save-tool — list saved toolIds for the signed-in user.
 * Used by the client to hydrate UI on page load.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return ok({ tools: [] });
  const rows = await db
    .select({ toolId: savedTools.toolId })
    .from(savedTools)
    .where(eq(savedTools.userId, session.user.id));
  return ok({ tools: rows.map((r) => r.toolId) });
}

import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api";

export const runtime = "nodejs";

const CommentSchema = z.object({
  /** Resource pointer: "blog:<slug>" or "news:<slug>" */
  resource: z.string().regex(/^(blog|news):[a-z0-9-]+$/),
  body: z.string().min(2).max(4000),
  parentId: z.string().uuid().optional(),
});

/**
 * POST /api/comment — leaves a comment on a blog post or news article.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return fail("Sign in required", 401);

  const body = await parseBody(req, CommentSchema);
  if (body instanceof Response) return body;

  try {
    const [row] = await db
      .insert(comments)
      .values({
        resource: body.resource,
        authorId: session.user.id,
        parentId: body.parentId,
        body: body.body,
      })
      .returning({ id: comments.id });
    return ok({ id: row.id }, { status: 201 });
  } catch (e) {
    console.error("[comment] db error:", e);
    return fail("Could not post comment", 500);
  }
}

/**
 * GET /api/comment?resource=blog:gpt-5-… — list comments oldest-first
 * (so threads read naturally top-down).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (!resource) return fail("resource is required", 400);

  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.resource, resource))
    .orderBy(asc(comments.createdAt))
    .limit(200);
  return ok({ comments: rows });
}

"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsDetectionEvents, newsPosts } from "@/lib/db/schema";
import { logAdmin } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session.user;
}

/**
 * Re-queue the originating detection event so the worker drafts a
 * fresh article on the next /api/cron/news-draft tick.
 *
 * Behavior:
 *  1. Look up the news_post → find the source_hash.
 *  2. Find the matching detection event by url_hash.
 *  3. Reset its status to 'new'.
 *  4. Delete the current news_post (its content was the old draft;
 *     a fresh one will be inserted on regenerate).
 *
 * Audit log entry preserves the old slug for traceability.
 */
export async function regenerateNewsDraft(newsPostId: string) {
  await requireEditor();

  const [post] = await db
    .select()
    .from(newsPosts)
    .where(eq(newsPosts.id, newsPostId))
    .limit(1);
  if (!post) throw new Error("News post not found");

  const [event] = await db
    .select()
    .from(newsDetectionEvents)
    .where(eq(newsDetectionEvents.urlHash, post.sourceHash))
    .limit(1);

  if (event) {
    await db
      .update(newsDetectionEvents)
      .set({ status: "new", newsPostId: null, updatedAt: new Date() })
      .where(eq(newsDetectionEvents.id, event.id));
  }

  await db.delete(newsPosts).where(eq(newsPosts.id, newsPostId));
  await logAdmin("news.regenerate", `news:${newsPostId}`, {
    eventId: event?.id,
    oldSlug: post.slug,
    sourceUrl: post.sourceUrl,
  });

  revalidatePath("/admin/news");
  revalidatePath("/admin/news/pipeline");
}

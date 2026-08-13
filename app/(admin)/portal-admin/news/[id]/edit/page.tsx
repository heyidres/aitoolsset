import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { NewsForm, type NewsFormValues } from "../../NewsForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toFormValues(p: typeof newsPosts.$inferSelect): NewsFormValues {
  return {
    headline: p.headline,
    description: p.description ?? "",
    source: p.source,
    sourceUrl: p.sourceUrl,
    topic: p.topic,
    tag: p.tag ?? "News",
    categories: (p.categories ?? []).join(", "),
    breaking: p.breaking,
    status: p.status,
    publishedAt: p.publishedAt
      ? new Date(p.publishedAt).toISOString().slice(0, 16)
      : "",
    draft: {
      seoTitle: p.draft?.seoTitle ?? "",
      metaDescription: p.draft?.metaDescription ?? "",
      introduction: p.draft?.introduction ?? "",
      keyHighlights: (p.draft?.keyHighlights ?? []).join("\n"),
      body: p.draft?.body ?? "",
      expertCommentary: p.draft?.expertCommentary ?? "",
      faqs: p.draft?.faqs ?? [],
      citations: p.draft?.citations ?? [],
    },
  };
}

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/signin?next=/admin/news/${id}/edit`);
  if (session.user.role !== "editor" && session.user.role !== "admin") {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>
          Editor role required.
        </div>
      </div>
    );
  }

  const post = await db.query.newsPosts.findFirst({ where: eq(newsPosts.id, id) });
  if (!post) notFound();

  return (
    <NewsForm
      mode="edit"
      initial={toFormValues(post)}
      postId={post.id}
      postSlug={post.slug}
    />
  );
}

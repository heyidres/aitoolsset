/**
 * Admin drafts queue — basic. Lists every news_post and lets
 * editors flip status. Real CMS-grade editing (rewrite headline,
 * tweak body, etc.) belongs in a richer UI later.
 */

import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { AdminRow } from "./AdminRow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="max-w-page mx-auto px-9 py-16">
        <h1 className="font-display text-2xl font-extrabold mb-4">Sign in</h1>
        <p style={{ color: "var(--text-2)" }}>
          You need to be signed in as an editor or admin to view this page.
        </p>
        <Link href="/signin" className="font-display text-sm font-bold mt-4 inline-block" style={{ color: "var(--blue)" }}>
          Go to sign-in →
        </Link>
      </main>
    );
  }

  const posts = await db
    .select({
      id: newsPosts.id,
      slug: newsPosts.slug,
      headline: newsPosts.headline,
      source: newsPosts.source,
      sourceDomain: newsPosts.sourceDomain,
      sourceUrl: newsPosts.sourceUrl,
      topic: newsPosts.topic,
      status: newsPosts.status,
      breaking: newsPosts.breaking,
      publishedAt: newsPosts.publishedAt,
      draftedAt: newsPosts.draftedAt,
    })
    .from(newsPosts)
    .orderBy(desc(newsPosts.publishedAt))
    .limit(100);

  const counts = {
    draft: posts.filter((p) => p.status === "draft").length,
    review: posts.filter((p) => p.status === "review").length,
    approved: posts.filter((p) => p.status === "approved").length,
    published: posts.filter((p) => p.status === "published").length,
  };

  return (
    <main className="max-w-page mx-auto px-9 py-12">
      <div className="flex items-baseline justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-1px" }}>
            News editorial queue
          </h1>
          <div className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Signed in as {session.user.email} · {session.user.role}
          </div>
        </div>
        <div className="flex gap-3 text-sm font-bold tnum">
          <span style={{ color: "var(--text-3)" }}>{counts.draft} draft</span>
          <span style={{ color: "#ea580c" }}>{counts.review} in review</span>
          <span style={{ color: "var(--blue)" }}>{counts.approved} approved</span>
          <span style={{ color: "var(--green)" }}>{counts.published} published</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg p-12 text-center" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <div className="text-3xl mb-3">📬</div>
          <div className="font-display text-lg font-extrabold mb-1">Queue is empty</div>
          <div className="text-sm" style={{ color: "var(--text-2)" }}>
            New drafts will appear here as the cron pulls them in.
          </div>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {posts.map((p) => (
            <AdminRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}

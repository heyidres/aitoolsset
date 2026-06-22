/**
 * /blog — public list of published blog posts.
 *
 * Reads from Postgres. When the DB is empty (clean install) the
 * page renders a small empty state explaining how to publish from
 * /admin/blog so it's never blank-and-confusing.
 */

import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getPublishedBlogPosts, type CmsBlogPost } from "@/lib/cms";

export const runtime = "nodejs";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Tools Set Blog — guides, comparisons, and reviews",
  description:
    "Hands-on reviews, head-to-head comparisons, and deep guides covering every major AI tool — written by the team that hand-curates the directory.",
  alternates: { canonical: "https://aitoolsset.com/blog" },
  openGraph: {
    title: "AI Tools Set Blog",
    description: "Hands-on AI tool reviews, comparisons, and guides.",
    url: "https://aitoolsset.com/blog",
  },
};

function fmtDate(d: Date | null | string): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts().catch(() => [] as CmsBlogPost[]);

  return (
    <main>
      <Nav />

      <section className="bg-white px-9 pt-16 pb-12 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto">
          <div
            className="font-display font-bold mb-3"
            style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)" }}
          >
            The AI Tools Set Blog
          </div>
          <h1
            className="font-display font-black mb-3"
            style={{ fontSize: 48, letterSpacing: "-1.5px", lineHeight: 1.05 }}
          >
            Hands-on AI tool reviews, comparisons, and guides.
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 680, lineHeight: 1.6 }}>
            Every post is written after using the tool for at least a week. No syndicated press releases, no AI-generated filler.
          </p>
        </div>
      </section>

      <section className="px-9 py-16 section-pad-x" style={{ background: "var(--cream)" }}>
        <div className="max-w-page mx-auto">
          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-3 gap-7 blog-row-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PostCard({ post }: { post: CmsBlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden bg-white transition-transform hover:-translate-y-[2px]"
      style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="w-full overflow-hidden"
        style={{
          aspectRatio: "1200 / 630",
          background: post.coverImageUrl
            ? `url(${post.coverImageUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--lavender), var(--mint))",
        }}
      >
        {!post.coverImageUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="font-display font-black"
              style={{ fontSize: 32, letterSpacing: "-1px", color: "rgba(0,82,255,.18)" }}
            >
              {post.category}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10.5px] font-bold uppercase tracking-[.06em] px-[8px] py-[3px] rounded-pill"
            style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)" }}
          >
            {post.category}
          </span>
          {post.readMinutes && (
            <span style={{ fontSize: 11.5, color: "var(--text-3)", fontWeight: 600 }}>
              · {post.readMinutes} min read
            </span>
          )}
        </div>
        <h2
          className="font-display font-black mb-2 transition-colors group-hover:text-blue"
          style={{ fontSize: 19, letterSpacing: "-.4px", lineHeight: 1.25 }}
        >
          {post.title}
        </h2>
        {post.deck && (
          <p
            className="mb-4 flex-1"
            style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55 }}
          >
            {post.deck.length > 140 ? post.deck.slice(0, 140) + "…" : post.deck}
          </p>
        )}
        <div
          className="flex items-center gap-3 pt-4 mt-auto"
          style={{ borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--text-3)" }}
        >
          {post.author && (
            <>
              <span style={{ fontWeight: 700, color: "var(--text-2)" }}>{post.author}</span>
              <span style={{ color: "var(--border-2)" }}>·</span>
            </>
          )}
          <span>{fmtDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-lg p-16 text-center bg-white"
      style={{ border: "1px solid var(--border)" }}
    >
      <div style={{ fontSize: 42, marginBottom: 14 }}>📝</div>
      <h2 className="font-display font-extrabold mb-2" style={{ fontSize: 22, letterSpacing: "-.4px" }}>
        No articles published yet
      </h2>
      <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 480, margin: "0 auto 18px" }}>
        Editorial content lands here as you publish it. Head to{" "}
        <Link href="/admin/blog/new" className="underline" style={{ color: "var(--blue)", fontWeight: 700 }}>
          /admin/blog/new
        </Link>{" "}
        to write the first article.
      </p>
    </div>
  );
}

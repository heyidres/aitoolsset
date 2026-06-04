/**
 * /blog/[slug] — public article renderer.
 *
 * Slug routing:
 *  • "gpt-5-complete-guide"  → legacy hardcoded demo article
 *  • anything else           → DB lookup (published posts only)
 *  • neither matches         → 404
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { getBlogPostBySlug, type CmsBlogPost } from "@/lib/cms";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import LegacyGpt5Article, { LEGACY_METADATA } from "./LegacyGpt5Article";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 60;

const LEGACY_SLUG = "gpt-5-complete-guide";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === LEGACY_SLUG) {
    return {
      title: LEGACY_METADATA.title,
      description: LEGACY_METADATA.description,
      openGraph: {
        title: LEGACY_METADATA.title,
        description: LEGACY_METADATA.description,
        type: "article",
        url: `https://aitoolsset.com/blog/${slug}`,
      },
    };
  }
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post || post.status !== "published") return { title: "Article not found" };
  return {
    title: post.seoTitle ?? `${post.title} — AI Tools Set Blog`,
    description: post.seoDescription ?? post.deck ?? undefined,
    openGraph: {
      title: post.title,
      description: post.deck ?? undefined,
      type: "article",
      url: `https://aitoolsset.com/blog/${slug}`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === LEGACY_SLUG) {
    return <LegacyGpt5Article />;
  }

  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post || post.status !== "published") notFound();

  return <CmsPostRenderer post={post} />;
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CmsPostRenderer({ post }: { post: CmsBlogPost }) {
  const author = post.author ?? "AI Tools Set Research Team";
  const initials = author
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main>
      <JsonLd
        data={[
          articleJsonLd({
            slug: post.slug,
            title: post.title,
            description: post.deck ?? post.seoDescription ?? null,
            imageUrl: post.coverImageUrl,
            author: post.author,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <Nav />
      <ReadingProgress />

      <section className="bg-white px-9 pt-12 pb-10 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[760px] mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-[22px] flex-wrap" style={{ color: "var(--text-3)" }}>
            <Link href="/" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>Home</Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <Link href="/blog" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>Blog</Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <span style={{ color: "var(--text-2)" }}>{post.category}</span>
          </nav>

          <div
            className="inline-flex items-center gap-[6px] rounded-pill px-3 py-[5px] font-display text-[11.5px] font-extrabold uppercase tracking-[.07em] mb-4"
            style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)", color: "var(--blue)" }}
          >
            {post.category}
          </div>

          <h1
            className="mb-[18px]"
            style={{
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "clamp(36px, 4.2vw, 52px)",
              fontWeight: 600,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            {post.title}
          </h1>

          {post.deck && (
            <p className="text-lg leading-[1.65] mb-[30px] font-normal" style={{ color: "var(--text-2)" }}>
              {post.deck}
            </p>
          )}

          <div className="flex items-center gap-[14px] flex-wrap">
            <div className="flex items-center gap-[10px]">
              <div
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-display text-sm font-extrabold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}
              >
                {initials}
              </div>
              <div className="flex flex-col">
                <div className="font-display text-sm font-extrabold" style={{ color: "var(--text)" }}>{author}</div>
                <div className="text-xs" style={{ color: "var(--text-3)" }}>AI Tools Set</div>
              </div>
            </div>
            {post.publishedAt && (
              <>
                <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
                <div className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>
                  📅 {fmtDate(post.publishedAt)}
                </div>
              </>
            )}
            {post.readMinutes && (
              <>
                <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
                <div className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>
                  ⏱️ {post.readMinutes} min read
                </div>
              </>
            )}
            {post.views > 0 && (
              <>
                <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
                <div className="text-[13px] font-medium tnum" style={{ color: "var(--text-2)" }}>
                  👁️ {post.views.toLocaleString()} views
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cover image */}
      {post.coverImageUrl && (
        <div className="max-w-[1080px] mx-auto px-9 section-pad-x">
          <div
            className="rounded-lg overflow-hidden mt-8"
            style={{
              aspectRatio: "1200 / 630",
              background: `url(${post.coverImageUrl}) center/cover no-repeat`,
            }}
          />
        </div>
      )}

      {/* Body + sidebar */}
      <section className="px-9 py-14 section-pad-x">
        <div className="max-w-page mx-auto grid grid-cols-[minmax(0,760px)_300px] gap-12 items-start">
          <article className="tool-prose" dangerouslySetInnerHTML={{ __html: post.body }} />
          <BlogSidebar />
        </div>
      </section>

      <Footer />
    </main>
  );
}

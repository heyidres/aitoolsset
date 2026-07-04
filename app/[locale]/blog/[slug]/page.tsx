/**
 * /blog/[slug] — public article renderer.
 *
 * Slug routing:
 *  • "gpt-5-complete-guide"  → legacy hardcoded demo article
 *  • anything else           → DB lookup (published posts only)
 *  • neither matches         → 404
 */

import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogBody } from "@/components/blog/BlogBody";
import { BlogFaqs } from "@/components/blog/BlogFaqs";
import { AuthorByline } from "@/components/blog/AuthorByline";
import { AuthorCards } from "@/components/blog/AuthorCards";
import {
  getBlogPostBySlug,
  getAuthorsBySlugs,
  getAuthorBySlug,
  getToolBySlug,
  type CmsBlogPost,
  type CmsAuthor,
} from "@/lib/cms";
import { JsonLd, articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/json-ld";
import { alternatesFor } from "@/lib/i18n/hreflang";
import { isLocale } from "@/lib/i18n/config";
import LegacyGpt5Article, { LEGACY_METADATA } from "./LegacyGpt5Article";
import { extractToc, extractToolSlugs } from "@/lib/blog-toc";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 60;

const LEGACY_SLUG = "gpt-5-complete-guide";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const alternates = isLocale(locale) ? alternatesFor({ locale, path: `/blog/${slug}` }) : undefined;
    if (slug === LEGACY_SLUG) {
      return {
        title: LEGACY_METADATA.title,
        description: LEGACY_METADATA.description,
        alternates,
        openGraph: {
          title: LEGACY_METADATA.title,
          description: LEGACY_METADATA.description,
          type: "article",
          url: alternates?.canonical ?? `https://aitoolsset.com/blog/${slug}`,
        },
      };
    }
    const post = await getBlogPostBySlug(slug).catch(() => null);
    if (!post || post.status !== "published") return { title: "Article not found" };
    return {
      title: post.seoTitle ?? `${post.title} — AI Tools Set Blog`,
      description: post.seoDescription ?? post.deck ?? undefined,
      alternates,
      openGraph: {
        title: post.title,
        description: post.deck ?? undefined,
        type: "article",
        url: alternates?.canonical ?? `https://aitoolsset.com/blog/${slug}`,
        images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      },
    };
  } catch (err) {
    console.error("[blog/[slug]] generateMetadata failed", err);
    return { title: "AI Tools Set Blog" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === LEGACY_SLUG) {
    return <LegacyGpt5Article />;
  }

  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post || post.status !== "published") notFound();

  // Resolve every author + reviewer in parallel for the rich byline + bio cards.
  const [authors, reviewedBy] = await Promise.all([
    getAuthorsBySlugs(post.authorSlugs).catch(() => []),
    post.reviewedBySlug ? getAuthorBySlug(post.reviewedBySlug).catch(() => null) : Promise.resolve(null),
  ]);

  return <CmsPostRenderer post={post} authors={authors} reviewedBy={reviewedBy} />;
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function CmsPostRenderer({
  post,
  authors,
  reviewedBy,
}: {
  post: CmsBlogPost;
  authors: CmsAuthor[];
  reviewedBy: CmsAuthor | null;
}) {
  // Person JSON-LD URLs for each author — fed into Article author array
  // so Google maps the byline to a verified Person entity.
  const authorJsonLd = authors.map((a) => ({
    "@type": "Person",
    name: a.name,
    url: `https://aitoolsset.com/blog/author/${a.slug}`,
    ...(a.photoUrl ? { image: a.photoUrl } : {}),
    ...(a.role ? { jobTitle: a.role } : {}),
    sameAs: [a.websiteUrl, a.linkedinUrl, a.xUrl, a.githubUrl].filter(Boolean),
  }));

  // Legacy fallback: when no CMS authors are linked, show the free-text byline.
  const legacyAuthorName =
    authors.length === 0 ? (post.author ?? "AI Tools Set Research Team") : null;

  // Per-article sidebar data — parsed from the body HTML on the server:
  //   • toc: every H2/H3 in the article, with an injected anchor id so
  //          the sidebar's click-to-jump and scroll-spy actually work.
  //   • toolsInArticle: tool slugs found in the body (either via
  //          [[tool:slug]] markers or /ai-tool/<slug> links), resolved
  //          to real CmsTool rows for the sidebar card.
  const { toc, htmlWithIds } = extractToc(post.body);
  const referencedSlugs = extractToolSlugs(post.body);
  const referencedTools = (
    await Promise.all(
      referencedSlugs.map((s) => getToolBySlug(s).catch(() => null)),
    )
  )
    .filter((t): t is NonNullable<typeof t> => !!t && t.status === "published")
    .map((t) => ({
      name: t.name,
      domain: t.domain,
      slug: t.slug,
      cat: t.category || (t.categories?.[0] ?? ""),
      verified: t.verified,
      free: t.pricing === "free" || t.pricing === "freemium",
    }));
  const sidebarArticleData = { toc, toolsInArticle: referencedTools };
  // Hand the body html with injected heading ids to the renderer so the
  // sidebar TOC's anchor links can find their targets.
  const postWithTocIds = { ...post, body: htmlWithIds };

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
            ...(authorJsonLd.length > 0 ? { authors: authorJsonLd } : {}),
            ...(reviewedBy
              ? {
                  reviewedBy: {
                    "@type": "Person",
                    name: reviewedBy.name,
                    url: `https://aitoolsset.com/blog/author/${reviewedBy.slug}`,
                  },
                }
              : {}),
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
          ...(post.faqs.length > 0 ? [faqJsonLd(post.faqs.map((f) => ({ q: f.q, a: f.a })))] : []),
        ]}
      />
      <Nav />
      <ReadingProgress />

      {/* HERO — title, deck, byline.  Centered narrow column (760px). */}
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
              fontSize: "clamp(34px, 4.0vw, 48px)",
              fontWeight: 600,
              letterSpacing: "-1px",
              lineHeight: 1.15,
              color: "var(--text)",
            }}
          >
            {post.title}
          </h1>

          {post.deck && (
            <p
              className="mb-[30px]"
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--text-2)",
                fontWeight: 400,
              }}
            >
              {post.deck}
            </p>
          )}

          <div className="flex items-center gap-[14px] flex-wrap">
            {authors.length > 0 ? (
              <AuthorByline authors={authors} reviewedBy={reviewedBy} />
            ) : (
              <LegacyByline name={legacyAuthorName ?? "AI Tools Set"} />
            )}
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

      {/* Cover image — same narrow column to feel centered with the article. */}
      {post.coverImageUrl && (
        <div className="max-w-[860px] mx-auto px-9 section-pad-x">
          <div
            className="rounded-lg overflow-hidden mt-8"
            style={{
              aspectRatio: "1200 / 630",
              background: `url(${post.coverImageUrl}) center/cover no-repeat`,
            }}
          />
        </div>
      )}

      {/* BODY + sidebar — matches the blog-post.html prototype:
          2-col grid (flex-1fr | 320px). Article body capped at 720px and
          justify-self:center so the reading column STILL feels centered
          within its slot, while the sidebar stays pinned on the right. */}
      <section className="px-9 py-14 section-pad-x">
        <div className="blog-layout mx-auto max-w-[1320px]">
          <article className="blog-body-col" style={{ minWidth: 0 }}>
            <BlogBody html={postWithTocIds.body} />
            {post.faqs.length > 0 && <BlogFaqs items={post.faqs} />}
            {(authors.length > 0 || reviewedBy) && (
              <AuthorCards authors={authors} reviewedBy={reviewedBy} />
            )}
          </article>
          <BlogSidebar article={sidebarArticleData} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function LegacyByline({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-[10px]">
      <div
        className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-display text-sm font-extrabold flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}
      >
        {initials}
      </div>
      <div className="flex flex-col">
        <div className="font-display text-sm font-extrabold" style={{ color: "var(--text)" }}>
          {name}
        </div>
        <div className="text-xs" style={{ color: "var(--text-3)" }}>
          AI Tools Set
        </div>
      </div>
    </div>
  );
}

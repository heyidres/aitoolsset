/**
 * Catch-all for CMS-managed site pages — About, Privacy, Terms,
 * Contact, and any other arbitrary slug the editor creates from
 * /admin/pages.
 *
 * Routing precedence in Next.js: every specific route in /app
 * (/blog, /ai-tool, /admin, /api, /ai-tools, etc.) is matched
 * before this catch-all, so it can never shadow a core feature.
 * Slugs that match reserved words (just-in-case defence) get a
 * 404 so the editor is gently nudged to pick a different slug
 * inside the admin form.
 *
 * Lives at the root so /about → app/[slug]/page.tsx, but /blog
 * → app/blog/page.tsx. Marked dynamic so newly published pages
 * are reachable without a redeploy.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getSitePageBySlug, RESERVED_PAGE_SLUGS, type CmsSitePage } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_PAGE_SLUGS.has(slug)) return { title: "Not found" };
  const page = await getSitePageBySlug(slug).catch(() => null);
  if (!page || page.status !== "published") return { title: "Not found" };
  return {
    title: page.seoTitle ?? `${page.title} — AI Tools Set`,
    description: page.seoDescription ?? page.deck ?? undefined,
    openGraph: {
      title: page.title,
      description: page.deck ?? undefined,
      url: `https://aitoolsset.com/${slug}`,
      images: page.coverImageUrl ? [{ url: page.coverImageUrl }] : undefined,
    },
  };
}

export default async function SitePageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED_PAGE_SLUGS.has(slug)) notFound();

  const page = await getSitePageBySlug(slug).catch(() => null);
  if (!page || page.status !== "published") notFound();

  return <SitePageRenderer page={page} />;
}

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SitePageRenderer({ page }: { page: CmsSitePage }) {
  return (
    <main>
      <Nav />

      <section className="bg-white px-9 pt-14 pb-10 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[760px] mx-auto">
          <h1
            className="font-display font-black mb-3"
            style={{
              fontSize: "clamp(32px, 4.4vw, 52px)",
              letterSpacing: "-1.2px",
              lineHeight: 1.05,
              color: "var(--text)",
            }}
          >
            {page.title}
          </h1>
          {page.deck && (
            <p
              className="font-normal"
              style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 680 }}
            >
              {page.deck}
            </p>
          )}
          {page.publishedAt && (
            <div className="mt-5 text-[13px]" style={{ color: "var(--text-3)" }}>
              Last updated {fmtDate(page.publishedAt)}
            </div>
          )}
        </div>
      </section>

      {page.coverImageUrl && (
        <div className="max-w-[1080px] mx-auto px-9 section-pad-x">
          <div
            className="rounded-lg overflow-hidden mt-8"
            style={{
              aspectRatio: "1200 / 630",
              background: `url(${page.coverImageUrl}) center/cover no-repeat`,
            }}
          />
        </div>
      )}

      <section className="px-9 py-14 section-pad-x">
        <div className="max-w-[760px] mx-auto">
          <article className="tool-prose" dangerouslySetInnerHTML={{ __html: page.body }} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

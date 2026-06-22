import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryIntro } from "@/components/category/CategoryIntro";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ComparisonTable } from "@/components/category/ComparisonTable";
import { FaqAccordion } from "@/components/category/FaqAccordion";
import { CategoryOutro } from "@/components/category/CategoryOutro";
import { RelatedCategories } from "@/components/category/RelatedCategories";
import { ALL_CATS } from "@/lib/categories";
import { MARKETING_FAQ_TEXT } from "@/lib/category-detail";
import { getToolsByCategory, getCategoryBySlug, type CmsCategory, type CmsTool } from "@/lib/cms";
import { cmsToolToDetail, cmsToolToLegacy } from "@/lib/cms-adapters";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/json-ld";
import { sanitizeHtml } from "@/lib/sanitize";
import { ToolCard } from "@/components/ToolCard";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 60;

type FoundCategory = {
  name: string;
  slug: string;
  count: number;
  /** Full CMS row when available — null for hardcoded-only categories. */
  cms: CmsCategory | null;
};

async function findCategory(slug: string): Promise<FoundCategory | null> {
  // Prefer the CMS row (it carries all editorial fields). Fall
  // back to the hardcoded ALL_CATS entry for backwards compat
  // until the editor seeds defaults.
  const cms = await getCategoryBySlug(slug).catch((e) => {
    console.error("[findCategory] getCategoryBySlug threw", { slug, err: e });
    return null;
  });
  if (cms) return { name: cms.name, slug: cms.slug, count: 0, cms };
  const hardcoded = ALL_CATS.find((c) => c.slug === slug);
  if (hardcoded) return { name: hardcoded.name, slug: hardcoded.slug, count: hardcoded.count, cms: null };
  return null;
}

export function generateStaticParams() {
  return ALL_CATS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const found = await findCategory(slug);
    if (!found) return { title: "Category not found" };
    const cms = found.cms;
    const title = cms?.seoTitle ?? `Best AI ${found.name} Tools 2026 — Top Tools Reviewed | AI Tools Set`;
    const description =
      cms?.seoDescription ??
      `Discover the best AI ${found.name.toLowerCase()} tools of 2026. Browse hand-picked AI tools. Compare pricing, features, and user reviews.`;
    return {
      title,
      description,
      openGraph: {
        title: cms?.seoTitle ?? `Best AI ${found.name} Tools 2026 | AI Tools Set`,
        description,
        url: `https://aitoolsset.com/ai-tools/${found.slug}`,
        images: cms?.bannerImageUrl ? [{ url: cms.bannerImageUrl }] : undefined,
      },
    };
  } catch (err) {
    // Metadata MUST never throw — if it does Next.js 500s the whole
    // route segment before error.tsx can render. Swallow + log.
    console.error("[ai-tools/[slug]] generateMetadata failed", err);
    return { title: "AI Tools — AI Tools Set" };
  }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findCategory(slug);
  if (!found) notFound();

  // Pull every CMS tool tagged with this category slug. We need
  // BOTH the legacy DetailTool shape (for CategoryBrowser) and
  // the rich Tool shape (for the featured picks rail at the top).
  const cmsTools = await getToolsByCategory(slug).catch(() => [] as CmsTool[]);
  const detailTools = cmsTools.map(cmsToolToDetail);
  const finalCount = cmsTools.length > 0 ? cmsTools.length : found.count;

  // Editor's picks — render at the top in a rich Tool-card rail.
  // featuredToolSlugs is jsonb with default []; be defensive against null/non-array
  // values from older rows or any mid-migration state.
  const rawPicks = found.cms?.featuredToolSlugs;
  const pickSlugs = new Set(Array.isArray(rawPicks) ? rawPicks : []);
  const featuredTools =
    pickSlugs.size > 0
      ? cmsTools.filter((t) => pickSlugs.has(t.slug)).map(cmsToolToLegacy)
      : [];

  const cms = found.cms;
  const hasCustomHero = !!(cms?.heroTitle || cms?.heroSubtitle || cms?.heroEyebrow || cms?.bannerImageUrl);
  const hasIntro = !!cms?.introHtml?.trim();

  // Sanitize once on the server. If DOMPurify throws (rare — happens
  // when jsdom can't init in a constrained runtime), fall back to a
  // plain-text strip so the page still renders.
  let introHtmlSafe = "";
  if (hasIntro && cms?.introHtml) {
    try {
      introHtmlSafe = sanitizeHtml(cms.introHtml);
    } catch (err) {
      console.error("[category page] sanitizeHtml failed", { slug, err });
      introHtmlSafe = cms.introHtml.replace(/<[^>]+>/g, "");
    }
  }

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "AI Tools", url: "/ai-tools" },
            { name: found.name, url: `/ai-tools/${found.slug}` },
          ]),
          faqJsonLd(
            MARKETING_FAQ_TEXT.map((f) => ({
              q: f.q.replace(/marketing/gi, found.name.toLowerCase()),
              a: f.a.replace(/<[^>]+>/g, ""),
            }))
          ),
        ]}
      />
      <Nav />

      {hasCustomHero ? (
        <CustomCategoryHero category={found.name} slug={found.slug} count={finalCount} cms={cms!} />
      ) : (
        <CategoryHero categoryName={found.name} count={finalCount} />
      )}

      {hasIntro ? (
        <section className="px-9 py-14 section-pad-x bg-white" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-[820px] mx-auto">
            <article className="tool-prose" dangerouslySetInnerHTML={{ __html: introHtmlSafe }} />
          </div>
        </section>
      ) : (
        <CategoryIntro categoryName={found.name} count={finalCount} />
      )}

      {/* Editor's picks rail — only when the editor has selected any */}
      {featuredTools.length > 0 && (
        <section className="px-9 py-14 section-pad-x" style={{ background: "var(--cream)" }}>
          <div className="max-w-page mx-auto">
            <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
              <div>
                <div
                  className="font-display font-bold mb-1"
                  style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)" }}
                >
                  ★ Editor&rsquo;s picks
                </div>
                <h2
                  className="font-display font-black"
                  style={{ fontSize: 28, letterSpacing: "-.6px", lineHeight: 1.15 }}
                >
                  Our team&rsquo;s top {found.name.toLowerCase()} tools
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5 search-row-3">
              {featuredTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CategoryBrowser categoryName={found.name} toolsOverride={detailTools} />
      <ComparisonTable categoryName={found.name} />
      <FaqAccordion items={MARKETING_FAQ_TEXT} categoryName={found.name} />
      <CategoryOutro categoryName={found.name} />
      <RelatedCategories />
      <Footer />
    </main>
  );
}

/**
 * Custom dark hero — used when the editor has set any of
 * heroEyebrow / heroTitle / heroSubtitle / bannerImageUrl.
 * Same visual style as CategoryHero but driven from CMS fields.
 */
function CustomCategoryHero({
  category,
  slug,
  count,
  cms,
}: {
  category: string;
  slug: string;
  count: number;
  cms: CmsCategory;
}) {
  const title = cms.heroTitle ?? `Best AI ${category} tools for 2026, ranked & reviewed`;
  const subtitle =
    cms.heroSubtitle ??
    cms.description ??
    `Hand-picked AI ${category.toLowerCase()} software. Every tool below has been tested by our editors.`;
  const eyebrow = cms.heroEyebrow ?? `CATEGORY · ${category.toUpperCase()}`;

  return (
    <section
      className="px-9 pt-14 pb-12 section-pad-x relative overflow-hidden"
      style={{ background: "var(--near-black)" }}
    >
      {cms.bannerImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cms.bannerImageUrl}
          alt=""
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
        />
      )}
      <div className="max-w-page mx-auto relative">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-5 flex-wrap" style={{ color: "rgba(255,255,255,.45)" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,.55)" }}>Home</Link>
          <span style={{ color: "rgba(255,255,255,.3)" }}>›</span>
          <Link href="/ai-tools" style={{ color: "rgba(255,255,255,.55)" }}>AI Tools</Link>
          <span style={{ color: "rgba(255,255,255,.3)" }}>›</span>
          <span style={{ color: "#fff" }}>{category}</span>
        </nav>

        <div
          className="inline-flex items-center gap-[7px] rounded-pill px-3 py-[5px] font-display text-[11.5px] font-extrabold uppercase tracking-[.07em] mb-4"
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)",
            color: "rgba(255,255,255,.75)",
          }}
        >
          {cms.icon ? <span>{cms.icon}</span> : null}
          {eyebrow}
        </div>

        <h1
          className="font-display font-black mb-4 text-white"
          style={{ fontSize: "clamp(36px, 4.6vw, 56px)", letterSpacing: "-1.5px", lineHeight: 1.05, maxWidth: 860 }}
        >
          {title}
        </h1>
        <p className="text-[16px] mb-5 max-w-[680px]" style={{ color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]" style={{ color: "rgba(255,255,255,.55)" }}>
          <span>
            📦 <strong className="tnum" style={{ color: "#fff", fontWeight: 800 }}>{count}</strong> tools listed
          </span>
          <span>·</span>
          <span>
            🔄 Updated{" "}
            <strong style={{ color: "#fff", fontWeight: 800 }}>
              {(() => {
                // Neon HTTP can return timestamps as strings; coerce defensively.
                const d = cms.updatedAt instanceof Date ? cms.updatedAt : new Date(cms.updatedAt as unknown as string);
                return isNaN(d.getTime())
                  ? "recently"
                  : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              })()}
            </strong>
          </span>
        </div>
      </div>
    </section>
  );
}

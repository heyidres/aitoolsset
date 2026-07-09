import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryIntro } from "@/components/category/CategoryIntro";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { FaqAccordion } from "@/components/category/FaqAccordion";
import { CategoryOutro } from "@/components/category/CategoryOutro";
import { RelatedCategories } from "@/components/category/RelatedCategories";
import { ALL_CATS } from "@/lib/categories";
import { getToolsByCategory, getCategoryBySlug, applyCategoryTranslations, type CmsCategory, type CmsTool } from "@/lib/cms";
import { cmsToolToDetail, cmsToolToLegacy } from "@/lib/cms-adapters";
import { computeCategoryStats } from "@/lib/category-stats";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/json-ld";
import { alternatesFor } from "@/lib/i18n/hreflang";
import { isLocale } from "@/lib/i18n/config";
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

async function findCategory(slug: string, locale: string = "en"): Promise<FoundCategory | null> {
  // Prefer the CMS row (it carries all editorial fields). Fall
  // back to the hardcoded ALL_CATS entry for backwards compat
  // until the editor seeds defaults.
  const cmsRaw = await getCategoryBySlug(slug).catch((e) => {
    console.error("[findCategory] getCategoryBySlug threw", { slug, err: e });
    return null;
  });
  if (cmsRaw) {
    // Lazy translate on first /ko/ hit if translation cache is empty.
    let cms = cmsRaw;
    const hasTranslation =
      !!cmsRaw.translations &&
      !!cmsRaw.translations[locale] &&
      Object.keys(cmsRaw.translations[locale] ?? {}).length > 0;
    if (!hasTranslation && locale !== "en") {
      try {
        const { translateCategoryUnauthenticated } = await import("@/app/portal-admin/categories/_translate-actions");
        const result = await translateCategoryUnauthenticated(cmsRaw.id, locale, null);
        if (result.ok) {
          const refreshed = await getCategoryBySlug(slug);
          if (refreshed) cms = refreshed;
        }
      } catch (e) {
        console.error(`[findCategory] lazy translate to ${locale} failed for ${slug}:`, e);
      }
    }
    const localized = applyCategoryTranslations(cms, locale);
    return { name: localized.name, slug: localized.slug, count: 0, cms: localized };
  }
  const hardcoded = ALL_CATS.find((c) => c.slug === slug);
  if (hardcoded) return { name: hardcoded.name, slug: hardcoded.slug, count: hardcoded.count, cms: null };
  return null;
}

export function generateStaticParams() {
  return ALL_CATS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const found = await findCategory(slug);
    if (!found) return { title: "Category not found" };
    const cms = found.cms;
    const year = new Date().getFullYear();
    const title = cms?.seoTitle ?? `Best AI ${found.name} Tools ${year} — Top Tools Reviewed | AI Tools Set`;
    const description =
      cms?.seoDescription ??
      `Discover the best AI ${found.name.toLowerCase()} tools of ${year}. Browse hand-picked AI tools. Compare pricing, features, and user reviews.`;
    const alternates = isLocale(locale)
      ? alternatesFor({ locale, path: `/ai-tools/${found.slug}` })
      : undefined;
    return {
      title,
      description,
      alternates,
      openGraph: {
        title: cms?.seoTitle ?? `Best AI ${found.name} Tools ${year} | AI Tools Set`,
        description,
        url: alternates?.canonical ?? `https://aitoolsset.com/ai-tools/${found.slug}`,
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

export default async function CategoryDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const [found, t] = await Promise.all([findCategory(slug, locale), getTranslations("category_page")]);
  if (!found) notFound();

  const cms = found.cms;

  // Pull every CMS tool tagged with this category slug, then apply the
  // editor's per-tool relevance threshold so loosely-tagged tools (e.g.
  // a general assistant that happens to carry the "code" tag) drop off
  // pages where they don't belong. A tool with no explicit score defaults
  // to 100 (always shown); threshold 0 = show everything.
  const allCmsTools = await getToolsByCategory(slug).catch(() => [] as CmsTool[]);
  const relevance = cms?.toolRelevance ?? {};
  const threshold = cms?.relevanceThreshold ?? 0;
  const cmsTools =
    threshold > 0
      ? allCmsTools.filter((tl) => (relevance[tl.slug] ?? 100) >= threshold)
      : allCmsTools;

  const detailTools = cmsTools.map(cmsToolToDetail);
  const finalCount = cmsTools.length > 0 ? cmsTools.length : found.count;

  // Hero facts + filters + FAQ fallback are derived from the REAL tools in
  // this category. No hardcoded marketing sample content.
  const stats = computeCategoryStats(found.name, cmsTools);
  const facts = stats.facts;

  // FAQ: prefer hand-written CMS FAQs (best AEO); fall back to generated.
  const faqs = cms && cms.faqs.length > 0 ? cms.faqs : stats.faqs;

  // "Last reviewed" footer date — distinct freshness signal from updatedAt.
  const reviewedDate = (() => {
    const d = cms?.lastReviewedAt
      ? cms.lastReviewedAt instanceof Date
        ? cms.lastReviewedAt
        : new Date(cms.lastReviewedAt as unknown as string)
      : null;
    return d && !isNaN(d.getTime())
      ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : null;
  })();

  const updatedLabel = (() => {
    const d = cms?.updatedAt
      ? cms.updatedAt instanceof Date
        ? cms.updatedAt
        : new Date(cms.updatedAt as unknown as string)
      : null;
    return d && !isNaN(d.getTime())
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;
  })();

  // Editor's picks — render at the top in a rich Tool-card rail.
  // featuredToolSlugs is jsonb with default []; be defensive against null/non-array
  // values from older rows or any mid-migration state.
  const rawPicks = cms?.featuredToolSlugs;
  const pickSlugs = new Set(Array.isArray(rawPicks) ? rawPicks : []);
  const featuredTools =
    pickSlugs.size > 0
      ? cmsTools.filter((tl) => pickSlugs.has(tl.slug)).map(cmsToolToLegacy)
      : [];
  // findCategory already applied per-locale overrides via applyCategoryTranslations,
  // so cms.heroTitle etc. are already in the active locale. Honor the CMS overrides
  // in every locale now — auto-translation makes the Korean version content-equivalent.
  const hasCustomHero = !!(cms?.heroTitle || cms?.heroSubtitle || cms?.heroEyebrow || cms?.bannerImageUrl);
  const hasIntro = !!cms?.introHtml?.trim();
  const hasBottom = !!cms?.bottomHtml?.trim();

  // Sanitize both content zones once on the server. If the sanitizer throws
  // (rare), fall back to a plain-text strip so the page still renders.
  const safeHtml = (html: string | null | undefined): string => {
    if (!html) return "";
    try {
      return sanitizeHtml(html);
    } catch (err) {
      console.error("[category page] sanitizeHtml failed", { slug, err });
      return html.replace(/<[^>]+>/g, "");
    }
  };
  const introHtmlSafe = hasIntro ? safeHtml(cms?.introHtml) : "";
  const bottomHtmlSafe = hasBottom ? safeHtml(cms?.bottomHtml) : "";

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "AI Tools", url: "/ai-tools" },
            { name: found.name, url: `/ai-tools/${found.slug}` },
          ]),
          ...(faqs.length > 0
            ? [
                faqJsonLd(
                  faqs.map((f) => ({
                    q: f.q,
                    a: f.a.replace(/\*\*/g, "").replace(/<[^>]+>/g, ""),
                  }))
                ),
              ]
            : []),
        ]}
      />
      <Nav />

      {hasCustomHero ? (
        <CustomCategoryHero category={found.name} count={finalCount} cms={cms!} facts={facts} avgRating={stats.avgRating} />
      ) : (
        <CategoryHero
          categoryName={found.name}
          count={finalCount}
          facts={facts}
          avgRating={stats.avgRating}
          updatedLabel={updatedLabel}
        />
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
                  {t("editors_pick_eyebrow")}
                </div>
                <h2
                  className="font-display font-black"
                  style={{ fontSize: 28, letterSpacing: "-.6px", lineHeight: 1.15 }}
                >
                  {t("editors_pick_heading", { nameLower: found.name.toLowerCase() })}
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

      <CategoryBrowser
        categoryName={found.name}
        toolsOverride={detailTools}
        subFacets={stats.subFacets}
        popularTags={stats.popularTags}
        pricingCounts={stats.pricingCounts}
        topTool={stats.topTool}
      />

      {/* BOTTOM CONTENT — the main editorial article below the tools grid
          (Futurepedia-style). Editor-authored rich text; falls back to the
          generic outro when empty so the page is never bare. */}
      {hasBottom ? (
        <section className="px-9 py-14 section-pad-x bg-white" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="max-w-[820px] mx-auto">
            <article className="tool-prose" dangerouslySetInnerHTML={{ __html: bottomHtmlSafe }} />
          </div>
        </section>
      ) : (
        <CategoryOutro categoryName={found.name} />
      )}

      <FaqAccordion items={faqs} categoryName={found.name} />

      <RelatedCategories />

      {reviewedDate && (
        <div className="px-9 py-6 section-pad-x bg-white" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="max-w-[1320px] mx-auto text-[12.5px]" style={{ color: "var(--text-3)" }}>
            ✓ Last reviewed by the AI Tools Set editorial team on{" "}
            <strong style={{ color: "var(--text-2)" }}>{reviewedDate}</strong>.
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

/**
 * Custom dark hero — used when the editor has set any of
 * heroEyebrow / heroTitle / heroSubtitle / bannerImageUrl.
 *
 * Matches the default CategoryHero exactly: pink eyebrow pill, a
 * gradient-accent headline, and the "AT A GLANCE" facts side box —
 * so setting a custom title keeps the premium two-column look instead
 * of dropping to a plain white heading with no stats panel.
 */
function CustomCategoryHero({
  category,
  count,
  cms,
  facts,
  avgRating,
}: {
  category: string;
  count: number;
  cms: CmsCategory;
  facts: Array<{ label: string; val: string }>;
  avgRating: number | null;
}) {
  const title = cms.heroTitle ?? `Best AI ${category} tools for 2026, ranked & reviewed`;
  const subtitle =
    cms.heroSubtitle ??
    cms.description ??
    `Hand-picked AI ${category.toLowerCase()} software. Every tool below has been tested by our editors.`;
  const eyebrow = cms.heroEyebrow ?? `CATEGORY · ${category.toUpperCase()}`;
  const updated = (() => {
    const d = cms.updatedAt instanceof Date ? cms.updatedAt : new Date(cms.updatedAt as unknown as string);
    return isNaN(d.getTime()) ? "recently" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  })();

  return (
    <section className="relative overflow-hidden px-9 pt-12 pb-14 text-white section-pad-x" style={{ background: "var(--near-black)" }}>
      {cms.bannerImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cms.bannerImageUrl} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }} />
      )}
      <div
        className="absolute pointer-events-none"
        style={{ top: -150, right: -80, width: 500, height: 500, background: "radial-gradient(circle, rgba(0,82,255,.18) 0%, transparent 60%)" }}
      />
      <div className="max-w-[1320px] mx-auto relative">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-5 flex-wrap" style={{ color: "rgba(255,255,255,.45)" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,.55)" }}>Home</Link>
          <span style={{ color: "rgba(255,255,255,.3)" }}>›</span>
          <Link href="/ai-tools" style={{ color: "rgba(255,255,255,.55)" }}>AI Tools</Link>
          <span style={{ color: "rgba(255,255,255,.3)" }}>›</span>
          <span style={{ color: "#fff" }}>{category}</span>
        </nav>

        <div className="grid grid-cols-[1fr_360px] gap-[60px] items-start cat-hero-grid">
          <div>
            {/* Blue-on-dark eyebrow + white headline — matches the homepage
                hero family (no off-palette pink gradient). */}
            <div
              className="inline-flex items-center gap-2 rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-bold uppercase tracking-[.07em] mb-4"
              style={{ background: "rgba(0,82,255,.14)", border: "1px solid rgba(87,139,250,.35)", color: "var(--blue-h)" }}
            >
              {cms.icon ? <span>{cms.icon}</span> : "📈"} {eyebrow}
            </div>

            <h1
              className="font-display font-black mb-4 text-white"
              style={{ fontSize: "clamp(36px, 4.5vw, 56px)", letterSpacing: "-2px", lineHeight: 1.05, maxWidth: 860 }}
            >
              {title}
            </h1>

            <p className="text-base leading-[1.65] max-w-[620px] mb-6" style={{ color: "rgba(255,255,255,.65)" }}>
              {subtitle}
            </p>

            <div className="flex items-center gap-[18px] flex-wrap text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
              <div className="flex items-center gap-[6px]">
                📂 <strong className="font-display font-extrabold text-white tnum">{count} tools</strong>
              </div>
              {avgRating != null && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
                  <div className="flex items-center gap-[6px]">
                    ⭐ <strong className="font-display font-extrabold text-white tnum">{avgRating.toFixed(1)}</strong>
                  </div>
                </>
              )}
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
              <div className="flex items-center gap-[6px]">
                🔄 <strong className="font-display font-extrabold text-white">Updated {updated}</strong>
              </div>
            </div>
          </div>

          {/* AT A GLANCE — real computed facts */}
          <div className="rounded-lg p-[22px]" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}>
            <div className="font-display text-[11.5px] font-bold uppercase tracking-[.08em] mb-[14px] flex items-center gap-2" style={{ color: "rgba(255,255,255,.5)" }}>
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: "var(--blue-h)" }} />
              {category} AI at a glance
            </div>
            {facts.map((f, i) => (
              <div
                key={f.label}
                className="flex justify-between items-center py-[10px]"
                style={{ borderBottom: i < facts.length - 1 ? "1px dashed rgba(255,255,255,.08)" : "none" }}
              >
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,.55)" }}>{f.label}</span>
                <span className="font-display text-sm font-extrabold text-white tnum">{f.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

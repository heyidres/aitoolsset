import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryIntro } from "@/components/category/CategoryIntro";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ComparisonTable } from "@/components/category/ComparisonTable";
import { FaqAccordion } from "@/components/category/FaqAccordion";
import { CategoryOutro } from "@/components/category/CategoryOutro";
import { RelatedCategories } from "@/components/category/RelatedCategories";
import { QuickPicks, type QuickPickView } from "@/components/category/QuickPicks";
import { CategoryProseSections } from "@/components/category/CategoryProseSections";
import { CategoryRelatedPosts, type RelatedPostView } from "@/components/category/CategoryRelatedPosts";
import { ALL_CATS } from "@/lib/categories";
import { getToolsByCategory, getCategoryBySlug, getBlogPostBySlug, applyCategoryTranslations, type CmsCategory, type CmsTool } from "@/lib/cms";
import { cmsToolToDetail, cmsToolToLegacy } from "@/lib/cms-adapters";
import { computeCategoryStats, type CompareRow } from "@/lib/category-stats";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/json-ld";
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
        const { translateCategoryUnauthenticated } = await import("@/app/admin/categories/_translate-actions");
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

  // Everything editorial is derived from the REAL tools in this category —
  // facts, filters, comparison rows, editor's pick, FAQ — then the CMS
  // editorial fields (FAQ/quick-picks/overrides) take precedence where set.
  const stats = computeCategoryStats(found.name, cmsTools);

  // Stats overrides: editor-provided facts win; otherwise computed facts.
  // CMS overrides use {label,value}; the hero facts use {label,val}.
  const facts =
    cms && cms.statsOverrides.length > 0
      ? cms.statsOverrides.map((s) => ({ label: s.label, val: s.value }))
      : stats.facts;

  // FAQ: prefer hand-written CMS FAQs (best AEO); fall back to generated.
  const faqs = cms && cms.faqs.length > 0 ? cms.faqs : stats.faqs;

  // Comparison: merge editor keyFeature/bestFor overrides onto the computed rows.
  const overrideBySlug = new Map((cms?.comparisonRows ?? []).map((r) => [r.toolSlug, r]));
  const compareRows: CompareRow[] = stats.compareRows.map((r) => {
    const o = overrideBySlug.get(r.slug);
    return o ? { ...r, keyFeature: o.keyFeature, bestFor: o.bestFor } : r;
  });

  // Quick picks → resolve each toolSlug to a real tool from this category.
  const toolBySlug = new Map(cmsTools.map((tl) => [tl.slug, tl]));
  const quickPicks: QuickPickView[] = (cms?.quickPicks ?? []).map((qp) => {
    const tl = toolBySlug.get(qp.toolSlug);
    return {
      scenario: qp.scenario,
      reason: qp.reason,
      tool: tl ? { name: tl.name, slug: tl.slug, domain: tl.domain } : null,
    };
  });

  // Related blog posts → resolve slugs to published posts (parallel).
  const relatedPosts: RelatedPostView[] = (
    await Promise.all(
      (cms?.relatedPostSlugs ?? []).map((s) => getBlogPostBySlug(s).catch(() => null)),
    )
  )
    .filter((p): p is NonNullable<typeof p> => !!p && p.status === "published")
    .map((p) => ({ slug: p.slug, title: p.title, category: p.category, deck: p.deck }));

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
          ...(compareRows.length > 0
            ? [
                itemListJsonLd({
                  name: `Best AI ${found.name} tools`,
                  items: compareRows.map((r) => ({ name: r.name, url: `/ai-tool/${r.slug}` })),
                }),
              ]
            : []),
        ]}
      />
      <Nav />

      {hasCustomHero ? (
        <CustomCategoryHero category={found.name} slug={found.slug} count={finalCount} cms={cms!} />
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

      {/* Decision framework — editor-authored quick picks by scenario */}
      <QuickPicks categoryName={found.name} picks={quickPicks} />

      <ComparisonTable categoryName={found.name} rows={compareRows} />

      {/* Buying guide — "how to choose" editorial prose */}
      <CategoryProseSections
        eyebrow="Buying guide"
        heading={`How to choose an AI ${found.name.toLowerCase()} tool`}
        sections={cms?.buyingGuide ?? []}
        tint="var(--lavender)"
      />

      {/* What changed this year — trends/freshness */}
      <CategoryProseSections
        eyebrow="What changed this year"
        heading={`AI ${found.name.toLowerCase()} in 2026: what's new`}
        sections={cms?.trends ?? []}
        tint="var(--white)"
      />

      <FaqAccordion items={faqs} categoryName={found.name} />

      {/* Internal-link footer — hand-picked related blog posts */}
      <CategoryRelatedPosts posts={relatedPosts} />

      <CategoryOutro categoryName={found.name} />
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

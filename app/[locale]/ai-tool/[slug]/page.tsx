import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ToolHeader, type ToolHeaderOverrides } from "@/components/tool/ToolHeader";
import { ToolTabs } from "@/components/tool/ToolTabs";
import { ToolOverview, type ToolOverviewOverrides } from "@/components/tool/ToolOverview";
import { ToolSidebar, type ToolSidebarOverrides } from "@/components/tool/ToolSidebar";
import { ToolReviews } from "@/components/tool/ToolReviews";
import { EmbedSection } from "@/components/tool/EmbedSection";
import { RelatedSlider } from "@/components/tool/RelatedSlider";
import { TOOLS, type Tool } from "@/lib/tools";
import { DEFAULT_TOOL_DETAIL } from "@/lib/tool-detail";
import { getToolBySlug, getReviewsForTool, getCategoryOptions, type CmsTool } from "@/lib/cms";
import { cmsToolToLegacy, cmsReviewToLegacy, type LegacyReview } from "@/lib/cms-adapters";
import { auth } from "@/lib/auth";
import { JsonLd, toolJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";

// Dynamic so DB-managed tools resolve at request time —
// `generateStaticParams` only lists hardcoded seed tools, but
// any extra slug falls through and hits Postgres on the fly.
export const dynamicParams = true;

type FindToolResult =
  | {
      tool: Tool;
      descriptionHtml?: string;
      headerOverrides?: ToolHeaderOverrides;
      overviewOverrides?: ToolOverviewOverrides;
      sidebarOverrides?: ToolSidebarOverrides;
      /** Postgres tool id — only set when the tool comes from CMS. */
      cmsToolId?: string;
      /** Real DB reviews adapted to the legacy shape. Only set when CMS. */
      reviewsOverride?: LegacyReview[];
      /** CMS-supplied SEO overrides. Blank → auto-generate from name + tagline. */
      seoTitle?: string | null;
      seoDescription?: string | null;
    }
  | null;

const SOCIAL_KIND_ORDER = [
  "x", "linkedin", "github", "youtube", "facebook", "instagram", "discord",
] as const;

function socialsRecordToList(
  socials: CmsTool["socials"]
): Array<{ kind: string; url: string }> {
  if (!socials) return [];
  return SOCIAL_KIND_ORDER.flatMap((k) => {
    const url = socials[k];
    return url ? [{ kind: k, url }] : [];
  });
}

function buildHeaderOverrides(
  t: CmsTool,
  knownCategories: Array<{ slug: string; name: string }> = []
): ToolHeaderOverrides {
  // Badge row: first pill = free-tier status, then the user-provided tags +
  // any extra categories the tool is listed under (so clicking them routes
  // straight to the category page).
  const badges: string[] = [];
  if (t.pricing === "free") badges.push("Free");
  else if (t.pricing === "freemium") badges.push("Free tier available");
  else badges.push("Paid");

  // Surface the multi-cat assignments as clickable pills (deduped against tags).
  const seen = new Set<string>();
  const categoryBadges: string[] = [];
  for (const slug of t.categories ?? []) {
    const cat = knownCategories.find((c) => c.slug === slug);
    if (!cat) continue;
    if (seen.has(cat.name)) continue;
    seen.add(cat.name);
    categoryBadges.push(cat.name);
  }
  for (const tag of t.tags ?? []) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    categoryBadges.push(tag);
  }
  badges.push(...categoryBadges.slice(0, 4));

  // Build the badge → href map. A badge whose label matches a known category
  // name links to /ai-tools/<slug>; anything else falls back to /search?q=.
  const byName = new Map(knownCategories.map((c) => [c.name.toLowerCase(), c.slug]));
  const badgeLinks: Record<string, string> = {};
  for (const b of badges) {
    const slug = byName.get(b.toLowerCase());
    if (slug) badgeLinks[b] = `/ai-tools/${slug}`;
  }

  return {
    tagline: t.tagline,
    badges,
    badgeLinks,
    socials: socialsRecordToList(t.socials),
    weeklyUsers: t.weeklyUsers,
    startingPrice: t.startingPrice,
    launched: t.launched,
    madeBy: t.madeBy,
    websiteUrl: t.websiteUrl || null,
    linkRel: t.linkRel,
  };
}

function buildOverviewOverrides(t: CmsTool): ToolOverviewOverrides {
  return {
    features: t.features ?? [],
    useCases: t.useCases ?? [],
    pros: t.pros ?? [],
    cons: t.cons ?? [],
    plans: t.plans ?? [],
  };
}

/** Display label for the expanded pricing enum. */
function pricingLabel(p: CmsTool["pricing"]): string {
  switch (p) {
    case "free": return "Free";
    case "freemium": return "Free + Paid";
    case "paid": return "Paid";
    case "trial": return "Free Trial";
    case "credit": return "Pay-per-use";
    case "enterprise": return "Enterprise";
    default: return p;
  }
}

function buildSidebarOverrides(t: CmsTool): ToolSidebarOverrides {
  // Quick Info — assembled from whichever editorial fields the editor
  // (or AI auto-fill) actually populated. Skip any row that's null/empty
  // so the panel never lies. The Website row is rendered separately by
  // ToolSidebar; we don't include it here.
  const quickInfo: NonNullable<ToolSidebarOverrides["quickInfo"]> = [];

  if (t.madeBy) quickInfo.push({ label: "Made by", val: t.madeBy });

  quickInfo.push({ label: "Pricing", val: pricingLabel(t.pricing), cls: "green" });

  if (t.startingPrice) quickInfo.push({ label: "Starts at", val: t.startingPrice, cls: "green" });
  if (t.launched) quickInfo.push({ label: "Launched", val: t.launched });
  if (t.weeklyUsers) quickInfo.push({ label: "Weekly users", val: t.weeklyUsers });

  if (t.hasApi !== null) quickInfo.push({
    label: "API",
    val: t.hasApi ? "Available" : "Not available",
    cls: t.hasApi ? "green" : undefined,
  });
  if (t.mobileApp) quickInfo.push({ label: "Mobile app", val: t.mobileApp, cls: "green" });
  if (t.browserExtension !== null) quickInfo.push({
    label: "Browser ext.",
    val: t.browserExtension ? "Yes" : "No",
    cls: t.browserExtension ? "green" : undefined,
  });
  // Surface platforms + integrations in Quick Info when populated —
  // these are the most search-relevant facets for a tool listing.
  if (t.platforms && t.platforms.length > 0) {
    quickInfo.push({ label: "Platforms", val: t.platforms.slice(0, 4).join(", ") });
  }
  if (t.integrations && t.integrations.length > 0) {
    quickInfo.push({ label: "Integrations", val: t.integrations.slice(0, 4).join(", ") });
  }

  quickInfo.push({
    label: "Last updated",
    val: t.updatedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  });

  return {
    quickInfo,
    tags: t.tags.length > 0 ? t.tags : undefined,
    websiteUrl: t.websiteUrl || null,
    linkRel: t.linkRel,
  };
}

/**
 * Apply per-locale translations to a CmsTool. For each translatable field,
 * use the locale override when present, otherwise pass through the English
 * canonical column. Mutates a copy — never the original row.
 *
 * The fields covered here mirror the `translations` JSONB shape in
 * lib/db/schema.ts (tool table). Adding a new translatable field is a
 * two-step process: declare it on the JSONB type, then merge it here.
 */
function applyToolTranslations(cms: CmsTool, locale: string): CmsTool {
  const tr = (cms as unknown as { translations?: Record<string, {
    tagline?: string;
    description?: string;
    features?: Array<{ title: string; desc: string }>;
    useCases?: string[];
    pros?: string[];
    cons?: string[];
    plans?: Array<{ name: string; price: string; period: string; popular?: boolean; feats: string[] }>;
    seoTitle?: string;
    seoDescription?: string;
  }> }).translations?.[locale];
  if (!tr) return cms;
  return {
    ...cms,
    tagline:        tr.tagline        ?? cms.tagline,
    description:    tr.description    ?? cms.description,
    features:       tr.features       ?? cms.features,
    useCases:       tr.useCases       ?? cms.useCases,
    pros:           tr.pros           ?? cms.pros,
    cons:           tr.cons           ?? cms.cons,
    plans:          tr.plans          ?? cms.plans,
    seoTitle:       tr.seoTitle       ?? cms.seoTitle,
    seoDescription: tr.seoDescription ?? cms.seoDescription,
  };
}

async function findTool(slug: string, locale: string = "en"): Promise<FindToolResult> {
  const hardcoded = TOOLS.find((t) => t.id === slug);
  if (hardcoded) return { tool: hardcoded };
  const cmsRaw = await getToolBySlug(slug);
  if (!cmsRaw || cmsRaw.status !== "published") return null;
  // Merge in the active-locale overrides before building any per-component
  // override bundle. Every downstream consumer sees a single CmsTool with
  // the correct copy already substituted in.
  const cms = applyToolTranslations(cmsRaw, locale);
  const [cmsReviews, allCategories] = await Promise.all([
    getReviewsForTool(cms.id).catch(() => []),
    getCategoryOptions().catch(() => []),
  ]);
  return {
    tool: cmsToolToLegacy(cms),
    descriptionHtml: cms.description,
    headerOverrides: buildHeaderOverrides(cms, allCategories),
    overviewOverrides: buildOverviewOverrides(cms),
    sidebarOverrides: buildSidebarOverrides(cms),
    cmsToolId: cms.id,
    reviewsOverride: cmsReviews.map(cmsReviewToLegacy),
    seoTitle: cms.seoTitle,
    seoDescription: cms.seoDescription,
  };
}

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const found = await findTool(slug, locale);
    if (!found) return { title: "Tool not found" };
    const { tool, seoTitle, seoDescription } = found;
    const defaultTitle = `${tool.name} Reviews: Detail, Pricing & Features`;
    const title = seoTitle?.trim() || defaultTitle;
    const description = seoDescription?.trim() || tool.desc;
    return {
      // `absolute` bypasses the root layout's "%s — AI Tools Set" template
      // so the title renders exactly as written (matches editorial intent).
      title: { absolute: title },
      description,
      openGraph: {
        title,
        description,
        url: `https://aitoolsset.com/ai-tool/${tool.id}`,
      },
    };
  } catch (err) {
    // Metadata MUST never throw — bubbling would 500 the route before
    // error.tsx can render. Match the category-page pattern.
    console.error("[ai-tool/[slug]] generateMetadata failed", err);
    return { title: "AI Tools Set" };
  }
}

export default async function ToolDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const [found, session, t] = await Promise.all([findTool(slug, locale), auth(), getTranslations("tool_page")]);
  if (!found) notFound();
  const { tool, descriptionHtml, headerOverrides, overviewOverrides, sidebarOverrides, cmsToolId, reviewsOverride } = found;
  const detail = DEFAULT_TOOL_DETAIL;
  const currentUser = session?.user
    ? { id: session.user.id, name: session.user.name ?? null, image: session.user.image ?? null }
    : null;
  const ratingValue = found.tool.deal ? 4.8 : 4.7; // mirrors the visible header rating
  const ratingCount = Math.max(found.tool.saves, 1);
  return (
    <main>
      <JsonLd
        data={[
          toolJsonLd({
            name: found.tool.name,
            slug: found.tool.id,
            description: descriptionHtml ? descriptionHtml.replace(/<[^>]+>/g, "").slice(0, 300) : found.tool.desc,
            category: found.tool.cat,
            pricing: found.tool.free ? "freemium" : "paid",
            url: `https://${found.tool.domain}`,
            rating: { value: ratingValue, count: ratingCount },
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "AI Tools", url: "/ai-tools" },
            { name: found.tool.name, url: `/ai-tool/${found.tool.id}` },
          ]),
        ]}
      />
      <Nav />

      {/* Breadcrumb bar — flat: Home › AI Tools › <tool name>.
          Category is intentionally omitted so the trail stays short
          (multi-cat tools would otherwise pick one arbitrarily). */}
      <div className="bg-white px-9 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto flex items-center gap-[6px] text-[13px] h-[44px]" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
            {t("breadcrumb_home")}
          </Link>
          <span style={{ color: "var(--border-2)" }}>›</span>
          <Link href="/ai-tools" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
            {t("breadcrumb_ai_tools")}
          </Link>
          <span style={{ color: "var(--border-2)" }}>›</span>
          <span className="font-semibold" style={{ color: "var(--text-2)" }}>
            {tool.name}
          </span>
        </div>
      </div>

      <ToolHeader tool={tool} detail={detail} overrides={headerOverrides} />
      <ToolTabs reviewCount={2341} />

      <div className="max-w-page mx-auto px-9 pt-8 grid grid-cols-[minmax(0,1fr)_300px] gap-8 items-start tool-page-grid section-pad-x">
        <div className="flex flex-col min-w-0 overflow-hidden">
          {/* Screenshot */}
          <div
            className="rounded-lg flex items-center justify-center relative overflow-hidden w-full"
            style={{ background: "var(--near-black)", height: 360, border: "1px solid var(--border)" }}
          >
            <div
              className="font-display font-black"
              style={{ fontSize: 64, letterSpacing: "-3px", color: "rgba(255,255,255,.08)" }}
            >
              {tool.name}
            </div>
            <div
              className="absolute top-[14px] left-[14px] rounded-pill px-[13px] py-[5px] font-display text-xs font-bold flex items-center gap-[6px] backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,.5)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.7)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              {t("product_screenshot")}
            </div>
            <div className="absolute bottom-[14px] right-[14px] flex gap-2">
              <button
                className="font-display text-xs font-bold px-[14px] py-[7px] rounded-pill cursor-pointer transition-colors hover:bg-white"
                style={{ background: "rgba(255,255,255,.9)", color: "var(--text)" }}
              >
                {t("view_gallery")}
              </button>
              <button
                className="font-display text-xs font-bold px-[14px] py-[7px] rounded-pill cursor-pointer transition-colors hover:bg-white"
                style={{ background: "rgba(255,255,255,.9)", color: "var(--text)" }}
              >
                {t("watch_demo")}
              </button>
            </div>
          </div>

          <ToolOverview name={tool.name} detail={detail} descriptionHtml={descriptionHtml} overrides={overviewOverrides} />
        </div>

        <ToolSidebar tool={tool} detail={detail} overrides={sidebarOverrides} />
      </div>

      <EmbedSection tool={tool} />
      <ToolReviews
        name={tool.name}
        detail={detail}
        toolId={cmsToolId}
        reviewsOverride={reviewsOverride}
        currentUser={currentUser}
      />
      <RelatedSlider category={detail.category} />
      <Footer />
    </main>
  );
}

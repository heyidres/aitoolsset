/**
 * ─────────────────────────────────────────────────────────────
 *  CMS → legacy adapters
 * ─────────────────────────────────────────────────────────────
 *
 *  The public site's client components (DealsClient, GlossaryClient,
 *  AllCategoriesGrid, etc.) were built against the hardcoded shapes
 *  in `lib/deals.ts`, `lib/glossary.ts`, `lib/categories.ts`. Once
 *  editors start publishing in /admin, those rows come from
 *  Postgres in a slightly different shape (CmsDeal, CmsGlossaryTerm,
 *  CmsCategory).
 *
 *  These adapters convert CMS rows to the legacy shapes so the
 *  client components don't need to change. Server pages do:
 *
 *      const cmsDeals = await getActiveDeals();
 *      const overrides = cmsDeals.map(cmsDealToLegacy);
 *      <DealsClient dealsOverride={overrides} />
 *
 *  When the DB is empty, server pages pass undefined and the
 *  client falls back to its hardcoded import.
 * ─────────────────────────────────────────────────────────────
 */

import type { Tool } from "./tools";
import type { Deal } from "./deals";
import type { GlossaryTerm } from "./glossary";
import type { PopularCategory, SmallCategory } from "./categories";
import type { CmsTool, CmsDeal, CmsGlossaryTerm, CmsCategory, CmsReview } from "./cms";

// ── Reviews ──────────────────────────────────────────────────
const REVIEW_PALETTES: Array<[string, string]> = [
  ["#dbeafe", "#1d4ed8"],
  ["#fce7f3", "#db2777"],
  ["#d1fae5", "#059669"],
  ["#fef3c7", "#d97706"],
  ["#ede9fe", "#7c3aed"],
];

/** Shape consumed by the legacy ToolReviews UI. */
export type LegacyReview = {
  name: string;
  role: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
  notHelpful: number;
  bg: string;
  fg: string;
  initials: string;
};

function relativeDate(d: Date): string {
  const diff = Date.now() - d.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return "Just now";
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function cmsReviewToLegacy(r: CmsReview): LegacyReview {
  const name = r.authorName?.trim() || "Anonymous";
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  // Deterministic palette so the same author keeps the same colour.
  const seed = r.authorId.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const [bg, fg] = REVIEW_PALETTES[seed % REVIEW_PALETTES.length];
  return {
    name,
    role: r.role?.trim() || "User",
    date: relativeDate(r.createdAt),
    rating: r.rating,
    text: r.body,
    helpful: r.helpfulCount,
    notHelpful: r.notHelpfulCount,
    bg,
    fg,
    initials,
  };
}

// ── Tools ────────────────────────────────────────────────────
/**
 * Map a Postgres CmsTool row to the legacy `Tool` shape that
 * every public homepage / category / tool-card component was
 * built against.
 */
export function cmsToolToLegacy(t: CmsTool): Tool {
  return {
    id: t.slug,
    name: t.name,
    domain: t.domain,
    cat: t.category,
    tags: t.tags,
    desc: t.tagline || t.description.slice(0, 200),
    saves: t.saveCount,
    free: t.pricing === "free" || t.pricing === "freemium",
    trending: false,
    featured: t.featured,
    trendPct: null,
    link: `/ai-tool/${t.slug}`,
    verified: t.verified,
    deal: t.deal,
  };
}

/**
 * Adapt a Postgres CmsTool row to the `DetailTool` shape used
 * by the category-detail browser (CategoryBrowser). Slightly
 * lossy — pricing is normalised to the legacy union, sub-category
 * defaults to the parent category until we add a sub-category
 * column.
 */
export function cmsToolToDetail(t: CmsTool): import("./category-detail").DetailTool {
  const price: "Free" | "Freemium" | "Paid" =
    t.pricing === "free" ? "Free" : t.pricing === "freemium" ? "Freemium" : "Paid";
  return {
    name: t.name,
    by: t.domain,
    desc: t.tagline || t.description.slice(0, 200),
    price,
    sub: t.category,
    rating: t.avgRating > 0 ? t.avgRating / 10 : 0,
    reviews: t.reviewCount,
    verified: t.verified,
    tags: t.tags.slice(0, 4),
  };
}

/** Merge a list of CMS tools onto the hardcoded TOOLS list. DB wins on slug. */
export function mergeToolsBySlug(hardcoded: Tool[], cms: CmsTool[]): Tool[] {
  const cmsAdapted = cms.map(cmsToolToLegacy);
  const cmsBySlug = new Map(cmsAdapted.map((t) => [t.id, t]));
  const merged = hardcoded.map((h) => cmsBySlug.get(h.id) ?? h);
  const seen = new Set(hardcoded.map((h) => h.id));
  for (const c of cmsAdapted) if (!seen.has(c.id)) merged.push(c);
  return merged;
}

// ── Deals ────────────────────────────────────────────────────
/** Map a tool's category slug onto the deals page's small union. */
function dealCatFromToolCategory(slug: string): Deal["cat"] {
  const s = slug.toLowerCase();
  if (/(writing|chat|copy|content|text)/.test(s)) return "writing";
  if (/(image|design|art|photo|logo)/.test(s)) return "image";
  if (/(video|animation|film)/.test(s)) return "video";
  if (/(code|developer|coding|devops)/.test(s)) return "code";
  if (/(audio|music|voice|speech|sound)/.test(s)) return "audio";
  return "productivity";
}

function fmtExpires(d: Date | null): string {
  if (!d) return "No expiry";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function txtFromDeal(d: CmsDeal): string {
  if (d.label) return d.label;
  if (d.type === "trial") return `${d.amount}-day trial`;
  if (d.type === "flat") return `$${d.amount} off`;
  return "off";
}

export function cmsDealToLegacy(d: CmsDeal): Deal {
  return {
    tool: d.toolName,
    cat: dealCatFromToolCategory(d.toolCategory),
    domain: d.toolDomain,
    pct: d.type === "percent" ? d.amount : 0,
    txt: txtFromDeal(d),
    headline: d.headline,
    desc: d.description,
    savings: d.savingsUsd ?? 0,
    code: d.code,
    expires: fmtExpires(d.expiresAt),
    uses: "", // analytics aren't wired yet
    verified: d.verified,
    exclusive: d.exclusive,
    bf: d.blackFriday,
  };
}

// ── Glossary ─────────────────────────────────────────────────
export function cmsGlossaryToLegacy(t: CmsGlossaryTerm): GlossaryTerm {
  return {
    term: t.term,
    acro: t.acronym ?? undefined,
    cat: t.cat,
    def: t.definition,
    example: t.example ?? undefined,
    related: t.related,
    tool: t.linkedToolName && t.linkedToolSlug
      ? { name: t.linkedToolName, domain: t.linkedToolSlug }
      : undefined,
  };
}

// ── Categories ───────────────────────────────────────────────
/** A DB-managed category mapped to the rich PopularCategory shape. */
export function cmsCategoryToPopular(c: CmsCategory, fallback?: Partial<PopularCategory>): PopularCategory {
  return {
    name: c.name,
    slug: c.slug,
    emoji: c.icon ?? fallback?.emoji ?? "📂",
    color: c.color ?? fallback?.color ?? "#0052ff",
    desc: c.description ?? fallback?.desc ?? "",
    count: fallback?.count ?? 0,
    trend: fallback?.trend ?? "+0",
    tools: fallback?.tools ?? [],
  };
}

/** A DB-managed category mapped to the lighter A-Z list shape. */
export function cmsCategoryToSmall(c: CmsCategory): SmallCategory {
  return {
    name: c.name,
    count: 0, // tool counts aren't backfilled yet
    icon: c.icon ?? "📂",
    bg: c.color ?? "#eef0f3",
    slug: c.slug,
  };
}

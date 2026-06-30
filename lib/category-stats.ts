/**
 * Derives every editorial figure on a category page from the REAL tools
 * tagged with that category — no hardcoded marketing samples.
 *
 * The category page used to render fixed "marketing" content (Jasper AI
 * editor's pick, Copy.ai/Surfer SEO comparison rows, "Top use case:
 * Content & SEO", marketing FAQ) on EVERY category, regardless of what
 * the page was actually about. This module replaces all of that with
 * values computed from the category's own CmsTool rows so a /code-assistant
 * page talks about Cursor/Copilot/Devin, an /image-generation page talks
 * about its image tools, etc.
 *
 * Everything here is pure + synchronous so the server page can compute it
 * once from the already-fetched tool list with zero extra DB round-trips.
 */

import type { CmsTool } from "./cms";

export type PriceLabel = "Free" | "Freemium" | "Paid";
export type CategoryFact = { label: string; val: string };
export type FacetCount = { key: string; label: string; count: number };
export type PricingCount = { value: PriceLabel; count: number };

export type CompareRow = {
  name: string;
  domain: string;
  slug: string;
  pricing: PriceLabel;
  startingPrice: string | null;
  freeTier: boolean;
  rating: number | null;
  reviews: number;
  verified: boolean;
};

export type TopTool = {
  name: string;
  domain: string;
  slug: string;
  tagline: string;
  pricing: PriceLabel;
  startingPrice: string | null;
  rating: number | null;
  reviews: number;
  verified: boolean;
};

export type CategoryStats = {
  total: number;
  free: number;
  freemium: number;
  paid: number;
  verified: number;
  /** Average rating on a 0–5 scale (CmsTool.avgRating is stored ×10). */
  avgRating: number | null;
  facts: CategoryFact[];
  /** Tag-based facets for the sidebar "sub-category" filter. */
  subFacets: FacetCount[];
  popularTags: string[];
  pricingCounts: PricingCount[];
  compareRows: CompareRow[];
  topTool: TopTool | null;
  faqs: { q: string; a: string }[];
};

function priceLabel(t: CmsTool): PriceLabel {
  return t.pricing === "free" ? "Free" : t.pricing === "freemium" ? "Freemium" : "Paid";
}

/** Lowest positive numeric plan price, e.g. "$19/mo" plans → 19. */
function startingPriceNum(t: CmsTool): number | null {
  if (!t.plans || t.plans.length === 0) return null;
  const nums = t.plans
    .map((p) => {
      const m = String(p.price).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : null;
    })
    .filter((n): n is number => n != null && n > 0);
  return nums.length ? Math.min(...nums) : null;
}

function fmtPrice(n: number | null): string | null {
  if (n == null) return null;
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}/mo`;
}

/** Rating on a 0–5 scale (stored ×10), or null when unrated. */
function rating5(t: CmsTool): number | null {
  return t.avgRating > 0 ? Math.round((t.avgRating / 10) * 10) / 10 : null;
}

/**
 * Editorial ranking: most-saved first, then highest-rated, then
 * most-reviewed, then verified, then alphabetical for stability.
 * Used for the "editor's pick" + comparison table ordering.
 */
function rank(a: CmsTool, b: CmsTool): number {
  if (b.saveCount !== a.saveCount) return b.saveCount - a.saveCount;
  if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
  if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
  if (a.verified !== b.verified) return a.verified ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function toTopTool(t: CmsTool): TopTool {
  return {
    name: t.name,
    domain: t.domain,
    slug: t.slug,
    tagline: t.tagline || t.name,
    pricing: priceLabel(t),
    startingPrice: fmtPrice(startingPriceNum(t)),
    rating: rating5(t),
    reviews: t.reviewCount,
    verified: t.verified,
  };
}

function and(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/**
 * Build a generic-but-real FAQ from the category's tools. Every answer
 * references real tool names + real counts, so it is accurate for any
 * category and useful for SEO (FAQ rich results) without per-category
 * manual writing.
 */
function buildFaqs(
  name: string,
  ranked: CmsTool[],
  total: number,
  free: number,
  freemium: number,
  paid: number,
  verified: number,
  minPrice: number | null,
): { q: string; a: string }[] {
  const lower = name.toLowerCase();
  const topNames = ranked.slice(0, 3).map((t) => `**${t.name}**`);
  const freeNames = ranked
    .filter((t) => t.pricing === "free" || t.pricing === "freemium")
    .slice(0, 3)
    .map((t) => `**${t.name}**`);
  const faqs: { q: string; a: string }[] = [];

  if (topNames.length > 0) {
    faqs.push({
      q: `What is the best AI ${lower} tool in 2026?`,
      a: `Based on user saves, ratings, and reviews, ${and(topNames)} ${
        topNames.length === 1 ? "is" : "are"
      } among the most popular ${lower} tools right now. The best choice depends on your budget and workflow — compare pricing, free tiers, and ratings in the table above to find the right fit.`,
    });
  }

  faqs.push({
    q: `How many AI ${lower} tools are there?`,
    a: `We currently list **${total}** ${lower} ${total === 1 ? "tool" : "tools"}${
      verified > 0 ? `, ${verified} of them verified by our editors` : ""
    }. The list is updated regularly as new tools launch and existing ones ship major updates.`,
  });

  const freeCount = free + freemium;
  if (freeCount > 0) {
    faqs.push({
      q: `Are there free AI ${lower} tools?`,
      a: `Yes — **${freeCount}** of the ${total} ${lower} tools listed here offer a free or freemium plan${
        freeNames.length > 0 ? `, including ${and(freeNames)}` : ""
      }. Use the **Pricing** filter above to see every free and freemium option.`,
    });
  } else {
    faqs.push({
      q: `Are there free AI ${lower} tools?`,
      a: `Most ${lower} tools in this category are paid, but many offer a free trial so you can test them before committing. Check each tool's pricing for current trial terms.`,
    });
  }

  faqs.push({
    q: `How much do AI ${lower} tools cost?`,
    a: `Pricing varies widely. ${
      free > 0 ? `**${free}** ${free === 1 ? "tool is" : "tools are"} completely free` : "Paid plans"
    }${minPrice != null ? `, and paid plans start from around **$${minPrice}/mo**` : ""}. ${
      paid > 0
        ? `**${paid}** ${paid === 1 ? "tool is" : "tools are"} paid-only.`
        : "Many tools also offer a freemium tier."
    } Compare exact pricing on each tool's page.`,
  });

  return faqs;
}

export function computeCategoryStats(name: string, tools: CmsTool[]): CategoryStats {
  const total = tools.length;
  const free = tools.filter((t) => t.pricing === "free").length;
  const freemium = tools.filter((t) => t.pricing === "freemium").length;
  const paid = total - free - freemium;
  const verified = tools.filter((t) => t.verified).length;

  // Average rating across rated tools only.
  const rated = tools.map(rating5).filter((r): r is number => r != null);
  const avgRating =
    rated.length > 0 ? Math.round((rated.reduce((a, b) => a + b, 0) / rated.length) * 10) / 10 : null;

  // Lowest paid starting price across the category.
  const minPriceNum =
    tools.map(startingPriceNum).filter((n): n is number => n != null).sort((a, b) => a - b)[0] ?? null;

  // Tag frequency → sub-category facets + popular tags (real data).
  const tagCounts = new Map<string, number>();
  for (const t of tools) {
    for (const tag of t.tags ?? []) {
      const key = tag.trim();
      if (key) tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    }
  }
  const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const subFacets: FacetCount[] = sortedTags.slice(0, 8).map(([label, count]) => ({ key: label, label, count }));
  const popularTags = sortedTags.slice(0, 8).map(([tag]) => tag);

  const pricingCounts: PricingCount[] = (
    [
      { value: "Free", count: free },
      { value: "Freemium", count: freemium },
      { value: "Paid", count: paid },
    ] as PricingCount[]
  ).filter((p) => p.count > 0);

  const ranked = [...tools].sort(rank);

  const compareRows: CompareRow[] = ranked.slice(0, 6).map((t) => ({
    name: t.name,
    domain: t.domain,
    slug: t.slug,
    pricing: priceLabel(t),
    startingPrice: fmtPrice(startingPriceNum(t)),
    freeTier: t.pricing === "free" || t.pricing === "freemium",
    rating: rating5(t),
    reviews: t.reviewCount,
    verified: t.verified,
  }));

  const topTool = ranked.length > 0 ? toTopTool(ranked[0]) : null;

  // Facts — same English labels the i18n overlay (localizeMarketingFacts)
  // knows how to translate, so Korean labels still work with real values.
  const facts: CategoryFact[] = [{ label: "Total tools", val: String(total) }];
  if (free > 0) facts.push({ label: "Free tools", val: String(free) });
  if (freemium > 0) facts.push({ label: "Freemium", val: String(freemium) });
  if (paid > 0) facts.push({ label: "Paid only", val: String(paid) });
  if (minPriceNum != null) facts.push({ label: "Avg starting price", val: `$${minPriceNum}/mo` });
  if (sortedTags[0]) facts.push({ label: "Top use case", val: sortedTags[0][0] });

  const faqs = buildFaqs(name, ranked, total, free, freemium, paid, verified, minPriceNum);

  return {
    total,
    free,
    freemium,
    paid,
    verified,
    avgRating,
    facts,
    subFacets,
    popularTags,
    pricingCounts,
    compareRows,
    topTool,
    faqs,
  };
}

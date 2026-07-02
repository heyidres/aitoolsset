/**
 * ─────────────────────────────────────────────────────────────
 *  CMS query layer — Drizzle/Postgres backed
 * ─────────────────────────────────────────────────────────────
 *
 *  Replaces the previous Sanity-backed lib/sanity.ts. Every
 *  admin and public page imports its data from here so there's
 *  exactly one place that touches the tool rows.
 *
 *  Future content types (categories, blog, deals, glossary,
 *  image prompts) get their own sections here as we add their
 *  tables in phase 2.
 *
 *  All reads are server-only — these queries hit the database
 *  via the Neon HTTP driver. Pages that import this should be
 *  Server Components or Route Handlers.
 * ─────────────────────────────────────────────────────────────
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { tools, categories, blogPosts, deals, glossaryTerms, reviews, users, savedTools, sitePages, authors, homeSections } from "./db/schema";
import { inArray } from "drizzle-orm";

// ── Types ────────────────────────────────────────────────────
export type CmsSocials = {
  x?: string | null;
  linkedin?: string | null;
  github?: string | null;
  youtube?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  discord?: string | null;
};

export type CmsPricing = "free" | "freemium" | "paid" | "credit" | "trial" | "enterprise";

export type CmsFeature = { title: string; desc: string };

export type CmsPlan = {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  feats: string[];
};

export type CmsTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  domain: string;
  websiteUrl: string;
  /** rel attribute applied to the public website CTA. */
  linkRel: "nofollow" | "dofollow" | "sponsored" | "ugc";
  /** Primary category (used for breadcrumb + canonical URL). */
  category: string;
  /** Additional categories — tool surfaces on each of these category pages. */
  categories: string[];
  tags: string[];
  description: string;
  pricing: CmsPricing;
  logoUrl: string | null;
  screenshotUrl: string | null;
  verified: boolean;
  featured: boolean;
  status: "draft" | "published";
  saveCount: number;
  voteCount: number;
  reviewCount: number;
  avgRating: number;
  deal: { label: string; expires: string } | null;
  /** Manual pin for the homepage Trending + Popular rails. NULL = organic sort. */
  homepageOrder: number | null;
  // Editorial detail
  madeBy: string | null;
  launched: string | null;
  weeklyUsers: string | null;
  startingPrice: string | null;
  hasApi: boolean | null;
  mobileApp: string | null;
  browserExtension: boolean | null;
  socials: CmsSocials | null;
  features: CmsFeature[] | null;
  useCases: string[] | null;
  platforms: string[] | null;
  integrations: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  plans: CmsPlan[] | null;
  /** Per-tool SEO overrides — public page falls back to name + tagline. */
  seoTitle: string | null;
  seoDescription: string | null;
  /**
   * Per-locale translations for editorial fields. Keys are locale codes.
   * Render path reads `translations[locale]?.<field>` and falls back to
   * the canonical English column when a field is missing.
   */
  translations: Record<string, {
    tagline?: string;
    description?: string;
    features?: CmsFeature[];
    useCases?: string[];
    pros?: string[];
    cons?: string[];
    plans?: CmsPlan[];
    seoTitle?: string;
    seoDescription?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

// ── Helpers ──────────────────────────────────────────────────
function toCmsTool(row: typeof tools.$inferSelect): CmsTool {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    domain: row.domain,
    websiteUrl: row.websiteUrl,
    linkRel: (row.linkRel as CmsTool["linkRel"]) ?? "nofollow",
    category: row.category,
    categories: Array.isArray(row.categories) ? row.categories : [],
    tags: row.tags,
    description: row.description,
    pricing: row.pricing as CmsTool["pricing"],
    logoUrl: row.logoUrl,
    screenshotUrl: row.screenshotUrl,
    verified: row.verified,
    featured: row.featured,
    status: row.status as CmsTool["status"],
    saveCount: row.saveCount,
    voteCount: row.voteCount,
    reviewCount: row.reviewCount,
    avgRating: row.avgRating,
    deal: row.deal,
    homepageOrder: row.homepageOrder,
    madeBy: row.madeBy,
    launched: row.launched,
    weeklyUsers: row.weeklyUsers,
    startingPrice: row.startingPrice,
    hasApi: row.hasApi,
    mobileApp: row.mobileApp,
    browserExtension: row.browserExtension,
    socials: row.socials,
    features: row.features,
    useCases: row.useCases,
    platforms: row.platforms,
    integrations: row.integrations,
    pros: row.pros,
    cons: row.cons,
    plans: row.plans,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    translations: (row.translations ?? {}) as CmsTool["translations"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Tool queries ─────────────────────────────────────────────
/** Every tool, newest first — admin lists. */
export async function getAllTools(): Promise<CmsTool[]> {
  const rows = await db.select().from(tools).orderBy(desc(tools.createdAt));
  return rows.map(toCmsTool);
}

/** Only published tools — public site. */
export async function getPublishedTools(): Promise<CmsTool[]> {
  const rows = await db
    .select()
    .from(tools)
    .where(eq(tools.status, "published"))
    .orderBy(desc(tools.saveCount));
  return rows.map(toCmsTool);
}

/** Featured tools for the homepage rail. */
export async function getFeaturedTools(): Promise<CmsTool[]> {
  const rows = await db
    .select()
    .from(tools)
    .where(sql`${tools.featured} = true AND ${tools.status} = 'published'`)
    .orderBy(desc(tools.saveCount));
  return rows.map(toCmsTool);
}

export type CategoryStats = {
  /** Total published tools in this category (primary OR additional). */
  count: number;
  /** Tools published in the last 7 days — drives the "+N this week" pill. */
  newThisWeek: number;
  /** Latest 5 published tools (newest first), used for the bottom-of-card favicon rail. */
  topTools: Array<{ slug: string; name: string; domain: string; logoUrl: string | null }>;
};

/**
 * Group every PUBLISHED tool by every category slug it belongs to
 * (primary `category` + each entry in `categories[]`), in ONE query.
 *
 * Used by the /ai-tools landing page so every category card shows
 * live counts and the actual 5 latest tools — no more hardcoded
 * domains in lib/categories.ts.
 *
 * Returns a Map keyed by category slug. Categories with zero tools
 * are not present in the map.
 */
export async function getCategoryStats(): Promise<Map<string, CategoryStats>> {
  const rows = await db
    .select({
      slug: tools.slug,
      name: tools.name,
      domain: tools.domain,
      logoUrl: tools.logoUrl,
      category: tools.category,
      categories: tools.categories,
      createdAt: tools.createdAt,
    })
    .from(tools)
    .where(eq(tools.status, "published"))
    .orderBy(desc(tools.createdAt));

  const stats = new Map<string, CategoryStats>();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const r of rows) {
    const inCats = new Set<string>(
      [r.category, ...(Array.isArray(r.categories) ? r.categories : [])].filter(Boolean) as string[]
    );
    const createdMs =
      r.createdAt instanceof Date ? r.createdAt.getTime() : new Date(r.createdAt as unknown as string).getTime();
    const isNew = !isNaN(createdMs) && createdMs >= oneWeekAgo;

    for (const slug of inCats) {
      let entry = stats.get(slug);
      if (!entry) {
        entry = { count: 0, newThisWeek: 0, topTools: [] };
        stats.set(slug, entry);
      }
      entry.count++;
      if (isNew) entry.newThisWeek++;
      // Already ordered by createdAt DESC → first 5 ARE the latest.
      if (entry.topTools.length < 5) {
        entry.topTools.push({
          slug: r.slug,
          name: r.name,
          domain: r.domain,
          logoUrl: r.logoUrl,
        });
      }
    }
  }
  return stats;
}

/** Single tool by URL slug. Returns null if not found. */
export async function getToolBySlug(slug: string): Promise<CmsTool | null> {
  const [row] = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
  return row ? toCmsTool(row) : null;
}

/** Single tool by id. */
export async function getToolById(id: string): Promise<CmsTool | null> {
  const [row] = await db.select().from(tools).where(eq(tools.id, id)).limit(1);
  return row ? toCmsTool(row) : null;
}

/**
 * Tools listed under a category slug, published only.
 *
 * A tool belongs to a category page if EITHER:
 *   - its primary `category` column matches the slug, OR
 *   - its `categories` jsonb array contains the slug
 *
 * The `@>` operator does a containment check against the jsonb array.
 */
export async function getToolsByCategory(categorySlug: string): Promise<CmsTool[]> {
  const containsArg = JSON.stringify([categorySlug]);
  const rows = await db
    .select()
    .from(tools)
    .where(
      sql`(${tools.category} = ${categorySlug} OR ${tools.categories} @> ${containsArg}::jsonb) AND ${tools.status} = 'published'`
    )
    .orderBy(desc(tools.saveCount));
  return rows.map(toCmsTool);
}

/**
 * Pick siblings for the "Top Alternatives" sidebar / "Related Tools"
 * slider on a tool detail page.
 *
 * Strategy: union of tools that share ANY category with the active tool
 * (primary OR extras), excluding the active tool itself, sorted by saveCount
 * desc, deduped, capped at `limit`. If the union runs short, pads with the
 * highest-save published tools from any category so the rails never look
 * empty on a niche tool.
 */
export async function getRelatedTools({
  excludeSlug,
  primaryCategory,
  extraCategories = [],
  limit = 8,
}: {
  excludeSlug: string;
  primaryCategory: string;
  extraCategories?: string[];
  limit?: number;
}): Promise<CmsTool[]> {
  const cats = Array.from(new Set([primaryCategory, ...extraCategories].filter(Boolean)));

  // Fetch siblings per category in parallel (each query reuses the same
  // index on tool.category / tool.categories @> [...] so cost is small).
  const buckets = cats.length > 0
    ? await Promise.all(cats.map((c) => getToolsByCategory(c).catch(() => [] as CmsTool[])))
    : [];

  // Merge, dedupe by id, drop self, cap to limit.
  const seen = new Set<string>([excludeSlug]);
  const merged: CmsTool[] = [];
  for (const bucket of buckets) {
    for (const t of bucket) {
      if (seen.has(t.slug) || seen.has(t.id)) continue;
      seen.add(t.slug);
      seen.add(t.id);
      merged.push(t);
      if (merged.length >= limit) break;
    }
    if (merged.length >= limit) break;
  }

  // Pad with global top-save tools if we still need more (niche category).
  if (merged.length < limit) {
    const padding = await db
      .select()
      .from(tools)
      .where(sql`${tools.status} = 'published'`)
      .orderBy(desc(tools.saveCount))
      .limit(limit + 5);
    for (const row of padding) {
      if (merged.length >= limit) break;
      if (seen.has(row.slug) || seen.has(row.id)) continue;
      seen.add(row.slug);
      seen.add(row.id);
      merged.push(toCmsTool(row));
    }
  }

  return merged.slice(0, limit);
}

/** Cheap count for sidebar badge / dashboard stat. */
export async function getToolsCount(): Promise<number> {
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(tools);
  return r?.n ?? 0;
}

/**
 * Search published tools across name, tagline, description, tags,
 * domain. Uses Postgres `ILIKE` rather than full-text search so it
 * works without a tsvector column — fast enough up to ~10k rows.
 *
 * Caller is responsible for trimming the query.
 */
export async function searchTools(query: string, limit = 50): Promise<CmsTool[]> {
  if (!query || query.length < 2) return [];
  const like = `%${query.replace(/[%_]/g, "\\$&")}%`;
  const rows = await db
    .select()
    .from(tools)
    .where(
      sql`${tools.status} = 'published' AND (
        ${tools.name} ILIKE ${like}
        OR ${tools.tagline} ILIKE ${like}
        OR ${tools.description} ILIKE ${like}
        OR ${tools.domain} ILIKE ${like}
        OR ${tools.tags}::text ILIKE ${like}
      )`
    )
    .orderBy(desc(tools.saveCount))
    .limit(limit);
  return rows.map(toCmsTool);
}

// ─────────────────────────────────────────────────────────────
//  Categories
// ─────────────────────────────────────────────────────────────

/** FAQ pair for the category FAQ editor + FAQPage JSON-LD. */
export type CategoryFaq = { q: string; a: string };

export type CmsCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  popular: boolean;
  orderIndex: number;
  parentSlug: string | null;
  // Editorial fields used by the public category page
  bannerImageUrl: string | null;
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  introHtml: string | null;
  /** Long-form editorial article rendered below the tools grid. */
  bottomHtml: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featuredToolSlugs: string[];
  // Editorial / SEO-AEO fields
  faqs: CategoryFaq[];
  toolRelevance: Record<string, number>;
  relevanceThreshold: number;
  lastReviewedAt: Date | null;
  focusKeyword: string | null;
  translations: Record<string, {
    name?: string;
    description?: string;
    heroEyebrow?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    introHtml?: string;
    bottomHtml?: string;
    seoTitle?: string;
    seoDescription?: string;
    faqs?: CategoryFaq[];
  }>;
  createdAt: Date;
  updatedAt: Date;
};

function toCmsCategory(row: typeof categories.$inferSelect): CmsCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    color: row.color,
    description: row.description,
    popular: row.popular,
    orderIndex: row.orderIndex,
    parentSlug: row.parentSlug,
    bannerImageUrl: row.bannerImageUrl,
    heroEyebrow: row.heroEyebrow,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    introHtml: row.introHtml,
    bottomHtml: row.bottomHtml,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    featuredToolSlugs: row.featuredToolSlugs,
    faqs: row.faqs ?? [],
    toolRelevance: row.toolRelevance ?? {},
    relevanceThreshold: row.relevanceThreshold ?? 0,
    lastReviewedAt: row.lastReviewedAt ?? null,
    focusKeyword: row.focusKeyword ?? null,
    translations: (row.translations ?? {}) as CmsCategory["translations"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Apply per-locale translations to a CmsCategory. Per-field fallback — if
 * a field is missing in the target locale, the English column is used.
 */
export function applyCategoryTranslations(cms: CmsCategory, locale: string): CmsCategory {
  const tr = cms.translations?.[locale];
  if (!tr) return cms;
  return {
    ...cms,
    name:           tr.name           ?? cms.name,
    description:    tr.description    ?? cms.description,
    heroEyebrow:    tr.heroEyebrow    ?? cms.heroEyebrow,
    heroTitle:      tr.heroTitle      ?? cms.heroTitle,
    heroSubtitle:   tr.heroSubtitle   ?? cms.heroSubtitle,
    introHtml:      tr.introHtml      ?? cms.introHtml,
    bottomHtml:     tr.bottomHtml     ?? cms.bottomHtml,
    seoTitle:       tr.seoTitle       ?? cms.seoTitle,
    seoDescription: tr.seoDescription ?? cms.seoDescription,
    faqs:           tr.faqs && tr.faqs.length > 0 ? tr.faqs : cms.faqs,
  };
}

export async function getAllCategories(): Promise<CmsCategory[]> {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.orderIndex), asc(categories.name));
  return rows.map(toCmsCategory);
}

export async function getCategoryBySlug(slug: string): Promise<CmsCategory | null> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ? toCmsCategory(row) : null;
}

export async function getCategoryById(id: string): Promise<CmsCategory | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ? toCmsCategory(row) : null;
}

export async function getCategoriesCount(): Promise<number> {
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(categories);
  return r?.n ?? 0;
}

// ─────────────────────────────────────────────────────────────
//  Blog posts
// ─────────────────────────────────────────────────────────────
export type CmsBlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  deck: string | null;
  coverImageUrl: string | null;
  /** Legacy free-text byline (back-compat). Prefer `authorSlugs`. */
  author: string | null;
  /** Multi-author E-E-A-T attribution. First slug = lead byline. */
  authorSlugs: string[];
  /** Optional fact-checker / editor attribution. */
  reviewedBySlug: string | null;
  tags: string[];
  body: string;
  /** Q&A pairs rendered below body + emitted as FAQ JSON-LD. */
  faqs: Array<{ q: string; a: string }>;
  readMinutes: number | null;
  status: "draft" | "scheduled" | "published";
  publishedAt: Date | null;
  views: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toCmsBlogPost(row: typeof blogPosts.$inferSelect): CmsBlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    deck: row.deck,
    coverImageUrl: row.coverImageUrl,
    author: row.author,
    authorSlugs: Array.isArray(row.authorSlugs) ? row.authorSlugs : [],
    reviewedBySlug: row.reviewedBySlug,
    tags: row.tags,
    body: row.body,
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    readMinutes: row.readMinutes,
    status: row.status as CmsBlogPost["status"],
    publishedAt: row.publishedAt,
    views: row.views,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllBlogPosts(): Promise<CmsBlogPost[]> {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return rows.map(toCmsBlogPost);
}

export async function getPublishedBlogPosts(): Promise<CmsBlogPost[]> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map(toCmsBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<CmsBlogPost | null> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return row ? toCmsBlogPost(row) : null;
}

export async function getBlogPostById(id: string): Promise<CmsBlogPost | null> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return row ? toCmsBlogPost(row) : null;
}

// ─────────────────────────────────────────────────────────────
//  Home page sections (For Writers / For Developers / …)
// ─────────────────────────────────────────────────────────────
export type CmsHomeUseCase = { name: string; desc: string; label: string; grad: string };

export type CmsHomeSection = {
  id: string;
  slug: string;
  badge: string;
  title: string;
  deck: string;
  bgColor: string;
  imageSide: "left" | "right";
  position: number;
  enabled: boolean;
  toolSlugs: string[];
  useCases: CmsHomeUseCase[];
  createdAt: Date;
  updatedAt: Date;
};

function toCmsHomeSection(row: typeof homeSections.$inferSelect): CmsHomeSection {
  return {
    id: row.id,
    slug: row.slug,
    badge: row.badge,
    title: row.title,
    deck: row.deck,
    bgColor: row.bgColor,
    imageSide: (row.imageSide === "left" ? "left" : "right") as "left" | "right",
    position: row.position,
    enabled: row.enabled,
    toolSlugs: Array.isArray(row.toolSlugs) ? row.toolSlugs : [],
    useCases: Array.isArray(row.useCases) ? row.useCases : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllHomeSections(): Promise<CmsHomeSection[]> {
  const rows = await db
    .select()
    .from(homeSections)
    .orderBy(asc(homeSections.position), asc(homeSections.createdAt));
  return rows.map(toCmsHomeSection);
}

export async function getEnabledHomeSections(): Promise<CmsHomeSection[]> {
  const rows = await db
    .select()
    .from(homeSections)
    .where(eq(homeSections.enabled, true))
    .orderBy(asc(homeSections.position), asc(homeSections.createdAt));
  return rows.map(toCmsHomeSection);
}

export async function getHomeSectionById(id: string): Promise<CmsHomeSection | null> {
  const [row] = await db.select().from(homeSections).where(eq(homeSections.id, id)).limit(1);
  return row ? toCmsHomeSection(row) : null;
}

// ─────────────────────────────────────────────────────────────
//  Authors (E-E-A-T)
// ─────────────────────────────────────────────────────────────
export type CmsAuthor = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bioHtml: string | null;
  photoUrl: string | null;
  credentials: string[];
  websiteUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  githubUrl: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toCmsAuthor(row: typeof authors.$inferSelect): CmsAuthor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    bioHtml: row.bioHtml,
    photoUrl: row.photoUrl,
    credentials: Array.isArray(row.credentials) ? row.credentials : [],
    websiteUrl: row.websiteUrl,
    linkedinUrl: row.linkedinUrl,
    xUrl: row.xUrl,
    githubUrl: row.githubUrl,
    email: row.email,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllAuthors(): Promise<CmsAuthor[]> {
  const rows = await db.select().from(authors).orderBy(asc(authors.name));
  return rows.map(toCmsAuthor);
}

export async function getAuthorBySlug(slug: string): Promise<CmsAuthor | null> {
  const [row] = await db.select().from(authors).where(eq(authors.slug, slug)).limit(1);
  return row ? toCmsAuthor(row) : null;
}

export async function getAuthorById(id: string): Promise<CmsAuthor | null> {
  const [row] = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  return row ? toCmsAuthor(row) : null;
}

/** Look up several authors at once, returned in the same order as the input slugs. */
export async function getAuthorsBySlugs(slugs: string[]): Promise<CmsAuthor[]> {
  if (slugs.length === 0) return [];
  const rows = await db.select().from(authors).where(inArray(authors.slug, slugs));
  const bySlug = new Map(rows.map((r) => [r.slug, toCmsAuthor(r)]));
  return slugs.map((s) => bySlug.get(s)).filter((a): a is CmsAuthor => !!a);
}

/** Lightweight options for admin pickers (slug + name only). */
export async function getAuthorOptions(): Promise<Array<{ slug: string; name: string }>> {
  const rows = await db.select({ slug: authors.slug, name: authors.name }).from(authors).orderBy(asc(authors.name));
  return rows;
}

/** Every published blog post written by the given author slug. */
export async function getPostsByAuthor(slug: string): Promise<CmsBlogPost[]> {
  const containsArg = JSON.stringify([slug]);
  const rows = await db
    .select()
    .from(blogPosts)
    .where(sql`(${blogPosts.authorSlugs} @> ${containsArg}::jsonb OR ${blogPosts.reviewedBySlug} = ${slug}) AND ${blogPosts.status} = 'published'`)
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map(toCmsBlogPost);
}

// ─────────────────────────────────────────────────────────────
//  Deals
// ─────────────────────────────────────────────────────────────
export type CmsDeal = {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  toolDomain: string;
  toolCategory: string;
  type: "percent" | "flat" | "trial";
  amount: number;
  label: string | null;
  headline: string;
  description: string;
  code: string | null;
  savingsUsd: number | null;
  expiresAt: Date | null;
  exclusive: boolean;
  blackFriday: boolean;
  verified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllDeals(): Promise<CmsDeal[]> {
  const rows = await db
    .select({
      d: deals,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolDomain: tools.domain,
      toolCategory: tools.category,
    })
    .from(deals)
    .innerJoin(tools, eq(deals.toolId, tools.id))
    .orderBy(desc(deals.createdAt));

  return rows.map(({ d, toolName, toolSlug, toolDomain, toolCategory }) => ({
    id: d.id,
    toolId: d.toolId,
    toolName,
    toolSlug,
    toolDomain,
    toolCategory,
    type: d.type as CmsDeal["type"],
    amount: d.amount,
    label: d.label,
    headline: d.headline,
    description: d.description,
    code: d.code,
    savingsUsd: d.savingsUsd,
    expiresAt: d.expiresAt,
    exclusive: d.exclusive,
    blackFriday: d.blackFriday,
    verified: d.verified,
    active: d.active,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
}

export async function getActiveDeals(): Promise<CmsDeal[]> {
  const all = await getAllDeals();
  const now = Date.now();
  return all.filter((d) => d.active && (!d.expiresAt || d.expiresAt.getTime() > now));
}

export async function getDealById(id: string): Promise<CmsDeal | null> {
  const rows = await db
    .select({
      d: deals,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolDomain: tools.domain,
      toolCategory: tools.category,
    })
    .from(deals)
    .innerJoin(tools, eq(deals.toolId, tools.id))
    .where(eq(deals.id, id))
    .limit(1);

  const r = rows[0];
  if (!r) return null;
  return {
    id: r.d.id,
    toolId: r.d.toolId,
    toolName: r.toolName,
    toolSlug: r.toolSlug,
    toolDomain: r.toolDomain,
    toolCategory: r.toolCategory,
    type: r.d.type as CmsDeal["type"],
    amount: r.d.amount,
    label: r.d.label,
    headline: r.d.headline,
    description: r.d.description,
    code: r.d.code,
    savingsUsd: r.d.savingsUsd,
    expiresAt: r.d.expiresAt,
    exclusive: r.d.exclusive,
    blackFriday: r.d.blackFriday,
    verified: r.d.verified,
    active: r.d.active,
    createdAt: r.d.createdAt,
    updatedAt: r.d.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────
//  Glossary terms
// ─────────────────────────────────────────────────────────────
export type CmsGlossaryTerm = {
  id: string;
  slug: string;
  term: string;
  acronym: string | null;
  cat: "core" | "models" | "training" | "agents";
  definition: string;
  example: string | null;
  related: string[];
  linkedToolId: string | null;
  linkedToolName: string | null;
  linkedToolSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllGlossaryTerms(): Promise<CmsGlossaryTerm[]> {
  const rows = await db
    .select({
      g: glossaryTerms,
      toolName: tools.name,
      toolSlug: tools.slug,
    })
    .from(glossaryTerms)
    .leftJoin(tools, eq(glossaryTerms.linkedToolId, tools.id))
    .orderBy(asc(glossaryTerms.term));

  return rows.map(({ g, toolName, toolSlug }) => ({
    id: g.id,
    slug: g.slug,
    term: g.term,
    acronym: g.acronym,
    cat: g.cat as CmsGlossaryTerm["cat"],
    definition: g.definition,
    example: g.example,
    related: g.related,
    linkedToolId: g.linkedToolId,
    linkedToolName: toolName,
    linkedToolSlug: toolSlug,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }));
}

export async function getGlossaryTermById(id: string): Promise<CmsGlossaryTerm | null> {
  const rows = await db
    .select({
      g: glossaryTerms,
      toolName: tools.name,
      toolSlug: tools.slug,
    })
    .from(glossaryTerms)
    .leftJoin(tools, eq(glossaryTerms.linkedToolId, tools.id))
    .where(eq(glossaryTerms.id, id))
    .limit(1);

  const r = rows[0];
  if (!r) return null;
  return {
    id: r.g.id,
    slug: r.g.slug,
    term: r.g.term,
    acronym: r.g.acronym,
    cat: r.g.cat as CmsGlossaryTerm["cat"],
    definition: r.g.definition,
    example: r.g.example,
    related: r.g.related,
    linkedToolId: r.g.linkedToolId,
    linkedToolName: r.toolName,
    linkedToolSlug: r.toolSlug,
    createdAt: r.g.createdAt,
    updatedAt: r.g.updatedAt,
  };
}

/** Lightweight tool lookups for foreign-key dropdowns in admin forms. */
export async function getToolOptions(): Promise<Array<{ id: string; name: string; slug: string }>> {
  const rows = await db
    .select({ id: tools.id, name: tools.name, slug: tools.slug })
    .from(tools)
    .orderBy(asc(tools.name));
  return rows;
}

/** Tools currently assigned to a category — used by the picks UI. */
export async function getToolOptionsByCategory(
  categorySlug: string
): Promise<Array<{ id: string; name: string; slug: string }>> {
  const rows = await db
    .select({ id: tools.id, name: tools.name, slug: tools.slug })
    .from(tools)
    .where(eq(tools.category, categorySlug))
    .orderBy(asc(tools.name));
  return rows;
}

/** Lightweight category lookups for the tool form dropdown. */
export async function getCategoryOptions(): Promise<Array<{ slug: string; name: string }>> {
  const rows = await db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.orderIndex), asc(categories.name));
  return rows;
}

// ─────────────────────────────────────────────────────────────
//  Reviews
// ─────────────────────────────────────────────────────────────
export type CmsReview = {
  id: string;
  toolId: string;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  rating: number;
  role: string | null;
  body: string;
  helpfulCount: number;
  notHelpfulCount: number;
  status: "approved" | "pending" | "rejected" | "flagged";
  createdAt: Date;
};

/** Approved reviews for a tool, newest first. */
export async function getReviewsForTool(toolId: string): Promise<CmsReview[]> {
  const rows = await db
    .select({
      id: reviews.id,
      toolId: reviews.toolId,
      authorId: reviews.authorId,
      rating: reviews.rating,
      role: reviews.role,
      body: reviews.body,
      helpfulCount: reviews.helpfulCount,
      notHelpfulCount: reviews.notHelpfulCount,
      status: reviews.status,
      createdAt: reviews.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(and(eq(reviews.toolId, toolId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));
  return rows.map((r) => ({ ...r, status: r.status as CmsReview["status"] }));
}

/** Every review written by a specific user, newest first. */
export async function getReviewsByUser(userId: string): Promise<Array<CmsReview & { toolName: string; toolSlug: string }>> {
  const rows = await db
    .select({
      id: reviews.id,
      toolId: reviews.toolId,
      authorId: reviews.authorId,
      rating: reviews.rating,
      role: reviews.role,
      body: reviews.body,
      helpfulCount: reviews.helpfulCount,
      notHelpfulCount: reviews.notHelpfulCount,
      status: reviews.status,
      createdAt: reviews.createdAt,
      authorName: users.name,
      authorImage: users.image,
      toolName: tools.name,
      toolSlug: tools.slug,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .innerJoin(tools, eq(reviews.toolId, tools.id))
    .where(eq(reviews.authorId, userId))
    .orderBy(desc(reviews.createdAt));
  return rows.map((r) => ({ ...r, status: r.status as CmsReview["status"] }));
}

// ─────────────────────────────────────────────────────────────
//  Saved tools (per user)
// ─────────────────────────────────────────────────────────────
export async function getSavedTools(userId: string): Promise<CmsTool[]> {
  const rows = await db
    .select()
    .from(savedTools)
    .innerJoin(tools, eq(savedTools.toolId, tools.id))
    .where(eq(savedTools.userId, userId))
    .orderBy(desc(savedTools.savedAt));
  return rows.map((r) => toCmsTool(r.tool));
}

export async function getSavedToolIds(userId: string): Promise<string[]> {
  const rows = await db.select({ id: savedTools.toolId }).from(savedTools).where(eq(savedTools.userId, userId));
  return rows.map((r) => r.id);
}

export async function getSavedCount(userId: string): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(savedTools)
    .where(eq(savedTools.userId, userId));
  return r?.n ?? 0;
}

// ─────────────────────────────────────────────────────────────
//  Users (public profile lookup)
// ─────────────────────────────────────────────────────────────
export type CmsUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "editor" | "admin";
};

export async function getUserById(id: string): Promise<CmsUser | null> {
  const [row] = await db
    .select({ id: users.id, name: users.name, email: users.email, image: users.image, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ? { ...row, role: row.role as CmsUser["role"] } : null;
}

// ─────────────────────────────────────────────────────────────
//  Site pages (About / Privacy / Terms / Contact / custom)
// ─────────────────────────────────────────────────────────────
export type CmsSitePage = {
  id: string;
  slug: string;
  title: string;
  deck: string | null;
  coverImageUrl: string | null;
  body: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toCmsSitePage(row: typeof sitePages.$inferSelect): CmsSitePage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    deck: row.deck,
    coverImageUrl: row.coverImageUrl,
    body: row.body,
    status: row.status as CmsSitePage["status"],
    publishedAt: row.publishedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllSitePages(): Promise<CmsSitePage[]> {
  const rows = await db.select().from(sitePages).orderBy(desc(sitePages.createdAt));
  return rows.map(toCmsSitePage);
}

export async function getPublishedSitePages(): Promise<CmsSitePage[]> {
  const rows = await db
    .select()
    .from(sitePages)
    .where(eq(sitePages.status, "published"))
    .orderBy(asc(sitePages.title));
  return rows.map(toCmsSitePage);
}

export async function getSitePageBySlug(slug: string): Promise<CmsSitePage | null> {
  const [row] = await db.select().from(sitePages).where(eq(sitePages.slug, slug)).limit(1);
  return row ? toCmsSitePage(row) : null;
}

export async function getSitePageById(id: string): Promise<CmsSitePage | null> {
  const [row] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  return row ? toCmsSitePage(row) : null;
}

/**
 * Top-level slugs the app already routes to. The Pages CMS
 * refuses to create a page with one of these slugs so the
 * catch-all route never shadows core functionality.
 */
export const RESERVED_PAGE_SLUGS = new Set<string>([
  "admin",
  "api",
  // Tool detail (singular) + legacy plural redirect target
  "ai-tool",
  "tools",
  // Categories landing (new) + legacy redirect target
  "ai-tools",
  "categories",
  "blog",
  "news",
  "deals",
  "glossary",
  "submit",
  "leaderboard",
  "images",
  "saved",
  "search",
  "u",
  "sitemap.xml",
  "robots.txt",
  "opengraph-image",
  "favicon.ico",
  "uploads",
  "trending",
  "new",
  "top-rated",
  "newsletter",
  // Static editorial pages (own React routes — must not be shadowed)
  "about",
  "contact",
  "privacy",
  "terms",
  "cookies",
]);

/** Convert a free-text name into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Dynamic sitemap.xml — generated at request time so Google
 * always sees fresh CMS content. Cached for 6h via revalidate.
 *
 * Includes every static route + every published tool, blog post,
 * category, and glossary term from both Postgres and the
 * hardcoded seed lists.
 */

import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/tools";
import { ALL_CATS } from "@/lib/categories";
import {
  getPublishedTools,
  getAllCategories,
  getPublishedBlogPosts,
  getPublishedSitePages,
} from "@/lib/cms";
import { i18n } from "@/lib/i18n/config";
import { localeUrl } from "@/lib/i18n/hreflang";

// force-dynamic (not build-time render) — see app/[locale]/ai-tools/page.tsx
// for why: keeps every DB query out of the build, since a fresh Vercel
// build can start while Supabase's free-tier compute is cold, and the
// build has no tolerance for that wake-up latency. Crawl volume is low
// enough that rendering per-request (instead of caching 6h) is fine.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.SITE_URL ?? "https://aitoolsset.com";

/**
 * Build `alternates.languages` for a path that has translations
 * in EVERY supported locale (the static UI-chrome routes).
 *
 * For per-row content (tools, blog posts, etc.) we DON'T emit
 * cross-locale alternates yet — that's wired in Phase 4 once each
 * row's `translations.<locale>` JSONB starts landing. Emitting a
 * Korean URL that serves English content would create duplicate
 * content signals and hurt SEO.
 */
function fullyTranslatedAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of i18n.locales) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl(i18n.defaultLocale, path);
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static top-level routes — UI chrome is translated in every locale,
  // so we emit one sitemap entry per locale-URL plus xhtml:link alternates.
  // NOTE deliberately absent:
  //  - /search      → noindexed + robots-disallowed (index bloat)
  //  - /news        → 0 published stories yet; re-add when the feed goes live
  //  - /leaderboard → unlinked pending a quality pass; re-add with it
  const now = new Date();
  const staticPaths: Array<{ path: string; freq: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "/",            freq: "daily",   priority: 1.0 },
    { path: "/ai-tools",    freq: "weekly",  priority: 0.9 },
    { path: "/blog",        freq: "daily",   priority: 0.8 },
    { path: "/deals",       freq: "daily",   priority: 0.8 },
    { path: "/glossary",    freq: "weekly",  priority: 0.7 },
    { path: "/submit",      freq: "monthly", priority: 0.5 },
  ];
  const staticRoutes: MetadataRoute.Sitemap = [];
  for (const sp of staticPaths) {
    const alternates = fullyTranslatedAlternates(sp.path);
    // Emit one sitemap entry PER locale so Google sees the Korean URL too;
    // each entry references the full language matrix.
    // No lastModified on static routes: stamping now() every generation
    // is a false freshness signal that teaches Google to distrust our
    // lastmod values. changefreq/priority carry the hint instead.
    for (const locale of i18n.locales) {
      staticRoutes.push({
        url: localeUrl(locale, sp.path),
        changeFrequency: sp.freq,
        priority: sp.priority,
        alternates,
      });
    }
  }

  // Tools — DB published + hardcoded seeds (dedup by slug)
  const cmsTools = await getPublishedTools().catch(() => []);
  const toolSlugs = new Set<string>();
  const toolUrls: MetadataRoute.Sitemap = [];
  for (const t of cmsTools) {
    if (toolSlugs.has(t.slug)) continue;
    toolSlugs.add(t.slug);
    toolUrls.push({
      url: `${BASE}/ai-tool/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const t of TOOLS) {
    if (toolSlugs.has(t.id)) continue;
    toolSlugs.add(t.id);
    toolUrls.push({
      url: `${BASE}/ai-tool/${t.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Categories — DB + hardcoded
  const cmsCats = await getAllCategories().catch(() => []);
  const catSlugs = new Set<string>();
  const categoryUrls: MetadataRoute.Sitemap = [];
  for (const c of cmsCats) {
    if (catSlugs.has(c.slug)) continue;
    catSlugs.add(c.slug);
    categoryUrls.push({
      url: `${BASE}/ai-tools/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const c of ALL_CATS) {
    if (catSlugs.has(c.slug)) continue;
    catSlugs.add(c.slug);
    categoryUrls.push({
      url: `${BASE}/ai-tools/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Blog posts — DB published only (hardcoded GPT-5 demo is its own URL)
  const cmsPosts = await getPublishedBlogPosts().catch(() => []);
  const blogUrls: MetadataRoute.Sitemap = cmsPosts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  blogUrls.push({
    url: `${BASE}/blog/gpt-5-complete-guide`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  });

  // Glossary term URLs are NOT sitemapped: they're #fragments on one
  // page, and Google ignores fragments in sitemaps — the entries were
  // pure noise. When per-term routes (/glossary/[slug]) ship, list
  // them here with real lastmod dates. The hub page itself is in
  // staticPaths above.

  // Editor-managed pages from the Pages CMS
  const cmsPages = await getPublishedSitePages().catch(() => []);
  const pageUrls: MetadataRoute.Sitemap = cmsPages.map((p) => ({
    url: `${BASE}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolUrls, ...categoryUrls, ...blogUrls, ...pageUrls];
}

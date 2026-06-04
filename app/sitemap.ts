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
import { GLOSSARY, slugifyTerm } from "@/lib/glossary";
import {
  getPublishedTools,
  getAllCategories,
  getPublishedBlogPosts,
  getAllGlossaryTerms,
} from "@/lib/cms";

export const revalidate = 21600; // 6 hours
export const runtime = "nodejs";

const BASE = process.env.SITE_URL ?? "https://aitoolsset.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static top-level routes
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/deals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
    { url: `${BASE}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/leaderboard`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
  ];

  // Tools — DB published + hardcoded seeds (dedup by slug)
  const cmsTools = await getPublishedTools().catch(() => []);
  const toolSlugs = new Set<string>();
  const toolUrls: MetadataRoute.Sitemap = [];
  for (const t of cmsTools) {
    if (toolSlugs.has(t.slug)) continue;
    toolSlugs.add(t.slug);
    toolUrls.push({
      url: `${BASE}/tools/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const t of TOOLS) {
    if (toolSlugs.has(t.id)) continue;
    toolSlugs.add(t.id);
    toolUrls.push({
      url: `${BASE}/tools/${t.id}`,
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

  // Glossary — DB + hardcoded
  const cmsTerms = await getAllGlossaryTerms().catch(() => []);
  const termSlugs = new Set<string>();
  const glossaryUrls: MetadataRoute.Sitemap = [];
  for (const t of cmsTerms) {
    if (termSlugs.has(t.slug)) continue;
    termSlugs.add(t.slug);
    glossaryUrls.push({
      url: `${BASE}/glossary#${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }
  for (const t of GLOSSARY) {
    const slug = slugifyTerm(t.term);
    if (termSlugs.has(slug)) continue;
    termSlugs.add(slug);
    glossaryUrls.push({
      url: `${BASE}/glossary#${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return [...staticRoutes, ...toolUrls, ...categoryUrls, ...blogUrls, ...glossaryUrls];
}

/**
 * /llms.txt — a curated content map for LLM agents (llmstxt.org).
 *
 * Generated from the live DB so counts and links never go stale.
 * Neither Futurepedia nor most directories ship one; the cost is a
 * single cached route and the upside is better retrieval/citation by
 * AI assistants (Anthropic, Perplexity, and several agent frameworks
 * fetch it in practice — no engine *requires* it).
 *
 * Cached 6h to match the sitemap cadence.
 */

import {
  getAllCategories,
  getCategoryStats,
  getPublishedTools,
  getPublishedBlogPosts,
} from "@/lib/cms";

// force-dynamic (not build-time render) — see app/[locale]/ai-tools/page.tsx
// for why: keeps DB queries out of the build (a fresh Vercel build can
// start while the free-tier DB compute is cold). LLM crawl volume is low
// enough that per-request rendering is fine without the 6h cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.SITE_URL ?? "https://aitoolsset.com";

export async function GET(): Promise<Response> {
  const [cats, stats, tools, posts] = await Promise.all([
    getAllCategories().catch(() => []),
    getCategoryStats().catch(() => new Map<string, { count: number }>()),
    getPublishedTools().catch(() => []),
    getPublishedBlogPosts().catch(() => []),
  ]);

  const toolCount = tools.length;

  // Top categories by live tool count.
  const topCats = cats
    .map((c) => ({ ...c, count: stats.get(c.slug)?.count ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  // Most-saved tools = the reviews people actually look for.
  const topTools = [...tools]
    .sort((a, b) => (b.saveCount ?? 0) - (a.saveCount ?? 0))
    .slice(0, 50);

  const lines: string[] = [
    "# AI Tools Set",
    "",
    `> Hand-reviewed directory of ${toolCount} AI tools across ${cats.length} categories.`,
    "> Every listing includes a written overview, verified pricing tiers, launch year,",
    "> pros/cons, platforms, and integrations. Facts are editor-maintained.",
    "",
    "## Tool categories (live counts)",
    ...topCats.map(
      (c) => `- [Best AI ${c.name} Tools](${BASE}/ai-tools/${c.slug}): ${c.count} reviewed tools, compared by pricing and features`
    ),
    "",
    "## Most-referenced tool reviews",
    ...topTools.map(
      (t) => `- [${t.name} review](${BASE}/ai-tool/${t.slug}): ${(t.tagline ?? "").slice(0, 110)}`
    ),
    "",
    "## Editorial",
    ...posts.slice(0, 20).map((p) => `- [${p.title}](${BASE}/blog/${p.slug})`),
    `- [AI glossary — plain-English definitions](${BASE}/glossary)`,
    "",
    "## Optional",
    `- [Browse all categories](${BASE}/ai-tools)`,
    `- [Submit a tool](${BASE}/submit)`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=21600",
    },
  });
}

import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? "https://aitoolsset.com";

// Paths that are private, duplicative, or index bloat.
// /search is also noindexed at the page level (belt and braces).
const DISALLOW = [
  "/admin",
  "/admin/",
  "/api/",
  "/saved",
  "/search",
  "/u/",
  "/uploads/",
];

// AI/LLM crawlers named explicitly so a future edit can't silently
// block them. Being crawlable by these engines is core strategy:
// it's how the directory gets cited in ChatGPT / Claude / Perplexity /
// Gemini answers. They inherit the same disallow list as everyone.
const AI_CRAWLERS = [
  "GPTBot",            // OpenAI — ChatGPT browsing + training
  "OAI-SearchBot",     // OpenAI — ChatGPT search index
  "ClaudeBot",         // Anthropic — Claude training + retrieval
  "Claude-Web",        // Anthropic — Claude live browsing
  "anthropic-ai",      // Anthropic — legacy UA
  "PerplexityBot",     // Perplexity — search index
  "Google-Extended",   // Google — Gemini training (allowed for GEO visibility)
  "Applebot-Extended", // Apple Intelligence
  "meta-externalagent",// Meta AI
  "CCBot",             // Common Crawl — feeds many open models
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

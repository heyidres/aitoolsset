import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? "https://aitoolsset.com";

// Paths that are duplicative or index bloat for ordinary app routes.
// Deliberately does NOT list /portal-admin or /api/ — robots.txt is a public,
// unauthenticated file any crawler (or attacker doing recon) can fetch,
// so it must never be used to "hide" sensitive infrastructure; doing so
// just hands out a map of interesting paths. Real protection for those
// comes from auth (NextAuth + MFA gate on /portal-admin) and from each route's
// own `robots: { index: false }` metadata (see app/portal-admin/layout.tsx,
// app/[locale]/saved/page.tsx), which keeps them out of Google without
// broadcasting the path here. /search is listed below for a different,
// non-security reason: it has effectively unbounded query-parameter
// URL space, so disallowing it here also protects crawl budget.
const DISALLOW = ["/saved", "/search", "/u/", "/uploads/"];

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

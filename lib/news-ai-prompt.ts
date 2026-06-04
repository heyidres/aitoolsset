/**
 * ──────────────────────────────────────────────────────────────────────────
 *  AI DRAFT WORKFLOW — Integration stub
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  This module is the boundary where the editorial-automation system plugs
 *  in. Today, news articles render directly from RSS metadata (title +
 *  description). To turn each RSS hit into a full SEO-optimised article
 *  draft, a scheduled job needs to:
 *
 *    1. Pull new posts from `fetchAllNews()` (lib/news.ts).
 *    2. Skip posts that already have a `draft` (deduplication).
 *    3. Call Claude with the prompt below, passing the RSS title +
 *       description + source URL.
 *    4. Persist the returned draft to the database (status = "draft").
 *    5. Notify editors. They flip status → "review" → "approved" →
 *       "published" via an admin UI.
 *
 *  None of those steps live in this Next.js project yet — they require:
 *    - Vercel Cron (or a queue worker) for scheduling
 *    - An Anthropic API key + billing
 *    - Postgres (CLAUDE.md plans Neon) for draft storage + state
 *    - NextAuth/Clerk for editor identity
 *    - An /admin route for the editorial workflow
 *
 *  Everything below is type-safe and ready to call once those pieces are
 *  in place. The exported `DRAFT_PROMPT` and `buildDraftMessages()` are
 *  what the cron worker would import.
 * ──────────────────────────────────────────────────────────────────────────
 */

import type { EditorialDraft } from "./news";

/**
 * The exact prompt sent to Claude for each new RSS item.
 * Designed to produce SEO-optimised, human-sounding tech journalism —
 * not AI-spam. Output is required to be a strict JSON object matching
 * `EditorialDraft` so it can be persisted directly.
 */
export const DRAFT_PROMPT = `You are a senior tech journalist writing breaking news for AI Tools Set,
a curated AI tools directory and editorial site. Your writing style is the
voice of a publication like The Verge, TechCrunch, or Ars Technica —
clear, factual, slightly opinionated, never breathless. You do not write
like an LLM. You write like a human who cares about being first AND right.

You will receive a single news item: a headline, a short description,
and the source URL. Your job is to produce a FIRST DRAFT only — an
editor will review, fact-check, and rewrite before publication. Be
explicit about anything you cannot verify from the source material.

Hard rules:
- NEVER invent quotes, statistics, benchmark numbers, dates, or product names.
- If the source doesn't mention something specific, write around it. Do not embellish.
- Open with the most important fact. No "In a world where AI is transforming..." intros.
- Use short paragraphs. 2-3 sentences each.
- Cite the source URL inline at least once, naturally.
- Write a 60-80 word introduction that could stand alone as a Google Discover summary.
- Generate 3-5 key highlights — punchy, scannable, factual.
- Suggest 2-4 internal links to /tools/[slug], /ai-tools/[category], /blog, /leaderboard if relevant.
- Suggest 3-5 external citations: the source URL + 2-4 plausible secondary sources (other outlets, official docs, benchmark sites).
- Generate 3 FAQs that real readers would search for.
- Output STRICT JSON only. No markdown wrappers. No commentary outside the JSON.

JSON schema:
{
  "seoTitle": string,             // 50-60 chars, includes primary keyword
  "metaDescription": string,      // 140-160 chars, must summarise + tease
  "introduction": string,         // 60-80 words, no AI cliches
  "keyHighlights": string[],      // 3-5 items, 8-16 words each, factual
  "body": string,                 // The article body in HTML. Use <h2>, <h3>, <p>, <strong>, <a href>.
                                  // 400-700 words. Multiple sections.
  "expertCommentary": string,     // 1-2 paragraph editorial take. "What this means."
  "faqs": [
    { "q": string, "a": string }  // 3 items
  ],
  "internalLinks": [
    { "label": string, "href": string }  // 2-4 items, hrefs start with /
  ],
  "citations": [
    { "label": string, "url": string }   // 3-5 items, first must be the source URL
  ]
}`;

export type DraftInput = {
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: number;
};

/**
 * Build the message array to send to Claude.
 * Returns the structure expected by `@anthropic-ai/sdk` so the cron
 * worker can call \`anthropic.messages.create({ messages, system, ... })\`
 * directly.
 */
export function buildDraftMessages(input: DraftInput): {
  system: string;
  messages: { role: "user"; content: string }[];
} {
  return {
    system: DRAFT_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          `Source: ${input.sourceName}`,
          `URL: ${input.sourceUrl}`,
          `Published: ${new Date(input.publishedAt).toISOString()}`,
          `Headline: ${input.title}`,
          ``,
          `Description: ${input.description}`,
          ``,
          `Produce the JSON draft now.`,
        ].join("\n"),
      },
    ],
  };
}

/**
 * Stub: where the cron worker would actually call Claude.
 * Throws because we haven't wired the Anthropic SDK yet.
 *
 * To enable:
 *   1. \`npm install @anthropic-ai/sdk\`
 *   2. Add ANTHROPIC_API_KEY to environment
 *   3. Replace the body with:
 *
 *      import Anthropic from "@anthropic-ai/sdk";
 *      const client = new Anthropic();
 *      const { system, messages } = buildDraftMessages(input);
 *      const res = await client.messages.create({
 *        model: "claude-opus-4-7",
 *        max_tokens: 4096,
 *        system,
 *        messages,
 *      });
 *      const text = res.content
 *        .filter((b) => b.type === "text")
 *        .map((b) => b.text)
 *        .join("");
 *      return JSON.parse(text) as EditorialDraft;
 */
export async function generateDraft(_input: DraftInput): Promise<EditorialDraft> {
  throw new Error(
    "generateDraft() is not wired. See lib/news-ai-prompt.ts for the integration steps."
  );
}

/**
 * Deduplication helper for the cron worker.
 * Two posts are considered the same story if their canonicalised
 * titles overlap by ≥0.8 (token-set Jaccard). The worker should run
 * this against the last ~50 published posts before generating a draft.
 */
export function isDuplicateOf(candidate: string, existing: string[]): boolean {
  const toks = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .split(/\s+/)
        .filter((w) => w.length >= 3)
    );
  const c = toks(candidate);
  for (const e of existing) {
    const t = toks(e);
    const inter = new Set([...c].filter((x) => t.has(x)));
    const union = new Set([...c, ...t]);
    if (union.size === 0) continue;
    const j = inter.size / union.size;
    if (j >= 0.6) return true;
  }
  return false;
}

/**
 * Drafting pipeline — three stages, cascading-provider model layer:
 *
 *   Stage 1 — OUTLINE   (Gemini → Groq → Anthropic)
 *     Reads the event title + summary + source URL. Returns a JSON
 *     outline: working title, angle, key facts, citations to fetch.
 *
 *   Stage 2 — RESEARCH  (no LLM)
 *     Fetches the original announcement + each citation URL the
 *     outline named. Strips to text. Caps total grounding text.
 *
 *   Stage 3 — DRAFT     (Gemini → Groq → Anthropic)
 *     Writes the article from outline + research. Output matches
 *     the news_posts.draft jsonb shape so the editor's existing
 *     news admin form can render it without changes.
 *
 * Provider priority: Gemini 2.5 Flash (free, 1500 req/day) →
 * Groq Llama 3.3 70B (free, 14400 req/day) → Anthropic Claude
 * (paid). On a quota / rate-limit / auth failure for one provider
 * we transparently fall through to the next. Configure via env:
 *   GEMINI_API_KEY (recommended)
 *   GROQ_API_KEY   (recommended fallback)
 *   ANTHROPIC_API_KEY (optional — kept for parity with the rest of the app)
 *
 * The whole pipeline is wrapped in try/catch — failures land in the
 * news_draft_jobs.error column for the observability dashboard.
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { fetchSourceBody } from "@/lib/news-detect/adapters";
import type { newsDetectionEvents } from "@/lib/db/schema";

// ── Per-stage model picks ────────────────────────────────────
// Both stages use the same cascade. Outline naturally consumes
// far fewer tokens so cost isn't a factor; using the same model
// across stages keeps the JSON-shape behavior consistent.
const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const ANTHROPIC_MODEL = "claude-haiku-4-5"; // fallback only

type Provider = "gemini" | "groq" | "anthropic";

export type Outline = {
  workingTitle: string;
  angle: string;
  keyFacts: string[];
  whyMatters: string;
  whoAffected: string[];
  citationsToFetch: string[];
  proposedTopic: string; // matches the news_topic enum
  proposedCategories: string[];
};

export type DraftResult = {
  seoTitle: string;
  metaDescription: string;
  introduction: string;
  keyHighlights: string[];
  body: string; // sanitized HTML
  expertCommentary?: string;
  faqs?: Array<{ q: string; a: string }>;
  internalLinks?: Array<{ label: string; href: string }>;
  citations: Array<{ label: string; url: string }>;
  headline: string;
  description: string;
  tag: string;
  topic: string;
  categories: string[];
  breaking: boolean;
  _confidence: Record<string, "high" | "medium" | "low">;
};

type DetectionEvent = typeof newsDetectionEvents.$inferSelect;

// ─────────────────────────────────────────────────────────────
// STAGE 1 — OUTLINE
// ─────────────────────────────────────────────────────────────

const OUTLINE_SYSTEM = `You are the lead news editor at AI Tools Set, an AI + cybersecurity industry newsroom.

You are given a freshly detected announcement (title, summary, source URL). Your job is to decide if this is worth a full article, and if so, output an editorial outline.

OUTPUT FORMAT — strict JSON, no prose, no markdown fence:

{
  "workingTitle": "<one sharp, journalistic working title, 60-90 chars, NOT the press-release headline rephrased>",
  "angle": "<one sentence: what's the real story BEYOND the announcement? competitive pressure? hidden tradeoff? safety concern?>",
  "keyFacts": ["<5-7 concrete facts pulled from the source, each under 25 words>"],
  "whyMatters": "<one sentence: why does the reader (AI builder / security team / policymaker) care today?>",
  "whoAffected": ["<3-5 audiences: e.g. 'OpenAI API customers on the Tier 4 plan', 'CISOs at regulated industries'>"],
  "citationsToFetch": ["<2-4 EXTERNAL urls worth fetching for grounding: competitor announcements, prior coverage, regulatory text. Skip if the source is self-sufficient.>"],
  "proposedTopic": "<one of: 'model-release' | 'funding' | 'partnership' | 'product' | 'research' | 'policy' | 'security' | 'ecosystem'>",
  "proposedCategories": ["<1-3 tags: 'AI', 'Security', 'Policy', 'Research', 'Funding', 'OpenAI', 'Anthropic' etc>"]
}

RULES:
- BANNED in workingTitle: 'unveils', 'introduces', 'announces', 'showcases', 'revolutionary', 'cutting-edge', 'game-changing'. These read as press-release rewrites.
- If the announcement is genuinely non-newsworthy (a minor docs update, a podcast episode, a recap blog), set workingTitle to "" — the worker will skip drafting.
- proposedTopic must be one of the listed values verbatim.
- citationsToFetch must be valid http(s) URLs from credible sources. Empty array is fine if you don't know any.`;

function buildOutlinePrompt(event: DetectionEvent): string {
  return `SOURCE: ${event.sourceName} (${event.sourceCategory})
URL: ${event.url}
TITLE: ${event.title}
PUBLISHED: ${event.publishedAt?.toISOString() ?? "unknown"}

SUMMARY / SNIPPET:
${event.summary ?? "(none — work from the title only)"}

RAW CONTENT (truncated):
${event.rawContent ?? "(none)"}

Now output the editorial outline JSON.`;
}

async function generateOutline(event: DetectionEvent): Promise<{ outline: Outline | null; provider: Provider } | null> {
  const prompt = buildOutlinePrompt(event);
  const result = await runWithFallback({
    system: OUTLINE_SYSTEM,
    user: prompt,
    maxTokens: 1500,
  });
  if (!result) return null;
  const cleaned = result.text.trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const parsed = JSON.parse(cleaned) as Outline;
    if (!parsed.workingTitle?.trim()) return { outline: null, provider: result.provider };
    return { outline: parsed, provider: result.provider };
  } catch {
    return { outline: null, provider: result.provider };
  }
}

// ─────────────────────────────────────────────────────────────
// STAGE 2 — RESEARCH
// ─────────────────────────────────────────────────────────────

export type ResearchBundle = {
  primarySource: { url: string; text: string };
  groundingSources: Array<{ url: string; text: string; ok: boolean }>;
};

export async function fetchResearch(
  event: DetectionEvent,
  outline: Outline,
  charsPerSource: number
): Promise<ResearchBundle> {
  // Always fetch the primary announcement.
  const primary = await fetchAndStrip(event.url, charsPerSource * 2);

  // Fetch each citation in parallel, dropping the ones that fail.
  const cites = await Promise.all(
    outline.citationsToFetch.slice(0, 4).map((url) => fetchAndStrip(url, charsPerSource))
  );

  return {
    primarySource: { url: event.url, text: primary.text },
    groundingSources: cites,
  };
}

async function fetchAndStrip(url: string, cap: number): Promise<{ url: string; text: string; ok: boolean }> {
  const fetched = await fetchSourceBody(url);
  if (!fetched.ok) return { url, text: "", ok: false };
  const text = fetched.body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, cap);
  return { url, text, ok: text.length > 200 };
}

// ─────────────────────────────────────────────────────────────
// STAGE 3 — DRAFT (Claude Opus 4.7)
// ─────────────────────────────────────────────────────────────

const DRAFT_SYSTEM = `You are a senior reporter at AI Tools Set, an AI + cybersecurity newsroom. Your prose is the quality bar of Wirecutter long-form: concrete, sourced, useful, never breathless.

You receive an editorial outline + grounding text from the primary source AND independent prior coverage. You write the full article.

OUTPUT — strict JSON matching this exact schema (no prose, no markdown fence):

{
  "headline":        "<60-90 chars. Mirrors the outline's workingTitle but tighter. NO 'unveils/introduces/announces' verbs.>",
  "description":     "<150-160 char dek used as the SERP meta description AND as the lead-card deck.>",
  "seoTitle":        "<60-65 chars optimized for search. Includes the company + the news + a year or version when relevant.>",
  "metaDescription": "<150-160 chars. Names the player, the action, the impact, ends with a verb (Read why / How it works).>",
  "introduction":    "<2 paragraph HTML lede. Paragraph 1: WHAT happened, in concrete terms. Paragraph 2: WHY it matters today. Wrap key terms in <strong>. NO 'breakthrough', 'revolutionary'.>",
  "keyHighlights":   ["<3-5 single-line takeaways. Each ≤ 14 words. Lead with a verb or named figure.>"],
  "body":            "<6-9 paragraphs HTML. Real journalistic structure: lede (already in introduction), CONTEXT (what came before this), DETAILS (the specifics from the source — pricing, model names, dates), REACTION/COMPARISON (what does this mean vs Anthropic / OpenAI / etc.), WHO IS AFFECTED, WHAT TO WATCH. Use <p>, <strong>, <em>, <a href='...'> only. EVERY <a> must link to a real URL from the research bundle. At least 2 inline citations to the primary source. Avoid 'in conclusion' / 'in summary' filler paragraphs.>",
  "expertCommentary":"<Optional. One paragraph of editorial analysis from the AI Tools Set newsroom POV — what's the angle competitors will miss? Skip if the story doesn't warrant it.>",
  "faqs":            [{ "q": "<question users will Google>", "a": "<2-sentence answer with inline source link>" }],
  "internalLinks":   [{ "label": "<related tool or category name>", "href": "</ai-tool/SLUG or /ai-tools/SLUG>" }],
  "citations":       [{ "label": "<source name>", "url": "<https url>" }],
  "tag":             "<short kicker shown on the listing card. e.g. 'Model Release', 'Funding', 'Vulnerability'>",
  "topic":           "<one of: model-release | funding | partnership | product | research | policy | security | ecosystem — copy the outline.proposedTopic>",
  "categories":      ["<1-3 high-level tags from outline.proposedCategories>"],
  "breaking":        <true | false — true only if the announcement is < 6 hours old AND high-impact (model release, major funding, active CVE).>,
  "_confidence":     {
    "headline": "high|medium|low",
    "introduction": "high|medium|low",
    "body": "high|medium|low",
    "faqs": "high|medium|low",
    "citations": "high|medium|low"
  }
}

ABSOLUTE RULES:
- This is journalism, NOT a press-release rewrite. The angle must add reporting value: timeline, comparison, sourcing, or 'what to watch'.
- BANNED phrases anywhere in the article: 'revolutionary', 'game-changing', 'unleash', 'powerful', 'next-generation', 'cutting-edge', 'unveils', 'introduces', 'showcases', 'redefines', 'paradigm shift', 'innovative solution'.
- Every claim that names a number, a date, or a competitor must be tied to a citation in the research bundle. If you don't have one, omit the claim. NEVER invent.
- Every <a> must point to a real URL from primarySource or groundingSources. NO placeholder URLs.
- Use sentence case in headlines, never Title Case.
- Confidence: 'high' = directly stated in primary source. 'medium' = inferred from context across sources. 'low' = guess. Be honest.`;

export async function generateArticle(
  event: DetectionEvent,
  outline: Outline,
  research: ResearchBundle
): Promise<{ draft: DraftResult; raw: string; prompt: string; provider: Provider }> {
  const groundingText = [
    `=== PRIMARY SOURCE ===\nURL: ${research.primarySource.url}\n${research.primarySource.text || "(could not fetch — work from event.rawContent)"}`,
    ...research.groundingSources
      .filter((g) => g.ok)
      .map((g) => `=== GROUNDING ===\nURL: ${g.url}\n${g.text}`),
  ].join("\n\n");

  const user = `OUTLINE:
${JSON.stringify(outline, null, 2)}

RESEARCH BUNDLE:
${groundingText}

ORIGINAL DETECTION:
Source: ${event.sourceName}
Detected at: ${event.detectedAt?.toISOString()}
Published at: ${event.publishedAt?.toISOString() ?? "unknown"}

Now write the article JSON. Remember: every URL in body / faqs / citations MUST be a real URL from the research bundle. Output ONLY the JSON.`;

  const result = await runWithFallback({
    system: DRAFT_SYSTEM,
    user,
    maxTokens: 6000,
  });
  if (!result) throw new Error("All AI providers exhausted (drafting)");

  const cleaned = result.text.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed = JSON.parse(cleaned) as DraftResult;
  return { draft: parsed, raw: result.text, prompt: user, provider: result.provider };
}

// ─────────────────────────────────────────────────────────────
// PUBLIC ENTRY POINT
// ─────────────────────────────────────────────────────────────

export type RunDraftResult = {
  ok: boolean;
  outline?: Outline;
  research?: ResearchBundle;
  draft?: DraftResult;
  raw?: string;
  prompt?: string;
  provider: string;
  error?: string;
};

export async function runDraftPipeline(
  event: DetectionEvent,
  charsPerSource: number
): Promise<RunDraftResult> {
  if (!hasAnyProvider()) {
    return {
      ok: false,
      provider: "none",
      error:
        "No AI provider configured. Set GEMINI_API_KEY (free, https://aistudio.google.com/apikey) or GROQ_API_KEY (free, https://console.groq.com/keys) or ANTHROPIC_API_KEY in your env.",
    };
  }

  try {
    const outlineResult = await generateOutline(event);
    if (!outlineResult || !outlineResult.outline) {
      return {
        ok: false,
        provider: outlineResult?.provider ?? "none",
        error: "outline skipped — story not newsworthy",
      };
    }
    const research = await fetchResearch(event, outlineResult.outline, charsPerSource);
    const { draft, raw, prompt, provider } = await generateArticle(event, outlineResult.outline, research);
    return {
      ok: true,
      outline: outlineResult.outline,
      research,
      draft,
      raw,
      prompt,
      provider: `${provider}/${activeModel(provider)}`,
    };
  } catch (e) {
    return {
      ok: false,
      provider: "draft-stage",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// PROVIDER CASCADE
// ─────────────────────────────────────────────────────────────

/**
 * Errors that mean "this provider is unavailable RIGHT NOW — try
 * the next one." Anything else (parse error, malformed prompt) is
 * deterministic and bubbles up.
 */
function isProviderUnavailable(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err).toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("rate_limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("credit balance") ||
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("authentication") ||
    msg.includes("unauthorized") ||
    msg.includes("401") ||
    msg.includes("invalid api key")
  );
}

function hasAnyProvider(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY);
}

function activeModel(p: Provider): string {
  if (p === "gemini") return GEMINI_MODEL;
  if (p === "groq") return GROQ_MODEL;
  return ANTHROPIC_MODEL;
}

/**
 * Run a single LLM call with cascading providers. Returns the first
 * provider that succeeds. On a quota/auth failure for one provider
 * the next is tried. Any other error bubbles up.
 */
async function runWithFallback(args: {
  system: string;
  user: string;
  maxTokens: number;
}): Promise<{ text: string; provider: Provider } | null> {
  const chain: Array<{ id: Provider; enabled: boolean; run: () => Promise<string> }> = [
    { id: "gemini",    enabled: !!process.env.GEMINI_API_KEY,    run: () => runGemini(args) },
    { id: "groq",      enabled: !!process.env.GROQ_API_KEY,      run: () => runGroq(args) },
    { id: "anthropic", enabled: !!process.env.ANTHROPIC_API_KEY, run: () => runAnthropic(args) },
  ];
  const active = chain.filter((p) => p.enabled);
  if (active.length === 0) return null;

  let lastErr: unknown = null;
  for (const p of active) {
    try {
      const text = await p.run();
      if (text && text.trim()) return { text, provider: p.id };
    } catch (e) {
      lastErr = e;
      if (!isProviderUnavailable(e)) throw e;
      console.warn(`[news-draft] ${p.id} unavailable, trying next provider…`, e instanceof Error ? e.message : e);
    }
  }
  throw lastErr instanceof Error
    ? new Error(`All AI providers exhausted. Last error from ${active[active.length - 1].id}: ${lastErr.message}`)
    : new Error("All AI providers exhausted.");
}

// ── Gemini ──────────────────────────────────────────────────
async function runGemini({ system, user, maxTokens }: { system: string; user: string; maxTokens: number }): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: user,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  });
  const text = response.text;
  if (!text) throw new Error("Gemini returned no content");
  return text;
}

// ── Groq (OpenAI-compatible REST) ───────────────────────────
async function runGroq({ system, user, maxTokens }: { system: string; user: string; maxTokens: number }): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body.slice(0, 300) || res.statusText}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no content");
  return text;
}

// ── Anthropic (fallback only) ───────────────────────────────
async function runAnthropic({ system, user, maxTokens }: { system: string; user: string; maxTokens: number }): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const blocks = response.content as Array<{ type: string; text?: string }>;
  const block = blocks.find((b) => b.type === "text" && typeof b.text === "string");
  if (!block?.text) throw new Error("Claude returned no text content");
  return block.text;
}

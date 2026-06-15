/**
 * ─────────────────────────────────────────────────────────────
 *  Tool auto-fill — multi-source + SEO + confidence scoring
 * ─────────────────────────────────────────────────────────────
 *
 *  Three providers tried in priority order with auto-fallback on
 *  quota / rate-limit / auth failures:
 *
 *   1) Google Gemini (gemini-2.5-flash)            — FREE, top-tier
 *      • 15 RPM, 1500 requests/day | GEMINI_API_KEY
 *      • https://aistudio.google.com/apikey
 *
 *   2) Groq Llama 3.3 70B (llama-3.3-70b-versatile) — FREE, top-tier
 *      • 30 RPM, 14,400 requests/day | GROQ_API_KEY
 *      • https://console.groq.com/keys
 *
 *   3) Anthropic Claude Haiku (claude-haiku-4-5)    — PAID
 *      • ~$0.005 per call | ANTHROPIC_API_KEY
 *
 *  Multi-source flow:
 *   1) Fetch homepage + /pricing + /about + /features in parallel.
 *      Each fetch soft-fails; we work with whatever returned.
 *   2) Strip every page to readable text, concat with section
 *      markers so the model knows which source each fact came from.
 *   3) Ask the provider for a structured editorial result INCLUDING
 *      SEO meta, expanded socials, use cases, platforms, integrations,
 *      and a per-field confidence rating ("high" | "medium" | "low").
 *   4) Return a typed AutofillResult the form merges into client
 *      state. Low-confidence fields render with a warning badge so
 *      the editor reviews them before publishing.
 * ─────────────────────────────────────────────────────────────
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const ANTHROPIC_MODEL = "claude-haiku-4-5";
const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/** Per-field confidence rating returned by the AI. */
export type ConfidenceLevel = "high" | "medium" | "low";
export type ConfidenceMap = Record<string, ConfidenceLevel>;

export type AutofillResult = {
  description: string; // HTML
  tagline: string;
  // SEO meta — generated alongside content so they align with the keywords used in the prose.
  seoTitle: string;
  seoDescription: string;
  // Editorial
  madeBy: string | null;
  launched: string | null;
  weeklyUsers: string | null;
  startingPrice: string | null;
  pricing: "free" | "freemium" | "paid" | "credit" | "trial" | "enterprise" | null;
  hasApi: boolean | null;
  mobileApp: string | null;
  browserExtension: boolean | null;
  socials: {
    x?: string | null;
    linkedin?: string | null;
    github?: string | null;
    youtube?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    discord?: string | null;
  } | null;
  features: Array<{ title: string; desc: string }> | null;
  /** Concrete jobs the tool helps users complete. */
  useCases: string[] | null;
  /** OS + surface availability — "Web", "macOS", "iOS", "API", etc. */
  platforms: string[] | null;
  /** Third-party integrations — "Zapier", "Slack", "Notion", etc. */
  integrations: string[] | null;
  /** Keyword-rich tag list. Doubles as primary + secondary SEO keywords. */
  tags: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  plans: Array<{
    name: string;
    price: string;
    period: string;
    popular?: boolean;
    feats: string[];
  }> | null;
  /** Per-field confidence rating. Form flags "low" entries for manual review. */
  _confidence: ConfidenceMap;
};

const SYSTEM_PROMPT = `You are a senior editorial researcher for AI Tools Set (aitoolsset.com), a high-traffic AI tools directory that ranks on Google. Your output IS the public-facing tool listing — write at the quality level of a Wirecutter or Tom's Guide review.

INPUT: tool name, website URL, and text scraped from multiple pages of the official site (homepage, /pricing, /about, /features). Each section is labelled with its source URL so you can cross-reference.

OUTPUT: a single JSON object. NO prose. NO markdown fence. NO commentary. Match this exact schema:

{
  "description": "<HTML, 3-4 paragraphs. Use <p>, <strong>, <em>, <a href=''>. NO <h1-h6>, <script>, <style>. Paragraph 1: what the tool IS and what specific problem it solves — lead with the action it performs, not adjectives. Paragraph 2: who it's for + concrete capabilities (name actual features, not 'powerful AI'). Paragraph 3: pricing tiers in plain language + bottom-line verdict. Use the tool name 2-3 times naturally, weave in 2-3 keyword phrases. Sound like a human reviewer who tested it, not marketing copy.>",
  "tagline": "<one declarative sentence, 90-130 chars, names what the tool does and for whom. NO 'revolutionary', 'cutting-edge', 'unleash', 'unlock the power of', 'next-generation'. Lead with a verb.>",
  "seoTitle": "<50-60 chars. Click-optimized search snippet. Format options: '<Tool Name> Review 2026: <Capability> & Pricing' OR '<Tool Name>: <Specific Use Case> AI Tool' OR '<Tool Name> Pricing, Features & Alternatives 2026'. Include the tool name. Include the year ONLY if the tool is recent/trendy.>",
  "seoDescription": "<150-160 chars. Meta description for Google SERP. Names the tool, its primary capability, the pricing model, and ends with an action ('Compare features', 'Try free', 'Read review'). Include 1-2 secondary keywords naturally. NO ellipsis at the end.>",
  "madeBy": "<exact company that built it. Look in /about, footer copyright, LinkedIn bio. e.g. 'OpenAI', 'Stability AI Ltd.' or null if you genuinely can't determine.>",
  "launched": "<short launch date e.g. 'Nov 2022', 'Q1 2024'. Check /about or press mentions. null if unknown.>",
  "weeklyUsers": "<e.g. '200M+', '50k', '10k+'. Use the figure the tool itself publishes. null if not stated.>",
  "startingPrice": "<exact lowest paid tier, e.g. '$10/mo', 'Free', '$0', '$8/mo'. Pull from /pricing.>",
  "pricing": "<one of: 'free' (truly free, no paid tier) | 'freemium' (free tier + paid upgrade) | 'paid' (no free tier) | 'credit' (pay-per-use / token-based) | 'trial' (free trial only, then paid) | 'enterprise' (custom pricing / sales-led only)>",
  "hasApi": <true if /api docs OR API mentioned on /pricing OR /about | false if explicitly no API | null if unclear>,
  "mobileApp": "<'iOS & Android' | 'iOS only' | 'Android only' | null. Check footer App Store / Play Store links.>",
  "browserExtension": <true|false|null>,
  "socials": {
    "x": "<full https URL or null. Look in footer + /about.>",
    "linkedin": "<full https URL or null>",
    "github": "<full https URL or null>",
    "youtube": "<full https URL or null>",
    "facebook": "<full https URL or null>",
    "instagram": "<full https URL or null>",
    "discord": "<full https discord.gg or invite URL or null>"
  },
  "features": [
    {"title": "<Feature name in 2-5 words>", "desc": "<One specific sentence — what it does, NOT why it's great.>"}
  ],
  "useCases": ["<5-7 concrete jobs users complete. Each starts with a verb. e.g. 'Generate ad creatives for Facebook campaigns', 'Transcribe Zoom calls into searchable notes'.>"],
  "platforms": ["<Pick from: 'Web', 'macOS', 'Windows', 'Linux', 'iOS', 'Android', 'API', 'Chrome Extension', 'VS Code', 'Discord Bot', 'Slack App'. Only include verified ones.>"],
  "integrations": ["<Third-party tools this connects to. e.g. 'Zapier', 'Slack', 'Notion', 'Figma', 'Google Drive', 'GitHub', 'Stripe'. Only include explicitly mentioned ones.>"],
  "tags": ["<5-8 keyword-rich tags. Mix the primary category (e.g. 'Image Generation'), 2-3 use-case keywords (e.g. 'Marketing AI'), and 1-2 audience tags (e.g. 'For Designers'). These double as SEO keywords woven into the description.>"],
  "pros": ["<4-6 specific strong points. Each under 80 chars. Cite an actual feature, not a vibe.>"],
  "cons": ["<3-5 honest limitations. Each under 80 chars. Pricing caveats, missing features, learning curve specifics.>"],
  "plans": [
    {"name": "Free", "price": "$0", "period": "/month", "popular": false, "feats": ["concrete feat 1", "concrete feat 2", "concrete feat 3"]}
  ],
  "_confidence": {
    "description": "high|medium|low",
    "tagline": "high|medium|low",
    "seoTitle": "high|medium|low",
    "seoDescription": "high|medium|low",
    "madeBy": "high|medium|low",
    "launched": "high|medium|low",
    "weeklyUsers": "high|medium|low",
    "startingPrice": "high|medium|low",
    "pricing": "high|medium|low",
    "hasApi": "high|medium|low",
    "mobileApp": "high|medium|low",
    "browserExtension": "high|medium|low",
    "socials": "high|medium|low",
    "features": "high|medium|low",
    "useCases": "high|medium|low",
    "platforms": "high|medium|low",
    "integrations": "high|medium|low",
    "tags": "high|medium|low",
    "pros": "high|medium|low",
    "cons": "high|medium|low",
    "plans": "high|medium|low"
  }
}

CRITICAL RULES:
- Cross-reference facts across the provided source URLs. If /pricing says "$10/mo" and /about doesn't mention price, that's HIGH confidence. If only the homepage hints at pricing without specifics, that's LOW confidence.
- Use null when you genuinely don't know. NEVER invent.
- Rate confidence honestly. "high" = explicit in source text. "medium" = inferred from context. "low" = guess based on category norms or unverified.
- BANNED PHRASES in description/tagline: 'revolutionary', 'cutting-edge', 'next-generation', 'powerful', 'seamless', 'state-of-the-art', 'game-changing', 'unleash', 'unlock the power of', 'leverage', 'innovative solution', 'comprehensive platform', 'robust suite'. If you find yourself writing these, REWRITE with concrete specifics.
- Every paragraph in the description must contain at least one specific, verifiable fact (a feature name, number, integration, pricing detail).
- Vary sentence structure — don't start three sentences in a row with the same word.
- Keep tone factual and useful. The reader is deciding whether to spend their time on this tool. Help them.`;

// ── Multi-source fetch ───────────────────────────────────────
type FetchedSource = { url: string; text: string };

const SCRAPE_PATHS = ["", "/pricing", "/about", "/features"];

async function fetchOneSource(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(7000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ") // strip site nav
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#x?\d+;/gi, " ") // strip remaining entities
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return null;
  }
}

/**
 * Fetch the homepage + 3 likely info pages from the same origin in
 * parallel. Soft-fails per URL — returns whatever came back. The
 * model uses the combination to cross-validate facts.
 */
async function fetchSources(rootUrl: string): Promise<FetchedSource[]> {
  let base: URL;
  try {
    base = new URL(rootUrl);
  } catch {
    return [];
  }
  const origin = `${base.protocol}//${base.host}`;

  // Strip trailing slash from path so concatenation is clean
  const rootPath = base.pathname.replace(/\/$/, "");

  const urls = SCRAPE_PATHS.map((p) => {
    // Homepage uses the URL the editor pasted verbatim — preserves
    // /products/foo style nested apps. Sub-paths hit the origin root.
    if (p === "") return rootUrl;
    return `${origin}${p}`;
  });

  const results = await Promise.all(
    urls.map(async (u) => {
      const text = await fetchOneSource(u);
      return text ? { url: u, text } : null;
    })
  );

  return results.filter((r): r is FetchedSource => !!r);
}

function buildUserMessage(name: string, websiteUrl: string, sources: FetchedSource[]): string {
  if (sources.length === 0) {
    return `Tool name: ${name}\nWebsite: ${websiteUrl}\n\n(All source pages failed to fetch — work from training-data knowledge of this tool. Set every _confidence field to "low" or "medium" since you have no live verification.)\n\nExtract the structured editorial detail per the schema.`;
  }

  // Budget the total input — keep each source under 3500 chars; cap total at ~12k chars.
  const PER_SOURCE_CAP = 3500;
  const TOTAL_CAP = 12_000;
  let used = 0;
  const sections: string[] = [];

  for (const s of sources) {
    if (used >= TOTAL_CAP) break;
    const slice = s.text.slice(0, Math.min(PER_SOURCE_CAP, TOTAL_CAP - used));
    sections.push(`━━━ SOURCE: ${s.url} ━━━\n${slice}`);
    used += slice.length;
  }

  return `Tool name: ${name}\nWebsite: ${websiteUrl}\n\nI fetched the following ${sources.length} source pages from the official site. Cross-reference facts across them. Mark anything you can't verify in the source text as "low" confidence.\n\n${sections.join("\n\n")}\n\nNow extract the structured editorial detail per the schema. Output ONLY the JSON.`;
}

function parseJsonResponse(text: string): AutofillResult {
  // Strip any accidental markdown fence
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<AutofillResult>;
    // Defensive: confidence map must always exist so the form can rely on it.
    if (!parsed._confidence || typeof parsed._confidence !== "object") {
      parsed._confidence = {};
    }
    return parsed as AutofillResult;
  } catch (err) {
    throw new Error(
      `AI provider returned malformed JSON: ${err instanceof Error ? err.message : "parse error"}`
    );
  }
}

// ── Gemini ───────────────────────────────────────────────────
async function runGemini(name: string, websiteUrl: string, sources: FetchedSource[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildUserMessage(name, websiteUrl, sources),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 6000,
      temperature: 0.25,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned no content");
  return parseJsonResponse(text);
}

// ── Groq (OpenAI-compatible REST — no SDK dep) ───────────────
async function runGroq(name: string, websiteUrl: string, sources: FetchedSource[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 6000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(name, websiteUrl, sources) },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body.slice(0, 300) || res.statusText}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no content");
  return parseJsonResponse(text);
}

// ── Anthropic ────────────────────────────────────────────────
async function runAnthropic(name: string, websiteUrl: string, sources: FetchedSource[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(name, websiteUrl, sources) }],
  });

  const blocks = response.content as Array<{ type: string; text?: string }>;
  const block = blocks.find((b) => b.type === "text" && typeof b.text === "string");
  if (!block?.text) {
    throw new Error("Claude returned no text content");
  }
  return parseJsonResponse(block.text);
}

// ── Cascading fallback ───────────────────────────────────────
type Provider = "gemini" | "groq" | "anthropic";

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

/**
 * Public entrypoint. Fetches multi-source context once, then tries
 * each configured AI provider in priority order. Auto-cascades on
 * quota / auth errors. Throws actionable error text on full failure.
 */
export async function autofillToolDetail({
  name,
  websiteUrl,
}: {
  name: string;
  websiteUrl: string;
}): Promise<AutofillResult> {
  const sources = await fetchSources(websiteUrl);

  const chain: Array<{
    id: Provider;
    enabled: boolean;
    run: () => Promise<AutofillResult>;
  }> = [
    { id: "gemini",    enabled: !!process.env.GEMINI_API_KEY,    run: () => runGemini(name, websiteUrl, sources) },
    { id: "groq",      enabled: !!process.env.GROQ_API_KEY,      run: () => runGroq(name, websiteUrl, sources) },
    { id: "anthropic", enabled: !!process.env.ANTHROPIC_API_KEY, run: () => runAnthropic(name, websiteUrl, sources) },
  ];

  const active = chain.filter((p) => p.enabled);
  if (active.length === 0) {
    throw new Error(
      "No AI provider configured. Add a free GEMINI_API_KEY (https://aistudio.google.com/apikey) or GROQ_API_KEY (https://console.groq.com/keys) to .env.local, then restart dev."
    );
  }

  let lastErr: unknown = null;
  for (const provider of active) {
    try {
      return await provider.run();
    } catch (err) {
      lastErr = err;
      if (!isProviderUnavailable(err)) throw err;
      console.warn(
        `[autofill] ${provider.id} unavailable, trying next provider…`,
        err instanceof Error ? err.message : err
      );
    }
  }

  throw lastErr instanceof Error
    ? new Error(`All AI providers exhausted. Last error from ${active[active.length - 1].id}: ${lastErr.message}`)
    : new Error("All AI providers exhausted.");
}

/** Which provider would `autofillToolDetail` use right now? */
export function activeProvider(): Provider | "none" {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

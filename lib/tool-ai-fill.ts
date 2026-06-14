/**
 * ─────────────────────────────────────────────────────────────
 *  Tool auto-fill — pluggable AI provider with cascading fallback
 * ─────────────────────────────────────────────────────────────
 *
 *  Three providers tried in order. If the first errors with a
 *  quota / rate-limit / auth failure we automatically fall
 *  through to the next one, so a daily Gemini cap doesn't break
 *  the admin flow.
 *
 *   1) Google Gemini (gemini-2.5-flash)            — FREE, top-tier
 *      • 15 RPM, 1500 requests/day, no credit card
 *      • https://aistudio.google.com/apikey
 *      • GEMINI_API_KEY=...
 *
 *   2) Groq Llama 3.3 70B (llama-3.3-70b-versatile) — FREE, top-tier
 *      • 30 RPM, 14,400 requests/day, no credit card
 *      • https://console.groq.com/keys
 *      • GROQ_API_KEY=...
 *
 *   3) Anthropic Claude Haiku (claude-haiku-4-5)    — PAID
 *      • ~$0.005 per auto-fill, pay-as-you-go
 *      • https://console.anthropic.com
 *      • ANTHROPIC_API_KEY=...
 *
 *  Flow:
 *   1) Fetch the homepage HTML (with a real browser UA)
 *   2) Strip to readable text (~6000 chars max)
 *   3) Try each configured provider in turn until one returns JSON
 *   4) Return a typed result the form merges into client state
 *
 *  Used by /admin/tools/new and /admin/tools/[id]/edit via the
 *  autofillTool server action.
 * ─────────────────────────────────────────────────────────────
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const ANTHROPIC_MODEL = "claude-haiku-4-5";
const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type AutofillResult = {
  description: string; // HTML
  tagline: string;
  madeBy: string | null;
  launched: string | null;
  weeklyUsers: string | null;
  startingPrice: string | null;
  hasApi: boolean | null;
  mobileApp: string | null;
  browserExtension: boolean | null;
  socials: {
    x?: string | null;
    linkedin?: string | null;
    github?: string | null;
    youtube?: string | null;
  } | null;
  features: Array<{ title: string; desc: string }> | null;
  pros: string[] | null;
  cons: string[] | null;
  plans: Array<{
    name: string;
    price: string;
    period: string;
    popular?: boolean;
    feats: string[];
  }> | null;
};

const SYSTEM_PROMPT = `You are an editorial researcher for an AI tools directory (AI Tools Set, aitoolsset.com).

You will be given a tool's name, website URL, and (when available) the homepage HTML content. Your job is to extract structured editorial detail.

Output ONLY a valid JSON object matching this exact schema (no prose, no markdown fence):

{
  "description": "<2-4 paragraphs of HTML. Use <p>, <strong>, <em>, <a href=''> tags. NO <h1>, <h2>, <script>, <style>. First paragraph: what the tool is. Second: who it's for + main capabilities. Third: pricing tiers and the bottom-line take. Keep professional, neutral, factual.>",
  "tagline": "<one sentence, under 140 chars, the pitch>",
  "madeBy": "<company that built it, e.g. 'OpenAI', or null if unknown>",
  "launched": "<short launch date e.g. 'Nov 2022', or null>",
  "weeklyUsers": "<e.g. '200M+', '50k', '10k+', or null if unknown>",
  "startingPrice": "<e.g. 'Free', '$10/mo', '$0', null>",
  "hasApi": <true|false|null>,
  "mobileApp": "<'iOS & Android' | 'iOS only' | 'Android only' | null>",
  "browserExtension": <true|false|null>,
  "socials": {
    "x": "<full URL or null>",
    "linkedin": "<full URL or null>",
    "github": "<full URL or null>",
    "youtube": "<full URL or null>"
  },
  "features": [
    {"title": "Feature name", "desc": "One-sentence description."}
  ],
  "pros": ["short pro 1", "short pro 2"],
  "cons": ["short con 1", "short con 2"],
  "plans": [
    {"name": "Free", "price": "$0", "period": "/month", "popular": false, "feats": ["feat 1", "feat 2", "feat 3"]},
    {"name": "Pro", "price": "$20", "period": "/month", "popular": true, "feats": ["feat 1", "feat 2", "feat 3"]}
  ]
}

Rules:
- Use null when you genuinely don't know. Don't invent.
- For description HTML, escape < > & in any quoted strings.
- 5-8 features, 4-6 pros (each under 80 chars), 3-5 cons (each under 80 chars), 2-3 plans (each with 3-5 feats).
- The popular plan is the one most users pick (usually the mid-tier).
- Keep tone neutral and factual. No marketing fluff.`;

async function fetchHomepageText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
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
      .trim();
    return text.slice(0, 6000);
  } catch {
    return null;
  }
}

function buildUserMessage(name: string, websiteUrl: string, homepageText: string | null): string {
  return homepageText
    ? `Tool name: ${name}\nWebsite: ${websiteUrl}\n\nHomepage content (text-only, truncated):\n\n${homepageText}\n\nExtract the structured editorial detail.`
    : `Tool name: ${name}\nWebsite: ${websiteUrl}\n\n(Homepage could not be fetched — work from training-data knowledge of this tool.)\n\nExtract the structured editorial detail.`;
}

function parseJsonResponse(text: string): AutofillResult {
  // Strip any accidental markdown fence
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as AutofillResult;
  } catch (err) {
    throw new Error(
      `AI provider returned malformed JSON: ${err instanceof Error ? err.message : "parse error"}`
    );
  }
}

// ── Gemini ───────────────────────────────────────────────────
async function runGemini(name: string, websiteUrl: string, homepageText: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildUserMessage(name, websiteUrl, homepageText),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // Forces strict JSON output — no need to strip code fences
      responseMimeType: "application/json",
      maxOutputTokens: 4000,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned no content");
  return parseJsonResponse(text);
}

// ── Anthropic ────────────────────────────────────────────────
async function runAnthropic(name: string, websiteUrl: string, homepageText: string | null) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(name, websiteUrl, homepageText) }],
  });

  // Anthropic's ContentBlock union doesn't narrow via .find — cast through
  // the lenient shape to read the text field safely.
  const blocks = response.content as Array<{ type: string; text?: string }>;
  const block = blocks.find((b) => b.type === "text" && typeof b.text === "string");
  if (!block?.text) {
    throw new Error("Claude returned no text content");
  }
  return parseJsonResponse(block.text);
}

// ── Groq (OpenAI-compatible REST — no SDK dep) ───────────────
async function runGroq(name: string, websiteUrl: string, homepageText: string | null) {
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
      // Forces strict JSON output (same as Gemini's responseMimeType).
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(name, websiteUrl, homepageText) },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
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

// ── Cascading fallback ───────────────────────────────────────
type Provider = "gemini" | "groq" | "anthropic";

/**
 * Errors that mean "this provider is unavailable RIGHT NOW — try the
 * next one." We DON'T fall through on genuine bad input (e.g. URL
 * unreachable) — those would fail on every provider.
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

/**
 * Run the auto-fill. Tries each configured provider in priority order
 * (Gemini → Groq → Anthropic). On a quota/auth failure, transparently
 * falls through to the next one. Re-throws the LAST error if every
 * configured provider fails, so the user sees something actionable.
 */
export async function autofillToolDetail({
  name,
  websiteUrl,
}: {
  name: string;
  websiteUrl: string;
}): Promise<AutofillResult> {
  const homepageText = await fetchHomepageText(websiteUrl);

  const chain: Array<{
    id: Provider;
    enabled: boolean;
    run: () => Promise<AutofillResult>;
  }> = [
    { id: "gemini",    enabled: !!process.env.GEMINI_API_KEY,    run: () => runGemini(name, websiteUrl, homepageText) },
    { id: "groq",      enabled: !!process.env.GROQ_API_KEY,      run: () => runGroq(name, websiteUrl, homepageText) },
    { id: "anthropic", enabled: !!process.env.ANTHROPIC_API_KEY, run: () => runAnthropic(name, websiteUrl, homepageText) },
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
      // Only cascade on quota / rate-limit / auth failures. Anything else
      // (network, parse error) is likely deterministic — bubble up.
      if (!isProviderUnavailable(err)) throw err;
      console.warn(`[autofill] ${provider.id} unavailable, trying next provider…`, err instanceof Error ? err.message : err);
    }
  }

  // Every provider was rate-limited / unauthorised.
  throw lastErr instanceof Error
    ? new Error(`All AI providers exhausted. Last error from ${active[active.length - 1].id}: ${lastErr.message}`)
    : new Error("All AI providers exhausted.");
}

/** Which provider would `autofillToolDetail` use right now? Used for diagnostics. */
export function activeProvider(): Provider | "none" {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

/**
 * ─────────────────────────────────────────────────────────────
 *  Tool auto-fill — pluggable AI provider
 * ─────────────────────────────────────────────────────────────
 *
 *  Two providers, picked at request time based on which env
 *  key is present (Gemini takes precedence — it's free):
 *
 *   1) Google Gemini (gemini-2.5-flash)
 *      • Free tier: 15 RPM, 1500 requests/day, no credit card
 *      • Get a key: https://aistudio.google.com/apikey
 *      • Set: GEMINI_API_KEY=...
 *
 *   2) Anthropic Claude (claude-haiku-4-5)
 *      • Pay-as-you-go (~$0.005 per auto-fill)
 *      • Get a key: https://console.anthropic.com
 *      • Set: ANTHROPIC_API_KEY=...
 *
 *  Flow:
 *   1) Fetch the homepage HTML (with a real browser UA)
 *   2) Strip to readable text (~6000 chars max)
 *   3) Ask the provider to return structured editorial detail
 *      as JSON
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

/**
 * Run the auto-fill. Picks Gemini if GEMINI_API_KEY is set,
 * otherwise Anthropic, otherwise throws with a setup message.
 */
export async function autofillToolDetail({
  name,
  websiteUrl,
}: {
  name: string;
  websiteUrl: string;
}): Promise<AutofillResult> {
  const homepageText = await fetchHomepageText(websiteUrl);

  if (process.env.GEMINI_API_KEY) {
    return runGemini(name, websiteUrl, homepageText);
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return runAnthropic(name, websiteUrl, homepageText);
  }
  throw new Error(
    "No AI provider configured. Add GEMINI_API_KEY (free) or ANTHROPIC_API_KEY to .env.local, then restart dev."
  );
}

/** Which provider would `autofillToolDetail` use right now? Used for diagnostics. */
export function activeProvider(): "gemini" | "anthropic" | "none" {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

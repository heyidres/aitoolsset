"use server";

/**
 * Auto-translate a CMS category's editorial fields into a target locale
 * and persist them to category.translations[locale]. Same Gemini→Groq→
 * Anthropic cascade as the tool translator. Idempotent — re-running
 * replaces the prior translation.
 *
 * Triggered:
 *   - Background, fire-and-forget, after every category create/update
 *     (see _actions.ts → backgroundTranslateCategoryAllLocales).
 *   - Manually via the admin UI (if you ever want to force-refresh).
 *
 * Public render path (CategoryHero, intro etc.) reads
 * category.translations[locale]?.field with English fallback, so a
 * missing field doesn't break the page.
 */

import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, auditLog } from "@/lib/db/schema";
import { i18n, isLocale } from "@/lib/i18n/config";

type CategoryTranslation = {
  name?: string;
  description?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  introHtml?: string;
  bottomHtml?: string;
  seoTitle?: string;
  seoDescription?: string;
  faqs?: Array<{ q: string; a: string }>;
};

const TARGET_LANGUAGE_NAME: Record<string, string> = {
  ko: "Korean (한국어)",
  ja: "Japanese (日本語)",
  fr: "French (Français)",
  es: "Spanish (Español)",
  de: "German (Deutsch)",
  zh: "Simplified Chinese (简体中文)",
  pt: "Brazilian Portuguese (Português do Brasil)",
  tw: "Traditional Chinese, Taiwan (繁體中文)",
  vi: "Vietnamese (Tiếng Việt)",
};

function buildPrompt(targetLocale: string, fields: CategoryTranslation): string {
  const target = TARGET_LANGUAGE_NAME[targetLocale] ?? targetLocale;
  return `Translate the following editorial copy for a category landing page on an AI tools directory into ${target}.

RULES:
- Output ONLY valid JSON matching the EXACT shape of the input (same keys, same array lengths, same object keys inside arrays).
- Keep brand and product names in English (ChatGPT, OpenAI, API, SEO, etc.).
- Preserve HTML tags in introHtml/bottomHtml (<p>, <strong>, <a>, <ul>, <h2>, etc.) — translate the text content, not the markup.
- Preserve **markdown bold** markers in FAQ answers — translate the text inside, keep the asterisks.
- heroEyebrow is an all-caps uppercase pill ("CATEGORY · X") — keep that format in ${target} where possible.
- For faqs[]: translate every q and a but keep the array order and length identical to the input.
- Natural, fluent ${target} — not literal word-for-word.

INPUT JSON (English):
${JSON.stringify(fields, null, 2)}

OUTPUT ONLY THE TRANSLATED JSON — no prose, no markdown fence.`;
}

const GEMINI_MODEL = "gemini-2.0-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const ANTHROPIC_MODEL = "claude-haiku-4-5";

async function runGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0.3,
    },
  });
  const text = response.text;
  if (!text) throw new Error("Gemini returned no content");
  return text;
}

async function runGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
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

async function runAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });
  const blocks = response.content as Array<{ type: string; text?: string }>;
  const block = blocks.find((b) => b.type === "text" && typeof b.text === "string");
  if (!block?.text) throw new Error("Claude returned no text content");
  return block.text;
}

function isProviderUnavailable(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err).toLowerCase();
  return (
    msg.includes("quota") || msg.includes("rate limit") || msg.includes("rate_limit") ||
    msg.includes("resource_exhausted") || msg.includes("credit balance") || msg.includes("429") ||
    msg.includes("503") || msg.includes("overloaded") || msg.includes("authentication") ||
    msg.includes("unauthorized") || msg.includes("401") || msg.includes("invalid api key") ||
    msg.includes("is not set")
  );
}

async function callTranslator(prompt: string): Promise<string> {
  const chain: Array<{ id: string; run: () => Promise<string> }> = [];
  if (process.env.GEMINI_API_KEY) chain.push({ id: "gemini", run: () => runGemini(prompt) });
  if (process.env.GROQ_API_KEY) chain.push({ id: "groq", run: () => runGroq(prompt) });
  if (process.env.ANTHROPIC_API_KEY) chain.push({ id: "anthropic", run: () => runAnthropic(prompt) });
  if (chain.length === 0) throw new Error("No AI provider configured (GEMINI_API_KEY / GROQ_API_KEY / ANTHROPIC_API_KEY)");
  const errors: string[] = [];
  for (const p of chain) {
    try {
      const out = await p.run();
      if (out?.trim()) return out;
      errors.push(`${p.id}: empty`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${p.id}: ${msg.slice(0, 180)}`);
      if (!isProviderUnavailable(e)) throw e;
    }
  }
  throw new Error(`All providers failed → ${errors.join(" || ")}`);
}

/**
 * Translate one category to one locale. Used by the post-save background
 * hook AND by the public category page (lazy fallback on cache miss).
 */
export async function translateCategoryUnauthenticated(
  categoryId: string,
  targetLocale: string,
  actorId: string | null,
): Promise<{ ok: true; fieldsTranslated: number } | { ok: false; error: string }> {
  try {
    if (!isLocale(targetLocale) || targetLocale === i18n.defaultLocale) {
      return { ok: false, error: `targetLocale must be a non-default supported locale (got '${targetLocale}')` };
    }
    const [row] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!row) return { ok: false, error: "Category not found" };

    const input: CategoryTranslation = {};
    if (row.name)         input.name = row.name;
    if (row.description)  input.description = row.description;
    if (row.heroEyebrow)  input.heroEyebrow = row.heroEyebrow;
    if (row.heroTitle)    input.heroTitle = row.heroTitle;
    if (row.heroSubtitle) input.heroSubtitle = row.heroSubtitle;
    if (row.introHtml)    input.introHtml = row.introHtml;
    if (row.bottomHtml)   input.bottomHtml = row.bottomHtml;
    if (row.seoTitle)     input.seoTitle = row.seoTitle;
    if (row.seoDescription) input.seoDescription = row.seoDescription;
    if (row.faqs?.length) input.faqs = row.faqs;

    const fieldsTranslated = Object.keys(input).length;
    if (fieldsTranslated === 0) {
      return { ok: false, error: "Nothing to translate — all editorial fields are empty." };
    }

    const raw = await callTranslator(buildPrompt(targetLocale, input));
    const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, "");
    let parsed: CategoryTranslation;
    try {
      parsed = JSON.parse(cleaned) as CategoryTranslation;
    } catch {
      return { ok: false, error: "Translator returned invalid JSON." };
    }

    const existing = (row.translations ?? {}) as Record<string, CategoryTranslation>;
    const next = { ...existing, [targetLocale]: parsed };

    await db.update(categories).set({ translations: next, updatedAt: new Date() }).where(eq(categories.id, categoryId));

    if (actorId) {
      await db.insert(auditLog).values({
        actorId,
        action: `category.translate.${targetLocale}`,
        target: `category:${categoryId}`,
        meta: { fieldsTranslated, slug: row.slug },
      });
    }

    return { ok: true, fieldsTranslated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Fire-and-forget background translation for every non-default locale.
 * Called from createCategory and updateCategory after the DB write.
 * Async (every export from a "use server" module must be) but the
 * caller never awaits — translations resolve in the same serverless
 * invocation while the redirect carries the editor away.
 */
export async function backgroundTranslateCategoryAllLocales(
  categoryId: string,
  actorId: string,
): Promise<void> {
  const targets = i18n.locales.filter((l) => l !== i18n.defaultLocale);
  for (const locale of targets) {
    translateCategoryUnauthenticated(categoryId, locale, actorId).catch((err) => {
      console.error(`[admin/categories] background translate to ${locale} failed for category ${categoryId}:`, err);
    });
  }
}

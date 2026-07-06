"use server";

/**
 * Translate a CMS tool's editorial fields into a target locale and
 * persist them to tool.translations[locale]. Idempotent — running it
 * again replaces the prior translation for that locale.
 *
 * Uses the same Gemini → Groq → Anthropic cascade as the news draft
 * pipeline so a free-tier API key is enough.
 */

import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tools, auditLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { i18n, isLocale } from "@/lib/i18n/config";

type ToolTranslation = {
  tagline?: string;
  description?: string;
  features?: Array<{ title: string; desc: string }>;
  useCases?: string[];
  pros?: string[];
  cons?: string[];
  plans?: Array<{ name: string; price: string; period: string; popular?: boolean; feats: string[] }>;
  seoTitle?: string;
  seoDescription?: string;
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

function buildPrompt(targetLocale: string, fields: ToolTranslation): string {
  const target = TARGET_LANGUAGE_NAME[targetLocale] ?? targetLocale;
  return `Translate the following editorial content for an AI tool listing into ${target}.

RULES:
- Output ONLY valid JSON matching the EXACT shape of the input — same keys, same array lengths, same object structure.
- Keep brand names, product names, and acronyms in English (e.g. "ChatGPT", "API", "SEO").
- Preserve HTML tags inside the description string (e.g. <p>, <strong>, <a>, <ul>, <li>) — translate the text content, not the markup.
- Natural, fluent ${target} — not literal word-for-word.
- Plan prices ("$0", "$29/month") stay as written. Only translate plan NAMES and feature bullets.
- For \`features\`, translate both \`title\` and \`desc\` of every entry.
- For \`plans\`, translate \`name\` and each entry in \`feats\`; leave \`price\` and \`period\` exactly as in the input.

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
      maxOutputTokens: 8000,
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
      max_tokens: 8000,
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
    max_tokens: 8000,
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
    msg.includes("invalid api key") ||
    msg.includes("is not set")
  );
}

async function callTranslator(prompt: string): Promise<string> {
  const chain: Array<{ id: string; run: () => Promise<string> }> = [];
  if (process.env.GEMINI_API_KEY) chain.push({ id: "gemini", run: () => runGemini(prompt) });
  if (process.env.GROQ_API_KEY) chain.push({ id: "groq", run: () => runGroq(prompt) });
  if (process.env.ANTHROPIC_API_KEY) chain.push({ id: "anthropic", run: () => runAnthropic(prompt) });
  if (chain.length === 0) throw new Error("No AI provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY.");
  const errors: string[] = [];
  for (const p of chain) {
    try {
      const out = await p.run();
      if (out?.trim()) return out;
      errors.push(`${p.id}: empty response`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${p.id}: ${msg.slice(0, 180)}`);
      if (!isProviderUnavailable(e)) throw e;
    }
  }
  throw new Error(`All providers failed → ${errors.join(" || ")}`);
}

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Sign in required");
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw new Error("Editor role required");
  }
  return session.user;
}

/**
 * Unguarded core. Used by:
 *  - autoTranslateTool (editor-triggered admin button — guards then calls this)
 *  - backgroundTranslateAllLocales (fires post-save, runs as the same editor)
 *  - public tool detail page (runtime safety net on cache miss)
 *
 * Returns { ok, fieldsTranslated } or { ok:false, error }.
 */
export async function translateToolUnauthenticated(
  toolId: string,
  targetLocale: string,
  actorId: string | null,
): Promise<{ ok: true; fieldsTranslated: number } | { ok: false; error: string }> {
  try {
    if (!isLocale(targetLocale) || targetLocale === i18n.defaultLocale) {
      return { ok: false, error: `targetLocale must be a non-default supported locale (got '${targetLocale}')` };
    }

    const [row] = await db.select().from(tools).where(eq(tools.id, toolId)).limit(1);
    if (!row) return { ok: false, error: "Tool not found" };

    // Assemble only the fields worth translating. Skip empty values so the
    // prompt is short and the LLM doesn't fabricate content.
    const input: ToolTranslation = {};
    if (row.tagline)        input.tagline = row.tagline;
    if (row.description)    input.description = row.description;
    if (row.features?.length)   input.features = row.features;
    if (row.useCases?.length)   input.useCases = row.useCases;
    if (row.pros?.length)       input.pros = row.pros;
    if (row.cons?.length)       input.cons = row.cons;
    if (row.plans?.length)      input.plans = row.plans;
    if (row.seoTitle)       input.seoTitle = row.seoTitle;
    if (row.seoDescription) input.seoDescription = row.seoDescription;

    const fieldsTranslated = Object.keys(input).length;
    if (fieldsTranslated === 0) {
      return { ok: false, error: "Nothing to translate — all editorial fields are empty." };
    }

    const prompt = buildPrompt(targetLocale, input);
    const raw = await callTranslator(prompt);
    const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, "");

    let parsed: ToolTranslation;
    try {
      parsed = JSON.parse(cleaned) as ToolTranslation;
    } catch {
      return { ok: false, error: "Translator returned invalid JSON. Try again." };
    }

    // Merge into existing translations object (don't blow away other locales).
    const existing = (row.translations ?? {}) as Record<string, ToolTranslation>;
    const next = { ...existing, [targetLocale]: parsed };

    await db
      .update(tools)
      .set({ translations: next, updatedAt: new Date() })
      .where(eq(tools.id, toolId));

    if (actorId) {
      await db.insert(auditLog).values({
        actorId,
        action: `tool.translate.${targetLocale}`,
        target: `tool:${toolId}`,
        meta: { fieldsTranslated, slug: row.slug },
      });
    }

    revalidatePath(`/admin/tools/${toolId}/edit`);
    revalidatePath(`/ai-tool/${row.slug}`);
    revalidatePath(`/${targetLocale}/ai-tool/${row.slug}`);

    return { ok: true, fieldsTranslated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Editor-triggered admin action. Wraps the unguarded core with
 * the auth check and passes the actor's id for the audit log.
 */
export async function autoTranslateTool(
  toolId: string,
  targetLocale: string,
): Promise<{ ok: true; fieldsTranslated: number } | { ok: false; error: string }> {
  try {
    const user = await requireEditor();
    return await translateToolUnauthenticated(toolId, targetLocale, user.id);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Bulk-translate every published tool that doesn't yet have a translation
 * in `targetLocale`. Used for one-time catch-up after this feature ships
 * (the 140 tools that pre-date Phase 4 auto-translate-on-save).
 *
 * Runs sequentially with a small delay between calls so the Gemini free
 * tier (15 RPM) doesn't burn out. Returns the per-tool result so the
 * editor sees progress.
 */
export async function bulkTranslateAllTools(
  targetLocale: string,
): Promise<{ ok: true; total: number; translated: number; skipped: number; failed: number; errors: string[] } | { ok: false; error: string }> {
  try {
    const user = await requireEditor();
    if (!isLocale(targetLocale) || targetLocale === i18n.defaultLocale) {
      return { ok: false, error: `targetLocale must be a non-default supported locale` };
    }

    // Pull every published tool, in a single query. Skip tools that already
    // have a translation in this locale (idempotent — safe to re-run).
    const rows = await db.select().from(tools);

    const candidates = rows.filter((r) => {
      if (r.status !== "published") return false;
      const tr = (r.translations as Record<string, unknown> | null) ?? {};
      const existing = tr[targetLocale] as Record<string, unknown> | undefined;
      return !existing || Object.keys(existing).length === 0;
    });

    const total = candidates.length;
    let translated = 0;
    let skipped = rows.length - total;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < candidates.length; i++) {
      const row = candidates[i];
      // 4-second gap between Gemini calls so we stay under the 15 RPM
      // free-tier cap. 140 tools × 4s = ~10 minutes; the editor sees the
      // total at the end. (Vercel function maxDuration is 300s by default,
      // so this runs through the streaming form result and the action
      // returns when complete.)
      if (i > 0) await new Promise((r) => setTimeout(r, 4000));
      try {
        const result = await translateToolUnauthenticated(row.id, targetLocale, user.id);
        if (result.ok) {
          translated++;
        } else {
          failed++;
          errors.push(`${row.slug}: ${result.error}`);
        }
      } catch (e) {
        failed++;
        errors.push(`${row.slug}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return { ok: true, total, translated, skipped, failed, errors };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

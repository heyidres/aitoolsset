"use server";

/**
 * Translate a CMS blog post's editorial fields into a target locale and
 * persist them to blog_post.translations[locale]. Idempotent — running it
 * again replaces the prior translation for that locale.
 *
 * Uses the same Gemini → Groq → Anthropic cascade as the tool/category
 * translators so a free-tier API key is enough.
 */

import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts, auditLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { i18n, isLocale } from "@/lib/i18n/config";

type BlogPostTranslation = {
  title?: string;
  deck?: string;
  body?: string;
  faqs?: Array<{ q: string; a: string }>;
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

function buildPrompt(targetLocale: string, fields: BlogPostTranslation): string {
  const target = TARGET_LANGUAGE_NAME[targetLocale] ?? targetLocale;
  return `Translate the following editorial blog article for an AI tools directory into ${target}.

RULES:
- Output ONLY valid JSON matching the EXACT shape of the input — same keys, same array lengths, same object structure.
- Keep brand names, product names, and acronyms in English (e.g. "ChatGPT", "OpenAI", "API", "SEO").
- Preserve HTML tags inside the body string (e.g. <p>, <h2>, <h3>, <strong>, <a>, <ul>, <li>, <table>) — translate the text content, not the markup or attribute values (hrefs, ids, classes).
- Natural, fluent ${target} — not literal word-for-word. Write like a native tech journalist, not a translated document.
- For \`faqs\`, translate every \`q\` and \`a\`, preserving array order and length.

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
 *  - autoTranslateBlogPost (editor-triggered admin button — guards then calls this)
 *  - backgroundTranslateBlogPostAllLocales (fires post-save, runs as the same editor)
 *  - public blog post page (runtime safety net on cache miss)
 *
 * Returns { ok, fieldsTranslated } or { ok:false, error }.
 */
export async function translateBlogPostUnauthenticated(
  postId: string,
  targetLocale: string,
  actorId: string | null,
): Promise<{ ok: true; fieldsTranslated: number } | { ok: false; error: string }> {
  try {
    if (!isLocale(targetLocale) || targetLocale === i18n.defaultLocale) {
      return { ok: false, error: `targetLocale must be a non-default supported locale (got '${targetLocale}')` };
    }

    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1);
    if (!row) return { ok: false, error: "Blog post not found" };

    // Assemble only the fields worth translating. Skip empty values so the
    // prompt is short and the LLM doesn't fabricate content.
    const input: BlogPostTranslation = {};
    if (row.title)           input.title = row.title;
    if (row.deck)            input.deck = row.deck;
    if (row.body)            input.body = row.body;
    if (row.faqs?.length)    input.faqs = row.faqs;
    if (row.seoTitle)        input.seoTitle = row.seoTitle;
    if (row.seoDescription)  input.seoDescription = row.seoDescription;

    const fieldsTranslated = Object.keys(input).length;
    if (fieldsTranslated === 0) {
      return { ok: false, error: "Nothing to translate — all editorial fields are empty." };
    }

    const prompt = buildPrompt(targetLocale, input);
    const raw = await callTranslator(prompt);
    const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, "");

    let parsed: BlogPostTranslation;
    try {
      parsed = JSON.parse(cleaned) as BlogPostTranslation;
    } catch {
      return { ok: false, error: "Translator returned invalid JSON. Try again." };
    }

    // Merge into existing translations object (don't blow away other locales).
    const existing = (row.translations ?? {}) as Record<string, BlogPostTranslation>;
    const next = { ...existing, [targetLocale]: parsed };

    await db
      .update(blogPosts)
      .set({ translations: next, updatedAt: new Date() })
      .where(eq(blogPosts.id, postId));

    if (actorId) {
      await db.insert(auditLog).values({
        actorId,
        action: `blogPost.translate.${targetLocale}`,
        target: `blogPost:${postId}`,
        meta: { fieldsTranslated, slug: row.slug },
      });
    }

    revalidatePath(`/admin/blog/${postId}/edit`);
    revalidatePath(`/blog/${row.slug}`);
    revalidatePath(`/${targetLocale}/blog/${row.slug}`);

    return { ok: true, fieldsTranslated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Editor-triggered admin action. Wraps the unguarded core with
 * the auth check and passes the actor's id for the audit log.
 */
export async function autoTranslateBlogPost(
  postId: string,
  targetLocale: string,
): Promise<{ ok: true; fieldsTranslated: number } | { ok: false; error: string }> {
  try {
    const user = await requireEditor();
    return await translateBlogPostUnauthenticated(postId, targetLocale, user.id);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Bulk-translate every published blog post that doesn't yet have a
 * translation in `targetLocale`. Only 9 published posts today, so this
 * finishes in well under a minute even sequentially.
 */
export async function bulkTranslateAllBlogPosts(
  targetLocale: string,
): Promise<{ ok: true; total: number; translated: number; skipped: number; failed: number; errors: string[] } | { ok: false; error: string }> {
  try {
    const user = await requireEditor();
    if (!isLocale(targetLocale) || targetLocale === i18n.defaultLocale) {
      return { ok: false, error: `targetLocale must be a non-default supported locale` };
    }

    const rows = await db.select().from(blogPosts);

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
      // 4-second gap between calls so we stay under Gemini's 15 RPM free-tier cap.
      if (i > 0) await new Promise((r) => setTimeout(r, 4000));
      try {
        const result = await translateBlogPostUnauthenticated(row.id, targetLocale, user.id);
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

/**
 * Fire-and-forget background translation for every non-default locale.
 * Called from createBlogPost and updateBlogPost after the DB write.
 */
export async function backgroundTranslateBlogPostAllLocales(
  postId: string,
  actorId: string,
): Promise<void> {
  const targets = i18n.locales.filter((l) => l !== i18n.defaultLocale);
  for (const locale of targets) {
    translateBlogPostUnauthenticated(postId, locale, actorId).catch((err) => {
      console.error(`[admin/blog] background translate to ${locale} failed for post ${postId}:`, err);
    });
  }
}

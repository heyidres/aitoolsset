/**
 * Server actions for the Tools admin.
 *
 * All actions are guarded — only signed-in users with role
 * admin|editor can call them.
 *
 *  • createTool / updateTool / deleteTool — CRUD against the
 *    Postgres `tool` table. Revalidate /portal-admin/tools and the
 *    public tool detail / homepage so server components see
 *    fresh data immediately.
 *
 *  • autofillTool — uses Claude (via lib/tool-ai-fill.ts) to
 *    extract structured editorial detail from the homepage.
 *    Returns the data; the form merges it into client state
 *    (it does NOT persist on its own — user reviews + saves).
 *
 *  • create + update trigger a FIRE-AND-FORGET background job
 *    that translates the editorial fields into every non-default
 *    locale via Gemini. The editor doesn't wait. Translations
 *    land in tool.translations[locale] within ~10 seconds, so
 *    /ko/ai-tool/<slug> serves Korean HTML before any Korean
 *    visitor (or Googlebot) hits the URL.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";
import { autofillToolDetail, type AutofillResult } from "@/lib/tool-ai-fill";
import { logAdmin } from "@/lib/audit";
import { i18n } from "@/lib/i18n/config";
import { translateToolUnauthenticated } from "./_translate-actions";

/**
 * Fire-and-forget background translation. Triggers the unguarded core
 * for every non-default locale in parallel, doesn't await the result,
 * and swallows errors so a translation failure never breaks save.
 *
 * Editor doesn't wait. Audit log gets one row per locale tagged with
 * the editor's id, so the activity is still traceable.
 */
function backgroundTranslateAllLocales(toolId: string, actorId: string): void {
  const targets = i18n.locales.filter((l) => l !== i18n.defaultLocale);
  for (const locale of targets) {
    translateToolUnauthenticated(toolId, locale, actorId).catch((err) => {
      console.error(`[admin/tools] background translate to ${locale} failed for tool ${toolId}:`, err);
    });
  }
}

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw new Error("Not authorised");
  }
  return session.user;
}

const ToolInput = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  tagline: z.string().min(1).max(200),
  domain: z.string().min(1).max(120),
  websiteUrl: z.string().url(),
  linkRel: z.enum(["dofollow", "nofollow", "sponsored", "ugc"]).default("nofollow"),
  category: z.string().min(1),
  extraCategoriesJson: z.string().optional().default(""),
  pricing: z.enum(["free", "freemium", "paid", "credit", "trial", "enterprise"]),
  description: z.string().min(1),
  tagsCsv: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
  screenshotUrl: z.string().optional().default(""),
  verified: z.string().optional(),
  featured: z.string().optional(),
  homepageOrder: z.string().optional().default(""),
  status: z.enum(["draft", "published"]).default("draft"),

  // Editorial detail — optional
  madeBy: z.string().optional().default(""),
  launched: z.string().optional().default(""),
  weeklyUsers: z.string().optional().default(""),
  startingPrice: z.string().optional().default(""),
  hasApi: z.string().optional().default(""), // "true" | "false" | ""
  mobileApp: z.string().optional().default(""),
  browserExtension: z.string().optional().default(""),
  socialsJson: z.string().optional().default(""),
  featuresJson: z.string().optional().default(""),
  useCasesJson: z.string().optional().default(""),
  platformsJson: z.string().optional().default(""),
  integrationsJson: z.string().optional().default(""),
  prosJson: z.string().optional().default(""),
  consJson: z.string().optional().default(""),
  plansJson: z.string().optional().default(""),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

function asBool(v: string | undefined | null): boolean {
  return v === "on" || v === "true";
}

function asNullableBool(v: string): boolean | null {
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

function safeJsonParse<T>(s: string): T | null {
  if (!s.trim()) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/**
 * Map a ZodError's first issue into a single human-readable string.
 * Field paths get capitalised; `String must contain at most N character(s)`
 * gets the field name prepended so the editor knows WHERE to trim.
 */
function friendlyZodError(err: z.ZodError): Error {
  const issue = err.issues[0];
  const field = issue?.path?.[0]?.toString() ?? "field";
  const fieldLabel = field
    .replace(/Json$/i, "")
    .replace(/Csv$/i, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (m) => m.toUpperCase())
    .trim();
  const detail =
    issue?.code === "too_big" && issue?.type === "string"
      ? `${fieldLabel} is too long — ${issue.maximum} chars max (you have ${
          (issue as { received?: number }).received ?? "more"
        }).`
      : issue?.code === "too_small"
      ? `${fieldLabel} is required.`
      : `${fieldLabel}: ${issue?.message ?? "invalid value"}`;
  return new Error(detail);
}

function parseFormData(fd: FormData) {
  try {
    return ToolInput.parse({
    name: (fd.get("name") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("name") as string) ?? ""),
    tagline: (fd.get("tagline") as string) ?? "",
    domain: ((fd.get("domain") as string) ?? "").replace(/^https?:\/\//i, "").replace(/\/.*$/, ""),
    websiteUrl: (fd.get("websiteUrl") as string) ?? "",
    linkRel: ((fd.get("linkRel") as string) ?? "nofollow") as
      | "dofollow"
      | "nofollow"
      | "sponsored"
      | "ugc",
    category: (fd.get("category") as string) ?? "",
    extraCategoriesJson: (fd.get("extraCategoriesJson") as string) ?? "",
    pricing: ((fd.get("pricing") as string) ?? "freemium") as
      | "free"
      | "freemium"
      | "paid"
      | "credit"
      | "trial"
      | "enterprise",
    description: (fd.get("description") as string) ?? "",
    tagsCsv: (fd.get("tagsCsv") as string) ?? "",
    logoUrl: (fd.get("logoUrl") as string) ?? "",
    screenshotUrl: (fd.get("screenshotUrl") as string) ?? "",
    verified: (fd.get("verified") as string) ?? "",
    featured: (fd.get("featured") as string) ?? "",
    homepageOrder: (fd.get("homepageOrder") as string) ?? "",
    status: ((fd.get("status") as string) ?? "draft") as "draft" | "published",
    madeBy: (fd.get("madeBy") as string) ?? "",
    launched: (fd.get("launched") as string) ?? "",
    weeklyUsers: (fd.get("weeklyUsers") as string) ?? "",
    startingPrice: (fd.get("startingPrice") as string) ?? "",
    hasApi: (fd.get("hasApi") as string) ?? "",
    mobileApp: (fd.get("mobileApp") as string) ?? "",
    browserExtension: (fd.get("browserExtension") as string) ?? "",
    socialsJson: (fd.get("socialsJson") as string) ?? "",
    featuresJson: (fd.get("featuresJson") as string) ?? "",
    useCasesJson: (fd.get("useCasesJson") as string) ?? "",
    platformsJson: (fd.get("platformsJson") as string) ?? "",
    integrationsJson: (fd.get("integrationsJson") as string) ?? "",
    prosJson: (fd.get("prosJson") as string) ?? "",
    consJson: (fd.get("consJson") as string) ?? "",
    plansJson: (fd.get("plansJson") as string) ?? "",
    seoTitle: (fd.get("seoTitle") as string) ?? "",
    seoDescription: (fd.get("seoDescription") as string) ?? "",
  });
  } catch (err) {
    if (err instanceof z.ZodError) throw friendlyZodError(err);
    throw err;
  }
}

function tagsFromCsv(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function safeParseSlugs(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function valuesFromInput(input: z.infer<typeof ToolInput>) {
  const extras = safeParseSlugs(input.extraCategoriesJson).filter((s) => s !== input.category);
  // Store EVERY category the tool belongs to in `categories` — including
  // the primary. That lets getToolsByCategory() match with a single
  // jsonb-contains check.
  const allCategories = Array.from(new Set([input.category, ...extras])).filter(Boolean);
  return {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    domain: input.domain,
    websiteUrl: input.websiteUrl,
    linkRel: input.linkRel,
    category: input.category,
    categories: allCategories,
    tags: tagsFromCsv(input.tagsCsv),
    description: input.description,
    pricing: input.pricing,
    logoUrl: input.logoUrl || null,
    screenshotUrl: input.screenshotUrl || null,
    verified: asBool(input.verified),
    featured: asBool(input.featured),
    homepageOrder: input.homepageOrder.trim() ? parseInt(input.homepageOrder, 10) : null,
    status: input.status,
    madeBy: input.madeBy || null,
    launched: input.launched || null,
    weeklyUsers: input.weeklyUsers || null,
    startingPrice: input.startingPrice || null,
    hasApi: asNullableBool(input.hasApi),
    mobileApp: input.mobileApp || null,
    browserExtension: asNullableBool(input.browserExtension),
    socials: safeJsonParse<Record<string, string | null>>(input.socialsJson),
    features: safeJsonParse<Array<{ title: string; desc: string }>>(input.featuresJson),
    useCases: safeJsonParse<string[]>(input.useCasesJson),
    platforms: safeJsonParse<string[]>(input.platformsJson),
    integrations: safeJsonParse<string[]>(input.integrationsJson),
    pros: safeJsonParse<string[]>(input.prosJson),
    cons: safeJsonParse<string[]>(input.consJson),
    plans: safeJsonParse<Array<{ name: string; price: string; period: string; popular?: boolean; feats: string[] }>>(input.plansJson),
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };
}

// ── CREATE ───────────────────────────────────────────────────
export async function createTool(formData: FormData) {
  const user = await requireEditor();
  const input = parseFormData(formData);

  const [existing] = await db.select({ id: tools.id }).from(tools).where(eq(tools.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A tool with slug "${input.slug}" already exists`);

  const [inserted] = await db
    .insert(tools)
    .values(valuesFromInput(input))
    .returning({ id: tools.id });
  await logAdmin("tool.create", `tool:${input.slug}`, { name: input.name, status: input.status });

  // Kick off background translation for every non-default locale so
  // /ko/, /ja/, etc. URLs serve localized HTML by the time anyone
  // (or Googlebot) visits. Editor does NOT wait — the next line redirects.
  if (inserted?.id) backgroundTranslateAllLocales(inserted.id, user.id);

  revalidatePath("/portal-admin/tools");
  revalidatePath(`/ai-tool/${input.slug}`);
  revalidatePath("/");
  redirect("/portal-admin/tools");
}

// ── UPDATE ───────────────────────────────────────────────────
export async function updateTool(id: string, formData: FormData) {
  const user = await requireEditor();
  const input = parseFormData(formData);

  const [conflict] = await db
    .select({ id: tools.id })
    .from(tools)
    .where(eq(tools.slug, input.slug))
    .limit(1);
  if (conflict && conflict.id !== id) {
    throw new Error(`A different tool already has slug "${input.slug}"`);
  }

  await db
    .update(tools)
    .set({ ...valuesFromInput(input), updatedAt: new Date() })
    .where(eq(tools.id, id));

  await logAdmin("tool.update", `tool:${id}`, { slug: input.slug, status: input.status });

  // Refresh the locale translations — content changed, so the cached
  // Korean/etc copy is now stale. Editor doesn't wait; this runs in
  // the background and overwrites translations[locale] within ~10s.
  backgroundTranslateAllLocales(id, user.id);

  revalidatePath("/portal-admin/tools");
  revalidatePath(`/ai-tool/${input.slug}`);
  revalidatePath("/");
  redirect("/portal-admin/tools");
}

// ── DELETE ───────────────────────────────────────────────────
export async function deleteTool(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: tools.slug }).from(tools).where(eq(tools.id, id)).limit(1);
  await db.delete(tools).where(eq(tools.id, id));
  await logAdmin("tool.delete", `tool:${id}`, { slug: row?.slug });
  revalidatePath("/portal-admin/tools");
  revalidatePath("/");
}

// ── AI AUTO-FILL ─────────────────────────────────────────────
/**
 * Run Claude over the tool's homepage to extract structured
 * editorial detail. Returns the result so the form can merge
 * it into client state (does NOT save automatically — the user
 * reviews + clicks Save).
 *
 * The function rewrites common Anthropic error messages into
 * actionable ones so the user sees "add credits → here" instead
 * of an opaque 400.
 */
export async function autofillTool(input: {
  name: string;
  websiteUrl: string;
}): Promise<AutofillResult> {
  await requireEditor();
  if (!input.name?.trim()) throw new Error("Tool name is required for auto-fill");
  if (!input.websiteUrl?.trim()) throw new Error("Website URL is required for auto-fill");
  try {
    new URL(input.websiteUrl);
  } catch {
    throw new Error("Website URL is malformed");
  }
  try {
    return await autofillToolDetail(input);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();

    // Anthropic — out of credits
    if (lower.includes("credit balance")) {
      throw new Error(
        "Your Anthropic API account is out of credits. Add credits at https://console.anthropic.com/settings/billing, or add a free fallback: GEMINI_API_KEY (https://aistudio.google.com/apikey) or GROQ_API_KEY (https://console.groq.com/keys) in .env.local."
      );
    }

    // Either provider — bad / missing key
    if (lower.includes("api key") || lower.includes("api_key") || lower.includes("authentication") || lower.includes("unauthorized")) {
      throw new Error(
        "AI API key is missing or invalid. Free options: Gemini (https://aistudio.google.com/apikey) or Groq (https://console.groq.com/keys). Set GEMINI_API_KEY or GROQ_API_KEY in .env.local and restart dev."
      );
    }

    // All providers exhausted → user-friendly version
    if (lower.includes("all ai providers exhausted")) {
      throw new Error(
        "All configured AI providers are rate-limited or out of credits. Add another free provider: Groq (https://console.groq.com/keys — 14,400 req/day free, top-tier) or Gemini (https://aistudio.google.com/apikey — 1,500 req/day free). Set GROQ_API_KEY or GEMINI_API_KEY in .env.local."
      );
    }

    // Either provider — rate / quota
    if (lower.includes("rate limit") || lower.includes("quota") || lower.includes("resource_exhausted") || lower.includes("429")) {
      throw new Error(
        "AI provider rate limit / quota hit. Either wait a minute, or add a free fallback: GROQ_API_KEY (14,400 req/day free, https://console.groq.com/keys). The system will then auto-cascade to it on the next quota hit."
      );
    }

    // Either provider — model not found / wrong region
    if (lower.includes("not found") && lower.includes("model")) {
      throw new Error("AI model not available for this API key. If using Gemini, your account region may not support gemini-2.5-flash — try another model in lib/tool-ai-fill.ts.");
    }

    throw new Error(`Auto-fill failed: ${msg}`);
  }
}

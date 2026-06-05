/**
 * Server actions for the Tools admin.
 *
 * All actions are guarded — only signed-in users with role
 * admin|editor can call them.
 *
 *  • createTool / updateTool / deleteTool — CRUD against the
 *    Postgres `tool` table. Revalidate /admin/tools and the
 *    public tool detail / homepage so server components see
 *    fresh data immediately.
 *
 *  • autofillTool — uses Claude (via lib/tool-ai-fill.ts) to
 *    extract structured editorial detail from the homepage.
 *    Returns the data; the form merges it into client state
 *    (it does NOT persist on its own — user reviews + saves).
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

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw new Error("Not authorised");
  }
  return session;
}

const ToolInput = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  tagline: z.string().min(1).max(140),
  domain: z.string().min(1).max(120),
  websiteUrl: z.string().url(),
  category: z.string().min(1),
  pricing: z.enum(["free", "freemium", "paid"]),
  description: z.string().min(1),
  tagsCsv: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
  screenshotUrl: z.string().optional().default(""),
  verified: z.string().optional(),
  featured: z.string().optional(),
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
  prosJson: z.string().optional().default(""),
  consJson: z.string().optional().default(""),
  plansJson: z.string().optional().default(""),
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

function parseFormData(fd: FormData) {
  return ToolInput.parse({
    name: (fd.get("name") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("name") as string) ?? ""),
    tagline: (fd.get("tagline") as string) ?? "",
    domain: ((fd.get("domain") as string) ?? "").replace(/^https?:\/\//i, "").replace(/\/.*$/, ""),
    websiteUrl: (fd.get("websiteUrl") as string) ?? "",
    category: (fd.get("category") as string) ?? "",
    pricing: ((fd.get("pricing") as string) ?? "freemium") as "free" | "freemium" | "paid",
    description: (fd.get("description") as string) ?? "",
    tagsCsv: (fd.get("tagsCsv") as string) ?? "",
    logoUrl: (fd.get("logoUrl") as string) ?? "",
    screenshotUrl: (fd.get("screenshotUrl") as string) ?? "",
    verified: (fd.get("verified") as string) ?? "",
    featured: (fd.get("featured") as string) ?? "",
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
    prosJson: (fd.get("prosJson") as string) ?? "",
    consJson: (fd.get("consJson") as string) ?? "",
    plansJson: (fd.get("plansJson") as string) ?? "",
  });
}

function tagsFromCsv(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function valuesFromInput(input: z.infer<typeof ToolInput>) {
  return {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    domain: input.domain,
    websiteUrl: input.websiteUrl,
    category: input.category,
    tags: tagsFromCsv(input.tagsCsv),
    description: input.description,
    pricing: input.pricing,
    logoUrl: input.logoUrl || null,
    screenshotUrl: input.screenshotUrl || null,
    verified: asBool(input.verified),
    featured: asBool(input.featured),
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
    pros: safeJsonParse<string[]>(input.prosJson),
    cons: safeJsonParse<string[]>(input.consJson),
    plans: safeJsonParse<Array<{ name: string; price: string; period: string; popular?: boolean; feats: string[] }>>(input.plansJson),
  };
}

// ── CREATE ───────────────────────────────────────────────────
export async function createTool(formData: FormData) {
  await requireEditor();
  const input = parseFormData(formData);

  const [existing] = await db.select({ id: tools.id }).from(tools).where(eq(tools.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A tool with slug "${input.slug}" already exists`);

  await db.insert(tools).values(valuesFromInput(input));
  await logAdmin("tool.create", `tool:${input.slug}`, { name: input.name, status: input.status });

  revalidatePath("/admin/tools");
  revalidatePath(`/ai-tool/${input.slug}`);
  revalidatePath("/");
  redirect("/admin/tools");
}

// ── UPDATE ───────────────────────────────────────────────────
export async function updateTool(id: string, formData: FormData) {
  await requireEditor();
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
  revalidatePath("/admin/tools");
  revalidatePath(`/ai-tool/${input.slug}`);
  revalidatePath("/");
  redirect("/admin/tools");
}

// ── DELETE ───────────────────────────────────────────────────
export async function deleteTool(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: tools.slug }).from(tools).where(eq(tools.id, id)).limit(1);
  await db.delete(tools).where(eq(tools.id, id));
  await logAdmin("tool.delete", `tool:${id}`, { slug: row?.slug });
  revalidatePath("/admin/tools");
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
        "Your Anthropic API account is out of credits. Either add credits at https://console.anthropic.com/settings/billing, or switch to the free Gemini provider by getting a key at https://aistudio.google.com/apikey and setting GEMINI_API_KEY in .env.local."
      );
    }

    // Either provider — bad / missing key
    if (lower.includes("api key") || lower.includes("api_key") || lower.includes("authentication") || lower.includes("unauthorized")) {
      throw new Error(
        "AI API key is missing or invalid. For the free option, get a Gemini key at https://aistudio.google.com/apikey and set GEMINI_API_KEY in .env.local, then restart dev."
      );
    }

    // Either provider — rate / quota
    if (lower.includes("rate limit") || lower.includes("quota") || lower.includes("resource_exhausted") || lower.includes("429")) {
      throw new Error("AI provider rate limit / quota hit — wait a minute and try again.");
    }

    // Either provider — model not found / wrong region
    if (lower.includes("not found") && lower.includes("model")) {
      throw new Error("AI model not available for this API key. If using Gemini, your account region may not support gemini-2.5-flash — try another model in lib/tool-ai-fill.ts.");
    }

    throw new Error(`Auto-fill failed: ${msg}`);
  }
}

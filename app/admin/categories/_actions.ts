"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";
import { ALL_CATS, POPULAR_CATS } from "@/lib/categories";
import { logAdmin } from "@/lib/audit";
import { backgroundTranslateCategoryAllLocales } from "./_translate-actions";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session.user;
}

const Input = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  icon: z.string().optional().default(""),
  color: z.string().optional().default(""),
  description: z.string().optional().default(""),
  popular: z.string().optional(),
  orderIndex: z.string().optional().default("0"),
  parentSlug: z.string().optional().default(""),
  // Editorial fields
  bannerImageUrl: z.string().optional().default(""),
  heroEyebrow: z.string().optional().default(""),
  heroTitle: z.string().optional().default(""),
  heroSubtitle: z.string().optional().default(""),
  introHtml: z.string().optional().default(""),
  bottomHtml: z.string().optional().default(""),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  featuredToolSlugsJson: z.string().optional().default(""),
  // Editorial / SEO-AEO fields
  faqsJson: z.string().optional().default(""),
  toolRelevanceJson: z.string().optional().default(""),
  relevanceThreshold: z.string().optional().default("0"),
  lastReviewedAt: z.string().optional().default(""),
  focusKeyword: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    name: (fd.get("name") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("name") as string) ?? ""),
    icon: (fd.get("icon") as string) ?? "",
    color: (fd.get("color") as string) ?? "",
    description: (fd.get("description") as string) ?? "",
    popular: (fd.get("popular") as string) ?? "",
    orderIndex: (fd.get("orderIndex") as string) ?? "0",
    parentSlug: (fd.get("parentSlug") as string) ?? "",
    bannerImageUrl: (fd.get("bannerImageUrl") as string) ?? "",
    heroEyebrow: (fd.get("heroEyebrow") as string) ?? "",
    heroTitle: (fd.get("heroTitle") as string) ?? "",
    heroSubtitle: (fd.get("heroSubtitle") as string) ?? "",
    introHtml: (fd.get("introHtml") as string) ?? "",
    bottomHtml: (fd.get("bottomHtml") as string) ?? "",
    seoTitle: (fd.get("seoTitle") as string) ?? "",
    seoDescription: (fd.get("seoDescription") as string) ?? "",
    featuredToolSlugsJson: (fd.get("featuredToolSlugsJson") as string) ?? "",
    faqsJson: (fd.get("faqsJson") as string) ?? "",
    toolRelevanceJson: (fd.get("toolRelevanceJson") as string) ?? "",
    relevanceThreshold: (fd.get("relevanceThreshold") as string) ?? "0",
    lastReviewedAt: (fd.get("lastReviewedAt") as string) ?? "",
    focusKeyword: (fd.get("focusKeyword") as string) ?? "",
  });
}

function safeParseSlugs(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string");
    return [];
  } catch {
    return [];
  }
}

/** Parse a JSON array of FAQ objects, keeping only valid { q, a } entries. */
function safeParseFaqs(raw: string): Array<{ q: string; a: string }> {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is { q: string; a: string } =>
        !!v && typeof v === "object" && typeof v.q === "string" && typeof v.a === "string",
    );
  } catch {
    return [];
  }
}

/** Parse the per-tool relevance map { slug: 0-100 }. */
function safeParseRelevance(raw: string): Record<string, number> {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = typeof v === "number" ? v : parseInt(String(v), 10);
      if (!Number.isNaN(n)) out[k] = Math.max(0, Math.min(100, n));
    }
    return out;
  } catch {
    return {};
  }
}

function values(i: z.infer<typeof Input>) {
  return {
    slug: i.slug,
    name: i.name,
    icon: i.icon || null,
    color: i.color || null,
    description: i.description || null,
    popular: i.popular === "on" || i.popular === "true",
    orderIndex: parseInt(i.orderIndex, 10) || 0,
    parentSlug: i.parentSlug || null,
    bannerImageUrl: i.bannerImageUrl || null,
    heroEyebrow: i.heroEyebrow || null,
    heroTitle: i.heroTitle || null,
    heroSubtitle: i.heroSubtitle || null,
    introHtml: i.introHtml || null,
    bottomHtml: i.bottomHtml || null,
    seoTitle: i.seoTitle || null,
    seoDescription: i.seoDescription || null,
    featuredToolSlugs: safeParseSlugs(i.featuredToolSlugsJson),
    faqs: safeParseFaqs(i.faqsJson),
    toolRelevance: safeParseRelevance(i.toolRelevanceJson),
    relevanceThreshold: Math.max(0, Math.min(100, parseInt(i.relevanceThreshold, 10) || 0)),
    lastReviewedAt:
      i.lastReviewedAt && !Number.isNaN(new Date(i.lastReviewedAt).getTime())
        ? new Date(i.lastReviewedAt)
        : null,
    focusKeyword: i.focusKeyword || null,
  };
}

export async function createCategory(fd: FormData) {
  const user = await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A category with slug "${input.slug}" already exists`);
  const [inserted] = await db.insert(categories).values(values(input)).returning({ id: categories.id });
  await logAdmin("category.create", `category:${input.slug}`, { name: input.name });

  // Fire-and-forget auto-translation for every non-default locale so
  // /ko/ai-tools/<slug> renders Korean content without editor effort.
  if (inserted?.id) backgroundTranslateCategoryAllLocales(inserted.id, user.id);

  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
  revalidatePath(`/ai-tools/${input.slug}`);
  redirect("/admin/categories");
}

export async function updateCategory(id: string, fd: FormData) {
  const user = await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different category already has slug "${input.slug}"`);
  await db.update(categories).set({ ...values(input), updatedAt: new Date() }).where(eq(categories.id, id));
  await logAdmin("category.update", `category:${id}`, { slug: input.slug });

  // English copy changed → refresh the locale translations in background.
  backgroundTranslateCategoryAllLocales(id, user.id);

  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
  revalidatePath(`/ai-tools/${input.slug}`);
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.id, id)).limit(1);
  await db.delete(categories).where(eq(categories.id, id));
  await logAdmin("category.delete", `category:${id}`, { slug: row?.slug });
  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
}

/**
 * One-shot import of the 48 hardcoded categories from
 * lib/categories.ts. Skips any slug that already exists so
 * it's safe to re-run.
 */
export async function seedDefaultCategories(): Promise<{ created: string[]; skipped: string[] }> {
  await requireEditor();

  const existing = await db.select({ slug: categories.slug }).from(categories);
  const existingSet = new Set(existing.map((r) => r.slug));

  const created: string[] = [];
  const skipped: string[] = [];

  // POPULAR_CATS have richer metadata (emoji + description); merge with
  // the broader ALL_CATS list, prefer popular versions for shared slugs.
  const popularBySlug = new Map(POPULAR_CATS.map((c) => [c.slug, c]));
  const seen = new Set<string>();

  // Popular ones first (so they get the lower orderIndex)
  let order = 0;
  for (const p of POPULAR_CATS) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    if (existingSet.has(p.slug)) { skipped.push(p.slug); order++; continue; }
    await db.insert(categories).values({
      slug: p.slug,
      name: p.name,
      icon: p.emoji,
      color: p.color,
      description: p.desc,
      popular: true,
      orderIndex: order,
    });
    created.push(p.slug);
    order++;
  }

  // Then the remaining ALL_CATS
  for (const a of ALL_CATS) {
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    if (existingSet.has(a.slug)) { skipped.push(a.slug); order++; continue; }
    const popular = popularBySlug.get(a.slug);
    await db.insert(categories).values({
      slug: a.slug,
      name: a.name,
      icon: popular?.emoji ?? a.icon ?? null,
      color: popular?.color ?? a.bg ?? null,
      description: popular?.desc ?? null,
      popular: !!popular,
      orderIndex: order,
    });
    created.push(a.slug);
    order++;
  }

  await logAdmin("category.seed", "category:bulk", { createdCount: created.length, skippedCount: skipped.length });
  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
  return { created, skipped };
}

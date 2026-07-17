"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";
import { backgroundTranslateBlogPostAllLocales } from "./_translate-actions";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session.user;
}

const Input = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  category: z.string().min(1),
  deck: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  author: z.string().optional().default(""),
  authorSlugsJson: z.string().optional().default(""),
  reviewedBySlug: z.string().optional().default(""),
  tagsCsv: z.string().optional().default(""),
  body: z.string().min(1),
  faqsJson: z.string().optional().default(""),
  readMinutes: z.string().optional().default(""),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  publishedAt: z.string().optional().default(""), // datetime-local
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    title: (fd.get("title") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("title") as string) ?? ""),
    category: (fd.get("category") as string) ?? "Guide",
    deck: (fd.get("deck") as string) ?? "",
    coverImageUrl: (fd.get("coverImageUrl") as string) ?? "",
    author: (fd.get("author") as string) ?? "",
    authorSlugsJson: (fd.get("authorSlugsJson") as string) ?? "",
    reviewedBySlug: (fd.get("reviewedBySlug") as string) ?? "",
    tagsCsv: (fd.get("tagsCsv") as string) ?? "",
    body: (fd.get("body") as string) ?? "",
    faqsJson: (fd.get("faqsJson") as string) ?? "",
    readMinutes: (fd.get("readMinutes") as string) ?? "",
    status: ((fd.get("status") as string) ?? "draft") as "draft" | "scheduled" | "published",
    publishedAt: (fd.get("publishedAt") as string) ?? "",
    seoTitle: (fd.get("seoTitle") as string) ?? "",
    seoDescription: (fd.get("seoDescription") as string) ?? "",
  });
}

function safeParseArr<T = unknown>(raw: string): T[] {
  if (!raw.trim()) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? (p as T[]) : [];
  } catch {
    return [];
  }
}

function values(i: z.infer<typeof Input>) {
  const tags = i.tagsCsv.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);
  const authorSlugs = safeParseArr<string>(i.authorSlugsJson)
    .filter((s) => typeof s === "string" && s.length > 0);
  const faqs = safeParseArr<{ q: string; a: string }>(i.faqsJson)
    .filter((f) => f && typeof f.q === "string" && typeof f.a === "string" && f.q.trim() && f.a.trim());
  return {
    slug: i.slug,
    title: i.title,
    category: i.category,
    deck: i.deck || null,
    coverImageUrl: i.coverImageUrl || null,
    author: i.author || null,
    authorSlugs,
    reviewedBySlug: i.reviewedBySlug || null,
    tags,
    body: i.body,
    faqs,
    readMinutes: i.readMinutes ? parseInt(i.readMinutes, 10) : null,
    status: i.status,
    publishedAt: i.publishedAt
      ? new Date(i.publishedAt)
      : i.status === "published" ? new Date() : null,
    seoTitle: i.seoTitle || null,
    seoDescription: i.seoDescription || null,
  };
}

export async function createBlogPost(fd: FormData) {
  const user = await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A post with slug "${input.slug}" already exists`);
  const [inserted] = await db.insert(blogPosts).values(values(input)).returning({ id: blogPosts.id });
  if (inserted?.id) backgroundTranslateBlogPostAllLocales(inserted.id, user.id);
  revalidatePath("/portal-admin/blog");
  revalidatePath(`/blog/${input.slug}`);
  revalidatePath("/blog");
  revalidatePath("/"); // homepage "latest articles" rail
  redirect("/portal-admin/blog");
}

export async function updateBlogPost(id: string, fd: FormData) {
  const user = await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different post already has slug "${input.slug}"`);
  await db.update(blogPosts).set({ ...values(input), updatedAt: new Date() }).where(eq(blogPosts.id, id));
  backgroundTranslateBlogPostAllLocales(id, user.id);
  revalidatePath("/portal-admin/blog");
  revalidatePath(`/blog/${input.slug}`);
  revalidatePath("/blog");
  revalidatePath("/"); // homepage "latest articles" rail
  redirect("/portal-admin/blog");
}

export async function deleteBlogPost(id: string) {
  await requireEditor();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/portal-admin/blog");
  revalidatePath("/blog");
  revalidatePath("/"); // homepage "latest articles" rail
}

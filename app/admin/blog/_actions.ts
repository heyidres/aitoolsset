"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
}

const Input = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  category: z.string().min(1),
  deck: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  author: z.string().optional().default(""),
  tagsCsv: z.string().optional().default(""),
  body: z.string().min(1),
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
    tagsCsv: (fd.get("tagsCsv") as string) ?? "",
    body: (fd.get("body") as string) ?? "",
    readMinutes: (fd.get("readMinutes") as string) ?? "",
    status: ((fd.get("status") as string) ?? "draft") as "draft" | "scheduled" | "published",
    publishedAt: (fd.get("publishedAt") as string) ?? "",
    seoTitle: (fd.get("seoTitle") as string) ?? "",
    seoDescription: (fd.get("seoDescription") as string) ?? "",
  });
}

function values(i: z.infer<typeof Input>) {
  const tags = i.tagsCsv.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);
  return {
    slug: i.slug,
    title: i.title,
    category: i.category,
    deck: i.deck || null,
    coverImageUrl: i.coverImageUrl || null,
    author: i.author || null,
    tags,
    body: i.body,
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
  await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A post with slug "${input.slug}" already exists`);
  await db.insert(blogPosts).values(values(input));
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${input.slug}`);
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updateBlogPost(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different post already has slug "${input.slug}"`);
  await db.update(blogPosts).set({ ...values(input), updatedAt: new Date() }).where(eq(blogPosts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${input.slug}`);
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  await requireEditor();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { slugify, RESERVED_PAGE_SLUGS } from "@/lib/cms";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
}

const Input = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(120),
  deck: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  body: z.string().min(1),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().optional().default(""),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    title: (fd.get("title") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("title") as string) ?? ""),
    deck: (fd.get("deck") as string) ?? "",
    coverImageUrl: (fd.get("coverImageUrl") as string) ?? "",
    body: (fd.get("body") as string) ?? "",
    status: ((fd.get("status") as string) ?? "draft") as "draft" | "published",
    publishedAt: (fd.get("publishedAt") as string) ?? "",
    seoTitle: (fd.get("seoTitle") as string) ?? "",
    seoDescription: (fd.get("seoDescription") as string) ?? "",
  });
}

function values(i: z.infer<typeof Input>) {
  return {
    slug: i.slug,
    title: i.title,
    deck: i.deck || null,
    coverImageUrl: i.coverImageUrl || null,
    body: i.body,
    status: i.status,
    publishedAt: i.publishedAt
      ? new Date(i.publishedAt)
      : i.status === "published" ? new Date() : null,
    seoTitle: i.seoTitle || null,
    seoDescription: i.seoDescription || null,
  };
}

function assertSlugAllowed(slug: string) {
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    throw new Error(`Slug "${slug}" is reserved by a core route. Pick a different slug (e.g. /our-${slug}).`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("Slug must be lowercase letters, numbers, and dashes only.");
  }
}

export async function createSitePage(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  assertSlugAllowed(input.slug);
  const [existing] = await db.select({ id: sitePages.id }).from(sitePages).where(eq(sitePages.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A page with slug "${input.slug}" already exists`);
  await db.insert(sitePages).values(values(input));
  revalidatePath("/admin/pages");
  revalidatePath(`/${input.slug}`);
  redirect("/admin/pages");
}

export async function updateSitePage(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  assertSlugAllowed(input.slug);
  const [conflict] = await db.select({ id: sitePages.id }).from(sitePages).where(eq(sitePages.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different page already has slug "${input.slug}"`);
  await db.update(sitePages).set({ ...values(input), updatedAt: new Date() }).where(eq(sitePages.id, id));
  revalidatePath("/admin/pages");
  revalidatePath(`/${input.slug}`);
  redirect("/admin/pages");
}

export async function deleteSitePage(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: sitePages.slug }).from(sitePages).where(eq(sitePages.id, id)).limit(1);
  await db.delete(sitePages).where(eq(sitePages.id, id));
  if (row) revalidatePath(`/${row.slug}`);
  revalidatePath("/admin/pages");
}

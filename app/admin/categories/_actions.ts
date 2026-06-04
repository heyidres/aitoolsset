"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session;
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
  });
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
  };
}

export async function createCategory(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A category with slug "${input.slug}" already exists`);
  await db.insert(categories).values(values(input));
  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different category already has slug "${input.slug}"`);
  await db.update(categories).set({ ...values(input), updatedAt: new Date() }).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireEditor();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/ai-tools");
}

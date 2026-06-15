"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";
import { logAdmin } from "@/lib/audit";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session.user;
}

const Input = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  role: z.string().optional().default(""),
  bioHtml: z.string().optional().default(""),
  photoUrl: z.string().optional().default(""),
  credentialsCsv: z.string().optional().default(""),
  websiteUrl: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  xUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  email: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    name: (fd.get("name") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("name") as string) ?? ""),
    role: (fd.get("role") as string) ?? "",
    bioHtml: (fd.get("bioHtml") as string) ?? "",
    photoUrl: (fd.get("photoUrl") as string) ?? "",
    credentialsCsv: (fd.get("credentialsCsv") as string) ?? "",
    websiteUrl: (fd.get("websiteUrl") as string) ?? "",
    linkedinUrl: (fd.get("linkedinUrl") as string) ?? "",
    xUrl: (fd.get("xUrl") as string) ?? "",
    githubUrl: (fd.get("githubUrl") as string) ?? "",
    email: (fd.get("email") as string) ?? "",
  });
}

function values(i: z.infer<typeof Input>) {
  return {
    slug: i.slug,
    name: i.name,
    role: i.role || null,
    bioHtml: i.bioHtml || null,
    photoUrl: i.photoUrl || null,
    credentials: i.credentialsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10),
    websiteUrl: i.websiteUrl || null,
    linkedinUrl: i.linkedinUrl || null,
    xUrl: i.xUrl || null,
    githubUrl: i.githubUrl || null,
    email: i.email || null,
  };
}

export async function createAuthor(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: authors.id }).from(authors).where(eq(authors.slug, input.slug)).limit(1);
  if (existing) throw new Error(`An author with slug "${input.slug}" already exists`);
  await db.insert(authors).values(values(input));
  await logAdmin("author.create", `author:${input.slug}`, { name: input.name });
  revalidatePath("/admin/authors");
  revalidatePath(`/blog/author/${input.slug}`);
  redirect("/admin/authors");
}

export async function updateAuthor(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: authors.id }).from(authors).where(eq(authors.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different author already has slug "${input.slug}"`);
  await db.update(authors).set({ ...values(input), updatedAt: new Date() }).where(eq(authors.id, id));
  await logAdmin("author.update", `author:${id}`, { slug: input.slug });
  revalidatePath("/admin/authors");
  revalidatePath(`/blog/author/${input.slug}`);
  redirect("/admin/authors");
}

export async function deleteAuthor(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: authors.slug }).from(authors).where(eq(authors.id, id)).limit(1);
  await db.delete(authors).where(eq(authors.id, id));
  await logAdmin("author.delete", `author:${id}`, { slug: row?.slug });
  revalidatePath("/admin/authors");
}

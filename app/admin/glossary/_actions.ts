"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { glossaryTerms } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
}

const Input = z.object({
  term: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  acronym: z.string().optional().default(""),
  cat: z.enum(["core", "models", "training", "agents"]),
  definition: z.string().min(1),
  example: z.string().optional().default(""),
  relatedCsv: z.string().optional().default(""),
  linkedToolId: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    term: (fd.get("term") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("term") as string) ?? ""),
    acronym: (fd.get("acronym") as string) ?? "",
    cat: ((fd.get("cat") as string) ?? "core") as "core" | "models" | "training" | "agents",
    definition: (fd.get("definition") as string) ?? "",
    example: (fd.get("example") as string) ?? "",
    relatedCsv: (fd.get("relatedCsv") as string) ?? "",
    linkedToolId: (fd.get("linkedToolId") as string) ?? "",
  });
}

function values(i: z.infer<typeof Input>) {
  return {
    slug: i.slug,
    term: i.term,
    acronym: i.acronym || null,
    cat: i.cat,
    definition: i.definition,
    example: i.example || null,
    related: i.relatedCsv.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12),
    linkedToolId: i.linkedToolId || null,
  };
}

export async function createGlossaryTerm(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: glossaryTerms.id }).from(glossaryTerms).where(eq(glossaryTerms.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A term with slug "${input.slug}" already exists`);
  await db.insert(glossaryTerms).values(values(input));
  revalidatePath("/admin/glossary");
  revalidatePath("/glossary");
  redirect("/admin/glossary");
}

export async function updateGlossaryTerm(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: glossaryTerms.id }).from(glossaryTerms).where(eq(glossaryTerms.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different term already has slug "${input.slug}"`);
  await db.update(glossaryTerms).set({ ...values(input), updatedAt: new Date() }).where(eq(glossaryTerms.id, id));
  revalidatePath("/admin/glossary");
  revalidatePath("/glossary");
  redirect("/admin/glossary");
}

export async function deleteGlossaryTerm(id: string) {
  await requireEditor();
  await db.delete(glossaryTerms).where(eq(glossaryTerms.id, id));
  revalidatePath("/admin/glossary");
  revalidatePath("/glossary");
}

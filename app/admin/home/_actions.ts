"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { homeSections } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";
import { logAdmin } from "@/lib/audit";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session.user;
}

const Input = z.object({
  slug: z.string().min(1).max(80),
  badge: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  deck: z.string().optional().default(""),
  bgColor: z.string().optional().default("var(--mint)"),
  imageSide: z.enum(["left", "right"]).default("right"),
  position: z.string().optional().default("0"),
  enabled: z.string().optional(),
  toolSlugsJson: z.string().optional().default(""),
  useCasesJson: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("badge") as string) ?? ""),
    badge: (fd.get("badge") as string) ?? "",
    title: (fd.get("title") as string) ?? "",
    deck: (fd.get("deck") as string) ?? "",
    bgColor: (fd.get("bgColor") as string) ?? "var(--mint)",
    imageSide: ((fd.get("imageSide") as string) ?? "right") as "left" | "right",
    position: (fd.get("position") as string) ?? "0",
    enabled: (fd.get("enabled") as string) ?? "",
    toolSlugsJson: (fd.get("toolSlugsJson") as string) ?? "",
    useCasesJson: (fd.get("useCasesJson") as string) ?? "",
  });
}

function safeParseArray<T>(raw: string): T[] {
  if (!raw.trim()) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? (p as T[]) : [];
  } catch {
    return [];
  }
}

function values(i: z.infer<typeof Input>) {
  return {
    slug: i.slug,
    badge: i.badge,
    title: i.title,
    deck: i.deck,
    bgColor: i.bgColor,
    imageSide: i.imageSide,
    position: parseInt(i.position, 10) || 0,
    enabled: i.enabled === "on" || i.enabled === "true",
    toolSlugs: safeParseArray<string>(i.toolSlugsJson).filter((s) => typeof s === "string" && s.length > 0),
    useCases: safeParseArray<{ name: string; desc: string; label: string; grad: string }>(
      i.useCasesJson
    ).filter((u) => u && typeof u.name === "string" && u.name.trim()),
  };
}

export async function createHomeSection(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [existing] = await db.select({ id: homeSections.id }).from(homeSections).where(eq(homeSections.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A home section with slug "${input.slug}" already exists`);
  await db.insert(homeSections).values(values(input));
  await logAdmin("homeSection.create", `homeSection:${input.slug}`, { title: input.title });
  revalidatePath("/admin/home");
  revalidatePath("/");
  redirect("/admin/home");
}

export async function updateHomeSection(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  const [conflict] = await db.select({ id: homeSections.id }).from(homeSections).where(eq(homeSections.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different home section already has slug "${input.slug}"`);
  await db.update(homeSections).set({ ...values(input), updatedAt: new Date() }).where(eq(homeSections.id, id));
  await logAdmin("homeSection.update", `homeSection:${id}`, { slug: input.slug });
  revalidatePath("/admin/home");
  revalidatePath("/");
  redirect("/admin/home");
}

export async function deleteHomeSection(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: homeSections.slug }).from(homeSections).where(eq(homeSections.id, id)).limit(1);
  await db.delete(homeSections).where(eq(homeSections.id, id));
  await logAdmin("homeSection.delete", `homeSection:${id}`, { slug: row?.slug });
  revalidatePath("/admin/home");
  revalidatePath("/");
}

/**
 * Seed the two default sections (Writers + Developers) using the same
 * content as the hardcoded fallback. Idempotent — skips slugs that
 * already exist.
 */
export async function seedDefaultHomeSections(): Promise<{ created: string[]; skipped: string[] }> {
  await requireEditor();
  const existing = await db.select({ slug: homeSections.slug }).from(homeSections);
  const existingSet = new Set(existing.map((r) => r.slug));
  const created: string[] = [];
  const skipped: string[] = [];

  const defaults = [
    {
      slug: "writers",
      badge: "✦ For Writers",
      title: "Write better, publish faster.",
      deck: "From blog posts to screenplays — the best AI writing tools to supercharge your workflow.",
      bgColor: "var(--mint)",
      imageSide: "right" as const,
      position: 10,
      enabled: true,
      toolSlugs: ["chatgpt", "claude", "jasper-ai", "copyai"],
      useCases: [
        { name: "Long-form writing", desc: "Articles, reports, and in-depth content at scale", label: "GPT", grad: "linear-gradient(135deg,#1e3a5f,#0052ff)" },
        { name: "SEO content", desc: "Rank-ready blog posts with AI keyword integration", label: "SEO", grad: "linear-gradient(135deg,#1a1a2e,#7c3aed)" },
        { name: "Email copy", desc: "Subject lines, sequences, and cold outreach", label: "✉", grad: "linear-gradient(135deg,#0f2027,#203a43)" },
        { name: "Social media", desc: "Threads, tweets, and LinkedIn posts in seconds", label: "✍", grad: "linear-gradient(135deg,#1e3c72,#2a5298)" },
      ],
    },
    {
      slug: "developers",
      badge: "✦ For Developers",
      title: "Code smarter, ship faster.",
      deck: "AI tools that write, review, and deploy code — from autocomplete to full-stack generation.",
      bgColor: "var(--sand)",
      imageSide: "left" as const,
      position: 20,
      enabled: true,
      toolSlugs: ["cursor", "v0-by-vercel", "boltnew", "github-copilot"],
      useCases: [
        { name: "AI coding IDEs", desc: "Write, debug, and deploy with AI assistance", label: "IDE", grad: "linear-gradient(135deg,#0a0a0a,#1a1a2e)" },
        { name: "API tools", desc: "Integrate AI into your apps in minutes", label: "API", grad: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
        { name: "UI generation", desc: "From prompt to production React in seconds", label: "UI", grad: "linear-gradient(135deg,#1a0533,#4c1d95)" },
        { name: "Code review", desc: "AI-powered bug detection and refactoring", label: "Bug", grad: "linear-gradient(135deg,#022c22,#065f46)" },
      ],
    },
  ];

  for (const def of defaults) {
    if (existingSet.has(def.slug)) {
      skipped.push(def.slug);
      continue;
    }
    await db.insert(homeSections).values(def);
    created.push(def.slug);
  }
  await logAdmin("homeSection.seed", "homeSection:bulk", { createdCount: created.length });
  revalidatePath("/admin/home");
  revalidatePath("/");
  return { created, skipped };
}

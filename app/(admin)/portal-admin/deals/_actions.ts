"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
}

const Input = z.object({
  toolId: z.string().min(1, "Pick a tool"),
  type: z.enum(["percent", "flat", "trial"]).default("percent"),
  amount: z.string().default("0"),
  label: z.string().optional().default(""),
  headline: z.string().min(1).max(120),
  description: z.string().min(1),
  code: z.string().optional().default(""),
  savingsUsd: z.string().optional().default(""),
  expiresAt: z.string().optional().default(""),
  exclusive: z.string().optional(),
  blackFriday: z.string().optional(),
  verified: z.string().optional(),
  active: z.string().optional(),
});

function parse(fd: FormData) {
  return Input.parse({
    toolId: (fd.get("toolId") as string) ?? "",
    type: ((fd.get("type") as string) ?? "percent") as "percent" | "flat" | "trial",
    amount: (fd.get("amount") as string) ?? "0",
    label: (fd.get("label") as string) ?? "",
    headline: (fd.get("headline") as string) ?? "",
    description: (fd.get("description") as string) ?? "",
    code: (fd.get("code") as string) ?? "",
    savingsUsd: (fd.get("savingsUsd") as string) ?? "",
    expiresAt: (fd.get("expiresAt") as string) ?? "",
    exclusive: (fd.get("exclusive") as string) ?? "",
    blackFriday: (fd.get("blackFriday") as string) ?? "",
    verified: (fd.get("verified") as string) ?? "",
    active: (fd.get("active") as string) ?? "",
  });
}

function values(i: z.infer<typeof Input>) {
  return {
    toolId: i.toolId,
    type: i.type,
    amount: parseInt(i.amount, 10) || 0,
    label: i.label || null,
    headline: i.headline,
    description: i.description,
    code: i.code || null,
    savingsUsd: i.savingsUsd ? parseInt(i.savingsUsd, 10) : null,
    expiresAt: i.expiresAt ? new Date(i.expiresAt) : null,
    exclusive: i.exclusive === "on" || i.exclusive === "true",
    blackFriday: i.blackFriday === "on" || i.blackFriday === "true",
    verified: i.verified === "on" || i.verified === "true",
    active: i.active === "on" || i.active === "true",
  };
}

export async function createDeal(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  await db.insert(deals).values(values(input));
  revalidatePath("/portal-admin/deals");
  revalidatePath("/deals");
  redirect("/portal-admin/deals");
}

export async function updateDeal(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  await db.update(deals).set({ ...values(input), updatedAt: new Date() }).where(eq(deals.id, id));
  revalidatePath("/portal-admin/deals");
  revalidatePath("/deals");
  redirect("/portal-admin/deals");
}

export async function deleteDeal(id: string) {
  await requireEditor();
  await db.delete(deals).where(eq(deals.id, id));
  revalidatePath("/portal-admin/deals");
  revalidatePath("/deals");
}

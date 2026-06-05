"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { SLOT_REGISTRY, upsertSlot, resetSlot, type SlotKey } from "@/lib/site-content";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw new Error("Not authorised");
  }
  return session.user;
}

function isValidSlotKey(key: string): key is SlotKey {
  return Object.prototype.hasOwnProperty.call(SLOT_REGISTRY, key);
}

export async function saveSlot(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  let user;
  try {
    user = await requireEditor();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Auth failed" };
  }

  const rawKey = (formData.get("slotKey") as string) ?? "";
  const value = ((formData.get("value") as string) ?? "").trim();

  if (!isValidSlotKey(rawKey)) {
    return { ok: false, error: "Unknown slot key" };
  }
  if (value.length === 0) {
    return { ok: false, error: "Value can't be empty. Click 'Reset to default' instead." };
  }
  if (value.length > 8000) {
    return { ok: false, error: "Value is too long (max 8000 chars)" };
  }

  try {
    await upsertSlot(rawKey as SlotKey, value, user.id);
    // Bust the most likely caller paths — broad but cheap.
    revalidatePath("/", "layout");
    revalidatePath("/admin/site-content");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function resetSlotAction(slotKey: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireEditor();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Auth failed" };
  }
  if (!isValidSlotKey(slotKey)) {
    return { ok: false, error: "Unknown slot key" };
  }
  try {
    await resetSlot(slotKey);
    revalidatePath("/", "layout");
    revalidatePath("/admin/site-content");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Reset failed" };
  }
}

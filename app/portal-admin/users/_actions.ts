/**
 * Server actions for the Users admin page.
 *
 * Admin-only (not editor) — user management is more sensitive than
 * content management, so it uses its own `requireAdmin` guard rather
 * than the `requireEditor` pattern the other admin sections use.
 *
 * How access is granted/revoked (see lib/auth.ts for the read side):
 *   - `inviteUser` upserts a row into `admin_invite` (email + role).
 *     That person can now sign in; the `signIn` callback sets their
 *     role from that row on every sign-in.
 *   - `updateUserRole` changes both the live `users.role` (so it
 *     takes effect immediately, before their next sign-in) and the
 *     `admin_invite` row (so a future re-login doesn't revert it).
 *   - `revokeAccess` deletes the invite row and demotes `users.role`
 *     to "user" immediately — database session strategy re-reads
 *     role on every request, so this takes effect right away, not
 *     just on next sign-in.
 *   - ADMIN_EMAILS-listed accounts are a permanent bootstrap list;
 *     none of these actions can touch them (they'd just be re-granted
 *     admin on next sign-in anyway) — the UI should disable controls
 *     for those rows.
 */

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, adminInvites } from "@/lib/db/schema";
import { logAdmin } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin") throw new Error("Not authorised — admin only");
  return session.user;
}

function bootstrapAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const InviteInput = z.object({
  email: z.string().email().max(320),
  role: z.enum(["editor", "admin"]),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

// ── Invite ───────────────────────────────────────────────────
export async function inviteUser(formData: FormData): Promise<ActionResult> {
  const actor = await requireAdmin();
  let input;
  try {
    input = InviteInput.parse({
      email: ((formData.get("email") as string) ?? "").trim().toLowerCase(),
      role: (formData.get("role") as string) ?? "editor",
    });
  } catch {
    return { ok: false, error: "Enter a valid email and role." };
  }

  if (bootstrapAdmins().includes(input.email)) {
    return { ok: false, error: "That email is already a permanent admin via ADMIN_EMAILS." };
  }

  try {
    await db
      .insert(adminInvites)
      .values({ email: input.email, role: input.role, invitedBy: actor.id })
      .onConflictDoUpdate({
        target: adminInvites.email,
        set: { role: input.role },
      });

    // If they've already signed in before (existing user row), apply
    // the role immediately rather than waiting for their next sign-in.
    await db.update(users).set({ role: input.role }).where(eq(users.email, input.email));

    await logAdmin("admin.user.invite", `email:${input.email}`, { role: input.role });
    revalidatePath("/portal-admin/users");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not save invite: ${msg}` };
  }
}

// ── Cancel a pending invite (not yet signed in) ────────────────
export async function cancelInvite(email: string): Promise<ActionResult> {
  await requireAdmin();
  const lower = email.trim().toLowerCase();
  try {
    await db.delete(adminInvites).where(eq(adminInvites.email, lower));
    await logAdmin("admin.user.cancel_invite", `email:${lower}`);
    revalidatePath("/portal-admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not cancel invite" };
  }
}

// ── Change an existing user's role ──────────────────────────────
export async function updateUserRole(userId: string, role: "editor" | "admin"): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (userId === actor.id) {
    return { ok: false, error: "You can't change your own role from here." };
  }

  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { ok: false, error: "User not found." };
  if (bootstrapAdmins().includes(target.email.toLowerCase())) {
    return { ok: false, error: "This account is a permanent admin via ADMIN_EMAILS — edit that env var instead." };
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    await db
      .insert(adminInvites)
      .values({ email: target.email.toLowerCase(), role, invitedBy: actor.id })
      .onConflictDoUpdate({ target: adminInvites.email, set: { role } });

    await logAdmin("admin.user.role_change", `user:${userId}`, { role });
    revalidatePath("/portal-admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not update role" };
  }
}

// ── Revoke access ────────────────────────────────────────────
export async function revokeAccess(userId: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (userId === actor.id) {
    return { ok: false, error: "You can't revoke your own access from here." };
  }

  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { ok: false, error: "User not found." };
  if (bootstrapAdmins().includes(target.email.toLowerCase())) {
    return { ok: false, error: "This account is a permanent admin via ADMIN_EMAILS — edit that env var instead." };
  }

  try {
    await db.delete(adminInvites).where(eq(adminInvites.email, target.email.toLowerCase()));
    await db.update(users).set({ role: "user" }).where(eq(users.id, userId));
    await logAdmin("admin.user.revoke", `user:${userId}`, { email: target.email });
    revalidatePath("/portal-admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not revoke access" };
  }
}

// ── Reset another user's 2FA (they lost their device) ───────────
export async function resetUserMfa(userId: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  try {
    await db
      .update(users)
      .set({ totpSecret: null, totpEnabled: false, totpBackupCodes: [] })
      .where(eq(users.id, userId));
    await logAdmin("admin.user.reset_mfa", `user:${userId}`, { by: actor.id });
    revalidatePath("/portal-admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not reset 2FA" };
  }
}

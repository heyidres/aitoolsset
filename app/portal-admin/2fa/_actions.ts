"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logAdmin } from "@/lib/audit";
import { MFA_COOKIE, MFA_TTL_SECONDS, signMfaToken } from "@/lib/admin-mfa";
import {
  verifyTotp,
  generateBackupCodes,
  consumeBackupCode,
} from "@/lib/totp";

type Result = { ok: true } | { ok: false; error: string };
type EnrollResult = { ok: true; backupCodes: string[] } | { ok: false; error: string };

function safeCallback(url: string | undefined): string {
  return url && url.startsWith("/portal-admin") && !url.startsWith("/portal-admin/login") ? url : "/portal-admin";
}

async function requireCmsUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw new Error("Not authorised");
  }
  return session.user;
}

async function setMfaCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(MFA_COOKIE, await signMfaToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/portal-admin",
    maxAge: MFA_TTL_SECONDS,
  });
}

/**
 * Finish enrollment: verify the first code against the pending secret,
 * flip totp_enabled on, mint backup codes, and grant the MFA cookie.
 */
export async function confirmEnrollment(code: string): Promise<EnrollResult> {
  const u = await requireCmsUser();
  const [row] = await db
    .select({ secret: users.totpSecret, enabled: users.totpEnabled })
    .from(users)
    .where(eq(users.id, u.id))
    .limit(1);

  if (!row?.secret) return { ok: false, error: "Enrollment expired. Reload and try again." };
  if (row.enabled) return { ok: false, error: "2FA is already set up. Refresh the page." };
  if (!verifyTotp(row.secret, code)) {
    return { ok: false, error: "That code didn't match. Check your authenticator app." };
  }

  const { plain, hashes } = generateBackupCodes();
  await db
    .update(users)
    .set({ totpEnabled: true, totpBackupCodes: hashes })
    .where(eq(users.id, u.id));

  await setMfaCookie(u.id);
  await logAdmin("admin.2fa.enroll", `user:${u.id}`);
  return { ok: true, backupCodes: plain };
}

/**
 * Verify an already-enrolled admin: accept a 6-digit TOTP code OR a
 * one-time backup code (which is then consumed). On success, grant the
 * MFA cookie and forward to the originally requested admin page.
 */
export async function verifyCode(code: string, callbackUrl: string): Promise<Result> {
  const u = await requireCmsUser();
  const [row] = await db
    .select({
      secret: users.totpSecret,
      enabled: users.totpEnabled,
      backups: users.totpBackupCodes,
    })
    .from(users)
    .where(eq(users.id, u.id))
    .limit(1);

  if (!row?.enabled || !row.secret) {
    return { ok: false, error: "2FA isn't set up on this account yet." };
  }

  const clean = (code ?? "").trim();
  let passed = false;

  if (/^\d{6}$/.test(clean.replace(/\s+/g, ""))) {
    passed = verifyTotp(row.secret, clean);
  } else {
    // Try a backup recovery code.
    const remaining = consumeBackupCode(clean, row.backups ?? []);
    if (remaining) {
      await db.update(users).set({ totpBackupCodes: remaining }).where(eq(users.id, u.id));
      await logAdmin("admin.2fa.backup_used", `user:${u.id}`, { remaining: remaining.length });
      passed = true;
    }
  }

  if (!passed) return { ok: false, error: "Invalid code. Try again." };

  await setMfaCookie(u.id);
  redirect(safeCallback(callbackUrl));
}

/**
 * Self-service recovery for "I lost my device AND my backup codes."
 * Gated by re-typing the account's own email (not just clicking a
 * button) so a bystander at an unlocked, already-signed-in laptop
 * can't wipe 2FA in one click — and by a best-effort notification
 * email to the account, so the real owner notices if this wasn't
 * them. This does NOT require passing MFA first (that's the whole
 * point — it's the recovery path for when MFA itself is unusable),
 * but it does require a valid, already-authenticated primary session
 * (magic link or Google), which is the same bar every other action
 * on this page already sits behind.
 */
export async function resetOwnMfa(confirmEmail: string): Promise<Result> {
  const u = await requireCmsUser();
  if (!u.email || confirmEmail.trim().toLowerCase() !== u.email.toLowerCase()) {
    return { ok: false, error: "Email didn't match your account. Type it exactly to confirm." };
  }

  await db
    .update(users)
    .set({ totpSecret: null, totpEnabled: false, totpBackupCodes: [] })
    .where(eq(users.id, u.id));

  // Drop the (now-stale) MFA cookie so this session re-enrolls cleanly.
  const jar = await cookies();
  jar.delete(MFA_COOKIE);

  await logAdmin("admin.2fa.self_reset", `user:${u.id}`);

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: u.email,
        subject: "Your two-factor authentication was just reset",
        text: `Two-factor authentication on your AI Tools Set admin account (${u.email}) was just reset from the sign-in page. You'll be asked to set it up again next time you access the CMS.\n\nIf this wasn't you, someone has access to your sign-in email — rotate your email account's password immediately and ask another admin to revoke your CMS access from /portal-admin/users.`,
      });
    } catch (e) {
      console.error("[2fa] reset notification email failed:", e);
    }
  }

  return { ok: true };
}

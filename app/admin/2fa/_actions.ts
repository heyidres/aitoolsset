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
  return url && url.startsWith("/admin") && !url.startsWith("/admin/login") ? url : "/admin";
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
    path: "/admin",
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

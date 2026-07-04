/**
 * Admin 2FA gate. Reachable after sign-in but before the MFA cookie
 * exists (middleware lets /admin/2fa through). Two modes:
 *
 *   • Not enrolled  → show a QR + secret to add to an authenticator
 *                     app, confirm one code, then reveal backup codes.
 *   • Enrolled      → ask for a 6-digit code (or a backup code).
 *
 * On success the action sets the 8h admin-mfa cookie and forwards to
 * the originally requested page.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateTotpSecret, totpQrDataUrl } from "@/lib/totp";
import { EnrollForm, VerifyForm } from "./TwoFactorForms";
import "../auth.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Two-factor · AI Tools Set",
  robots: { index: false, follow: false },
};

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const sp = await searchParams;
  const callbackUrl =
    sp.callbackUrl && sp.callbackUrl.startsWith("/admin") && !sp.callbackUrl.startsWith("/admin/login")
      ? sp.callbackUrl
      : "/admin";

  const [row] = await db
    .select({ secret: users.totpSecret, enabled: users.totpEnabled })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // ── Already enrolled → verify ──────────────────────────────
  if (row?.enabled) {
    return (
      <main className="al-shell">
        <div className="al-card">
          <div className="al-brand">
            <span className="al-logo">A</span>
            <div>
              <div className="al-brand-name">Two-factor auth</div>
              <div className="al-brand-sub">{session.user.email}</div>
            </div>
          </div>
          <h1 className="al-title">Enter your code</h1>
          <p className="al-desc">Open your authenticator app and enter the current 6-digit code.</p>
          <VerifyForm callbackUrl={callbackUrl} />
          <div className="al-foot">Lost your device? Enter a backup recovery code instead.</div>
        </div>
      </main>
    );
  }

  // ── Not enrolled → set up. Persist a pending secret once. ───
  let secret = row?.secret ?? null;
  if (!secret) {
    secret = generateTotpSecret();
    await db.update(users).set({ totpSecret: secret }).where(eq(users.id, session.user.id));
  }
  const qr = await totpQrDataUrl(secret, session.user.email ?? "admin");

  return (
    <main className="al-shell">
      <div className="al-card">
        <div className="al-brand">
          <span className="al-logo">A</span>
          <div>
            <div className="al-brand-name">Set up 2FA</div>
            <div className="al-brand-sub">Required for CMS access</div>
          </div>
        </div>
        <h1 className="al-title">Protect your account</h1>
        <ol className="al-steps">
          <li>Open Google Authenticator, Authy, or 1Password.</li>
          <li>Scan this QR code (or enter the key below).</li>
          <li>Enter the 6-digit code it shows.</li>
        </ol>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="al-qr" src={qr} alt="Authenticator QR code" width={200} height={200} />
        <div className="al-secret">{secret}</div>
        <EnrollForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}

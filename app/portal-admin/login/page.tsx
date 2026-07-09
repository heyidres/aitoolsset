/**
 * Custom admin sign-in — replaces the default /api/auth/signin UI.
 *
 * Renders "bare" (no CMS shell) because the admin layout special-cases
 * /portal-admin/login. Magic-link + optional Google, gated by Turnstile and a
 * per-IP rate limit in the server action. Sign-in itself is restricted
 * to the ADMIN_EMAILS allowlist by the auth `signIn` callback.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { turnstileSiteKey } from "@/lib/turnstile";
import { LoginForm } from "./LoginForm";
import "../auth.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in · AI Tools Set",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; callbackUrl?: string; error?: string }>;
}) {
  // Already signed in? Skip straight to the 2FA gate (which forwards on).
  const session = await auth();
  if (session?.user) redirect("/portal-admin/2fa");

  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl && sp.callbackUrl.startsWith("/portal-admin") ? sp.callbackUrl : "/portal-admin";
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="al-shell">
      <div className="al-card">
        <div className="al-brand">
          <span className="al-logo">A</span>
          <div>
            <div className="al-brand-name">AI Tools Set</div>
            <div className="al-brand-sub">Content management</div>
          </div>
        </div>

        <h1 className="al-title">Sign in to the CMS</h1>
        <p className="al-desc">
          Access is restricted to authorized editors. You&apos;ll confirm a second factor after
          signing in.
        </p>

        {sp.error && (
          <div className="al-error" role="alert">
            {sp.error === "AccessDenied"
              ? "That account isn't authorized for the CMS."
              : "Something went wrong signing in. Try again."}
          </div>
        )}

        <LoginForm
          turnstileSiteKey={turnstileSiteKey()}
          hasResend={hasResend}
          hasGoogle={hasGoogle}
          callbackUrl={callbackUrl}
          initialSent={sp.sent === "1"}
        />

        <div className="al-foot">Protected by rate limiting, bot checks, and 2-factor auth.</div>
      </div>
    </main>
  );
}

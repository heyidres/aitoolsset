"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { limit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const EmailSchema = z.string().email().max(320);

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Request an admin magic link. Layered defense before we ever send:
 *   1. Rate limit per IP (5 / 15 min) — stops email-bombing.
 *   2. Turnstile bot check (no-op until keys are set).
 *   3. Allowlist enforced in the auth `signIn` callback; here we
 *      return a generic message either way so the form can't be used
 *      to enumerate which emails are admins.
 */
export async function requestMagicLink(formData: FormData): Promise<LoginResult> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? hdrs.get("x-real-ip") ?? "unknown";

  const rl = limit("admin-login", ip, 5, 15 * 60 * 1000);
  if (!rl.success) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const token = (formData.get("turnstileToken") as string) ?? "";
  if (!(await verifyTurnstile(token, ip))) {
    return { ok: false, error: "Bot check failed. Refresh the page and try again." };
  }

  const parsed = EmailSchema.safeParse((formData.get("email") as string) ?? "");
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  // The signIn callback rejects non-allowlisted emails, so a link is
  // only actually sent to authorized admins. We don't branch on the
  // result — same response for allowed and not, to prevent enumeration.
  try {
    await signIn("resend", { email: parsed.data, redirect: false });
  } catch {
    // Swallow — never reveal whether the address was accepted.
  }
  return { ok: true };
}

/** Kick off Google OAuth (2FA still enforced afterwards in middleware). */
export async function signInWithGoogle(callbackUrl: string): Promise<void> {
  await signIn("google", { redirectTo: callbackUrl || "/admin" });
  redirect("/admin");
}

/**
 * Cloudflare Turnstile — invisible bot challenge.
 *
 * Setup:
 *   1) Sign up at https://www.cloudflare.com → Turnstile
 *   2) Add a site (Widget Mode: Managed for invisible)
 *   3) Copy the site key + secret key
 *   4) Set in env:
 *        NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
 *        TURNSTILE_SECRET_KEY=...
 *
 *  When the env vars are NOT set, the verifier returns `true`
 *  and the widget renders as a no-op — so the feature is dark
 *  in dev / staging until you opt in.
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export function turnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

/**
 * Verify a token submitted from the client widget.
 * Returns true on valid token OR when Turnstile is disabled.
 */
export async function verifyTurnstile(token: string | null | undefined, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // feature disabled
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (remoteIp) form.append("remoteip", remoteIp);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // If Cloudflare is unreachable, fail open (don't block real users)
    // but the rate limiter is still in front of the endpoint as backup.
    return true;
  }
}

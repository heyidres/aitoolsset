/**
 * Short-lived "admin has passed 2FA" proof, carried in a signed cookie.
 *
 * Decoupled from the NextAuth session on purpose:
 *   • NextAuth session  = "who you are" (long-lived, 30d)
 *   • This MFA token     = "you passed TOTP recently" (8h, re-auth after)
 *
 * The token is an HS256 JWT bound to the user id, signed with AUTH_SECRET.
 * Middleware verifies it on every /portal-admin hit; when it's missing/expired the
 * user is bounced to /portal-admin/2fa to re-enter a code. That 8h ceiling is the
 * "short admin session" — closing the laptop for the night logs admin out
 * of the CMS even though the base session is still valid.
 *
 * jose-only (no next/headers here) so it stays importable from edge
 * middleware. Cookie read/write lives in the server action that owns
 * next/headers.
 */

import { SignJWT, jwtVerify } from "jose";

export const MFA_COOKIE = "ats-admin-mfa";
/** 8 hours — admin re-enters a TOTP code after this. */
export const MFA_TTL_SECONDS = 8 * 60 * 60;

function secretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set — cannot sign MFA token");
  return new TextEncoder().encode(s);
}

/** Mint an MFA proof for a user who just passed TOTP. */
export async function signMfaToken(userId: string): Promise<string> {
  return new SignJWT({ v: 1 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MFA_TTL_SECONDS}s`)
    .sign(secretKey());
}

/**
 * True when `token` is a valid, unexpired MFA proof. When `expectedUserId`
 * is given, the token's subject must match — so a token minted for one
 * account can't authorize another.
 */
export async function verifyMfaToken(
  token: string | undefined | null,
  expectedUserId?: string
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (expectedUserId && payload.sub !== expectedUserId) return false;
    return true;
  } catch {
    return false;
  }
}

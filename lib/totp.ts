/**
 * TOTP (RFC 6238) helpers for admin/editor two-factor auth.
 *
 * Wraps `otplib` for the authenticator-app codes and adds one-time
 * backup recovery codes. Secrets are base32; backup codes are stored
 * only as sha256 hashes so a DB leak can't replay them.
 *
 * Node runtime only (uses node:crypto). Never import from middleware
 * (edge) — the middleware only checks the signed MFA cookie, not TOTP.
 */

import { createHash, randomBytes, randomInt } from "node:crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";

// Accept the code for the current 30s step plus one step either side,
// so a slightly-out-of-sync phone clock still works.
authenticator.options = { window: 1, step: 30 };

const ISSUER = "AI Tools Set";

/** Fresh base32 secret to store on the user during enrollment. */
export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

/** otpauth:// URI encoding the secret — what the QR code contains. */
export function totpAuthUri(secret: string, accountLabel: string): string {
  return authenticator.keyuri(accountLabel, ISSUER, secret);
}

/** Render the otpauth URI as a PNG data URL for an <img src>. */
export async function totpQrDataUrl(secret: string, accountLabel: string): Promise<string> {
  return QRCode.toDataURL(totpAuthUri(secret, accountLabel), { margin: 1, width: 220 });
}

/** True if a 6-digit code matches the secret within the drift window. */
export function verifyTotp(secret: string, code: string): boolean {
  const clean = (code ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  try {
    return authenticator.verify({ token: clean, secret });
  } catch {
    return false;
  }
}

// ── Backup recovery codes ─────────────────────────────────────

const BACKUP_COUNT = 10;

/** Human-friendly code like "3F9K-2QX7". */
function makeBackupCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/1/O/I ambiguity
  let s = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) s += "-";
    s += alphabet[randomInt(0, alphabet.length)];
  }
  return s;
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

/**
 * Generate a fresh set of backup codes. Returns the plaintext codes
 * (shown to the user exactly once) and their hashes (stored in the DB).
 */
export function generateBackupCodes(): { plain: string[]; hashes: string[] } {
  const plain = Array.from({ length: BACKUP_COUNT }, makeBackupCode);
  return { plain, hashes: plain.map(hashBackupCode) };
}

/**
 * If `code` matches one of `hashes`, return the remaining hashes
 * (that code consumed). Otherwise return null.
 */
export function consumeBackupCode(code: string, hashes: string[]): string[] | null {
  const h = hashBackupCode(code);
  if (!hashes.includes(h)) return null;
  return hashes.filter((x) => x !== h);
}

/** Opaque token unused elsewhere but handy for tests / future use. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

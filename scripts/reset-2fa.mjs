/**
 * Lockout recovery — reset an admin's 2FA.
 *
 * If an admin loses their authenticator app AND their backup codes,
 * run this to clear their TOTP so they can re-enroll on next sign-in.
 * Requires DATABASE_URL (server/env access), so only someone who can
 * already reach the database can use it — appropriate for recovery.
 *
 * Usage:
 *   node scripts/reset-2fa.mjs you@example.com
 *   node scripts/reset-2fa.mjs --list          # show 2FA status for all admins
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const arg = process.argv[2];

if (!arg) {
  console.error("Usage: node scripts/reset-2fa.mjs <email> | --list");
  process.exit(1);
}

if (arg === "--list") {
  const rows = await sql`
    SELECT email, role, totp_enabled,
           jsonb_array_length(totp_backup_codes) AS backup_codes_left
    FROM "user"
    WHERE role IN ('admin', 'editor')
    ORDER BY email`;
  console.log("CMS accounts:");
  for (const r of rows) {
    console.log(
      `  ${r.email}  [${r.role}]  2FA:${r.totp_enabled ? "ON" : "off"}  backups:${r.backup_codes_left}`
    );
  }
  process.exit(0);
}

const email = arg.trim().toLowerCase();
const [user] = await sql`SELECT id, email, totp_enabled FROM "user" WHERE lower(email) = ${email} LIMIT 1`;

if (!user) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

await sql`
  UPDATE "user"
  SET totp_secret = NULL, totp_enabled = false, totp_backup_codes = '[]'::jsonb
  WHERE id = ${user.id}`;

console.log(`✔ Reset 2FA for ${user.email}.`);
console.log("  They'll be prompted to set up a new authenticator on next sign-in.");

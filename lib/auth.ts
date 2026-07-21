/**
 * NextAuth.js v5 — wires:
 *   • Email magic links via Resend
 *   • Google OAuth (optional)
 *   • Drizzle adapter against our `user / account / session` tables
 *   • Role-based session: { user: { id, role } }
 *
 * Two sources grant CMS access, checked in `isAllowedToSignIn`:
 *   1. ADMIN_EMAILS env var — a permanent bootstrap allowlist that
 *      always grants "admin" role. This exists so the site can never
 *      be fully locked out even if the DB allowlist is empty or
 *      misconfigured; it requires a redeploy to change, by design.
 *   2. The `admin_invite` DB table — self-service editor or admin
 *      grants made from /portal-admin/users without a redeploy. An admin
 *      adds a row (email + role) there; on that person's first
 *      sign-in the `signIn` callback copies the invited role onto
 *      their user row. Revoking access = deleting the invite row,
 *      which (combined with database session strategy re-reading
 *      role live) demotes them back to "user" on their next request.
 *
 * SIGN-IN IS CLOSED. Launch config = admin-only: the `signIn`
 * callback rejects any email that isn't allowed by either source
 * above, so no stranger can create an account at all. When public
 * user accounts (save/review/submit) go live, relax the callback to
 * allow non-allowlisted emails through as role="user".
 *
 * Custom sign-in lives at /portal-admin/login (see `pages`). TOTP 2FA is
 * enforced separately in middleware via the admin-mfa cookie — it
 * is NOT wired here because database sessions can't carry the
 * "passed 2FA recently" flag cleanly.
 */

import NextAuth, { type DefaultSession, type Session } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens, adminInvites } from "./db/schema";
import { eq } from "drizzle-orm";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "editor" | "admin";
    } & DefaultSession["user"];
  }
}

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Looks up who's allowed to sign in and what role they get.
 *   - ADMIN_EMAILS match → always "admin" (bootstrap list wins).
 *   - Otherwise, an `admin_invite` row for this email → that row's role.
 *   - Neither → not allowed.
 */
async function resolveAccess(
  email: string | null | undefined
): Promise<{ allowed: boolean; role: "admin" | "editor" }> {
  if (!email) return { allowed: false, role: "editor" };
  const lower = email.toLowerCase();
  if (adminEmails.includes(lower)) return { allowed: true, role: "admin" };

  const [invite] = await db
    .select({ role: adminInvites.role })
    .from(adminInvites)
    .where(eq(adminInvites.email, lower))
    .limit(1);
  if (invite) return { allowed: true, role: invite.role === "admin" ? "admin" : "editor" };

  return { allowed: false, role: "editor" };
}

const providers = [];
if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    })
  );
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers,
  session: {
    strategy: "database",
    // Base session lives 30 days; the 8h admin-mfa cookie is what
    // actually gates the CMS, so this only affects "remember me".
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    // Custom branded sign-in replaces the default /api/auth/signin UI.
    signIn: "/portal-admin/login",
    error: "/portal-admin/login",
    verifyRequest: "/portal-admin/login?sent=1",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      // @ts-expect-error role is added by adapter via schema enum
      session.user.role = user.role ?? "user";
      return session;
    },
    async signIn({ user }) {
      // CLOSED signup: reject anyone not allowed by either source.
      // Returning false makes NextAuth deny the sign-in (AccessDenied).
      const access = await resolveAccess(user.email);
      if (!access.allowed) return false;
      // Sync role from the source of truth on every sign-in (not just
      // the first) so a role change in /portal-admin/users takes effect the
      // next time this person signs in, without needing a DB migration.
      if (user.email) {
        await db.update(users).set({ role: access.role }).where(eq(users.email, user.email));
      }
      return true;
    },
  },
});

/**
 * Resilient session lookup for the admin gate. `session: { strategy:
 * "database" }` means every `auth()` call is a live DB read through the
 * same serverless-recycled connection as everything else — on the very
 * first request a Lambda instance serves after a cold start (exactly the
 * request that follows a fresh sign-in or a 2FA redirect), that lookup can
 * occasionally come back empty even for a genuinely valid session: a
 * fresh connection under first-use load takes a bit longer to establish,
 * and NextAuth treats any hiccup as "no session" rather than surfacing an
 * error. We've confirmed the same session resolves correctly moments
 * later (a direct re-check always succeeds), so a single short, bounded
 * retry absorbs that blip instead of bouncing a signed-in admin back to
 * the login screen. Not used on public pages — this is intentionally
 * scoped to the low-traffic admin gate where the extra latency is
 * invisible and the cost of a false "not logged in" is high.
 */
export async function authWithRetry(): Promise<Session | null> {
  const first = await auth();
  if (first?.user) return first;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return auth();
}

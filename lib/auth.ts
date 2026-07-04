/**
 * NextAuth.js v5 — wires:
 *   • Email magic links via Resend
 *   • Google OAuth (optional)
 *   • Drizzle adapter against our `user / account / session` tables
 *   • Role-based session: { user: { id, role } }
 *
 * Admin allowlist is comma-separated ADMIN_EMAILS env. Anyone in
 * the list gets role="admin" on first sign-in.
 *
 * SIGN-IN IS CLOSED. Launch config = admin-only: the `signIn`
 * callback rejects any email that isn't on the ADMIN_EMAILS
 * allowlist, so no stranger can create an account at all. When
 * public user accounts (save/review/submit) go live, relax the
 * callback to allow non-allowlisted emails through as role="user".
 *
 * Custom sign-in lives at /admin/login (see `pages`). TOTP 2FA is
 * enforced separately in middleware via the admin-mfa cookie — it
 * is NOT wired here because database sessions can't carry the
 * "passed 2FA recently" flag cleanly.
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "./db/schema";
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
 * Who is allowed to sign in at all. Today = the admin allowlist
 * (admin-only launch). Split this out so opening signup later is a
 * one-line change here, not a rewrite of the callback.
 */
function isAllowedToSignIn(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
}

const providers = [];
if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
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
    signIn: "/admin/login",
    error: "/admin/login",
    verifyRequest: "/admin/login?sent=1",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      // @ts-expect-error role is added by adapter via schema enum
      session.user.role = user.role ?? "user";
      return session;
    },
    async signIn({ user }) {
      // CLOSED signup: reject anyone not on the allowlist. Returning
      // false makes NextAuth deny the sign-in (AccessDenied).
      if (!isAllowedToSignIn(user.email)) return false;
      // Promote allowlisted emails to admin on first sign-in.
      if (user.email) {
        await db.update(users).set({ role: "admin" }).where(eq(users.email, user.email));
      }
      return true;
    },
  },
});

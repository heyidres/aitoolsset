/**
 * NextAuth.js v5 — wires:
 *   • Email magic links via Resend
 *   • Google OAuth (optional)
 *   • Drizzle adapter against our `user / account / session` tables
 *   • Role-based session: { user: { id, role } }
 *
 * Admin allowlist is comma-separated ADMIN_EMAILS env. Anyone in
 * the list gets role="admin" on first sign-in. Promote/demote
 * others via the /admin UI (todo).
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
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      // @ts-expect-error role is added by adapter via schema enum
      session.user.role = user.role ?? "user";
      return session;
    },
    async signIn({ user }) {
      // Promote allowlisted emails to admin on first sign-in.
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        await db.update(users).set({ role: "admin" }).where(eq(users.email, user.email));
      }
      return true;
    },
  },
});

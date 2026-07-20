/**
 * TEMPORARY diagnostic — reports what auth() sees for the CALLER (using
 * their own cookies). Used to debug the "logged in but bounced to login"
 * loop: if this shows hasUser:false while you're signed in, the session
 * cookie isn't being read (config/cookie issue); if hasUser:true, the
 * bounce is elsewhere. Exposes only the caller's own session — safe.
 * Delete after the admin-login issue is resolved.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  // Cookie NAMES only (no values) — reveals whether the __Secure- prefixed
  // session cookie is present, which depends on AUTH_URL scheme.
  const cookieNames = jar.getAll().map((c) => c.name);
  const authCookieNames = cookieNames.filter(
    (n) => /authjs|next-auth|session-token|mfa/i.test(n),
  );

  const out: Record<string, unknown> = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown",
    authUrlScheme: (process.env.AUTH_URL ?? "").split("://")[0] || "unset",
    authCookieNames,
    totalCookies: cookieNames.length,
  };

  try {
    const t = Date.now();
    const session = await auth();
    out.authMs = Date.now() - t;
    out.hasSession = Boolean(session);
    out.hasUser = Boolean(session?.user);
    out.userId = session?.user?.id ?? null;
    out.role = session?.user?.role ?? null;
    out.email = session?.user?.email ?? null;
  } catch (e) {
    out.authError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(out, { status: 200 });
}

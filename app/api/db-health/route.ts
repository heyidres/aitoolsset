/**
 * TEMPORARY diagnostic endpoint — safe to delete after the Supabase
 * cutover is confirmed. Reports, from inside the production serverless
 * function: which commit is serving, which database it dials, whether a
 * FRESH connection works, and whether the SHARED (recycling proxy) `db`
 * client works. Leaks no credentials — only hostname/commit/booleans.
 * Everything is bounded so the endpoint itself can never hang.
 */
import { NextResponse } from "next/server";
import postgres from "postgres";
import { sql as dsql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hostOf(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  const m = cleaned.match(/@([^:/?]+)/);
  return m ? m[1] : "unparseable";
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${ms}ms-timeout`)), ms)),
  ]);
}

export async function GET() {
  const supa = process.env.SUPABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  const chosen = (supa ?? dbUrl)?.trim().replace(/^["']|["']$/g, "");

  const report: Record<string, unknown> = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown",
    usingHost: hostOf(supa ?? dbUrl),
    hasSUPABASE_URL: Boolean(supa),
  };

  // 1. Fresh, isolated connection (control — this always worked).
  if (chosen) {
    const fresh = postgres(chosen, { prepare: false, max: 1, connect_timeout: 5, idle_timeout: 5 });
    const t = Date.now();
    try {
      const r = (await withTimeout(fresh`select count(*)::int n from tool`, 6000)) as Array<{ n: number }>;
      report.freshClient = { ok: true, toolCount: r[0].n, ms: Date.now() - t };
    } catch (e) {
      report.freshClient = { ok: false, error: e instanceof Error ? e.message : String(e), ms: Date.now() - t };
    } finally {
      await fresh.end({ timeout: 1 }).catch(() => {});
    }
  }

  // 2. The SHARED recycling-proxy `db` that real pages use — the real test.
  {
    const t = Date.now();
    try {
      const r = (await withTimeout(
        db.execute(dsql`select count(*)::int n from tool`),
        9000,
      )) as unknown as Array<{ n: number }>;
      report.sharedDb = { ok: true, toolCount: r[0].n, ms: Date.now() - t };
    } catch (e) {
      report.sharedDb = { ok: false, error: e instanceof Error ? e.message : String(e), ms: Date.now() - t };
    }
  }

  return NextResponse.json(report, { status: 200 });
}

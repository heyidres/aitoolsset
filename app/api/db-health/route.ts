/**
 * TEMPORARY diagnostic endpoint — safe to delete after the Supabase
 * cutover is confirmed. Reports, from inside the production serverless
 * function, WHICH database the app is actually dialing and whether a
 * trivial query succeeds. Leaks no credentials — only the hostname and
 * booleans. Bounded to ~6s so it never hangs the way page renders do.
 */
import { NextResponse } from "next/server";
import postgres from "postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hostOf(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  const m = cleaned.match(/@([^:/?]+)/);
  return m ? m[1] : "unparseable";
}

export async function GET() {
  const supa = process.env.SUPABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  const chosenRaw = supa ?? dbUrl;
  const chosen = chosenRaw?.trim().replace(/^["']|["']$/g, "");

  const report: Record<string, unknown> = {
    hasSUPABASE_URL: Boolean(supa),
    hasDATABASE_URL: Boolean(dbUrl),
    SUPABASE_host: hostOf(supa),
    DATABASE_host: hostOf(dbUrl),
    usingHost: hostOf(chosenRaw),
    // did the pasted value carry stray quotes/whitespace?
    supabaseNeededTrim: supa ? supa !== supa.trim().replace(/^["']|["']$/g, "") : null,
  };

  if (!chosen) {
    return NextResponse.json({ ...report, query: "no-url" }, { status: 200 });
  }

  const sql = postgres(chosen, { prepare: false, max: 1, connect_timeout: 5, idle_timeout: 5 });
  const t = Date.now();
  try {
    const r = (await Promise.race([
      sql`select count(*)::int as n from tool`,
      new Promise((_, rej) => setTimeout(() => rej(new Error("6s-timeout")), 6000)),
    ])) as Array<{ n: number }>;
    report.query = "ok";
    report.toolCount = r[0].n;
    report.ms = Date.now() - t;
  } catch (e) {
    report.query = "fail";
    report.error = e instanceof Error ? e.message : String(e);
    report.ms = Date.now() - t;
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }

  return NextResponse.json(report, { status: 200 });
}

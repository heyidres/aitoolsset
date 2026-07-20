/**
 * Drizzle client — postgres-js driver, hardened for Vercel serverless.
 *
 * THE PROBLEM this file solves:
 * postgres-js keeps a live TCP connection open on the module-level client
 * and reuses it across requests. On Vercel, a serverless instance is
 * FROZEN between invocations. While it's frozen, Supabase's pooler (and
 * any NAT in between) silently drops the idle connection. When the
 * instance thaws, postgres-js still believes the socket is alive and
 * writes the next query into a dead connection — which never gets a
 * response and never errors. The request then hangs until the platform's
 * hard 300s limit (FUNCTION_INVOCATION_TIMEOUT). Because it HANGS rather
 * than rejecting, call-site `.catch()` fallbacks can't save the page.
 * (A brand-new connection always works — that's why isolated probes pass
 * while real page renders hang.)
 *
 * THE FIX:
 * Never reuse a connection that has been idle longer than IDLE_LIMIT_MS.
 * The check is synchronous, done when a query is about to run (not via a
 * timer, which is suspended during the freeze). Pooled connections stay
 * alive for minutes, so a connection used <8s ago is safe to reuse (fast
 * path for bursts / Promise.all); anything idle longer is replaced with a
 * fresh connection — the same behavior as the probe that always works.
 * The Supabase transaction pooler (Supavisor) is built for exactly this
 * churn, so recreating connections is the recommended serverless pattern,
 * not a workaround.
 *
 * A transparent Proxy around the postgres-js client applies this to every
 * Drizzle query without touching any of the ~50 query call sites.
 *
 * URL: prefer SUPABASE_URL (the live DB); DATABASE_URL may still hold the
 * retired Neon string in some environments. Trim stray quotes/whitespace
 * so a value pasted from a .env file (`"postgres://…"`) still connects.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// postgres-js exposes its client type as the namespaced `postgres.Sql`,
// not a direct named export — derive it from the factory's return type.
type Sql = ReturnType<typeof postgres>;

const url = (process.env.SUPABASE_URL ?? process.env.DATABASE_URL ?? "")
  .trim()
  .replace(/^["']|["']$/g, "");
if (!url) {
  console.warn("[db] Neither SUPABASE_URL nor DATABASE_URL is set — DB-dependent routes will fail.");
}

// A connection idle longer than this is treated as possibly-dead and
// replaced. Well under any pooler idle timeout, so a reused connection is
// always genuinely alive; large enough that a burst of concurrent queries
// (e.g. Promise.all on one page) still shares a single warm connection.
//
// EXCEPTION — during `next build`: there is no serverless freeze, so
// connections never go stale, and recycling would only CHURN connections
// (open/close repeatedly between page renders). That churn hammers
// Supabase's free-tier pooler while it's already generating hundreds of
// pages, exhausting connection slots so page queries block past the 60s
// static-generation timeout and fail the build. During build we therefore
// keep ONE stable connection (never recycle) so ISR-cached pages can be
// pre-rendered without bursting the pool. Detected via NEXT_PHASE, which
// Next sets to "phase-production-build" for the duration of the build.
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const IDLE_LIMIT_MS = IS_BUILD ? Number.POSITIVE_INFINITY : 8_000;

function makeClient(): Sql {
  return postgres(url, {
    prepare: false, // required by Supabase's transaction pooler (port 6543)
    max: 1,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 10,
  });
}

let client: Sql | null = null;
let lastUsed = 0;

function getClient(): Sql {
  const now = Date.now();
  if (!client || now - lastUsed > IDLE_LIMIT_MS) {
    const stale = client;
    client = makeClient();
    // Tear down the old (likely dead) connection in the background — never
    // block the new query on it, and swallow errors from closing a socket
    // that may already be gone.
    if (stale) void stale.end({ timeout: 5 }).catch(() => {});
  }
  lastUsed = now;
  return client;
}

// Transparent stand-in for the postgres-js client. Every property access
// and call is routed to a fresh-enough real client via getClient(), so
// Drizzle transparently gets connection recycling. The Proxy target is a
// function so the client stays callable (postgres-js clients are tag
// functions) and `typeof client === "function"` still holds.
const clientProxy = new Proxy(function () {} as unknown as Sql, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
  apply(_target, _thisArg, args: unknown[]) {
    return (getClient() as unknown as (...a: unknown[]) => unknown)(...args);
  },
}) as Sql;

export const db = drizzle(clientProxy, { schema });
export { schema };

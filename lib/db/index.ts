/**
 * Drizzle client — postgres-js against Supabase (Transaction pooler).
 *
 * RUNTIME: a FRESH connection pool PER REQUEST (not a long-lived shared
 * pool). This is the crux fix. A pooled connection reused across a Vercel
 * serverless freeze/thaw can be silently dead — Supabase/NAT drops the idle
 * socket without a clean FIN, so postgres-js keeps writing queries into a
 * black hole that never responds. Bounded to 8s by the fail-fast wrapper
 * below, but still an error; and once several of an instance's connections
 * are stuck that way, every request to it errors until it recycles (the
 * "tool page returns 500" symptom). A brand-new connection per request is
 * never stale — the exact pattern the health probe used that NEVER once
 * hung across all debugging. `cache()` memoizes the pool for the duration
 * of a single request so all of that request's queries share it; `after()`
 * closes it once the response is sent so nothing leaks or lingers to go
 * stale. Opening a connection is network-wait, not CPU, so this is cheap on
 * the CPU quota — and Supabase's transaction pooler is built for exactly
 * this connect/disconnect churn.
 *
 * BUILD: one stable pool instead — `next build` renders hundreds of pages
 * sequentially with no request scope and no freeze, so reuse is correct and
 * avoids opening a connection per generated page.
 *
 * FAIL-FAST: postgres-js has no per-query timeout; every runtime query is
 * wrapped in an 8s bounded race so a pathological hang rejects fast (letting
 * page `.catch()` fallbacks render) instead of running to Vercel's 300s
 * limit and burning CPU. Kept as a safety net even with per-request
 * connections. Not applied at build (long healthy queries mustn't false-out).
 *
 * URL: prefer SUPABASE_URL (the live DB); DATABASE_URL may still hold the
 * retired Neon string. Trim stray quotes/whitespace off a pasted value.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cache } from "react";
import { after } from "next/server";
import * as schema from "./schema";

type Sql = ReturnType<typeof postgres>;

const url = (process.env.SUPABASE_URL ?? process.env.DATABASE_URL ?? "")
  .trim()
  .replace(/^["']|["']$/g, "");
if (!url) {
  console.warn("[db] Neither SUPABASE_URL nor DATABASE_URL is set — DB-dependent routes will fail.");
}

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const QUERY_TIMEOUT_MS = 8000;

function makePool(max: number): Sql {
  return postgres(url, {
    prepare: false, // required by Supabase's transaction pooler (port 6543)
    max,
    connect_timeout: 10,
    idle_timeout: 10,
    max_lifetime: 60 * 5,
  });
}

// Build path: one stable pool, reused across the whole build.
const buildPool: Sql | null = IS_BUILD ? makePool(1) : null;

// Runtime path: one fresh pool per request, memoized for that request and
// closed after the response. max:3 gives concurrent page queries real
// parallel lanes without opening many sockets.
const getRequestPool = cache((): Sql => {
  const pool = makePool(3);
  try {
    after(() => void pool.end({ timeout: 3 }).catch(() => {}));
  } catch {
    // No request scope to hook into (shouldn't happen for a real request) —
    // idle_timeout still reaps the pool shortly after it goes quiet.
  }
  return pool;
});

const activePool = (): Sql => buildPool ?? getRequestPool();

function raceTimeout<T>(pending: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`[db] query exceeded ${QUERY_TIMEOUT_MS}ms — failing fast`)),
      QUERY_TIMEOUT_MS,
    );
  });
  return Promise.race([Promise.resolve(pending).finally(() => clearTimeout(timer)), timeout]);
}

// Wrap postgres-js `unsafe` (Drizzle's query entry point) so both the
// direct-await and `.values()` paths are time-bounded, preserving the
// thenable shape Drizzle relies on.
function wrapUnsafe(pool: Sql) {
  return (query: string, params?: unknown[], options?: unknown) => {
    const pending = (pool.unsafe as (q: string, p?: unknown[], o?: unknown) => {
      values: () => Promise<unknown>;
      execute: () => Promise<unknown>;
    } & Promise<unknown>)(query, params, options);
    return {
      then: (res: ((v: unknown) => unknown) | undefined, rej: ((e: unknown) => unknown) | undefined) =>
        raceTimeout(pending).then(res, rej),
      catch: (rej: (e: unknown) => unknown) => raceTimeout(pending).catch(rej),
      finally: (f: () => void) => raceTimeout(pending).finally(f),
      values: () => raceTimeout(pending.values()),
      execute: () => raceTimeout(pending.execute()),
    };
  };
}

// A single stable proxy is handed to Drizzle at module load. Every access
// resolves to the CURRENT request's pool (or the build pool); `unsafe` is
// fail-fast-wrapped at runtime. Everything else (transactions via `.begin`,
// tag calls) passes through to the real pool.
const clientProxy = new Proxy(function () {} as unknown as Sql, {
  get(_target, prop) {
    const pool = activePool();
    if (prop === "unsafe" && !IS_BUILD) return wrapUnsafe(pool);
    const value = (pool as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(pool) : value;
  },
  apply(_target, _thisArg, args: unknown[]) {
    return (activePool() as unknown as (...a: unknown[]) => unknown)(...args);
  },
}) as Sql;

export const db = drizzle(clientProxy, { schema });
export { schema };

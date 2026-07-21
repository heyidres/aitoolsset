/**
 * Drizzle client — postgres-js driver against Supabase (Transaction pooler).
 *
 * Deliberately a PLAIN postgres-js connection pool — no custom connection
 * recycling. An earlier version wrapped the client in a Proxy that tore
 * down and recreated the connection whenever it had been idle >8s, to work
 * around a "stale socket hangs forever after a serverless freeze" problem.
 * That problem turned out to be the app pointing at a DEAD Neon database
 * (DATABASE_URL still held the retired Neon string); once it pointed at
 * Supabase, the recycling was unnecessary — and actively harmful. It
 * introduced two production outages of its own:
 *   1. It closed old clients with end({ timeout: 5 }), which force-destroys
 *      sockets mid-query — one request's recycle killed another request's
 *      in-flight queries ("write CONNECTION_DESTROYED" 500s).
 *   2. Combined with max:1, concurrent page queries (generateMetadata in
 *      parallel with the page body, plus Promise.all fan-outs) wedged the
 *      single-connection queue permanently after a recycle — the tool-page
 *      hang.
 *
 * A standard pool avoids all of it. Verified against production Supabase:
 * the tool page's exact concurrent-query shape ran 8/8 clean across
 * repeated 25s idle gaps (each gap > idle_timeout, forcing postgres-js to
 * close and cleanly reconnect). postgres-js manages the pool itself:
 *   • `max` connections opened on demand, so concurrent queries get real
 *     parallel lanes instead of one wedgeable queue;
 *   • `idle_timeout` closes idle connections; Supabase's pooler closes its
 *     side gracefully (TCP FIN), so postgres-js detects the close and
 *     reconnects on the next query rather than hanging;
 *   • `max_lifetime` recycles long-lived connections.
 *
 * Build uses max:1: `next build` renders hundreds of pages, and a bigger
 * pool per worker could burst Supabase's free-tier pooler during static
 * generation. Runtime uses a small pool for the concurrency above.
 *
 * URL: prefer SUPABASE_URL (the live DB); DATABASE_URL may still hold the
 * retired Neon string in some environments. Trim stray quotes/whitespace
 * so a value pasted from a .env file (`"postgres://…"`) still connects.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = (process.env.SUPABASE_URL ?? process.env.DATABASE_URL ?? "")
  .trim()
  .replace(/^["']|["']$/g, "");
if (!url) {
  console.warn("[db] Neither SUPABASE_URL nor DATABASE_URL is set — DB-dependent routes will fail.");
}

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

const rawClient = postgres(url, {
  prepare: false, // required by Supabase's transaction pooler (port 6543)
  max: IS_BUILD ? 1 : 5,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

/**
 * FAIL-FAST safeguard. postgres-js has no per-query timeout, so if a pooled
 * connection is silently dead after a serverless freeze/thaw, a query
 * written into it can hang until the platform's 300s function limit —
 * which burns CPU quota, blocks the page, and makes crawlers time out
 * (SEO). Wrapping every query in a bounded race turns that worst case into
 * a fast rejection instead: the page's own `.catch()` fallbacks then render
 * content immediately rather than spinning. A timed-out request just uses
 * another pooled connection next time (verified: the pool recovers), and
 * normal queries are untouched — 8s is far above any healthy query
 * (typically <200ms) but far below the 300s hang it prevents.
 *
 * Not applied during build: static generation runs long, sequential, and
 * has no freeze, so an 8s cap there would only risk false failures.
 */
const QUERY_TIMEOUT_MS = 8000;

function raceTimeout<T>(pending: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`[db] query exceeded ${QUERY_TIMEOUT_MS}ms (likely a dead pooled connection) — failing fast`)),
      QUERY_TIMEOUT_MS,
    );
  });
  return Promise.race([Promise.resolve(pending).finally(() => clearTimeout(timer)), timeout]);
}

type Unsafe = (typeof rawClient)["unsafe"];

// Drizzle runs every query through `client.unsafe(query, params)` (awaited
// directly) or `.unsafe(...).values()`. Wrap `unsafe` so both paths are
// time-bounded while preserving the thenable + `.values()`/`.execute()`
// shape Drizzle relies on. Everything else on the client is passed through
// untouched (transactions via `.begin`, etc.).
const wrappedUnsafe = ((query: string, params?: unknown[], options?: unknown) => {
  const pending = (rawClient.unsafe as (q: string, p?: unknown[], o?: unknown) => {
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
}) as unknown as Unsafe;

// Runtime gets the fail-fast wrapper; build uses the raw client so a slow
// (but healthy) static-generation query can't be false-timed-out into
// rendering fallback content into a pre-built page.
const client = IS_BUILD
  ? rawClient
  : (new Proxy(rawClient, {
      get(target, prop, receiver) {
        if (prop === "unsafe") return wrappedUnsafe;
        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    }) as typeof rawClient);

export const db = drizzle(client, { schema });
export { schema };

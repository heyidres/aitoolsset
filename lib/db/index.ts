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

const client = postgres(url, {
  prepare: false, // required by Supabase's transaction pooler (port 6543)
  max: IS_BUILD ? 1 : 5,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
export { schema };

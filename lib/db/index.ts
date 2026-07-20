/**
 * Drizzle client — postgres-js driver.
 *
 * Works with any standard Postgres (Supabase, Neon's pooled connection,
 * local). For Supabase on serverless use the Transaction pooler
 * connection string (port 6543); `prepare: false` is required because
 * transaction-mode pooling doesn't support prepared statements.
 *
 * `max: 1` caps postgres-js to a single connection per client instance.
 * Next.js spins up many parallel workers (build-time static generation,
 * and separately many concurrent serverless invocations at runtime) —
 * each gets its OWN client instance, so leaving postgres-js's default
 * (max: 10) meant dozens of workers could each open up to 10 connections
 * at once, well past what Supabase's free-tier pooler can serve, which
 * queued/timed out and failed the build. The pooler (Supavisor) already
 * multiplexes many logical clients onto a small number of real backend
 * connections, so a lean max per client is the standard config for
 * serverless + Supabase, not a workaround.
 *
 * DATABASE_URL not set → we don't throw at import so the rest of the app
 * keeps working; DB-dependent routes throw when they actually query.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prefer SUPABASE_URL. The site migrated off Neon (its free-tier compute
// hit the quota cap and 402s); DATABASE_URL may still hold the old Neon
// string in some environments, and connecting the postgres-js TCP driver
// to Neon's suspended compute HANGS instead of erroring. Reading the
// Supabase var first guarantees we talk to the live database everywhere,
// falling back to DATABASE_URL for envs that already point at Supabase.
// Trim stray whitespace/quotes: pasting a value into a hosting dashboard
// (Vercel) often carries the surrounding quotes from a .env file, and a
// URL like `"postgres://…"` (quotes included) silently fails to connect.
const url = (process.env.SUPABASE_URL ?? process.env.DATABASE_URL ?? "")
  .trim()
  .replace(/^["']|["']$/g, "");
if (!url) {
  console.warn("[db] Neither SUPABASE_URL nor DATABASE_URL is set — DB-dependent routes will fail.");
}

// Lazy: postgres-js doesn't open a connection until the first query, so an
// empty string here is safe at import time (matches the old neon() behavior).
//
// connect_timeout / idle_timeout: without these, a connection attempt that
// gets no response (rather than an explicit refusal) hangs indefinitely —
// no error, nothing for a caller's .catch() to catch, just a request that
// never completes. Bounding both means a bad connection surfaces as a fast,
// catchable error instead of hanging the whole page render.
const client = postgres(url ?? "", {
  prepare: false,
  max: 1,
  connect_timeout: 10,
  idle_timeout: 20,
});
export const db = drizzle(client, { schema });
export { schema };

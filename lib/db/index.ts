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

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn("[db] DATABASE_URL is not set — DB-dependent routes will fail.");
}

// Lazy: postgres-js doesn't open a connection until the first query, so an
// empty string here is safe at import time (matches the old neon() behavior).
const client = postgres(url ?? "", { prepare: false, max: 1 });
export const db = drizzle(client, { schema });
export { schema };

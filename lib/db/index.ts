/**
 * Drizzle client — postgres-js driver.
 *
 * Works with any standard Postgres (Supabase, Neon's pooled connection,
 * local). For Supabase on serverless use the Transaction pooler
 * connection string (port 6543); `prepare: false` is required because
 * transaction-mode pooling doesn't support prepared statements.
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
const client = postgres(url ?? "", { prepare: false });
export const db = drizzle(client, { schema });
export { schema };

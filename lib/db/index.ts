/**
 * Drizzle client — Neon HTTP driver.
 *
 * The Neon serverless driver works in every Next.js runtime
 * (Node, edge, Vercel functions). For local dev you can point
 * DATABASE_URL at any Postgres instance; the HTTP driver only
 * matters for the serverless Neon transport.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  // We don't throw at import-time so the rest of the app keeps
  // working without a database. Routes that need the DB throw
  // when they try to query.
  console.warn("[db] DATABASE_URL is not set — DB-dependent routes will fail.");
}

const sql = neon(url ?? "");
export const db = drizzle(sql, { schema });
export { schema };

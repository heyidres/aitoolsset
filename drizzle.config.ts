import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit only reads `.env` by default — load `.env.local` too.
config({ path: ".env.local" });

/**
 * Which database migrations run against.
 *
 * This MUST resolve to the same database the app reads, and the precedence
 * below deliberately mirrors lib/db/index.ts (SUPABASE_URL, then
 * DATABASE_URL). Reading only DATABASE_URL previously meant a stale value
 * could silently migrate a completely different — even decommissioned —
 * database and report success, while the running app talked to another one
 * and failed on the missing column.
 *
 * MIGRATE_DATABASE_URL takes priority so you can point DDL at Supabase's
 * DIRECT connection (port 5432). The transaction pooler (6543) that the app
 * uses is not a reliable target for migrations — it multiplexes sessions,
 * which breaks the session-scoped state some DDL and prepared statements
 * depend on.
 */
const migrationUrl = (
  process.env.MIGRATE_DATABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.DATABASE_URL ??
  ""
)
  .trim()
  .replace(/^["']|["']$/g, "");

if (!migrationUrl) {
  throw new Error(
    "No database URL for migrations. Set MIGRATE_DATABASE_URL (Supabase → Settings → Database → Direct connection) in .env.local.",
  );
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;

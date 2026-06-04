import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit only reads `.env` by default — load `.env.local` too.
config({ path: ".env.local" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
} satisfies Config;

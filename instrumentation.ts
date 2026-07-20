/**
 * Next.js 15 instrumentation hook — runs once per worker (i.e. on every
 * serverless cold start). Loads the right Sentry config based on runtime.
 *
 *   - "nodejs" runtime → sentry.server.config.ts
 *   - "edge" runtime   → sentry.edge.config.ts
 *
 * IMPORTANT: `@sentry/nextjs` is a large package, and importing it adds
 * measurable time to every cold start. Sentry is a no-op without a DSN,
 * so when no DSN is configured we skip the import entirely rather than
 * pay the load cost for nothing. The moment a SENTRY_DSN is set, the
 * import (and error reporting) comes back automatically.
 */

export async function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // no DSN → don't load the heavy SDK at all on cold start

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

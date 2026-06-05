/**
 * Next.js 15 instrumentation hook — runs once per worker.
 * Loads the right Sentry config based on runtime.
 *
 *   - "nodejs" runtime → sentry.server.config.ts
 *   - "edge" runtime   → sentry.edge.config.ts
 *
 * No-ops without a DSN.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

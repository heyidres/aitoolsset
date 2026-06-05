/**
 * Sentry — server init. Loaded by Next 15's instrumentation hook.
 * No-op without SENTRY_DSN.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Capture unhandled rejections + uncaught exceptions
    enableTracing: true,
  });
}

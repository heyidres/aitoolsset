/**
 * Sentry — client init. No-op when NEXT_PUBLIC_SENTRY_DSN is
 * not set, so dev / staging stay quiet.
 *
 * Setup:
 *   1) Sign up at https://sentry.io (free 5k events/mo)
 *   2) Create a Next.js project → copy the DSN
 *   3) Set NEXT_PUBLIC_SENTRY_DSN in Vercel + .env.local
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Conservative sample rate — we don't want to burn the free tier
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    // Ignore noisy browser extensions / network blips
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      /^Network request failed/i,
    ],
  });
}

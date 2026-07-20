/**
 * next-intl routing configuration.
 *
 * This is the bridge between `lib/i18n/config.ts` (our app-level
 * locale registry) and the next-intl library. Keeps i18n config
 * in one place — next-intl just reads from it.
 *
 * `localePrefix: 'as-needed'`:
 *   - Default locale (en) lives at `/`, no `/en` prefix
 *   - All other locales live at `/<locale>/`
 *   - Preserves every English URL Google has already indexed
 */

import { defineRouting } from "next-intl/routing";
import { i18n } from "./config";

export const routing = defineRouting({
  locales: [...i18n.locales],
  defaultLocale: i18n.defaultLocale,
  localePrefix: "as-needed",
  // Cookie DISABLED on purpose. next-intl otherwise writes a locale
  // cookie (Set-Cookie) on EVERY page response — and Vercel will not
  // CDN-cache any response that carries a Set-Cookie header, which
  // silently defeats ISR/static caching and forces every page to
  // cold-render per request. With the cookie off, locale comes purely
  // from the URL prefix (+ the GeoIP first-visit redirect in
  // middleware), and page responses stay cacheable so they serve
  // instantly from the edge. Trade-off: no cookie-based persistence of
  // a manually switched locale across visits to `/` — acceptable for a
  // URL-prefixed, SEO-first i18n scheme.
  localeCookie: false,
});

export type AppPathname = string;

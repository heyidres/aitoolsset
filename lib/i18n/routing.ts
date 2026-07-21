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
  // Cookie name used by next-intl's locale detection — keep in sync
  // with the cookie our manual switcher writes.
  localeCookie: {
    name: i18n.cookieName,
    maxAge: i18n.cookieMaxAge,
  },
});

export type AppPathname = string;

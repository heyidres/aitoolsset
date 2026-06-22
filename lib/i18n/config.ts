/**
 * i18n single source of truth.
 *
 * To add a new locale:
 *   1. Add the code to `locales` (must match ISO 639-1, lowercase)
 *   2. Add a display name to `localeNames` (rendered in the switcher)
 *   3. Optionally map a GeoIP country code in `countryToLocale`
 *   4. Create `messages/<code>.json` — clone en.json and translate
 *   5. Deploy. No code changes elsewhere needed.
 *
 * URL strategy: `localePrefix: 'as-needed'`
 *   - Default locale (en) lives at /             (e.g. /tool/cursor)
 *   - All other locales live at /<locale>/       (e.g. /ko/tool/cursor)
 *   - Preserves existing English URLs that are already indexed by Google.
 */

export const i18n = {
  /** Locale served at root `/` with no prefix. */
  defaultLocale: "en",

  /** All supported locales (must include defaultLocale). Order = display order. */
  locales: ["en", "ko"] as const,

  /** Human-readable name shown in the language switcher. */
  localeNames: {
    en: "English",
    ko: "한국어",
  } as Record<string, string>,

  /** Optional flag emoji shown in the switcher. */
  localeFlags: {
    en: "🇺🇸",
    ko: "🇰🇷",
  } as Record<string, string>,

  /**
   * GeoIP country code → locale.
   * Vercel edge sets `x-vercel-ip-country` on every request.
   * If the visitor's country isn't mapped, we fall back to Accept-Language.
   */
  countryToLocale: {
    KR: "ko",
  } as Record<string, string>,

  /**
   * Language tag emitted in <html lang="…">. Some locales differ
   * between code and full BCP-47 tag (e.g. zh-CN). Add overrides here.
   */
  htmlLang: {
    en: "en",
    ko: "ko-KR",
  } as Record<string, string>,

  /**
   * Cookie name remembering the user's manual locale choice.
   * 1-year expiry, set whenever the LanguageSwitcher fires.
   */
  cookieName: "ats-locale",

  /** Cookie max-age in seconds (1 year). */
  cookieMaxAge: 60 * 60 * 24 * 365,
} as const;

export type Locale = (typeof i18n.locales)[number];

/** Type guard — narrows an unknown string to a Locale at compile time. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (i18n.locales as readonly string[]).includes(value);
}

/** Returns the canonical Locale for a value or the default. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : (i18n.defaultLocale as Locale);
}

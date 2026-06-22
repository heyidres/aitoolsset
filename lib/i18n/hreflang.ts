/**
 * SEO helpers for emitting hreflang + canonical URLs on every page.
 *
 * Usage in a page.tsx generateMetadata():
 *
 *   import { alternatesFor } from "@/lib/i18n/hreflang";
 *
 *   export async function generateMetadata({ params }): Promise<Metadata> {
 *     const { locale } = await params;
 *     return {
 *       title: …,
 *       alternates: alternatesFor({
 *         locale,
 *         path: `/tool/${slug}`,
 *         // Optional: pass a function that says whether a given
 *         // locale has a translation for THIS specific page. Used
 *         // when only some locales have content (e.g. only 12% of
 *         // Korean tool translations have landed).
 *         availableLocales: ["en", "ko"],
 *       }),
 *     };
 *   }
 *
 * The function builds:
 *   - canonical: this page in this locale
 *   - languages: { en, ko, "x-default" } each pointing to that locale's URL
 */

import { i18n, isLocale, type Locale } from "./config";

const SITE = process.env.SITE_URL ?? "https://aitoolsset.com";

/** Strip a leading locale segment from a path so we can re-prefix it cleanly. */
function stripLocalePrefix(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (isLocale(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

/** Builds the absolute URL for `path` in `locale`. */
export function localeUrl(locale: Locale, path: string): string {
  const cleanPath = stripLocalePrefix(path);
  // Default locale lives at root with no prefix.
  if (locale === i18n.defaultLocale) {
    return `${SITE}${cleanPath === "/" ? "" : cleanPath}`.replace(/\/$/, "") || SITE;
  }
  if (cleanPath === "/") return `${SITE}/${locale}`;
  return `${SITE}/${locale}${cleanPath}`;
}

/**
 * Build `Metadata.alternates` for a given page.
 * - `canonical` always points to the active locale's URL
 * - `languages` includes ALL locales that have content (default: all
 *   supported locales). If a locale doesn't have a translation, omit
 *   it from `availableLocales` and Google will fall through to
 *   `x-default` (English).
 */
export function alternatesFor({
  locale,
  path,
  availableLocales,
}: {
  locale: Locale;
  path: string;
  /** Locales that have a translation for THIS specific page. Defaults to all. */
  availableLocales?: readonly Locale[];
}) {
  const available = availableLocales ?? i18n.locales;
  const languages: Record<string, string> = {};

  for (const l of available) {
    languages[l] = localeUrl(l, path);
  }
  // x-default always points at the default-locale URL — Google uses this
  // when the user's preferred language isn't in our list.
  languages["x-default"] = localeUrl(i18n.defaultLocale as Locale, path);

  return {
    canonical: localeUrl(locale, path),
    languages,
  };
}

/** Returns the path with the current locale prefix stripped, for use with the language switcher. */
export function pathWithoutLocale(pathname: string): string {
  return stripLocalePrefix(pathname);
}

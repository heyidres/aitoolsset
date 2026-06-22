/**
 * next-intl runtime config — called for every Server Component render
 * to pick the right message catalog for the request.
 *
 * The locale comes from the URL segment via `requestLocale`, which the
 * middleware sets. If something is off (unknown locale, missing file),
 * we fall back to the default — the request still renders, just in
 * English.
 */

import { getRequestConfig } from "next-intl/server";
import { i18n, isLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const raw = await requestLocale;
  const locale = isLocale(raw) ? raw : i18n.defaultLocale;

  return {
    locale,
    // Dynamic import keeps the bundle small — only the active locale
    // is sent to the client.
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Use a stable timezone so server-rendered timestamps don't drift
    // when the user's clock changes.
    timeZone: "UTC",
    // Fail visibly in dev when a key is missing; in prod, fall back
    // to the key itself so the page still renders.
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[i18n]", error);
      }
    },
    getMessageFallback: ({ namespace, key }) =>
      `${namespace ? namespace + "." : ""}${key}`,
  };
});

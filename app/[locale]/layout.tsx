/**
 * Localized public-shell layout — wraps every public page that has a
 * `[locale]` URL segment. The root layout already emits <html>/<body>
 * + the NextIntlClientProvider, so this layout just:
 *
 *   1. Hard-validates the locale segment so an invalid /<xx>/ 404s
 *      cleanly instead of rendering a broken page in the wrong locale.
 *   2. Calls setRequestLocale so child Server Components and
 *      generateMetadata() can use the locale even under static
 *      rendering.
 *   3. (Page-specific hreflang is emitted by each page.tsx via
 *      `alternatesFor()` — see lib/i18n/hreflang.ts.)
 *
 * Generated route params for static rendering are produced by
 * `generateStaticParams` so Next.js pre-builds /en/* and /ko/*
 * shells at build time.
 */

import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { i18n, isLocale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Hard-reject unknown locales. next-intl middleware should never let
  // a bad locale slip through, but defending here is cheap insurance.
  if (!isLocale(locale)) notFound();

  // Enable static rendering for this segment — required by next-intl
  // so all `useTranslations()` calls in children resolve at build time
  // instead of forcing dynamic rendering.
  setRequestLocale(locale);

  return children;
}

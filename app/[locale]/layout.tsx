/**
 * Locale root layout — the real root for the public, locale-prefixed
 * site. Emits <html>/<body>, loads fonts, and provides the i18n message
 * bundle. Route-group sibling: app/(admin)/layout.tsx is the separate
 * root for /portal-admin/*, which was never locale-prefixed.
 *
 * WHY TWO ROOTS: there used to be one shared root layout (app/layout.tsx,
 * since deleted) above both this file and the admin section. It called
 * next-intl's getLocale() directly. getLocale() only avoids Next's
 * dynamic headers() fallback if setRequestLocale() has already run for
 * this request — but that call lived HERE, one layout further down,
 * which renders AFTER the (former) parent. So the parent's getLocale()
 * call always missed the cache and fell through to headers() — a
 * genuinely dynamic API that permanently disqualifies the whole route
 * from ISR/static caching, regardless of what any child page does. That
 * silently defeated every `export const revalidate` in the app,
 * including routes that never touched next-intl themselves (revalidate
 * config narrows a route's cacheability from the top down — a dynamic
 * API anywhere above it in the tree overrides it). Making this layout
 * the actual root — so setRequestLocale() is the very first next-intl
 * call, before getMessages()/getLocale() below need it — fixes that.
 *
 * `<html lang>` is set from the URL's locale segment so screen readers +
 * Google get the correct signal on every public page.
 *
 * NOTE on invalid locales: the previous version of this layout called
 * notFound() here when the segment wasn't a real locale. Doing that from
 * within a ROOT layout (before <html> would otherwise render) is a
 * documented, unresolved edge case in Next.js — not something to take on
 * in the same change that fixes the caching bug. Dropped in favor of
 * trusting middleware.ts's next-intl locale routing, which is what's
 * actually responsible for locale validation/negotiation and already
 * shouldn't let an invalid segment reach here. next-intl's own request
 * config (lib/i18n/request.ts) also independently falls back to
 * i18n.defaultLocale for any locale it doesn't recognize, so a segment
 * that somehow slipped through renders in English rather than crashing.
 */

import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata, Viewport } from "next";
import { Manrope, DM_Sans, Lora } from "next/font/google";
import "../globals.css";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/json-ld";
import { i18n, isLocale } from "@/lib/i18n/config";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const SITE = process.env.SITE_URL ?? "https://aitoolsset.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "AI Tools Set — Find the Best AI Tools",
    template: "%s — AI Tools Set",
  },
  // Keep these counts honest — AI engines cross-check them against the
  // live directory before citing us. Round down, never inflate.
  description:
    "Discover, compare, and save the best AI tools — curated for writers, coders, designers, and teams. 590+ hand-reviewed tools across 80+ categories, updated daily.",
  applicationName: "AI Tools Set",
  authors: [{ name: "AI Tools Set" }],
  keywords: ["AI tools", "AI directory", "ChatGPT alternatives", "best AI tools", "AI tool comparison"],
  openGraph: {
    title: "AI Tools Set — Find the Best AI Tools",
    description: "The cleanest AI tools directory. Curated, categorized, and updated every day.",
    type: "website",
    url: SITE,
    siteName: "AI Tools Set",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Set — Find the Best AI Tools",
    description: "Hand-curated AI tools directory. 590+ reviewed tools, 80+ categories.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

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
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : i18n.defaultLocale;

  // MUST be the first next-intl call in this render, before getMessages()
  // below or anything a descendant Server Component does — see file
  // header for why.
  setRequestLocale(locale);

  const htmlLang = i18n.htmlLang[locale] ?? locale;
  const messages = await getMessages();

  return (
    <html lang={htmlLang} className={`${manrope.variable} ${dmSans.variable} ${lora.variable}`}>
      <head>
        {/* Speed up favicon + font loads */}
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Schema.org root entities — site + organization */}
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

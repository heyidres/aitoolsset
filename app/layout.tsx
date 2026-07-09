/**
 * Root layout — emits the document skeleton (<html>/<body>), loads
 * fonts, and provides the i18n message bundle to the React tree.
 *
 * `<html lang>` is set dynamically from the active locale so screen
 * readers + Google get the correct signal on every public page.
 * For unmatched routes (e.g. /portal-admin/*) where no locale is in the URL,
 * we fall back to the default locale's lang tag.
 */

import type { Metadata, Viewport } from "next";
import { Manrope, DM_Sans, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // next-intl returns the resolved locale OR the default if the request
  // didn't have a locale segment (e.g. on /portal-admin/*, /api/*).
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : i18n.defaultLocale;
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

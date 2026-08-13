/**
 * Admin root layout — emits <html>/<body> for /portal-admin/* only.
 *
 * This is a separate root from app/[locale]/layout.tsx (route groups —
 * see that file's header for the full story). Admin was never localized:
 * before this split, the single shared root layout resolved its locale
 * via next-intl's getLocale(), which for a route with no [locale]
 * segment already fell back to i18n.defaultLocale ("en") every time. So
 * hardcoding "en" here is a straight extraction of existing behavior,
 * not a new decision.
 *
 * Fonts are duplicated from the locale root (rather than shared) because
 * each route-group root needs its own <html>/<body> — admin.css and
 * several admin components reference these same --font-* variables.
 */

import type { Metadata } from "next";
import { Manrope, DM_Sans, Lora } from "next/font/google";
import "../globals.css";

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

export const metadata: Metadata = {
  title: "AI Tools Set — Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}

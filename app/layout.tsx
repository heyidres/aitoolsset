import type { Metadata } from "next";
import { Manrope, DM_Sans, Lora } from "next/font/google";
import "./globals.css";

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
  title: "AI Tools Set — Find the Best AI Tools",
  description:
    "Discover, compare, and save the best AI tools — curated for writers, coders, designers, and teams. 2,400+ tools across 48 categories, updated daily.",
  openGraph: {
    title: "AI Tools Set — Find the Best AI Tools",
    description:
      "The cleanest AI tools directory. Curated, categorized, and updated every day.",
    type: "website",
    url: "https://aitoolsset.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}

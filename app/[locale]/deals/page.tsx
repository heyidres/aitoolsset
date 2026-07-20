import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DealsClient } from "@/components/deals/DealsClient";
import { getActiveDeals } from "@/lib/cms";
import { cmsDealToLegacy } from "@/lib/cms-adapters";
import { alternatesFor } from "@/lib/i18n/hreflang";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";
// Stays force-dynamic: pre-rendering deals for every locale at build can
// exceed the 60s static-generation budget under pooler contention.
// Rendered per-request; keep-warm covers cold-start.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? alternatesFor({ locale, path: "/deals" }) : undefined;
  return {
    title: "AI Deals & Discounts — Save on the Best AI Tools | AI Tools Set",
    description:
      "Verified active deals, coupon codes, and Black Friday discounts on the top AI tools — ChatGPT, Midjourney, Cursor, ElevenLabs, Runway, and more. Updated daily.",
    alternates,
    openGraph: {
      title: "AI Deals & Discounts — AI Tools Set",
      description: "Verified live deals. Hand-checked daily. No expired junk.",
      url: alternates?.canonical ?? "https://aitoolsset.com/deals",
    },
  };
}

export default async function DealsPage() {
  // CMS deals win. When the DB is empty (clean install) the client
  // falls back to its hardcoded seed list so the page still looks
  // populated.
  const cmsDeals = await getActiveDeals().catch(() => []);
  const dealsOverride = cmsDeals.length > 0 ? cmsDeals.map(cmsDealToLegacy) : undefined;

  return (
    <main>
      <Nav />
      <DealsClient dealsOverride={dealsOverride} />
      <Footer />
    </main>
  );
}

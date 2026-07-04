import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CategoriesHero } from "@/components/categories/CategoriesHero";
import { IntentBar } from "@/components/categories/IntentBar";
import { PopularCategoriesGrid } from "@/components/categories/PopularCategoriesGrid";
import { AllCategoriesGrid } from "@/components/categories/AllCategoriesGrid";
import { UseCaseGrid } from "@/components/categories/UseCaseGrid";
import { PricingGrid } from "@/components/categories/PricingGrid";
import { AZList } from "@/components/categories/AZList";
import { CategoriesCta } from "@/components/categories/CategoriesCta";
import {
  POPULAR_CATS,
  ALL_CATS,
  type PopularCategory,
  type SmallCategory,
} from "@/lib/categories";
import { getAllCategories, getCategoryStats, type CategoryStats } from "@/lib/cms";
import { cmsCategoryToPopular, cmsCategoryToSmall } from "@/lib/cms-adapters";
import { alternatesFor } from "@/lib/i18n/hreflang";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? alternatesFor({ locale, path: "/ai-tools" }) : undefined;
  return {
    title: "Browse AI Tools by Category — AI Tools Set",
    description:
      "Browse 590+ hand-reviewed AI tools across 80+ categories — organised by what they do, who they're for, and how much they cost.",
    alternates,
    openGraph: {
      title: "Browse AI Tools by Category — AI Tools Set",
      description: "80+ categories. 590+ hand-reviewed tools. Find the right AI for any task.",
      type: "website",
      url: alternates?.canonical ?? "https://aitoolsset.com/ai-tools",
    },
  };
}

/**
 * Merge a CMS list onto a hardcoded list by slug.
 *  - DB row wins on conflict (DB values overwrite hardcoded ones)
 *  - DB-only rows are appended at the end
 *  - Hardcoded order is preserved otherwise
 */
function mergeBySlug<T extends { slug: string }>(hardcoded: T[], cms: T[]): T[] {
  const cmsBySlug = new Map(cms.map((c) => [c.slug, c]));
  const merged = hardcoded.map((h) => cmsBySlug.get(h.slug) ?? h);
  const seenSlugs = new Set(hardcoded.map((h) => h.slug));
  for (const c of cms) if (!seenSlugs.has(c.slug)) merged.push(c);
  return merged;
}

export default async function CategoriesPage() {
  const [cmsCats, stats] = await Promise.all([
    getAllCategories().catch(() => []),
    getCategoryStats().catch(() => new Map<string, CategoryStats>()),
  ]);

  // CMS-managed categories get live counts + latest tools woven in.
  const hardcodedPopularBySlug = new Map(POPULAR_CATS.map((c) => [c.slug, c]));
  const cmsPopular: PopularCategory[] = cmsCats.map((c) =>
    cmsCategoryToPopular(c, hardcodedPopularBySlug.get(c.slug), stats.get(c.slug))
  );
  const popularMerged = mergeBySlug(POPULAR_CATS, cmsPopular)
    // Apply live stats to hardcoded-only rows too — so a seeded "3D"
    // category gets its real count/tool rail even when it has no CMS row.
    .map((c) => {
      const s = stats.get(c.slug);
      if (!s) return c;
      return {
        ...c,
        count: s.count > 0 ? s.count : c.count,
        trend: `+${s.newThisWeek}`,
        tools: s.topTools.length > 0 ? s.topTools.map((t) => t.domain) : c.tools,
      };
    });

  const cmsSmall: SmallCategory[] = cmsCats.map((c) => cmsCategoryToSmall(c, stats.get(c.slug)?.count));
  const allMerged = mergeBySlug(ALL_CATS, cmsSmall).map((c) => {
    const s = stats.get(c.slug);
    return s && s.count > 0 ? { ...c, count: s.count } : c;
  });

  // AZList is a Client Component — props cross the RSC boundary and must
  // be JSON-serialisable. Explicitly project to plain primitives so a
  // stray Drizzle field (Date, jsonb proxy, etc.) can never break the
  // page render with "Functions cannot be passed directly to Client
  // Components". Same projection for PopularCategoriesGrid's data even
  // though it's a Server Component — defense in depth.
  const azListData: SmallCategory[] = allMerged.map((c) => ({
    name: String(c.name ?? ""),
    count: Number(c.count ?? 0),
    icon: typeof c.icon === "string" ? c.icon : "📂",
    bg: typeof c.bg === "string" ? c.bg : "#eef0f3",
    slug: String(c.slug ?? ""),
  }));
  const popularData: PopularCategory[] = popularMerged.map((c) => ({
    name: String(c.name ?? ""),
    slug: String(c.slug ?? ""),
    color: String(c.color ?? "#0052ff"),
    emoji: String(c.emoji ?? "📂"),
    desc: String(c.desc ?? ""),
    count: Number(c.count ?? 0),
    trend: String(c.trend ?? "+0"),
    tools: Array.isArray(c.tools) ? c.tools.filter((t): t is string => typeof t === "string") : [],
  }));

  return (
    <main>
      <Nav />
      <CategoriesHero />
      <IntentBar />
      <PopularCategoriesGrid catsOverride={popularData} />
      <AllCategoriesGrid catsOverride={azListData} />
      <UseCaseGrid />
      <PricingGrid />
      <AZList catsOverride={azListData} />
      <CategoriesCta />
      <Footer />
    </main>
  );
}

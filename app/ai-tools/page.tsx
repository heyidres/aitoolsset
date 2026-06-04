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
import { getAllCategories } from "@/lib/cms";
import { cmsCategoryToPopular, cmsCategoryToSmall } from "@/lib/cms-adapters";

export const runtime = "nodejs";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse AI Tools by Category — AI Tools Set",
  description:
    "Browse 2,400+ AI tools across 48 categories — organised by what they do, who they're for, and how much they cost.",
  openGraph: {
    title: "Browse AI Tools by Category — AI Tools Set",
    description: "48 categories. 2,400+ tools. Find the right AI for any task.",
    type: "website",
    url: "https://aitoolsset.com/ai-tools",
  },
};

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
  const cmsCats = await getAllCategories().catch(() => []);

  // Build per-component merged lists. For the rich PopularCategoriesGrid
  // we let CMS rows inherit the hardcoded count/trend/tools when matched
  // (those aren't stored in the DB yet).
  const hardcodedPopularBySlug = new Map(POPULAR_CATS.map((c) => [c.slug, c]));
  const cmsPopular: PopularCategory[] = cmsCats.map((c) =>
    cmsCategoryToPopular(c, hardcodedPopularBySlug.get(c.slug))
  );
  const popularMerged = mergeBySlug(POPULAR_CATS, cmsPopular);

  const cmsSmall: SmallCategory[] = cmsCats.map(cmsCategoryToSmall);
  const allMerged = mergeBySlug(ALL_CATS, cmsSmall);

  return (
    <main>
      <Nav />
      <CategoriesHero />
      <IntentBar />
      <PopularCategoriesGrid catsOverride={popularMerged} />
      <AllCategoriesGrid catsOverride={allMerged} />
      <UseCaseGrid />
      <PricingGrid />
      <AZList catsOverride={allMerged} />
      <CategoriesCta />
      <Footer />
    </main>
  );
}

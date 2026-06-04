import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryIntro } from "@/components/category/CategoryIntro";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ComparisonTable } from "@/components/category/ComparisonTable";
import { FaqAccordion } from "@/components/category/FaqAccordion";
import { CategoryOutro } from "@/components/category/CategoryOutro";
import { RelatedCategories } from "@/components/category/RelatedCategories";
import { ALL_CATS } from "@/lib/categories";
import { MARKETING_FAQ_TEXT } from "@/lib/category-detail";
import { getToolsByCategory, getCategoryBySlug } from "@/lib/cms";
import { cmsToolToDetail } from "@/lib/cms-adapters";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/json-ld";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 60;

async function findCategory(slug: string) {
  // Hardcoded first (48 seeds) — falls back to a DB category if
  // editors added one with a slug not in the seed list.
  const hardcoded = ALL_CATS.find((c) => c.slug === slug);
  if (hardcoded) return { name: hardcoded.name, count: hardcoded.count, slug: hardcoded.slug };
  const cms = await getCategoryBySlug(slug).catch(() => null);
  if (cms) return { name: cms.name, count: 0, slug: cms.slug };
  return null;
}

export function generateStaticParams() {
  return ALL_CATS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await findCategory(slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `Best AI ${cat.name} Tools 2026 — ${cat.count} Top Tools Reviewed | AI Tools Set`,
    description: `Discover the best AI ${cat.name.toLowerCase()} tools of 2026. Browse ${cat.count} hand-picked AI tools. Compare pricing, features, and user reviews.`,
    openGraph: {
      title: `Best AI ${cat.name} Tools 2026 | AI Tools Set`,
      description: `${cat.count} hand-picked AI ${cat.name.toLowerCase()} tools, ranked and reviewed.`,
      url: `https://aitoolsset.com/ai-tools/${cat.slug}`,
    },
  };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await findCategory(slug);
  if (!cat) notFound();

  // Pull every CMS tool tagged with this category slug, adapt
  // to the legacy DetailTool shape the browser expects. Empty
  // result → CategoryBrowser shows its hardcoded MARKETING_TOOLS
  // sample so a fresh install still has visible content.
  const cmsTools = await getToolsByCategory(slug).catch(() => []);
  const detailTools = cmsTools.map(cmsToolToDetail);
  const finalCount = detailTools.length > 0 ? detailTools.length : cat.count;

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "AI Tools", url: "/ai-tools" },
            { name: cat.name, url: `/ai-tools/${cat.slug}` },
          ]),
          faqJsonLd(
            MARKETING_FAQ_TEXT.map((f) => ({
              q: f.q.replace(/marketing/gi, cat.name.toLowerCase()),
              a: f.a.replace(/<[^>]+>/g, ""),
            }))
          ),
        ]}
      />
      <Nav />
      <CategoryHero categoryName={cat.name} count={finalCount} />
      <CategoryIntro categoryName={cat.name} count={finalCount} />
      <CategoryBrowser categoryName={cat.name} toolsOverride={detailTools} />
      <ComparisonTable categoryName={cat.name} />
      <FaqAccordion items={MARKETING_FAQ_TEXT} categoryName={cat.name} />
      <CategoryOutro categoryName={cat.name} />
      <RelatedCategories />
      <Footer />
    </main>
  );
}

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TrustedTicker } from "@/components/TrustedTicker";
import { FeaturedTools } from "@/components/FeaturedTools";
import { TrendingGrid } from "@/components/TrendingGrid";
import { UseCaseBlock } from "@/components/UseCaseBlock";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { PopularTable } from "@/components/PopularTable";
import { NewsSection } from "@/components/NewsSection";
import { BlogSection } from "@/components/BlogSection";
import { CtaSection } from "@/components/CtaSection";
import { TOOLS, WRITER_TOOLS, DEV_TOOLS, WRITER_USECASES, DEV_USECASES } from "@/lib/tools";
import { getPublishedTools } from "@/lib/cms";
import { mergeToolsBySlug } from "@/lib/cms-adapters";

export const runtime = "nodejs";
// 60-second ISR — admin publishes are also instant via revalidatePath().
export const revalidate = 60;

export default async function HomePage() {
  // Pull every published tool from Postgres, merge onto the
  // hardcoded TOOLS list (DB row wins on slug). The merged list
  // flows into FeaturedTools / TrendingGrid / PopularTable so
  // anything you mark "Featured" in /admin/tools shows up here.
  const cmsTools = await getPublishedTools().catch(() => []);
  const tools = mergeToolsBySlug(TOOLS, cmsTools);

  return (
    <main>
      <Nav />
      <Hero />
      <TrustedTicker />
      <FeaturedTools toolsOverride={tools} />
      <TrendingGrid toolsOverride={tools} />

      <UseCaseBlock
        bg="var(--mint)"
        badge="✦ For Writers"
        title={
          <>
            Write better,<br />publish faster.
          </>
        }
        description="From blog posts to screenplays — the best AI writing tools to supercharge your workflow."
        tools={WRITER_TOOLS}
        cases={WRITER_USECASES}
        imageSide="right"
      />

      <UseCaseBlock
        bg="var(--sand)"
        badge="✦ For Developers"
        title={
          <>
            Code smarter,<br />ship faster.
          </>
        }
        description="AI tools that write, review, and deploy code — from autocomplete to full-stack generation."
        tools={DEV_TOOLS}
        cases={DEV_USECASES}
        imageSide="left"
      />

      <CategoriesGrid />
      <PopularTable toolsOverride={tools} />
      <NewsSection />
      <BlogSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

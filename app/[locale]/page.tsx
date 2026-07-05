import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TrustedTicker } from "@/components/TrustedTicker";
import { FeaturedTools } from "@/components/FeaturedTools";
import { TrendingGrid } from "@/components/TrendingGrid";
import { UseCaseBlock } from "@/components/UseCaseBlock";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { PopularTable } from "@/components/PopularTable";
import { BlogSection } from "@/components/BlogSection";
import { CtaSection } from "@/components/CtaSection";
import { TOOLS, WRITER_TOOLS, DEV_TOOLS, WRITER_USECASES, DEV_USECASES } from "@/lib/tools";
import { getPublishedTools, getEnabledHomeSections, type CmsTool } from "@/lib/cms";
import { mergeToolsBySlug } from "@/lib/cms-adapters";
import { getLocale, getTranslations } from "next-intl/server";
import { i18n, isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/hreflang";
import {
  localizeTools,
  localizeToolList,
  localizeUseCases,
  localizePricingTag,
} from "@/lib/i18n/seed-i18n";

export const runtime = "nodejs";
// 60-second ISR — admin publishes are also instant via revalidatePath().
export const revalidate = 60;

// Homepage canonical + hreflang. Title/description inherit from the
// root layout; this only pins the URL identity (en at root, ko at /ko)
// so the vercel.app mirror and locale variants consolidate cleanly.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    alternates: alternatesFor({ locale: isLocale(locale) ? locale : i18n.defaultLocale, path: "/" }),
  };
}

export default async function HomePage() {
  // Pull every published tool + every enabled homepage section in parallel.
  const [cmsTools, sections, locale, t] = await Promise.all([
    getPublishedTools().catch(() => []),
    getEnabledHomeSections().catch(() => []),
    getLocale(),
    getTranslations("home"),
  ]);
  const mergedTools = mergeToolsBySlug(TOOLS, cmsTools);
  // Apply the per-locale overlay to tool desc + tags so cards show
  // Korean copy for the seed catalogue (CMS-managed tools fall back
  // until Phase 3 wires the translations JSONB column).
  const tools = localizeTools(mergedTools, locale);
  const toolBySlug = new Map(cmsTools.map((t) => [t.slug, t]));
  // For non-default locales we ignore the (English) CMS-edited sections
  // and render the translated hardcoded blocks. Phase 3 will add a
  // per-locale translations column to home_sections so editors can
  // localize this content too.
  const useCmsSections = locale === i18n.defaultLocale && sections.length > 0;

  // Pre-localize the writer/dev use-case data + tool lists so the
  // hardcoded fallback panels are fully Korean.
  const WRITER_TOOLS_L  = localizeToolList(WRITER_TOOLS, locale);
  const DEV_TOOLS_L     = localizeToolList(DEV_TOOLS, locale);
  const WRITER_CASES_L  = localizeUseCases(WRITER_USECASES, locale, "writer");
  const DEV_CASES_L     = localizeUseCases(DEV_USECASES, locale, "dev");

  return (
    <main>
      <Nav />
      <Hero />
      <TrustedTicker />
      <FeaturedTools toolsOverride={tools} />
      <TrendingGrid toolsOverride={tools} />

      {/* Editorial use-case blocks. Default locale (English) shows CMS-
          managed sections when present, falling back to the hardcoded
          pair. Non-default locales always use the translated hardcoded
          pair until Phase 3 adds per-locale CMS overrides. */}
      {useCmsSections ? (
        sections.map((s) => (
          <UseCaseBlock
            key={s.id}
            bg={s.bgColor}
            badge={s.badge}
            title={renderTitleWithBreaks(s.title)}
            description={s.deck}
            tools={resolveSectionTools(s.toolSlugs, toolBySlug)}
            cases={s.useCases}
            imageSide={s.imageSide}
          />
        ))
      ) : (
        <>
          <UseCaseBlock
            bg="var(--mint)"
            badge={t("writers_badge")}
            title={
              <>
                {t("writers_title_line1")}<br />{t("writers_title_line2")}
              </>
            }
            description={t("writers_description")}
            tools={WRITER_TOOLS_L}
            cases={WRITER_CASES_L}
            imageSide="right"
          />
          <UseCaseBlock
            bg="var(--sand)"
            badge={t("devs_badge")}
            title={
              <>
                {t("devs_title_line1")}<br />{t("devs_title_line2")}
              </>
            }
            description={t("devs_description")}
            tools={DEV_TOOLS_L}
            cases={DEV_CASES_L}
            imageSide="left"
          />
        </>
      )}

      <CategoriesGrid />
      <PopularTable toolsOverride={tools} />
      {/* NewsSection removed until the news feed publishes real stories —
          the /news route stays live, just not promoted on the homepage. */}
      <BlogSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

/** Split on newlines so editors can break the headline in the CMS form. */
function renderTitleWithBreaks(title: string): React.ReactNode {
  const lines = title.split(/\r?\n/);
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

/**
 * Convert CMS tool slugs into the lightweight shape UseCaseBlock expects.
 * Unknown slugs are skipped silently so a section never blows up if a
 * tool is unpublished or renamed.
 */
function resolveSectionTools(
  slugs: string[],
  bySlug: Map<string, CmsTool>
): Array<{ name: string; domain: string; tag: string }> {
  const out: Array<{ name: string; domain: string; tag: string }> = [];
  for (const slug of slugs) {
    const t = bySlug.get(slug);
    if (!t) continue;
    const tag =
      t.pricing === "free"
        ? "Free"
        : t.pricing === "freemium"
        ? "Free tier"
        : t.pricing === "trial"
        ? "Free Trial"
        : t.pricing === "credit"
        ? "Credit-based"
        : t.pricing === "enterprise"
        ? "Enterprise"
        : "Paid";
    out.push({ name: t.name, domain: t.domain, tag });
  }
  return out.slice(0, 4);
}

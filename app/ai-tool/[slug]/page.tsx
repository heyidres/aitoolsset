import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ToolHeader, type ToolHeaderOverrides } from "@/components/tool/ToolHeader";
import { ToolTabs } from "@/components/tool/ToolTabs";
import { ToolOverview, type ToolOverviewOverrides } from "@/components/tool/ToolOverview";
import { ToolSidebar } from "@/components/tool/ToolSidebar";
import { ToolReviews } from "@/components/tool/ToolReviews";
import { EmbedSection } from "@/components/tool/EmbedSection";
import { RelatedSlider } from "@/components/tool/RelatedSlider";
import { TOOLS, type Tool } from "@/lib/tools";
import { DEFAULT_TOOL_DETAIL } from "@/lib/tool-detail";
import { getToolBySlug, getReviewsForTool, type CmsTool } from "@/lib/cms";
import { cmsToolToLegacy, cmsReviewToLegacy, type LegacyReview } from "@/lib/cms-adapters";
import { auth } from "@/lib/auth";

// Dynamic so DB-managed tools resolve at request time —
// `generateStaticParams` only lists hardcoded seed tools, but
// any extra slug falls through and hits Postgres on the fly.
export const dynamicParams = true;

type FindToolResult =
  | {
      tool: Tool;
      descriptionHtml?: string;
      headerOverrides?: ToolHeaderOverrides;
      overviewOverrides?: ToolOverviewOverrides;
      /** Postgres tool id — only set when the tool comes from CMS. */
      cmsToolId?: string;
      /** Real DB reviews adapted to the legacy shape. Only set when CMS. */
      reviewsOverride?: LegacyReview[];
    }
  | null;

const SOCIAL_KIND_ORDER = ["x", "linkedin", "github", "youtube"] as const;

function socialsRecordToList(
  socials: CmsTool["socials"]
): Array<{ kind: string; url: string }> {
  if (!socials) return [];
  return SOCIAL_KIND_ORDER.flatMap((k) => {
    const url = socials[k];
    return url ? [{ kind: k, url }] : [];
  });
}

function buildHeaderOverrides(t: CmsTool): ToolHeaderOverrides {
  // Badge row: first pill = free-tier status, then the user-provided tags.
  const badges: string[] = [];
  if (t.pricing === "free") badges.push("Free");
  else if (t.pricing === "freemium") badges.push("Free tier available");
  else badges.push("Paid");
  badges.push(...t.tags.slice(0, 4));

  return {
    tagline: t.tagline,
    badges,
    socials: socialsRecordToList(t.socials),
    weeklyUsers: t.weeklyUsers,
    startingPrice: t.startingPrice,
    launched: t.launched,
    madeBy: t.madeBy,
  };
}

function buildOverviewOverrides(t: CmsTool): ToolOverviewOverrides {
  return {
    features: t.features ?? [],
    pros: t.pros ?? [],
    cons: t.cons ?? [],
    plans: t.plans ?? [],
  };
}

async function findTool(slug: string): Promise<FindToolResult> {
  const hardcoded = TOOLS.find((t) => t.id === slug);
  if (hardcoded) return { tool: hardcoded };
  const cms = await getToolBySlug(slug);
  if (!cms || cms.status !== "published") return null;
  const cmsReviews = await getReviewsForTool(cms.id).catch(() => []);
  return {
    tool: cmsToolToLegacy(cms),
    descriptionHtml: cms.description,
    headerOverrides: buildHeaderOverrides(cms),
    overviewOverrides: buildOverviewOverrides(cms),
    cmsToolId: cms.id,
    reviewsOverride: cmsReviews.map(cmsReviewToLegacy),
  };
}

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findTool(slug);
  if (!found) return { title: "Tool not found" };
  const { tool } = found;
  return {
    title: `${tool.name} — AI Tools Set`,
    description: tool.desc,
    openGraph: {
      title: `${tool.name} — AI Tools Set`,
      description: tool.desc,
      url: `https://aitoolsset.com/ai-tool/${tool.id}`,
    },
  };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [found, session] = await Promise.all([findTool(slug), auth()]);
  if (!found) notFound();
  const { tool, descriptionHtml, headerOverrides, overviewOverrides, cmsToolId, reviewsOverride } = found;
  const detail = DEFAULT_TOOL_DETAIL;
  const currentUser = session?.user
    ? { id: session.user.id, name: session.user.name ?? null, image: session.user.image ?? null }
    : null;
  return (
    <main>
      <Nav />

      {/* Breadcrumb bar */}
      <div className="bg-white px-9 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto flex items-center gap-[6px] text-[13px] h-[44px]" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
            Home
          </Link>
          <span style={{ color: "var(--border-2)" }}>›</span>
          <Link href="/ai-tools" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
            {detail.category}
          </Link>
          <span style={{ color: "var(--border-2)" }}>›</span>
          <span className="font-semibold" style={{ color: "var(--text-2)" }}>
            {tool.name}
          </span>
        </div>
      </div>

      <ToolHeader tool={tool} detail={detail} overrides={headerOverrides} />
      <ToolTabs reviewCount={2341} />

      <div className="max-w-page mx-auto px-9 pt-8 grid grid-cols-[minmax(0,1fr)_300px] gap-8 items-start tool-page-grid section-pad-x">
        <div className="flex flex-col min-w-0 overflow-hidden">
          {/* Screenshot */}
          <div
            className="rounded-lg flex items-center justify-center relative overflow-hidden w-full"
            style={{ background: "var(--near-black)", height: 360, border: "1px solid var(--border)" }}
          >
            <div
              className="font-display font-black"
              style={{ fontSize: 64, letterSpacing: "-3px", color: "rgba(255,255,255,.08)" }}
            >
              {tool.name}
            </div>
            <div
              className="absolute top-[14px] left-[14px] rounded-pill px-[13px] py-[5px] font-display text-xs font-bold flex items-center gap-[6px] backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,.5)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.7)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Product screenshot
            </div>
            <div className="absolute bottom-[14px] right-[14px] flex gap-2">
              <button
                className="font-display text-xs font-bold px-[14px] py-[7px] rounded-pill cursor-pointer transition-colors hover:bg-white"
                style={{ background: "rgba(255,255,255,.9)", color: "var(--text)" }}
              >
                View gallery
              </button>
              <button
                className="font-display text-xs font-bold px-[14px] py-[7px] rounded-pill cursor-pointer transition-colors hover:bg-white"
                style={{ background: "rgba(255,255,255,.9)", color: "var(--text)" }}
              >
                Watch demo
              </button>
            </div>
          </div>

          <ToolOverview name={tool.name} detail={detail} descriptionHtml={descriptionHtml} overrides={overviewOverrides} />
        </div>

        <ToolSidebar tool={tool} detail={detail} />
      </div>

      <EmbedSection tool={tool} />
      <ToolReviews
        name={tool.name}
        detail={detail}
        toolId={cmsToolId}
        reviewsOverride={reviewsOverride}
        currentUser={currentUser}
      />
      <RelatedSlider category={detail.category} />
      <Footer />
    </main>
  );
}

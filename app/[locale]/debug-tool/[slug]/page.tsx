/**
 * TEMPORARY diagnostic page — delete after the tool-page hang is solved.
 *
 * Reproduces the EXACT data/auth structure of /ai-tool/[slug] (same route
 * config, same generateMetadata→findTool concurrency, same auth() then
 * Promise.all data fan-out) but renders bare <pre> timings instead of the
 * real component tree. Bisects the hang: if THIS page hangs too, the
 * problem lives in the data/auth layer; if this is fast while the real
 * page hangs, the problem lives in the real page's render tree.
 */

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getToolBySlug, getReviewsForTool, getCategoryOptions, getRelatedTools } from "@/lib/cms";
import { getTranslations } from "next-intl/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = Date.now();
  const tool = await getToolBySlug(slug).catch(() => null);
  return {
    title: `debug ${slug} meta:${Date.now() - t}ms found:${Boolean(tool)}`,
    robots: { index: false, follow: false },
  };
}

export default async function DebugToolPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const steps: string[] = [];
  const t0 = Date.now();
  const mark = (label: string) => steps.push(`${label}: +${Date.now() - t0}ms`);

  const session = await auth();
  mark(`auth (hasUser=${Boolean(session?.user)})`);

  const tool = await getToolBySlug(slug).catch((e) => {
    mark(`getToolBySlug FAILED: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  });
  mark(`getToolBySlug (found=${Boolean(tool)})`);

  const tr = await getTranslations("tool_page").catch(() => null);
  mark(`getTranslations (${tr ? "ok" : "fail"})`);

  if (tool) {
    const [reviews, cats, related] = await Promise.all([
      getReviewsForTool(tool.id).catch(() => []),
      getCategoryOptions().catch(() => []),
      getRelatedTools({
        excludeSlug: tool.slug,
        primaryCategory: tool.category,
        extraCategories: tool.categories,
        limit: 8,
      }).catch(() => []),
    ]);
    mark(`Promise.all trio (reviews=${reviews.length} cats=${cats.length} related=${related.length})`);
  }

  return (
    <pre style={{ padding: 24, fontSize: 13 }}>
      {`debug-tool/${slug}\ntotal: ${Date.now() - t0}ms\n\n${steps.join("\n")}`}
    </pre>
  );
}

/**
 * Renders a CMS blog body, expanding plain-text markers into rich
 * server-rendered components. See lib/blog-markers.ts for the
 * marker grammar.
 *
 * Tool slugs are looked up once via Promise.all so a 5-card article
 * costs a single DB round-trip.
 */

import { sanitizeHtml } from "@/lib/sanitize";
import { getToolBySlug, type CmsTool } from "@/lib/cms";
import { parseBlogBody, type ParsedBlock } from "@/lib/blog-markers";
import { EmbeddedToolCard, type SerializableTool } from "./EmbeddedToolCard";
import { ReviewCard, type ReviewCardTool } from "./ReviewCard";

/** Strip the CMS tool down to the minimal shape the client card needs. */
function toSerializable(t: CmsTool): SerializableTool {
  return {
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    domain: t.domain,
    category: t.category,
    tags: t.tags,
    pricing: t.pricing,
    logoUrl: t.logoUrl,
    verified: t.verified,
    saveCount: t.saveCount,
  };
}

/** Extra fields the ranked review card needs beyond the compact tool card. */
function toReviewTool(t: CmsTool): ReviewCardTool {
  return {
    slug: t.slug,
    name: t.name,
    domain: t.domain,
    verified: t.verified,
    pricing: t.pricing,
    startingPrice: t.startingPrice,
    saveCount: t.saveCount,
  };
}
import {
  TldrBlock,
  HighlightBlock,
  VerdictBlock,
  ProsConsBlock,
  RoundBlock,
  UseCaseBlock,
} from "./BlogBlocks";

export async function BlogBody({ html }: { html: string }) {
  // 1. Sanitize first so unsafe HTML never reaches the marker parser.
  const safe = sanitizeHtml(html);

  // 2. Split body into HTML chunks + parsed marker blocks.
  const segments = parseBlogBody(safe);

  // 3. Tool-card AND ranked-review markers both need a DB lookup. Batch
  //    every referenced slug into a single round-trip.
  const toolSlugs = Array.from(
    new Set(
      segments
        .filter(
          (s): s is { kind: "block"; block: Extract<ParsedBlock, { kind: "tool" | "review" }> } =>
            s.kind === "block" && (s.block.kind === "tool" || s.block.kind === "review")
        )
        .map((s) => s.block.slug)
    )
  );
  const tools = await Promise.all(toolSlugs.map((s) => getToolBySlug(s).catch(() => null)));
  const bySlug = new Map<string, SerializableTool>();
  const reviewBySlug = new Map<string, ReviewCardTool>();
  for (let i = 0; i < toolSlugs.length; i++) {
    const t = tools[i];
    if (t && t.status === "published") {
      bySlug.set(toolSlugs[i], toSerializable(t));
      reviewBySlug.set(toolSlugs[i], toReviewTool(t));
    }
  }

  return (
    <article className="blog-prose">
      {segments.map((seg, i) =>
        seg.kind === "html" ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: seg.value }} />
        ) : (
          <BlockRenderer key={i} block={seg.block} toolsBySlug={bySlug} reviewBySlug={reviewBySlug} />
        )
      )}
    </article>
  );
}

function BlockRenderer({
  block,
  toolsBySlug,
  reviewBySlug,
}: {
  block: ParsedBlock;
  toolsBySlug: Map<string, SerializableTool>;
  reviewBySlug: Map<string, ReviewCardTool>;
}) {
  switch (block.kind) {
    case "tool":
      return <EmbeddedToolCard tool={toolsBySlug.get(block.slug) ?? null} slug={block.slug} />;
    case "review":
      return (
        <ReviewCard
          tool={reviewBySlug.get(block.slug) ?? null}
          slug={block.slug}
          n={block.n}
          best={block.best}
          body={block.body}
          pros={block.pros}
          cons={block.cons}
        />
      );
    case "tldr":
      return <TldrBlock>{block.body}</TldrBlock>;
    case "highlight":
      return <HighlightBlock title={block.title}>{block.body}</HighlightBlock>;
    case "verdict":
      return <VerdictBlock left={block.left} right={block.right} />;
    case "proscons":
      return <ProsConsBlock pros={block.pros} cons={block.cons} />;
    case "round":
      return (
        <RoundBlock n={block.n} title={block.title} winner={block.winner}>
          {block.body}
        </RoundBlock>
      );
    case "usecase":
      return (
        <UseCaseBlock audience={block.audience} pick={block.pick} reason={block.reason} />
      );
  }
}

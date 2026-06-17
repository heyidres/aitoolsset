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
import { EmbeddedToolCard } from "./EmbeddedToolCard";
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

  // 3. Tool-card markers need a DB lookup. Batch them.
  const toolSlugs = Array.from(
    new Set(
      segments
        .filter((s): s is { kind: "block"; block: Extract<ParsedBlock, { kind: "tool" }> } =>
          s.kind === "block" && s.block.kind === "tool"
        )
        .map((s) => s.block.slug)
    )
  );
  const tools = await Promise.all(toolSlugs.map((s) => getToolBySlug(s).catch(() => null)));
  const bySlug = new Map<string, CmsTool>();
  for (let i = 0; i < toolSlugs.length; i++) {
    const t = tools[i];
    if (t && t.status === "published") bySlug.set(toolSlugs[i], t);
  }

  return (
    <article className="blog-prose">
      {segments.map((seg, i) =>
        seg.kind === "html" ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: seg.value }} />
        ) : (
          <BlockRenderer key={i} block={seg.block} toolsBySlug={bySlug} />
        )
      )}
    </article>
  );
}

function BlockRenderer({
  block,
  toolsBySlug,
}: {
  block: ParsedBlock;
  toolsBySlug: Map<string, CmsTool>;
}) {
  switch (block.kind) {
    case "tool":
      return <EmbeddedToolCard tool={toolsBySlug.get(block.slug) ?? null} slug={block.slug} />;
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

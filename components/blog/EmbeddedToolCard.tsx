import type { CmsTool } from "@/lib/cms";
import { cmsToolToLegacy } from "@/lib/cms-adapters";
import { ToolCard } from "@/components/ToolCard";

/**
 * Inline tool card rendered in the middle of a blog article.
 *
 * Renders the EXACT same `<ToolCard>` you see on category pages /
 * the homepage — full feature parity: verified badge, save heart,
 * upvote, share, tags, free pill, deal ribbon, hover "Visit tool →"
 * CTA. We just hand it the same legacy `Tool` shape via the existing
 * cmsToolToLegacy adapter.
 *
 * When the slug doesn't resolve (deleted / unpublished tool) we
 * render an inline warning so the editor can spot + fix it.
 */
export function EmbeddedToolCard({
  tool,
  slug,
}: {
  tool: CmsTool | null;
  slug: string;
}) {
  if (!tool) {
    return (
      <div
        style={{
          margin: "28px 0",
          padding: "14px 18px",
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: 10,
          color: "#92400e",
          fontSize: 13,
        }}
      >
        ⚠ Embedded tool <code style={{ fontFamily: "var(--mono)" }}>{slug}</code> is missing or unpublished.
      </div>
    );
  }

  return (
    <div
      // not-prose stops the blog body's serif typography from leaking into
      // the card. Margin matches the prototype's mid-article block spacing.
      className="not-prose"
      style={{ margin: "32px 0", display: "block", maxWidth: 520 }}
    >
      <ToolCard tool={cmsToolToLegacy(tool)} />
    </div>
  );
}

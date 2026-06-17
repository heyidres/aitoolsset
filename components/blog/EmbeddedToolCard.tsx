import Link from "next/link";
import type { CmsTool } from "@/lib/cms";
import { VerifiedBadge } from "@/components/VerifiedBadge";

/**
 * Full-width tool card rendered inline in a blog article body.
 * Lives in editorial flow — design echoes a Pinterest/Wirecutter
 * recommendation block.
 *
 * Renders a clear "tool not found" notice instead of crashing when
 * the editor links to a slug that was later deleted or unpublished.
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

  const pricingLabel =
    tool.pricing === "free" ? "Free" :
    tool.pricing === "freemium" ? "Free + Paid" :
    tool.pricing === "trial" ? "Free Trial" :
    tool.pricing === "credit" ? "Pay-per-use" :
    tool.pricing === "enterprise" ? "Enterprise" :
    "Paid";

  return (
    <aside
      className="not-prose embedded-tool-card"
      style={{
        margin: "32px 0",
        padding: "22px 24px",
        background: "linear-gradient(135deg, #fff, #f8f9fa)",
        border: "1.5px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 4px 16px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        {tool.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.logoUrl}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: "#fff", border: "1px solid var(--border)" }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `url(https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64) center/32px no-repeat #fff`,
              border: "1px solid var(--border)",
              flexShrink: 0,
            }}
          />
        )}

        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              color: "var(--blue)",
              marginBottom: 4,
            }}
          >
            Recommended tool
          </div>
          <div
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-.4px",
              color: "var(--text)",
              marginBottom: 4,
              lineHeight: 1.2,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tool.name}
            {tool.verified && <VerifiedBadge />}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 12 }}>
            {tool.tagline}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 100,
                color: "var(--green)",
                background: "var(--green-bg)",
                border: "1px solid var(--green-border)",
              }}
            >
              {pricingLabel}
            </span>
            {tool.startingPrice && (
              <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
                Starts at <strong style={{ color: "var(--text-2)" }}>{tool.startingPrice}</strong>
              </span>
            )}
            {tool.weeklyUsers && (
              <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
                · <strong style={{ color: "var(--text-2)" }}>{tool.weeklyUsers}</strong> users
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <Link
            href={`/ai-tool/${tool.slug}`}
            style={{
              padding: "10px 18px",
              borderRadius: 100,
              background: "var(--blue)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Read full review
          </Link>
          <a
            href={tool.websiteUrl || `https://${tool.domain}`}
            target="_blank"
            rel={buildRel(tool.linkRel)}
            style={{
              padding: "10px 18px",
              borderRadius: 100,
              border: "1.5px solid var(--border-2)",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              textAlign: "center",
              background: "#fff",
            }}
          >
            Visit {tool.name} ↗
          </a>
        </div>
      </div>
    </aside>
  );
}

function buildRel(kind: CmsTool["linkRel"] | null | undefined): string {
  const security = "noopener noreferrer";
  switch (kind) {
    case "nofollow": return `nofollow ${security}`;
    case "sponsored": return `sponsored ${security}`;
    case "ugc": return `ugc ${security}`;
    case "dofollow":
    default: return security;
  }
}

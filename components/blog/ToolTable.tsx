import { Link } from "@/lib/i18n/navigation";
import { getToolsBySlugs, type CmsTool } from "@/lib/cms";

/**
 * Ranked comparison table for roundup / "best X" posts.
 *
 * The editor supplies only the ranking and the two editorial columns
 * (Best for / Trial info) per row — see blogPosts.toolTable. Everything
 * factual (name, logo, link, price) is resolved from the tool table here,
 * so a price change propagates to every roundup at once instead of going
 * stale in N hand-typed copies.
 *
 * Rows whose slug no longer resolves to a tool are dropped rather than
 * rendered blank: a deleted or renamed tool should vanish from the table,
 * not leave a broken row with a dead link.
 */

export type ToolTableRow = { slug: string; bestFor: string; trialInfo: string };

/** Human-readable price for the table's Price column. */
function priceLabel(tool: CmsTool): string {
  if (tool.startingPrice) return `From ${tool.startingPrice}`;
  switch (tool.pricing) {
    case "free":
      return "Free";
    case "freemium":
      return "Free plan available";
    case "trial":
      return "Free trial";
    case "credit":
      return "Pay-per-use";
    case "enterprise":
      return "Custom pricing";
    default:
      return "Paid";
  }
}

export async function ToolTable({
  rows,
  title,
}: {
  rows: ToolTableRow[];
  /** Heading above the table. Falls back to a neutral label. */
  title?: string;
}) {
  if (rows.length === 0) return null;

  const bySlug = await getToolsBySlugs(rows.map((r) => r.slug));
  // Preserve the editor's ranking, drop rows whose tool no longer exists.
  const resolved = rows
    .map((row) => ({ row, tool: bySlug.get(row.slug) }))
    .filter((x): x is { row: ToolTableRow; tool: CmsTool } => !!x.tool);

  if (resolved.length === 0) return null;

  return (
    <section style={{ margin: "36px 0" }}>
      <h2
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-.5px",
          color: "var(--text)",
          marginBottom: 14,
        }}
      >
        {title ?? "Summary"}
      </h2>

      {/* Wide table on a narrow reading column — scroll it inside its own
          container so the article body never scrolls horizontally. */}
      <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--r)" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            minWidth: 640,
            background: "var(--white)",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["", "Tool", "Best for", "Trial info", "Price", ""].map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--text-3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resolved.map(({ row, tool }, i) => (
              <tr
                key={tool.slug}
                style={{
                  borderBottom: i === resolved.length - 1 ? "none" : "1px solid var(--border)",
                  background: i % 2 === 1 ? "var(--bg)" : "transparent",
                }}
              >
                <td style={{ padding: "14px", color: "var(--text-3)", fontWeight: 700 }} className="tnum">
                  {i + 1}
                </td>
                <td style={{ padding: "14px" }}>
                  <Link
                    href={`/ai-tool/${tool.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      color: "var(--text)",
                      textDecoration: "none",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ToolLogo tool={tool} />
                    {tool.name}
                  </Link>
                </td>
                <td style={{ padding: "14px", color: "var(--text-2)", lineHeight: 1.5, minWidth: 180 }}>
                  {row.bestFor}
                </td>
                <td style={{ padding: "14px", color: "var(--text-2)", lineHeight: 1.5, minWidth: 140 }}>
                  {row.trialInfo}
                </td>
                <td
                  style={{ padding: "14px", color: "var(--text-2)", whiteSpace: "nowrap" }}
                  className="tnum"
                >
                  {priceLabel(tool)}
                </td>
                <td style={{ padding: "14px" }}>
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel={tool.linkRel || "noopener noreferrer"}
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "var(--r-pill)",
                      border: `1px solid var(--blue)`,
                      color: "var(--blue)",
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Website
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Tool logo with the site-wide favicon fallback. */
function ToolLogo({ tool }: { tool: CmsTool }) {
  const src =
    tool.logoUrl ||
    `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={28}
      height={28}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        objectFit: "contain",
        background: "var(--white)",
        border: "1px solid var(--border)",
        flexShrink: 0,
      }}
    />
  );
}

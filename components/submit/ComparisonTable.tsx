type Row = { label: string; free: React.ReactNode; featured: React.ReactNode; ent: React.ReactNode };

const ROWS: Row[] = [
  { label: "Basic listing page", free: "✓", featured: "✓", ent: "✓" },
  { label: "Searchable in directory", free: "✓", featured: "✓", ent: "✓" },
  { label: "User reviews", free: "✓", featured: "✓", ent: "✓" },
  { label: "SEO-optimised page", free: "✓", featured: "✓", ent: "✓" },
  { label: "Verified badge", free: "—", featured: "✓", ent: "✓" },
  { label: "Featured placement", free: "—", featured: "Homepage + Category", ent: "✓ Priority" },
  { label: "Analytics dashboard", free: "—", featured: "✓", ent: "✓ Advanced" },
  { label: "Newsletter inclusion", free: "—", featured: "1× per month", ent: "Dedicated issue" },
  { label: "Social media mention", free: "—", featured: "✓", ent: "✓ Multiple" },
  { label: "Review turnaround", free: "5–7 days", featured: "24 hours", ent: "Same day" },
  { label: "Sponsored article", free: "—", featured: "—", ent: "✓" },
  { label: "Account manager", free: "—", featured: "—", ent: "✓ Dedicated" },
  { label: "Homepage hero banner", free: "—", featured: "—", ent: "✓" },
];

function cellClass(v: React.ReactNode) {
  if (v === "✓") return "ct-yes";
  if (v === "—") return "ct-no";
  return "";
}

function cellStyle(v: React.ReactNode): React.CSSProperties {
  if (v === "✓") return { color: "var(--green)", fontWeight: 700 };
  if (v === "—") return { color: "var(--text-3)" };
  return {};
}

export function ComparisonTable() {
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-9">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            Compare Plans
          </div>
          <h2 className="font-display font-black" style={{ fontSize: 32, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            Everything side by side
          </h2>
        </div>
        <div className="bg-white rounded-lg overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  { label: "Feature", style: { color: "rgba(255,255,255,.4)" } },
                  { label: "Free", style: {} },
                  { label: "Featured", style: { background: "var(--blue)" } },
                  { label: "Enterprise", style: {} },
                ].map((h) => (
                  <th
                    key={h.label}
                    className="font-display text-[13px] font-bold text-white p-4 text-left"
                    style={{ background: "var(--near-black)", ...h.style }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label}>
                  <td
                    className="px-5 py-[14px] text-[13.5px] font-semibold"
                    style={{
                      borderBottom: i < ROWS.length - 1 ? "1px solid var(--border)" : "none",
                      color: "var(--text)",
                    }}
                  >
                    {r.label}
                  </td>
                  <td
                    className={`px-5 py-[14px] text-[13.5px] ${cellClass(r.free)}`}
                    style={{ ...cellStyle(r.free), borderBottom: i < ROWS.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    {r.free}
                  </td>
                  <td
                    className={`px-5 py-[14px] text-[13.5px] ${cellClass(r.featured)}`}
                    style={{
                      ...cellStyle(r.featured),
                      background: "var(--blue-soft)",
                      borderBottom: i < ROWS.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {typeof r.featured === "string" && r.featured !== "✓" && r.featured !== "—" ? (
                      <span
                        className="inline-flex text-[11px] font-bold px-2 py-[2px] rounded-pill"
                        style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.15)" }}
                      >
                        {r.featured}
                      </span>
                    ) : (
                      r.featured
                    )}
                  </td>
                  <td
                    className={`px-5 py-[14px] text-[13.5px] ${cellClass(r.ent)}`}
                    style={{ ...cellStyle(r.ent), borderBottom: i < ROWS.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    {r.ent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

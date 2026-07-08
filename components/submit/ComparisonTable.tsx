import { getTranslations } from "next-intl/server";

type Row = { label: string; standard: React.ReactNode; featured: React.ReactNode; ent: React.ReactNode };

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

export async function ComparisonTable() {
  const t = await getTranslations("submit");
  const ROWS: Row[] = [
    { label: t("row_basic_listing"),       standard: "✓",         featured: "✓",                          ent: "✓" },
    { label: t("row_searchable"),          standard: "✓",         featured: "✓",                          ent: "✓" },
    { label: t("row_reviews"),             standard: "✓",         featured: "✓",                          ent: "✓" },
    { label: t("row_seo_page"),            standard: "✓",         featured: "✓",                          ent: "✓" },
    { label: t("row_verified"),            standard: "✓",         featured: "✓",                          ent: "✓" },
    { label: t("row_featured_placement"),  standard: "—",         featured: t("row_homepage_category"),   ent: `✓ ${t("row_priority")}` },
    { label: t("row_review_turnaround"),   standard: t("row_5_7_days"), featured: t("row_24_hours"),      ent: t("row_same_day") },
    { label: t("row_sponsored"),           standard: "—",         featured: "—",                          ent: "✓" },
    { label: t("row_account_manager"),     standard: "—",         featured: "—",                          ent: `✓ ${t("row_dedicated")}` },
    { label: t("row_hero_banner"),         standard: "—",         featured: "—",                          ent: "✓" },
  ];
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-9">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            {t("compare_heading")}
          </div>
          <h2 className="font-display font-black" style={{ fontSize: 32, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            {t("compare_subheading")}
          </h2>
        </div>
        <div className="bg-white rounded-lg overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  { label: t("compare_col_feature"),    style: { color: "rgba(255,255,255,.4)" } },
                  { label: t("compare_col_standard"),   style: {} },
                  { label: t("compare_col_featured"),   style: { background: "var(--blue)" } },
                  { label: t("compare_col_enterprise"), style: {} },
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
                    className={`px-5 py-[14px] text-[13.5px] ${cellClass(r.standard)}`}
                    style={{ ...cellStyle(r.standard), borderBottom: i < ROWS.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    {r.standard}
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

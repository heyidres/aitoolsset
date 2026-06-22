import { getTranslations } from "next-intl/server";
import { favicon } from "@/lib/tools";
import { MARKETING_COMPARE } from "@/lib/category-detail";

const FEATURES = ["SEO", "Copywriting", "Brand Voice", "API"];

export async function ComparisonTable({ categoryName }: { categoryName: string }) {
  const t = await getTranslations("category_page");
  const lower = categoryName.toLowerCase();
  // Feature column headers stay in English since they're proper terms;
  // only the table-meta columns (Pricing / Free Tier / Rating / Tool) translate.
  const headers = [t("comparison_col_pricing"), t("comparison_col_free_tier"), ...FEATURES, t("comparison_col_rating")];
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--sand)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1320px] mx-auto">
        <div className="mb-[30px]">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            {t("comparison_eyebrow")}
          </div>
          <h2 className="font-display font-black mb-2" style={{ fontSize: 32, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
            {t("comparison_heading", { nameLower: lower })}
          </h2>
          <p className="text-[14.5px] leading-[1.55] max-w-[680px]" style={{ color: "var(--text-2)" }}>
            {t("comparison_sub")}
          </p>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="font-display text-[11.5px] font-extrabold uppercase tracking-[.06em] px-[18px] py-[14px] text-left sticky left-0"
                  style={{ background: "var(--surface)", color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
                >
                  {t("comparison_col_tool")}
                </th>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="font-display text-[11.5px] font-extrabold uppercase tracking-[.06em] px-[18px] py-[14px] text-left"
                    style={{ background: "var(--surface)", color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MARKETING_COMPARE.map((row, i) => (
                <tr key={row.name}>
                  <td
                    className="px-[18px] py-[18px] text-[13.5px] align-middle"
                    style={{ borderBottom: i < MARKETING_COMPARE.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <div className="flex items-center gap-[10px] font-display font-extrabold" style={{ color: "var(--text)" }}>
                      <img src={favicon(row.domain, 64)} alt={row.name} className="w-7 h-7 rounded-[7px]" />
                      {row.name}
                    </div>
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: i < MARKETING_COMPARE.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <span
                      className="inline-flex font-display text-[11px] font-extrabold px-[9px] py-[3px] rounded-pill"
                      style={{ color: row.priceColor.fg, background: row.priceColor.bg }}
                    >
                      {row.price}
                    </span>
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: i < MARKETING_COMPARE.length - 1 ? "1px solid var(--border)" : "none" }}>
                    {row.freeTier === "—" ? (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    ) : (
                      <span className="font-bold" style={{ color: "var(--green)" }}>
                        {row.freeTier}
                      </span>
                    )}
                  </td>
                  {FEATURES.map((f) => (
                    <td
                      key={f}
                      className="px-[18px] py-[18px] text-[13.5px] align-middle"
                      style={{ borderBottom: i < MARKETING_COMPARE.length - 1 ? "1px solid var(--border)" : "none" }}
                    >
                      {row.features[f] ? (
                        <span className="font-extrabold" style={{ color: "var(--green)" }}>
                          ✓
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-3)" }}>—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: i < MARKETING_COMPARE.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div className="flex items-center gap-[5px] font-display font-extrabold tnum">
                      {row.rating}
                      <span style={{ color: "#fbbf24" }}>★</span>
                    </div>
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

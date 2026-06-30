import { getTranslations } from "next-intl/server";
import { favicon } from "@/lib/tools";
import type { CompareRow } from "@/lib/category-stats";

/**
 * At-a-glance comparison of the top real tools in this category.
 * Columns are all derived from actual CMS data (pricing, free tier,
 * starting price, rating, reviews, verified) — no fabricated feature
 * matrix. Renders nothing when the category has no tools yet.
 */
export async function ComparisonTable({
  categoryName,
  rows,
}: {
  categoryName: string;
  rows: CompareRow[];
}) {
  if (rows.length === 0) return null;
  const t = await getTranslations("category_page");
  const lower = categoryName.toLowerCase();

  // Editorial columns only appear when the editor has filled them for ≥1 row.
  const showKeyFeature = rows.some((r) => r.keyFeature && r.keyFeature.trim());
  const showBestFor = rows.some((r) => r.bestFor && r.bestFor.trim());

  const cellBorder = (i: number) =>
    i < rows.length - 1 ? "1px solid var(--border)" : "none";

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
                {[
                  t("comparison_col_tool"),
                  t("comparison_col_pricing"),
                  t("comparison_col_free_tier"),
                  "Starts at",
                  ...(showKeyFeature ? ["Key feature"] : []),
                  ...(showBestFor ? ["Best for"] : []),
                  t("comparison_col_rating"),
                  "Reviews",
                  "Verified",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`font-display text-[11.5px] font-extrabold uppercase tracking-[.06em] px-[18px] py-[14px] text-left${i === 0 ? " sticky left-0" : ""}`}
                    style={{ background: "var(--surface)", color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.slug}>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle sticky left-0 bg-white" style={{ borderBottom: cellBorder(i) }}>
                    <a href={`/ai-tool/${row.slug}`} className="flex items-center gap-[10px] font-display font-extrabold hover:underline" style={{ color: "var(--text)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={favicon(row.domain, 64)} alt={row.name} className="w-7 h-7 rounded-[7px]" />
                      <span className="inline-flex items-center gap-1">
                        {row.name}
                        {row.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9BF0" className="flex-shrink-0">
                            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" />
                            <path d="M9 12l2 2.5 4.5-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                      </span>
                    </a>
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i) }}>
                    <span
                      className="inline-flex font-display text-[11px] font-extrabold px-[9px] py-[3px] rounded-pill"
                      style={
                        row.pricing === "Free"
                          ? { color: "var(--green)", background: "var(--green-bg)" }
                          : row.pricing === "Freemium"
                          ? { color: "#1d4ed8", background: "#eff6ff" }
                          : { color: "#a16207", background: "#fef3c7" }
                      }
                    >
                      {row.pricing}
                    </span>
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i) }}>
                    {row.freeTier ? (
                      <span className="font-extrabold" style={{ color: "var(--green)" }}>✓</span>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i) }}>
                    {row.startingPrice ?? <span style={{ color: "var(--text-3)" }}>—</span>}
                  </td>
                  {showKeyFeature && (
                    <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i), color: "var(--text-2)" }}>
                      {row.keyFeature?.trim() ? row.keyFeature : <span style={{ color: "var(--text-3)" }}>—</span>}
                    </td>
                  )}
                  {showBestFor && (
                    <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i), color: "var(--text-2)" }}>
                      {row.bestFor?.trim() ? row.bestFor : <span style={{ color: "var(--text-3)" }}>—</span>}
                    </td>
                  )}
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i) }}>
                    {row.rating != null ? (
                      <div className="flex items-center gap-[5px] font-display font-extrabold tnum">
                        {row.rating.toFixed(1)}
                        <span style={{ color: "#fbbf24" }}>★</span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle tnum" style={{ borderBottom: cellBorder(i), color: "var(--text-2)" }}>
                    {row.reviews > 0 ? row.reviews.toLocaleString() : "—"}
                  </td>
                  <td className="px-[18px] py-[18px] text-[13.5px] align-middle" style={{ borderBottom: cellBorder(i) }}>
                    {row.verified ? (
                      <span className="font-extrabold" style={{ color: "var(--green)" }}>✓</span>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
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

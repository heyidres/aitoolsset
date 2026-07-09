import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { TOOLS, type Tool } from "@/lib/tools";
import { Favicon } from "./Favicon";

export async function PopularTable({ toolsOverride }: { toolsOverride?: Tool[] } = {}) {
  const t = await getTranslations("home");
  const tc = await getTranslations("tool_card");
  const TOOLS_DATA = toolsOverride && toolsOverride.length > 0 ? toolsOverride : TOOLS;
  // Same precedence rule as TrendingGrid: manual homepageOrder pins float
  // to the top, then natural sort by saves.
  const popular = [...TOOLS_DATA]
    .sort((a, b) => {
      const ao = a.homepageOrder;
      const bo = b.homepageOrder;
      if (ao != null && bo != null && ao !== bo) return ao - bo;
      if (ao != null && bo == null) return -1;
      if (ao == null && bo != null) return 1;
      return b.saves - a.saves;
    })
    .slice(0, 8);
  return (
    <div className="bg-white">
      <div className="max-w-page mx-auto px-9 section-pad-x">
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
            <div>
              <div className="eyebrow mb-[6px]">{t("popular_eyebrow")}</div>
              <h2 className="font-display font-extrabold tracking-[-.8px] leading-[1.1]" style={{ fontSize: 28 }}>
                {t("popular_heading")}
              </h2>
              <div className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
                {t("popular_sub")}
              </div>
            </div>
            <Link
              href="/ai-tools"
              className="text-[13.5px] font-semibold flex items-center gap-1"
              style={{ color: "var(--blue)" }}
            >
              {t("popular_full_rankings")} →
            </Link>
          </div>

          <div className="flex flex-col">
            {popular.map((tool, i) => (
              <Link
                key={tool.id}
                href={tool.link}
                className="group flex items-center gap-[14px] py-[14px] cursor-pointer tnum"
                style={{ borderBottom: i < popular.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <div
                  className="font-display text-[13px] font-bold text-center flex-shrink-0 tnum"
                  style={{ color: "var(--text-3)", width: 20 }}
                >
                  {i + 1}
                </div>
                <div
                  className="w-[38px] h-[38px] rounded-[9px] overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <Favicon domain={tool.domain} name={tool.name} size={38} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold mb-[2px] transition-colors group-hover:text-blue">
                    {tool.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-2)" }}>
                    {tool.desc}
                  </div>
                </div>
                <div className="flex gap-[5px] flex-shrink-0 pop-tags-hide">
                  {tool.tags.map((x) => (
                    <span
                      key={x}
                      className="text-[11px] font-semibold px-[9px] py-[3px] rounded-pill"
                      style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
                    >
                      {x}
                    </span>
                  ))}
                  {tool.free && (
                    <span
                      className="text-[11px] font-bold px-[9px] py-[3px] rounded-pill"
                      style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
                    >
                      {tc("free")}
                    </span>
                  )}
                </div>
                <div
                  className="text-xs font-semibold flex-shrink-0 text-right tnum"
                  style={{ color: "var(--text-3)", width: 80 }}
                >
                  {tool.saves.toLocaleString()} {t("popular_saves_unit")}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

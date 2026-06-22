import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TOOLS, type Tool } from "@/lib/tools";
import { Favicon } from "./Favicon";

export async function TrendingGrid({ toolsOverride }: { toolsOverride?: Tool[] } = {}) {
  const t = await getTranslations("home");
  // Manual pin first (lower homepageOrder = higher slot, NULL = organic).
  // Falls back to save count, then to the hardcoded `trending` flag
  // when no CMS data is around.
  const trending =
    toolsOverride && toolsOverride.length > 0
      ? [...toolsOverride].sort(sortByHomepageOrderThenSaves).slice(0, 4)
      : TOOLS.filter((t) => t.trending).slice(0, 4);
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-page mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-extrabold text-white tracking-[-.8px]" style={{ fontSize: 28 }}>
              🔥 {t("trending_heading")}
            </h2>
            <div className="text-sm mt-[5px]" style={{ color: "rgba(255,255,255,.35)" }}>
              {t("trending_sub")}
            </div>
          </div>
          <Link href="/trending" className="text-[13.5px] font-semibold" style={{ color: "var(--blue-h)" }}>
            {t("trending_see_all")} →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3 trend-grid-4">
          {trending.map((t) => (
            <Link
              key={t.id}
              href={t.link}
              className="dark-card-hover rounded-lg p-5 tnum"
            >
              <div className="flex items-center gap-[10px] mb-[14px]">
                <div
                  className="w-[38px] h-[38px] rounded-[9px] overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,.08)" }}
                >
                  <Favicon domain={t.domain} name={t.name} size={38} />
                </div>
                <div>
                  <div className="font-display font-extrabold text-white" style={{ fontSize: 14.5, marginBottom: 2 }}>
                    {t.name}
                  </div>
                  <div className="text-[11.5px]" style={{ color: "rgba(255,255,255,.3)" }}>
                    {t.tags[0]}
                  </div>
                </div>
              </div>
              <div
                className="text-[12.5px] leading-[1.5] mb-[14px] overflow-hidden"
                style={{
                  color: "rgba(255,255,255,.45)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {t.desc}
              </div>
              <div className="flex items-center gap-[6px] flex-wrap">
                {t.tags.map((x) => (
                  <span
                    key={x}
                    className="text-[11px] font-semibold px-2 py-[3px] rounded-pill"
                    style={{ color: "rgba(255,255,255,.35)", border: "1px solid rgba(255,255,255,.1)" }}
                  >
                    {x}
                  </span>
                ))}
                {t.free && (
                  <span
                    className="text-[11px] font-semibold px-2 py-[3px] rounded-pill"
                    style={{ color: "rgba(255,255,255,.35)", border: "1px solid rgba(255,255,255,.1)" }}
                  >
                    Free
                  </span>
                )}
                <span className="text-xs font-extrabold ml-auto" style={{ color: "#4ade80" }}>
                  ↑{t.trendPct}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Tools with a non-null homepageOrder always float above tools without
 * one. Among the pinned group, lower numbers come first. Ties (or pure
 * unpinned tools) fall back to save count desc.
 */
function sortByHomepageOrderThenSaves(a: Tool, b: Tool): number {
  const ao = a.homepageOrder;
  const bo = b.homepageOrder;
  if (ao != null && bo != null) {
    if (ao !== bo) return ao - bo;
  } else if (ao != null) {
    return -1;
  } else if (bo != null) {
    return 1;
  }
  return b.saves - a.saves;
}

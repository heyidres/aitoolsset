import Link from "next/link";
import { TOOLS, type Tool } from "@/lib/tools";
import { Favicon } from "./Favicon";

export function TrendingGrid({ toolsOverride }: { toolsOverride?: Tool[] } = {}) {
  // CMS doesn't track "trending" yet, so when an override is
  // provided we treat the top 4 by saves as trending. Falls
  // back to the hardcoded trending flag otherwise.
  const trending =
    toolsOverride && toolsOverride.length > 0
      ? [...toolsOverride].sort((a, b) => b.saves - a.saves).slice(0, 4)
      : TOOLS.filter((t) => t.trending).slice(0, 4);
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-page mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-extrabold text-white tracking-[-.8px]" style={{ fontSize: 28 }}>
              🔥 Trending this week
            </h2>
            <div className="text-sm mt-[5px]" style={{ color: "rgba(255,255,255,.35)" }}>
              Tools gaining the most traction in the last 7 days
            </div>
          </div>
          <Link href="/trending" className="text-[13.5px] font-semibold" style={{ color: "var(--blue-h)" }}>
            See all trending →
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

import Link from "next/link";
import { TOOLS, type Tool } from "@/lib/tools";
import { Favicon } from "./Favicon";

export function PopularTable({ toolsOverride }: { toolsOverride?: Tool[] } = {}) {
  const TOOLS_DATA = toolsOverride && toolsOverride.length > 0 ? toolsOverride : TOOLS;
  const popular = [...TOOLS_DATA].sort((a, b) => b.saves - a.saves).slice(0, 8);
  return (
    <div className="bg-white">
      <div className="max-w-page mx-auto px-9 section-pad-x">
        <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
            <div>
              <div className="eyebrow mb-[6px]">Community picks</div>
              <h2 className="font-display font-extrabold tracking-[-.8px] leading-[1.1]" style={{ fontSize: 28 }}>
                Most Popular
              </h2>
              <div className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
                Ranked by weekly saves across all users
              </div>
            </div>
            <Link
              href="/top-rated"
              className="text-[13.5px] font-semibold flex items-center gap-1"
              style={{ color: "var(--blue)" }}
            >
              Full rankings →
            </Link>
          </div>

          <div className="flex flex-col">
            {popular.map((t, i) => (
              <Link
                key={t.id}
                href={t.link}
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
                  <Favicon domain={t.domain} name={t.name} size={38} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold mb-[2px] transition-colors group-hover:text-blue">
                    {t.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-2)" }}>
                    {t.desc}
                  </div>
                </div>
                <div className="flex gap-[5px] flex-shrink-0 pop-tags-hide">
                  {t.tags.map((x) => (
                    <span
                      key={x}
                      className="text-[11px] font-semibold px-[9px] py-[3px] rounded-pill"
                      style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
                    >
                      {x}
                    </span>
                  ))}
                  {t.free && (
                    <span
                      className="text-[11px] font-bold px-[9px] py-[3px] rounded-pill"
                      style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
                    >
                      Free
                    </span>
                  )}
                </div>
                <div
                  className="text-xs font-semibold flex-shrink-0 text-right tnum"
                  style={{ color: "var(--text-3)", width: 80 }}
                >
                  {t.saves.toLocaleString()} saves
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

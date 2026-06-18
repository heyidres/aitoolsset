import Link from "next/link";
import { POPULAR_CATS, type PopularCategory } from "@/lib/categories";
import { favicon } from "@/lib/tools";
import { CategoriesSectionHeader } from "./SectionHeader";

export function PopularCategoriesGrid({ catsOverride }: { catsOverride?: PopularCategory[] } = {}) {
  const cats = catsOverride && catsOverride.length > 0 ? catsOverride : POPULAR_CATS;
  return (
    <section id="popular" className="py-[72px] px-9 bg-white section-pad-x">
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow="Most Browsed"
          title="Popular Categories"
          sub="The most-visited categories on AI Tools Set this week — based on real traffic from 50,000+ monthly users."
          link={{ label: "View all 48 →", href: "#all" }}
        />

        <div className="grid grid-cols-3 gap-5 popular-grid-3">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/ai-tools/${c.slug}`}
              className="pop-card-hover relative overflow-hidden rounded-lg p-7 cursor-pointer flex flex-col"
              // userSelect:text lets editors copy the title / description
              // text inside the card without the link hijacking the drag.
              style={{ color: c.color, minHeight: 220, userSelect: "text" }}
            >
              <span className="pop-card-corner" />

              <div
                className="font-display font-black mb-[6px] relative"
                style={{ fontSize: 22, letterSpacing: "-.6px", lineHeight: 1.15, color: "var(--text)" }}
              >
                {c.name}
              </div>
              <p
                className="text-[13.5px] leading-[1.55] mb-[18px] relative flex-1"
                style={{ color: "var(--text-2)", userSelect: "text" }}
              >
                {c.desc}
              </p>

              <div className="flex items-center gap-[10px] relative">
                <span className="font-display text-[13px] font-bold tnum" style={{ color: "var(--text)" }}>
                  {c.count} tools
                </span>
                <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border)" }} />
                <span
                  className="text-xs font-bold flex items-center gap-[3px] tnum"
                  style={{ color: "var(--green)" }}
                >
                  ↑ {c.trend} this week
                </span>
                <div className="pop-arrow-h ml-auto w-7 h-7 rounded-full flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>

              <div
                className="flex items-center mt-[14px] pt-[14px] relative"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex">
                  {c.tools.map((t, i) => (
                    <div
                      key={`${t}-${i}`}
                      className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: "var(--surface)",
                        border: "2px solid var(--white)",
                        marginLeft: i === 0 ? 0 : -7,
                      }}
                    >
                      <img
                        src={favicon(t, 64)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[11.5px] font-semibold ml-[14px]" style={{ color: "var(--text-3)" }}>
                  {c.tools.length}+ top tools
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

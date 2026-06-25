import { getTranslations } from "next-intl/server";
import { Breadcrumb } from "../Breadcrumb";
import { POPULAR_SEARCHES } from "@/lib/categories";

export async function CategoriesHero() {
  const t = await getTranslations("categories_landing");
  const STATS = [
    { num: "48",     label: t("hero_stat_categories") },
    { num: "2,400+", label: t("hero_stat_tools") },
    { num: "12k",    label: t("hero_stat_reviews") },
  ];
  return (
    <section
      className="relative overflow-hidden px-9 pt-[72px] pb-[88px] text-white section-pad-x"
      style={{ background: "var(--near-black)" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: -200,
          right: -100,
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(0,82,255,.16) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -150,
          left: -80,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(124,58,237,.1) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-page mx-auto relative">
        <Breadcrumb
          items={[
            { label: t("breadcrumb_home"), href: "/" },
            { label: t("breadcrumb_all") },
          ]}
          theme="dark"
        />
        <div className="grid grid-cols-[1fr_320px] gap-16 items-end cat-hero-grid">
          <div>
            <div
              className="inline-flex items-center gap-[6px] rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-bold uppercase tracking-[.07em] mb-[18px]"
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.7)",
              }}
            >
              {t("hero_eyebrow")}
            </div>
            <h1
              className="font-display font-black mb-[18px]"
              style={{
                fontSize: "clamp(44px, 5.5vw, 72px)",
                letterSpacing: "-2.8px",
                lineHeight: 1,
              }}
            >
              {t("hero_headline_lead")}
              <br />
              {/* Split into plain-text tail + rendered accent <span> rather
                  than a t.rich() callback. Avoids passing a function (or
                  function-wrapped JSX) through next-intl's interpolator,
                  which was triggering the RSC "Functions cannot be passed
                  directly to Client Components" error during page
                  revalidation. */}
              {t("hero_headline_tail")}{" "}
              <span className="gradient-text">{t("hero_headline_accent")}</span>
            </h1>
            <p className="text-[17px] leading-[1.65] max-w-[540px] mb-[30px]" style={{ color: "rgba(255,255,255,.55)" }}>
              {t("hero_sub")}
            </p>

            <form className="relative max-w-[540px] mb-6" role="search">
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "rgba(255,255,255,.5)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t("hero_search_placeholder")}
                aria-label={t("hero_search_placeholder")}
                className="w-full h-[54px] rounded-pill text-[15px] text-white outline-none pl-[50px] pr-[90px] transition-colors placeholder:text-white/40 focus:border-[var(--blue)] focus:bg-white/10"
                style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1.5px solid rgba(255,255,255,.14)",
                }}
              />
              <span
                className="absolute right-[14px] top-1/2 -translate-y-1/2 font-display text-[11px] font-bold px-[9px] py-[3px] rounded-[6px]"
                style={{
                  color: "rgba(255,255,255,.4)",
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              >
                ⌘ K
              </span>
            </form>

            <div className="flex gap-2 flex-wrap">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-[6px] rounded-pill px-[14px] py-[6px] text-[13px] font-semibold tnum"
                  style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.75)",
                  }}
                >
                  <strong className="font-display font-extrabold text-white">{s.num}</strong>
                  {s.label}
                </div>
              ))}
              <div
                className="flex items-center gap-[6px] rounded-pill px-[14px] py-[6px] text-[13px] font-semibold tnum"
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.1)",
                  color: "var(--green)",
                }}
              >
                <strong className="font-display font-extrabold" style={{ color: "var(--green)" }}>
                  ⬆ 32
                </strong>
                {t("hero_stat_added")}
              </div>
            </div>
          </div>

          <div>
            <div
              className="font-display text-[11px] font-bold uppercase tracking-[.08em] mb-[14px]"
              style={{ color: "rgba(255,255,255,.4)" }}
            >
              {t("hero_most_searched")}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {POPULAR_SEARCHES.map((q) => (
                <button
                  key={q}
                  className="hq-chip-hover font-display text-[12.5px] font-bold px-[13px] py-[7px] rounded-pill cursor-pointer"
                  style={{ color: "rgba(255,255,255,.8)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

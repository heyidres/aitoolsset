import { getTranslations } from "next-intl/server";

export async function SubmitHero() {
  const t = await getTranslations("submit");
  const STATS = [
    { num: "50k+",   label: t("stat_visitors") },
    { num: "2,400+", label: t("stat_tools") },
    { num: "12k+",   label: t("stat_reviews") },
    { num: "48h",    label: t("stat_review_time") },
  ];
  const TRUST_ITEMS = [
    { icon: "✓",  bg: "#f0fdf4", text: t("trust_quality_reviewed") },
    { icon: "🔒", bg: "#eff6ff", text: t("trust_secure_payment") },
    { icon: "⚡", bg: "#fdf4ff", text: t("trust_listed_48h") },
    { icon: "📈", bg: "#fff7ed", text: t("trust_real_traffic") },
    { icon: "🌍", bg: "#fef9c3", text: t("trust_seo") },
  ];
  return (
    <>
      <section
        className="relative overflow-hidden text-center px-9 pt-[72px] pb-20 section-pad-x"
        style={{ background: "var(--near-black)" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -150,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 800,
            background: "radial-gradient(circle, rgba(0,82,255,.2) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[760px] mx-auto relative">
          <div
            className="inline-flex items-center gap-[6px] rounded-pill px-[14px] py-[5px] font-display text-xs font-bold uppercase tracking-[.06em] mb-5"
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
            }}
          >
            {t("hero_eyebrow")}
          </div>
          <h1
            className="font-display font-black text-white mb-4"
            style={{
              fontSize: "clamp(42px, 5vw, 68px)",
              letterSpacing: "-2.5px",
              lineHeight: 1,
            }}
          >
            {t("hero_headline_lead")}
            <br />
            <span style={{ color: "var(--blue-h)" }}>{t("hero_headline_accent")}</span>
          </h1>
          <p className="text-[17px] leading-[1.7] max-w-[520px] mx-auto mb-9" style={{ color: "rgba(255,255,255,.5)" }}>
            {t("hero_sub")}
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="font-display font-black text-white tnum" style={{ fontSize: 28, letterSpacing: "-1px", lineHeight: 1 }}>
                    {s.num}
                  </div>
                  <div className="text-[12.5px] mt-1" style={{ color: "rgba(255,255,255,.35)" }}>
                    {s.label}
                  </div>
                </div>
                {i < STATS.length - 1 && <div className="w-px h-9" style={{ background: "rgba(255,255,255,.1)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-white px-9 py-4 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto flex items-center justify-center gap-8 flex-wrap">
          {TRUST_ITEMS.map((t) => (
            <div key={t.text} className="flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: "var(--text-2)" }}>
              <div
                className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: t.bg }}
              >
                {t.icon}
              </div>
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

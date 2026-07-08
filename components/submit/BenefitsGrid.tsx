import { getTranslations } from "next-intl/server";

export async function BenefitsGrid() {
  const t = await getTranslations("submit");
  const BENEFITS = [
    { icon: "🎯", title: t("benefit_targeted_title"),   desc: t("benefit_targeted_desc") },
    { icon: "🔍", title: t("benefit_seo_title"),         desc: t("benefit_seo_desc") },
    { icon: "⭐", title: t("benefit_social_title"),      desc: t("benefit_social_desc") },
    { icon: "✅", title: t("benefit_verified_title"),    desc: t("benefit_verified_desc") },
    { icon: "🏷️", title: t("benefit_deals_title"),       desc: t("benefit_deals_desc") },
    { icon: "🔗", title: t("benefit_embed_title"),       desc: t("benefit_embed_desc") },
  ];
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--bg)" }}>
      <div className="max-w-page mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            {t("benefits_eyebrow")}
          </div>
          <h2
            className="font-display font-black mb-3"
            style={{ fontSize: "clamp(28px, 3vw, 42px)", letterSpacing: "-1.5px", lineHeight: 1.1 }}
          >
            {t("benefits_heading")}
          </h2>
          <p className="text-base leading-[1.7]" style={{ color: "var(--text-2)" }}>
            {t("benefits_sub")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 benefits-grid-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-lg p-7"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.12)" }}
              >
                {b.icon}
              </div>
              <div className="font-display text-base font-extrabold mb-[6px]" style={{ letterSpacing: "-.3px" }}>
                {b.title}
              </div>
              <div className="text-[13.5px] leading-[1.6]" style={{ color: "var(--text-2)" }}>
                {b.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

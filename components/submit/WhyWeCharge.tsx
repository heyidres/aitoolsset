import { getTranslations } from "next-intl/server";

export async function WhyWeCharge() {
  const t = await getTranslations("submit");
  const POINTS = [
    { icon: "👩‍💻", title: t("why_charge_editorial_title"),  desc: t("why_charge_editorial_desc") },
    { icon: "📣",   title: t("why_charge_marketing_title"),  desc: t("why_charge_marketing_desc") },
    { icon: "🆓",   title: t("why_charge_users_title"),      desc: t("why_charge_users_desc") },
    { icon: "📊",   title: t("why_charge_infra_title"),      desc: t("why_charge_infra_desc") },
  ];
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-page mx-auto">
        <div className="grid grid-cols-2 gap-14 items-center why-grid-2">
          <div>
            <div className="font-display text-[11.5px] font-bold uppercase tracking-[.09em] mb-3" style={{ color: "var(--blue-h)" }}>
              {t("why_charge_eyebrow")}
            </div>
            <h2
              className="font-display font-black text-white mb-5"
              style={{ fontSize: "clamp(32px, 3vw, 48px)", letterSpacing: "-1.5px", lineHeight: 1.05 }}
            >
              {t("why_charge_heading")}
            </h2>
            <div className="text-[15px] leading-[1.8]" style={{ color: "rgba(255,255,255,.5)" }}>
              <p className="mb-[14px]">{t("why_charge_intro")}</p>
              <p>{t("why_charge_outro")}</p>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              {POINTS.map((p) => (
                <div
                  key={p.title}
                  className="flex gap-[14px] items-start rounded p-[18px]"
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.2)" }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="font-display text-[14.5px] font-extrabold text-white mb-1">{p.title}</div>
                    <div className="text-[13px] leading-[1.55]" style={{ color: "rgba(255,255,255,.4)" }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { getTranslations, getLocale } from "next-intl/server";
import { Breadcrumb } from "../Breadcrumb";
import { localizeMarketingFacts } from "@/lib/i18n/seed-i18n";
import { categoryNameForAiTemplate, type CategoryFact } from "@/lib/category-stats";

type Props = {
  categoryName: string;
  count: number;
  /** Real, computed facts for the "at a glance" panel. */
  facts: CategoryFact[];
  /** Real average rating (0–5) across the category's tools, or null. */
  avgRating: number | null;
  /** Last-updated date for the category, formatted. */
  updatedLabel?: string;
};

export async function CategoryHero({ categoryName, count, facts: rawFacts, avgRating, updatedLabel }: Props) {
  const t = await getTranslations("category_page");
  const locale = await getLocale();
  // Translate only the fact LABELS (fixed vocabulary); the VALUES are
  // real numbers computed from the category's tools.
  const facts = localizeMarketingFacts(rawFacts, locale);
  const lower = categoryNameForAiTemplate(categoryName);
  return (
    <section
      className="relative overflow-hidden px-9 pt-12 pb-14 text-white section-pad-x"
      style={{ background: "var(--near-black)" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: -150,
          right: -80,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(0,82,255,.18) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-[1320px] mx-auto relative">
        <Breadcrumb
          items={[
            { label: t("breadcrumb_home"), href: "/" },
            { label: t("breadcrumb_ai_tools"), href: "/ai-tools" },
            { label: categoryName },
          ]}
          theme="dark"
        />

        <div className="grid grid-cols-[1fr_360px] gap-[60px] items-start cat-hero-grid">
          <div>
            {/* Eyebrow + accent match the homepage hero (blue on dark),
                so every dark hero across the site reads as one family. */}
            <div
              className="inline-flex items-center gap-2 rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-bold uppercase tracking-[.07em] mb-4"
              style={{
                background: "rgba(0,82,255,.14)",
                border: "1px solid rgba(87,139,250,.35)",
                color: "var(--blue-h)",
              }}
            >
              📈 {t("eyebrow", { name: categoryName })}
            </div>
            <h1
              className="font-display font-black mb-4 text-white"
              style={{
                fontSize: "clamp(36px, 4.5vw, 56px)",
                letterSpacing: "-2px",
                lineHeight: 1.05,
              }}
            >
              {t("headline_lead")}{" "}
              <span style={{ color: "var(--blue-h)" }}>
                {t("headline_accent", { nameLower: lower })}
              </span>
              <br />
              {t("headline_tail")}
            </h1>
            <p className="text-base leading-[1.65] max-w-[620px] mb-6" style={{ color: "rgba(255,255,255,.65)" }}>
              {t("description", { nameLower: lower })}
            </p>
            <div className="flex items-center gap-[18px] flex-wrap text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
              <div className="flex items-center gap-[6px]">
                📂 <strong className="font-display font-extrabold text-white tnum">{t("stat_tools_listed", { count })}</strong>
              </div>
              {avgRating != null && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
                  <div className="flex items-center gap-[6px]">
                    ⭐ <strong className="font-display font-extrabold text-white tnum">{t("stat_avg_rating", { rating: avgRating.toFixed(1) })}</strong>
                  </div>
                </>
              )}
              {updatedLabel && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
                  <div className="flex items-center gap-[6px]">
                    🔄 <strong className="font-display font-extrabold text-white">{t("stat_updated", { date: updatedLabel })}</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="rounded-lg p-[22px]"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}
          >
            <div
              className="font-display text-[11.5px] font-bold uppercase tracking-[.08em] mb-[14px] flex items-center gap-2"
              style={{ color: "rgba(255,255,255,.5)" }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: "var(--blue-h)" }} />
              {t("at_a_glance", { name: categoryName })}
            </div>
            {facts.map((f, i) => (
              <div
                key={f.label}
                className="flex justify-between items-center py-[10px]"
                style={{ borderBottom: i < facts.length - 1 ? "1px dashed rgba(255,255,255,.08)" : "none" }}
              >
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,.55)" }}>
                  {f.label}
                </span>
                <span className="font-display text-sm font-extrabold text-white tnum">{f.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

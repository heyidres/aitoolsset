import { Link } from "@/lib/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { POPULAR_CATS, type PopularCategory } from "@/lib/categories";
import { favicon } from "@/lib/tools";
import { CategoriesSectionHeader } from "./SectionHeader";
import { localizeCategories, localizePopularCategoryDescs } from "@/lib/i18n/seed-i18n";
import { getSlotOverrides, type SlotKey } from "@/lib/site-content";

// Each popular card's description is editable from /admin/site-content.
// Keyed by the stable card slug so the mapping survives localization.
const CARD_DESC_SLOT: Record<string, SlotKey> = {
  "writing-and-editing": "categories.cards.writing-and-editing.desc",
  "image-generation": "categories.cards.image-generation.desc",
  "code-and-developer": "categories.cards.code-and-developer.desc",
  "video-and-animation": "categories.cards.video-and-animation.desc",
  "audio-and-music": "categories.cards.audio-and-music.desc",
  "productivity-and-automation": "categories.cards.productivity-and-automation.desc",
};

export async function PopularCategoriesGrid({ catsOverride }: { catsOverride?: PopularCategory[] } = {}) {
  const t = await getTranslations("categories_landing");
  const home = await getTranslations("home");
  const locale = await getLocale();
  const raw = catsOverride && catsOverride.length > 0 ? catsOverride : POPULAR_CATS;
  // Apply name + desc overlay so popular cards render fully Korean copy.
  const cats = localizePopularCategoryDescs(localizeCategories(raw, locale), locale);
  // Admin overrides for the card descriptions (English). When set, they win
  // over the localized default; when absent, the localized default shows —
  // so /ko keeps its Korean copy unless an editor explicitly overrides.
  const descOverrides = await getSlotOverrides(Object.values(CARD_DESC_SLOT));
  return (
    <section id="popular" className="py-[72px] px-9 bg-white section-pad-x">
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow={t("popular_eyebrow")}
          title={t("popular_heading")}
          sub={t("popular_sub")}
          link={{ label: `${home("view_all_count", { count: "48" })} →`, href: "#all" }}
        />

        <div className="grid grid-cols-3 gap-5 popular-grid-3">
          {cats.map((c) => {
            const slotKey = CARD_DESC_SLOT[c.slug];
            const desc = (slotKey && descOverrides[slotKey]) ?? c.desc;
            return (
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
                {desc}
              </p>

              <div className="flex items-center gap-[10px] relative">
                <span className="font-display text-[13px] font-bold tnum" style={{ color: "var(--text)" }}>
                  {home("tools_count", { count: c.count.toLocaleString() })}
                </span>
                <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border)" }} />
                <span
                  className="text-xs font-bold flex items-center gap-[3px] tnum"
                  style={{ color: "var(--green)" }}
                >
                  ↑ {c.trend} {t("card_trend_this_week")}
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
                  {c.tools.length}+ {t("card_top_tools_suffix")}
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

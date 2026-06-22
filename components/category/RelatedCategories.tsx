import { Link } from "@/lib/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { RELATED_CATS } from "@/lib/category-detail";
import { localizeCategories } from "@/lib/i18n/seed-i18n";

export async function RelatedCategories() {
  const t = await getTranslations("category_page");
  const homeT = await getTranslations("home");
  const locale = await getLocale();
  const localized = localizeCategories(RELATED_CATS, locale);
  return (
    <section className="py-16 px-9 text-white section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-[1320px] mx-auto">
        <div className="mb-7">
          <div className="font-display text-[11.5px] font-bold uppercase tracking-[.09em] mb-2" style={{ color: "var(--blue-h)" }}>
            {t("related_eyebrow")}
          </div>
          <h2 className="font-display font-black text-white" style={{ fontSize: 30, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
            {t("related_heading")}
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-[14px] related-grid-4">
          {localized.map((c) => (
            <Link
              key={c.slug}
              href={`/ai-tools/${c.slug}`}
              className="rel-card-hover rounded p-5 cursor-pointer"
            >
              <div className="text-2xl mb-3">{c.icon}</div>
              <div className="font-display text-[15px] font-extrabold text-white mb-1">{c.name}</div>
              <div className="text-[12.5px] tnum" style={{ color: "rgba(255,255,255,.5)" }}>
                {homeT("tools_count", { count: c.count.toLocaleString() })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

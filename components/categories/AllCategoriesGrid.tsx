import { Link } from "@/lib/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { ALL_CATS, type SmallCategory } from "@/lib/categories";
import { CategoriesSectionHeader } from "./SectionHeader";
import { localizeCategories } from "@/lib/i18n/seed-i18n";

export async function AllCategoriesGrid({ catsOverride }: { catsOverride?: SmallCategory[] } = {}) {
  const t = await getTranslations("categories_landing");
  const home = await getTranslations("home");
  const locale = await getLocale();
  const raw = catsOverride && catsOverride.length > 0 ? catsOverride : ALL_CATS;
  const cats = localizeCategories(raw, locale);
  return (
    <section id="all" className="py-[72px] px-9 section-pad-x" style={{ background: "var(--sand)" }}>
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow={t("all_eyebrow")}
          title={t("all_heading")}
          sub={t("all_sub")}
        />
        <div className="grid grid-cols-4 gap-[14px] cat-grid-mini-4">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/ai-tools/${c.slug}`}
              className="cat-mini-card-hover rounded p-[18px] cursor-pointer flex flex-col"
              style={{ userSelect: "text" }}
            >
              <div
                className="font-display font-extrabold mb-[2px]"
                style={{ fontSize: 14, letterSpacing: "-.2px", color: "var(--text)" }}
              >
                {c.name}
              </div>
              <div className="text-xs font-semibold tnum" style={{ color: "var(--text-3)" }}>
                {home("tools_count", { count: c.count.toLocaleString() })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "@/lib/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { CATEGORIES } from "@/lib/tools";
import { localizeCategories } from "@/lib/i18n/seed-i18n";

// Real category slugs for each card below — every card used to link to
// the generic /ai-tools hub regardless of which category it displayed.
// Mapped by hand since CATEGORIES here uses broad marketing names that
// don't 1:1 match the CMS's more granular category slugs.
const CATEGORY_SLUGS: Record<string, string> = {
  "Writing & Editing": "essay-writing",
  "Image Generation": "image-generators",
  "Video": "video-generators",
  "Code & Developer": "ai-coding",
  "Marketing": "marketing",
  "Productivity": "project-management",
  "Audio & Music": "generating-ai-music",
  "Research & Data": "research",
  "Design & Creative": "design-generators",
  "Business & Finance": "finance",
  "Education": "education",
  "Automation": "workflow-automation",
};

export async function CategoriesGrid() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const categories = localizeCategories(CATEGORIES, locale);
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-page mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-extrabold text-white tracking-[-.8px]" style={{ fontSize: 28 }}>
              {t("all_categories")}
            </h2>
            <div className="text-sm mt-[5px]" style={{ color: "rgba(255,255,255,.35)" }}>
              {t("all_categories_sub")}
            </div>
          </div>
          <Link href="/ai-tools" className="text-[13.5px] font-semibold" style={{ color: "var(--blue-h)" }}>
            {t("view_all_count", { count: "48" })} →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-[10px] cat-grid-4">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              href={`/ai-tools/${CATEGORY_SLUGS[CATEGORIES[i].name] ?? ""}`}
              className="cat-card-hover rounded p-5 cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-display font-bold text-white" style={{ fontSize: 14.5, marginBottom: 3 }}>
                  {c.name}
                </div>
                <div className="text-xs tnum" style={{ color: "rgba(255,255,255,.3)" }}>
                  {t("tools_count", { count: c.count.toLocaleString() })}
                </div>
              </div>
              <div className="cat-arrow text-lg">›</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

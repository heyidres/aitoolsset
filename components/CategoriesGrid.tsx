import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CATEGORIES } from "@/lib/tools";

export async function CategoriesGrid() {
  const t = await getTranslations("home");
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
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href="/ai-tools"
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

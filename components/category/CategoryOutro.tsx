import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { categoryNameForAiTemplate } from "@/lib/category-stats";

export async function CategoryOutro({ categoryName }: { categoryName: string }) {
  const t = await getTranslations("category_page");
  const lower = categoryNameForAiTemplate(categoryName);

  const bullets = [
    t("outro_bullet_1"),
    t("outro_bullet_2"),
    t("outro_bullet_3"),
    t("outro_bullet_4"),
  ];

  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--mint)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[880px] mx-auto">
        <h2 className="font-display font-black mb-4" style={{ fontSize: 28, letterSpacing: "-1px", lineHeight: 1.2 }}>
          {t("outro_heading", { nameLower: lower })}
        </h2>
        <p className="text-[15.5px] leading-[1.75] mb-[14px]" style={{ color: "var(--text-2)" }}>
          {t("outro_intro", { nameLower: lower })}
        </p>
        <p className="text-[15.5px] leading-[1.75] mb-[14px]" style={{ color: "var(--text-2)" }}>
          {t("outro_advice_lead", { nameLower: lower })}
        </p>
        <ul className="my-[14px] mb-[18px] pl-0 list-none">
          {bullets.map((bullet, i) => (
            <li
              key={i}
              className="text-[15px] leading-[1.75] mb-[6px] pl-6 relative"
              style={{ color: "var(--text-2)" }}
            >
              <span className="absolute left-0 font-extrabold" style={{ color: "var(--blue)" }}>→</span>
              {bullet}
            </li>
          ))}
        </ul>
        <p className="text-[15.5px] leading-[1.75]" style={{ color: "var(--text-2)" }}>
          {t.rich("outro_closing", {
            nameLower: lower,
            submit: (chunks) => (
              <Link href="/submit" className="font-bold" style={{ color: "var(--blue)" }}>
                {chunks}
              </Link>
            ),
            newsletter: (chunks) => (
              <Link href="/blog" className="font-bold" style={{ color: "var(--blue)" }}>
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </section>
  );
}

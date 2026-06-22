import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Props = { categoryName: string; count: number };

export async function CategoryIntro({ categoryName, count }: Props) {
  const t = await getTranslations("category_page");
  const lower = categoryName.toLowerCase();
  return (
    <section className="bg-white px-9 py-12 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-[880px] mx-auto">
        <h2 className="font-display font-black mb-[14px]" style={{ fontSize: 24, letterSpacing: "-.8px", lineHeight: 1.2 }}>
          {t("intro_heading", { nameLower: lower })}
        </h2>
        <p className="text-base leading-[1.75] mb-4" style={{ color: "var(--text-2)" }}>
          {t.rich("intro_body_p1", {
            nameLower: lower,
            count,
            strong: (chunks) => <strong style={{ color: "var(--text)" }}>{chunks}</strong>,
          })}
        </p>
        <p className="text-base leading-[1.75]" style={{ color: "var(--text-2)" }}>
          {t.rich("intro_body_p2", {
            nameLower: lower,
            editorsPick: (chunks) => (
              <Link href="#editors-pick" className="font-bold" style={{ color: "var(--blue)" }}>
                {chunks}
              </Link>
            ),
            faq: (chunks) => (
              <Link href="#faq" className="font-bold" style={{ color: "var(--blue)" }}>
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </section>
  );
}

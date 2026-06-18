import Link from "next/link";
import { ALL_CATS, type SmallCategory } from "@/lib/categories";
import { CategoriesSectionHeader } from "./SectionHeader";

export function AllCategoriesGrid({ catsOverride }: { catsOverride?: SmallCategory[] } = {}) {
  const cats = catsOverride && catsOverride.length > 0 ? catsOverride : ALL_CATS;
  return (
    <section id="all" className="py-[72px] px-9 section-pad-x" style={{ background: "var(--sand)" }}>
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow="Complete Directory"
          title="All Categories"
          sub="Every category we cover, from writing assistants to autonomous agents. Click any to see the tools inside."
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
                {c.count} tools
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

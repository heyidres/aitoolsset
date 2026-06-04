import { USE_CASES } from "@/lib/categories";
import { CategoriesSectionHeader } from "./SectionHeader";

export function UseCaseGrid() {
  return (
    <section id="usecase" className="py-[72px] px-9 section-pad-x" style={{ background: "var(--cream)" }}>
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow="Find Tools Faster"
          title="Browse by Use Case"
          sub="Skip the categories — tell us what you're trying to do and we'll show you the right tools."
        />
        <div className="grid grid-cols-4 gap-[18px] uc-grid-4">
          {USE_CASES.map((u) => (
            <div
              key={u.name}
              className="uc-card-cat-hover rounded-lg p-6 cursor-pointer tnum"
            >
              <div className="text-[32px] mb-[14px] leading-none">{u.emoji}</div>
              <div className="font-display font-extrabold mb-1" style={{ fontSize: 15, letterSpacing: "-.2px", color: "var(--text)" }}>
                {u.name}
              </div>
              <div className="text-[12.5px] leading-[1.5] mb-[14px]" style={{ color: "var(--text-2)" }}>
                {u.desc}
              </div>
              <span className="font-display text-[12.5px] font-bold" style={{ color: "var(--blue)" }}>
                {u.count} tools →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

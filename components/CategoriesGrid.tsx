import Link from "next/link";
import { CATEGORIES } from "@/lib/tools";

export function CategoriesGrid() {
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-page mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-extrabold text-white tracking-[-.8px]" style={{ fontSize: 28 }}>
              All Categories
            </h2>
            <div className="text-sm mt-[5px]" style={{ color: "rgba(255,255,255,.35)" }}>
              Find tools by what you need to do
            </div>
          </div>
          <Link href="/categories" className="text-[13.5px] font-semibold" style={{ color: "var(--blue-h)" }}>
            View all 48 →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-[10px] cat-grid-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href="/categories"
              className="cat-card-hover rounded p-5 cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-display font-bold text-white" style={{ fontSize: 14.5, marginBottom: 3 }}>
                  {c.name}
                </div>
                <div className="text-xs tnum" style={{ color: "rgba(255,255,255,.3)" }}>
                  {c.count} tools
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

import Link from "next/link";
import { RELATED_CATS } from "@/lib/category-detail";

export function RelatedCategories() {
  return (
    <section className="py-16 px-9 text-white section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-[1320px] mx-auto">
        <div className="mb-7">
          <div className="font-display text-[11.5px] font-bold uppercase tracking-[.09em] mb-2" style={{ color: "var(--blue-h)" }}>
            Keep exploring
          </div>
          <h2 className="font-display font-black text-white" style={{ fontSize: 30, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
            Related AI tool categories
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-[14px] related-grid-4">
          {RELATED_CATS.map((c) => (
            <Link
              key={c.slug}
              href={`/ai-tools/${c.slug}`}
              className="rel-card-hover rounded p-5 cursor-pointer"
            >
              <div className="text-2xl mb-3">{c.icon}</div>
              <div className="font-display text-[15px] font-extrabold text-white mb-1">{c.name}</div>
              <div className="text-[12.5px] tnum" style={{ color: "rgba(255,255,255,.5)" }}>
                {c.count} tools
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

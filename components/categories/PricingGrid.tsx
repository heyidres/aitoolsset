import { PRICING_TIERS } from "@/lib/categories";
import { CategoriesSectionHeader } from "./SectionHeader";

export function PricingGrid() {
  return (
    <section id="pricing" className="py-[72px] px-9 section-pad-x" style={{ background: "var(--mint)" }}>
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow="Filter by Cost"
          title="Browse by Pricing"
          sub="Tools sorted by what they cost — from completely free to enterprise plans."
        />
        <div className="grid grid-cols-4 gap-4 pr-grid-4">
          {PRICING_TIERS.map((p) => (
            <button
              key={p.tag}
              className="pr-card-hover rounded-lg p-6 cursor-pointer text-left tnum"
            >
              <div
                className="inline-flex font-display text-[11px] font-extrabold uppercase tracking-[.07em] px-[10px] py-[3px] rounded-pill mb-[14px]"
                style={{
                  background: p.tagBg,
                  color: p.tagFg,
                  border: `1px solid ${p.tagBorder}`,
                }}
              >
                {p.tag}
              </div>
              <div className="font-display font-black mb-[6px]" style={{ fontSize: 18, letterSpacing: "-.4px", color: "var(--text)" }}>
                {p.name}
              </div>
              <div className="text-[13px] leading-[1.55] mb-[14px]" style={{ color: "var(--text-2)" }}>
                {p.desc}
              </div>
              <div
                className="font-display text-[13px] font-bold flex items-center gap-[6px] tnum"
                style={{ color: "var(--text)" }}
              >
                {p.count.toLocaleString()} tools
                <span className="ml-auto" style={{ color: "var(--text-3)" }}>
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

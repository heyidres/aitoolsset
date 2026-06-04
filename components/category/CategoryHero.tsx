import { Breadcrumb } from "../Breadcrumb";
import { MARKETING_FACTS } from "@/lib/category-detail";

type Props = {
  categoryName: string;
  count: number;
};

export function CategoryHero({ categoryName, count }: Props) {
  return (
    <section
      className="relative overflow-hidden px-9 pt-12 pb-14 text-white section-pad-x"
      style={{ background: "var(--near-black)" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: -150,
          right: -80,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(0,82,255,.18) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-[1320px] mx-auto relative">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "AI Tools", href: "/categories" },
            { label: categoryName },
          ]}
          theme="dark"
        />

        <div className="grid grid-cols-[1fr_360px] gap-[60px] items-start cat-hero-grid">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-bold uppercase tracking-[.07em] mb-4"
              style={{
                background: "rgba(236,72,153,.12)",
                border: "1px solid rgba(236,72,153,.3)",
                color: "#f9a8d4",
              }}
            >
              📈 Category · {categoryName}
            </div>
            <h1
              className="font-display font-black mb-4"
              style={{
                fontSize: "clamp(36px, 4.5vw, 56px)",
                letterSpacing: "-2px",
                lineHeight: 1.05,
              }}
            >
              Best{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #f472b6, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                AI {categoryName.toLowerCase()} tools
              </span>
              <br />
              for 2026, ranked &amp; reviewed
            </h1>
            <p className="text-base leading-[1.65] max-w-[620px] mb-6" style={{ color: "rgba(255,255,255,.65)" }}>
              Hand-picked AI {categoryName.toLowerCase()} software for SEO, content, ad copy, email automation, social media, and analytics. Every tool below has been tested by our editors and rated by real users — compare pricing, features, and reviews side-by-side.
            </p>
            <div className="flex items-center gap-[18px] flex-wrap text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
              <div className="flex items-center gap-[6px]">
                📂 <strong className="font-display font-extrabold text-white tnum">{count} tools</strong> listed
              </div>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
              <div className="flex items-center gap-[6px]">
                ⭐ <strong className="font-display font-extrabold text-white tnum">4.6</strong> avg rating
              </div>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
              <div className="flex items-center gap-[6px]">
                🔄 Updated <strong className="font-display font-extrabold text-white">May 8, 2026</strong>
              </div>
              <span className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,.3)" }} />
              <div className="flex items-center gap-[6px]" style={{ color: "#34d399" }}>
                ⬆ <strong className="font-display font-extrabold tnum" style={{ color: "#34d399" }}>14 added</strong> this month
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-[22px]"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}
          >
            <div
              className="font-display text-[11.5px] font-bold uppercase tracking-[.08em] mb-[14px] flex items-center gap-2"
              style={{ color: "rgba(255,255,255,.5)" }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: "#f472b6" }} />
              {categoryName} AI at a glance
            </div>
            {MARKETING_FACTS.map((f, i) => (
              <div
                key={f.label}
                className="flex justify-between items-center py-[10px]"
                style={{ borderBottom: i < MARKETING_FACTS.length - 1 ? "1px dashed rgba(255,255,255,.08)" : "none" }}
              >
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,.55)" }}>
                  {f.label}
                </span>
                <span className="font-display text-sm font-extrabold text-white tnum">{f.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

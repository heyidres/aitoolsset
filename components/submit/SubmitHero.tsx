const STATS = [
  { num: "50k+", label: "Monthly visitors" },
  { num: "2,400+", label: "Tools listed" },
  { num: "12k+", label: "User reviews" },
  { num: "48h", label: "Avg. review time" },
];

const TRUST_ITEMS = [
  { icon: "✓", bg: "#f0fdf4", text: "Quality-reviewed by our editorial team" },
  { icon: "🔒", bg: "#eff6ff", text: "Secure payment via Stripe" },
  { icon: "⚡", bg: "#fdf4ff", text: "Listed within 48 hours" },
  { icon: "📈", bg: "#fff7ed", text: "Real traffic from real users" },
  { icon: "🌍", bg: "#fef9c3", text: "SEO-optimised tool pages" },
];

export function SubmitHero() {
  return (
    <>
      <section
        className="relative overflow-hidden text-center px-9 pt-[72px] pb-20 section-pad-x"
        style={{ background: "var(--near-black)" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -150,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 800,
            background: "radial-gradient(circle, rgba(0,82,255,.2) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[760px] mx-auto relative">
          <div
            className="inline-flex items-center gap-[6px] rounded-pill px-[14px] py-[5px] font-display text-xs font-bold uppercase tracking-[.06em] mb-5"
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
            }}
          >
            For AI Tool Makers
          </div>
          <h1
            className="font-display font-black text-white mb-4"
            style={{
              fontSize: "clamp(42px, 5vw, 68px)",
              letterSpacing: "-2.5px",
              lineHeight: 1,
            }}
          >
            Get your AI tool in front of
            <br />
            <span style={{ color: "var(--blue-h)" }}>50,000+ users</span>
          </h1>
          <p className="text-[17px] leading-[1.7] max-w-[520px] mx-auto mb-9" style={{ color: "rgba(255,255,255,.5)" }}>
            AI Tools Set is the most curated AI directory on the internet. Submit your tool and reach the exact audience that needs it — developers, creators, and AI enthusiasts.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="font-display font-black text-white tnum" style={{ fontSize: 28, letterSpacing: "-1px", lineHeight: 1 }}>
                    {s.num}
                  </div>
                  <div className="text-[12.5px] mt-1" style={{ color: "rgba(255,255,255,.35)" }}>
                    {s.label}
                  </div>
                </div>
                {i < STATS.length - 1 && <div className="w-px h-9" style={{ background: "rgba(255,255,255,.1)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-white px-9 py-4 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto flex items-center justify-center gap-8 flex-wrap">
          {TRUST_ITEMS.map((t) => (
            <div key={t.text} className="flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: "var(--text-2)" }}>
              <div
                className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: t.bg }}
              >
                {t.icon}
              </div>
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

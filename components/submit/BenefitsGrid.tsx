const BENEFITS = [
  { icon: "🎯", title: "Targeted audience", desc: "Our visitors are AI professionals, developers, and power users actively looking for tools to integrate into their workflows — not casual browsers." },
  { icon: "🔍", title: "SEO authority", desc: "Each tool page is fully optimised for search engines with structured data, fast loading, and keyword-rich content — driving long-term organic traffic." },
  { icon: "⭐", title: "Social proof engine", desc: "User reviews, saves, and ratings build credibility that converts. Tools with 50+ reviews see 3× higher click-through rates from our directory." },
  { icon: "📊", title: "Analytics dashboard", desc: "Track impressions, clicks, saves, and review scores in real time. Understand where your traffic comes from and which features resonate most." },
  { icon: "📧", title: "Newsletter reach", desc: "Our weekly AI newsletter goes to 28,000+ subscribers. Featured tools get a dedicated mention, driving a measurable spike in signups." },
  { icon: "🔗", title: "Embed badge", desc: "Featured listings come with an \"As seen on AI Tools Set\" badge you can embed on your landing page — adding trusted third-party credibility." },
];

export function BenefitsGrid() {
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--bg)" }}>
      <div className="max-w-page mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            What You Get
          </div>
          <h2
            className="font-display font-black mb-3"
            style={{ fontSize: "clamp(28px, 3vw, 42px)", letterSpacing: "-1.5px", lineHeight: 1.1 }}
          >
            Built to drive real results
          </h2>
          <p className="text-base leading-[1.7]" style={{ color: "var(--text-2)" }}>
            Every listing on AI Tools Set is crafted to convert visitors into users — not just eyeballs.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 benefits-grid-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-lg p-7"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.12)" }}
              >
                {b.icon}
              </div>
              <div className="font-display text-base font-extrabold mb-[6px]" style={{ letterSpacing: "-.3px" }}>
                {b.title}
              </div>
              <div className="text-[13.5px] leading-[1.6]" style={{ color: "var(--text-2)" }}>
                {b.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

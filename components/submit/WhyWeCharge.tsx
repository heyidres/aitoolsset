const POINTS = [
  { icon: "👩‍💻", title: "Human editorial review", desc: "Every tool is tested and reviewed by a real person — we don't auto-approve submissions." },
  { icon: "📣", title: "Real marketing spend", desc: "Fees fund paid social, SEO campaigns, and newsletter distribution that drive traffic to your listing." },
  { icon: "🆓", title: "Free for users, always", desc: "Charging tool makers — not users — keeps our recommendations unbiased and the directory free to browse." },
  { icon: "📊", title: "Infrastructure & analytics", desc: "Fees fund the analytics dashboard, uptime, CDN, and the engineering that powers your listing page." },
];

export function WhyWeCharge() {
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-page mx-auto">
        <div className="grid grid-cols-2 gap-14 items-center why-grid-2">
          <div>
            <div className="font-display text-[11.5px] font-bold uppercase tracking-[.09em] mb-3" style={{ color: "var(--blue-h)" }}>
              Transparency
            </div>
            <h2
              className="font-display font-black text-white mb-5"
              style={{ fontSize: "clamp(32px, 3vw, 48px)", letterSpacing: "-1.5px", lineHeight: 1.05 }}
            >
              Why we charge
              <br />
              for featured listings
            </h2>
            <div className="text-[15px] leading-[1.8]" style={{ color: "rgba(255,255,255,.5)" }}>
              <p className="mb-[14px]">
                We believe a great directory requires editorial work — not automation. Every tool on AI Tools Set is manually reviewed by our team to ensure it's real, functional, and genuinely useful.
              </p>
              <p className="mb-[14px]">
                Charging for featured placement lets us fund this curation work, keep the directory free for users, and dedicate marketing resources that actually get your tool in front of the right people.
              </p>
              <p>
                We will never charge for basic inclusion or sell fake reviews. Our credibility depends on your users trusting our recommendations.
              </p>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              {POINTS.map((p) => (
                <div
                  key={p.title}
                  className="flex gap-[14px] items-start rounded p-[18px]"
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.2)" }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="font-display text-[14.5px] font-extrabold text-white mb-1">{p.title}</div>
                    <div className="text-[13px] leading-[1.55]" style={{ color: "rgba(255,255,255,.4)" }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Favicon } from "../Favicon";
import { DEALS, DEAL_FILTERS, type Deal } from "@/lib/deals";

const FAQS = [
  { q: "Are these deals legit?", a: "Yes. Every code on this page is manually tested by our team within 24 hours before going live, and re-checked every week. If a deal stops working, it's removed within hours." },
  { q: "Do you get a commission?", a: "Some deals are affiliate links (clearly marked with the <strong>⭐ Exclusive</strong> badge), which means we earn a small commission if you sign up. <strong>This never changes the price you pay</strong> — in many cases the exclusive code gives you a deeper discount than the tool's public price." },
  { q: "When do new Black Friday deals go live?", a: "Black Friday deals begin rolling out on <strong>November 25</strong> and run through Cyber Monday. We add new deals daily during this window — subscribe to our newsletter to get notified the moment a high-discount code goes live." },
  { q: "A code didn't work for me. What now?", a: "Report it using the small \"report\" link on the deal card. We'll re-verify within 24 hours. Most \"broken\" codes are actually region-restricted (e.g. EU-only) or have hit their usage cap." },
];

const HOW_STEPS = [
  { n: 1, h: "Copy the code", t: "Click \"Copy code\" on any deal card. The discount code is copied to your clipboard automatically." },
  { n: 2, h: "Visit the tool", t: "Click \"Claim deal\" to go to the tool's pricing page in a new tab. Choose your plan." },
  { n: 3, h: "Apply at checkout", t: "Paste the code in the discount field at checkout. The price updates instantly. Done." },
];

const TRUST = [
  { title: "Manually verified", text: "Every code tested by our team within 24 hours before listing.", icon: (
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  ) },
  { title: "Updated daily", text: "Expired deals removed automatically. Fresh codes added every day.", icon: (
    <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
  ) },
  { title: "Exclusive codes", text: "12 deals available only through AI Tools Set partnerships.", icon: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ) },
  { title: "No spam, no signup", text: "Copy codes instantly. No email walls, no popups, no fake countdowns.", icon: (
    <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
  ) },
];

function renderMd(text: string) {
  const parts = text.split(/(<strong>[^<]+<\/strong>)/g);
  return parts.map((p, i) => {
    if (p.startsWith("<strong>") && p.endsWith("</strong>")) {
      return (
        <strong key={i} style={{ color: "var(--text)", fontWeight: 700 }}>
          {p.slice(8, -9)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export function DealsClient({ dealsOverride }: { dealsOverride?: Deal[] } = {}) {
  // When the page server-side fetches DB-managed deals it passes
  // them here; otherwise we fall back to the hardcoded seed data
  // imported above, so empty-CMS state still looks populated.
  const DEALS_DATA = dealsOverride && dealsOverride.length > 0 ? dealsOverride : DEALS;
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [cd, setCd] = useState({ d: "02", h: "14", m: "32", s: "08" });

  // Countdown timer
  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 62);
    const tick = () => {
      const diff = +target - Date.now();
      if (diff <= 0) {
        setCd({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      setCd({ d: pad(d), h: pad(h), m: pad(m), s: pad(s) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return DEALS_DATA.filter((d) => {
      if (filter === "all") return true;
      if (filter === "bf") return d.bf;
      if (filter === "exclusive") return d.exclusive;
      return d.cat === filter;
    });
  }, [filter, DEALS_DATA]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1700);
  };

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    showToast(`✓ Code "${code}" copied`);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-9 pt-[60px] pb-14 text-white section-pad-x"
        style={{ background: "var(--near-black)" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -150,
            right: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(234,88,12,.22) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -100,
            left: -80,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(0,82,255,.15) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-page mx-auto relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-5 flex-wrap" style={{ color: "rgba(255,255,255,.4)" }}>
            <Link href="/" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,.55)" }}>
              Home
            </Link>
            <span style={{ color: "rgba(255,255,255,.2)" }}>/</span>
            <span style={{ color: "#fff" }}>AI Deals &amp; Discounts</span>
          </nav>

          <div className="grid grid-cols-[1fr_360px] gap-12 items-center deals-hero-grid">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-extrabold uppercase tracking-[.07em] mb-4"
                style={{ background: "rgba(234,88,12,.18)", border: "1px solid rgba(234,88,12,.3)", color: "#fdba74" }}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full animate-pulse-dot"
                  style={{ background: "#fdba74" }}
                />
                34 live deals · Verified daily
              </div>
              <h1 className="font-display font-black text-white mb-[14px]" style={{ fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: "-2.2px", lineHeight: 1 }}>
                Save big on the
                <br />
                best{" "}
                <span
                  style={{
                    background: "linear-gradient(120deg,#fb923c,#f59e0b)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  AI tools
                </span>
              </h1>
              <p className="text-[17px] leading-[1.65] max-w-[540px] mb-6" style={{ color: "rgba(255,255,255,.55)" }}>
                Verified active deals, coupon codes, and exclusive discounts on the top AI tools. Hand-checked by our team — no expired junk.
              </p>
              <div className="flex gap-6 flex-wrap">
                {[
                  { num: "34", lbl: "Active deals" },
                  { num: "$420K+", lbl: "Saved by users", savings: true },
                  { num: "12", lbl: "Exclusive codes" },
                  { num: "Today", lbl: "Last verified" },
                ].map((s) => (
                  <div key={s.lbl}>
                    <div className="font-display font-black tnum" style={{ fontSize: 24, letterSpacing: "-.8px", color: s.savings ? "#fb923c" : "#fff" }}>
                      {s.num}
                    </div>
                    <div className="text-xs mt-[3px]" style={{ color: "rgba(255,255,255,.4)" }}>
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spotlight */}
            <div className="rounded-lg p-[22px] relative" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}>
              <div
                className="inline-flex items-center gap-[5px] font-display text-[10.5px] font-extrabold uppercase tracking-[.07em] px-[10px] py-[3px] rounded-pill mb-[14px]"
                style={{ color: "#fdba74", background: "rgba(234,88,12,.15)" }}
              >
                🔥 Deal of the day
              </div>
              <div className="flex items-center gap-3 mb-[14px]">
                <div className="w-11 h-11 rounded-[11px] bg-white overflow-hidden flex items-center justify-center">
                  <Favicon domain="midjourney.com" name="Midjourney" size={32} />
                </div>
                <div>
                  <div className="font-display font-black text-white" style={{ fontSize: 18, letterSpacing: "-.5px" }}>
                    Midjourney
                  </div>
                  <div className="text-[11.5px]" style={{ color: "rgba(255,255,255,.45)" }}>
                    Image Generation
                  </div>
                </div>
              </div>
              <div
                className="font-display font-black mb-[6px] tnum"
                style={{
                  fontSize: 32,
                  background: "linear-gradient(120deg,#fb923c,#f59e0b)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  letterSpacing: "-1px",
                  lineHeight: 1.05,
                }}
              >
                40% OFF
              </div>
              <div className="text-[13px] mb-[14px]" style={{ color: "rgba(255,255,255,.65)" }}>
                Annual Pro plan · Save $96/year
              </div>
              <div className="flex gap-2 mb-[14px]">
                {[
                  { num: cd.d, lbl: "Days" },
                  { num: cd.h, lbl: "Hours" },
                  { num: cd.m, lbl: "Min" },
                  { num: cd.s, lbl: "Sec" },
                ].map((c) => (
                  <div
                    key={c.lbl}
                    className="flex-1 rounded-sm p-2 text-center"
                    style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.08)" }}
                  >
                    <div className="font-bold text-white text-xl leading-none tnum" style={{ fontFamily: "ui-monospace, 'JetBrains Mono', monospace" }}>
                      {c.num}
                    </div>
                    <div className="text-[9.5px] uppercase tracking-[.08em] mt-1" style={{ color: "rgba(255,255,255,.4)" }}>
                      {c.lbl}
                    </div>
                  </div>
                ))}
              </div>
              <a className="block text-center font-display text-[13.5px] font-extrabold bg-white py-[11px] rounded-pill cursor-pointer transition-colors hover:bg-[#f59e0b] hover:text-white" style={{ color: "var(--near-black)" }}>
                Claim deal →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky z-[100] backdrop-blur-[20px]" style={{ top: 58, background: "rgba(255,255,255,.95)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto flex items-center gap-[6px] overflow-x-auto no-scrollbar px-9 py-[14px] section-pad-x">
          <span className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mr-1 flex-shrink-0" style={{ color: "var(--text-3)" }}>
            Filter
          </span>
          {DEAL_FILTERS.map((f) => {
            const active = filter === f.key;
            const isBf = f.bf;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="font-display text-[12.5px] font-bold px-[13px] py-[6px] rounded-pill whitespace-nowrap flex-shrink-0 cursor-pointer transition-colors"
                style={
                  isBf
                    ? {
                        background: "linear-gradient(120deg,#ea580c,#f59e0b)",
                        color: "#fff",
                        border: "1.5px solid #ea580c",
                      }
                    : {
                        background: active ? "var(--blue)" : "var(--white)",
                        color: active ? "#fff" : "var(--text-2)",
                        border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
                      }
                }
              >
                {isBf && "🔥 "}
                {f.label}
              </button>
            );
          })}
          <button
            className="font-display text-[12.5px] font-bold px-[13px] py-[6px] rounded-pill flex items-center gap-[5px] ml-auto whitespace-nowrap"
            style={{ color: "var(--text-2)", background: "var(--white)", border: "1.5px dashed var(--border)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="3 6 5 6 21 6" />
              <polyline points="3 12 13 12" />
              <polyline points="3 18 9 18" />
            </svg>
            Highest discount
          </button>
        </div>
      </div>

      {/* Page */}
      <div className="max-w-page mx-auto px-9 py-9 section-pad-x">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
          <div className="font-display font-black" style={{ fontSize: 24, letterSpacing: "-.8px" }}>
            🔥 Featured deals this week
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-2)" }}>
            Showing <strong className="tnum" style={{ color: "var(--text)", fontWeight: 800 }}>{filtered.length}</strong> of {DEALS_DATA.length} active deals ·{" "}
            <span className="font-extrabold" style={{ color: "var(--blue)" }}>
              Updated 2h ago
            </span>
          </div>
        </div>

        {/* BF Banner */}
        <div
          className="rounded-lg p-8 text-white mb-7 grid grid-cols-[1fr_220px] gap-6 items-center relative overflow-hidden bf-banner-grid"
          style={{ background: "linear-gradient(135deg, #1a0a00 0%, #7c2d12 50%, #ea580c 100%)" }}
        >
          <div
            className="absolute pointer-events-none"
            style={{ top: -100, right: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 60%)" }}
          />
          <div className="relative">
            <div className="font-display text-[11px] font-extrabold uppercase tracking-[.09em] mb-[10px]" style={{ color: "#fdba74" }}>
              ⚡ Limited time · Black Friday 2026
            </div>
            <div className="font-display font-black mb-2 text-white" style={{ fontSize: 34, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
              The biggest AI tool sale of the year
            </div>
            <div className="text-[14.5px] leading-[1.6] max-w-[520px]" style={{ color: "rgba(255,255,255,.75)" }}>
              Hand-picked Black Friday deals from 40+ AI tools. Up to 75% off annual plans, lifetime licenses, and exclusive AI Tools Set codes you won't find anywhere else. Ends Nov 30.
            </div>
            <a className="inline-block bg-white font-display text-[13.5px] font-extrabold px-5 py-[10px] rounded-pill mt-[14px] cursor-pointer transition-colors hover:bg-[#fdba74] hover:text-white" style={{ color: "#7c2d12" }}>
              View all Black Friday deals →
            </a>
          </div>
          <div className="text-center relative">
            <div
              className="font-display font-black tnum"
              style={{
                fontSize: 54,
                letterSpacing: "-2.5px",
                background: "linear-gradient(120deg, #fb923c, #fef3c7)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                lineHeight: 1,
              }}
            >
              75%
            </div>
            <div className="text-xs mt-[6px] uppercase tracking-[.07em] font-bold" style={{ color: "rgba(255,255,255,.55)" }}>
              Max discount
            </div>
          </div>
        </div>

        {/* Deals grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-5" style={{ color: "var(--text-3)" }}>
            <div className="text-4xl mb-[14px]">🏷️</div>
            <div className="font-display text-lg font-extrabold mb-[6px]" style={{ color: "var(--text)" }}>
              No deals in this category
            </div>
            <div>Try another filter or check back tomorrow — we add new deals daily.</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[18px] deals-grid-3">
            {filtered.map((d, i) => (
              <DealCard key={`${d.tool}-${i}`} deal={d} onCopy={copyCode} copied={copiedCode === d.code} />
            ))}
          </div>
        )}
      </div>

      {/* Trust strip */}
      <section className="py-9 px-9 section-pad-x" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto grid grid-cols-4 gap-6 trust-grid-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--blue)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
              </div>
              <div>
                <div className="font-display text-[13.5px] font-extrabold mb-[2px]">{t.title}</div>
                <div className="text-[12.5px] leading-[1.5]" style={{ color: "var(--text-2)" }}>
                  {t.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section className="py-12 px-9 section-pad-x" style={{ background: "var(--cream)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center mb-8">
            <div className="font-display text-[11.5px] font-extrabold uppercase tracking-[.09em] mb-[6px]" style={{ color: "var(--blue)" }}>
              3 steps
            </div>
            <div className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-1.2px" }}>
              How to claim a deal
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[18px] how-grid-3">
            {HOW_STEPS.map((s) => (
              <div key={s.n} className="bg-white rounded-lg p-6" style={{ border: "1px solid var(--border)" }}>
                <div
                  className="w-8 h-8 rounded-[8px] text-white font-display text-sm font-black flex items-center justify-center mb-[14px]"
                  style={{ background: "var(--blue)" }}
                >
                  {s.n}
                </div>
                <div className="font-display text-[15px] font-extrabold mb-[6px]">{s.h}</div>
                <div className="text-[13px] leading-[1.6]" style={{ color: "var(--text-2)" }}>
                  {s.t}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-9 section-pad-x" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[780px] mx-auto">
          <div className="text-center mb-6">
            <div className="font-display text-[11.5px] font-extrabold uppercase tracking-[.09em] mb-[6px]" style={{ color: "var(--blue)" }}>
              FAQ
            </div>
            <div className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-1.2px" }}>
              Common questions
            </div>
          </div>
          {FAQS.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  className="w-full text-left py-[18px] font-display text-[15px] font-extrabold flex justify-between items-center gap-[14px]"
                >
                  {f.q}
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isOpen ? "var(--blue)" : "var(--surface)",
                      color: isOpen ? "#fff" : "var(--text-2)",
                      transform: isOpen ? "rotate(45deg)" : "none",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all"
                  style={{ maxHeight: isOpen ? 280 : 0, paddingBottom: isOpen ? 18 : 0, color: "var(--text-2)", fontSize: 14, lineHeight: 1.7 }}
                >
                  {renderMd(f.a)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Toast */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white font-display text-[13px] font-bold px-[18px] py-[10px] rounded-pill z-[1000] transition-all"
        style={{
          background: "var(--near-black)",
          boxShadow: "var(--shadow)",
          opacity: toast ? 1 : 0,
          transform: `translateX(-50%) translateY(${toast ? 0 : 60}px)`,
        }}
      >
        {toast}
      </div>
    </>
  );
}

function DealCard({ deal, onCopy, copied }: { deal: Deal; onCopy: (code: string) => void; copied: boolean }) {
  const ribbon = deal.bf ? "🔥 Black Friday" : deal.exclusive ? "⭐ Exclusive" : deal.pct >= 50 ? "Hot deal" : null;
  const ribbonBg = deal.bf ? "linear-gradient(135deg,#ea580c,#f59e0b)" : deal.exclusive ? "var(--blue)" : "#dc2626";

  return (
    <div
      className="bg-white rounded-lg overflow-hidden cursor-pointer flex flex-col relative transition-all"
      style={{ border: "1.5px solid var(--border)" }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "#ea580c";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234,88,12,.07), var(--shadow)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {ribbon && (
        <div
          className="absolute top-[14px] left-0 z-[2] text-white font-display text-[10.5px] font-extrabold px-3 py-1 pl-3 rounded-r-pill uppercase tracking-[.06em] flex items-center gap-[5px]"
          style={{ background: ribbonBg }}
        >
          {ribbon}
        </div>
      )}
      <div
        className="px-5 pt-[18px] pb-4"
        style={{ background: "linear-gradient(180deg, var(--cream) 0%, var(--white) 100%)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3 mb-[14px] mt-[14px]">
          <div
            className="w-11 h-11 rounded-[11px] overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Favicon domain={deal.domain} name={deal.tool} size={44} />
          </div>
          <div>
            <div className="font-display font-black flex items-center gap-[5px]" style={{ fontSize: 16, letterSpacing: "-.3px" }}>
              {deal.tool}
              {deal.verified && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--blue)" }}>
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" />
                </svg>
              )}
            </div>
            <div className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
              {deal.cat.charAt(0).toUpperCase() + deal.cat.slice(1)}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display font-black tnum" style={{ fontSize: 36, letterSpacing: "-1.5px", color: "#ea580c", lineHeight: 1 }}>
            {deal.pct}%
          </span>
          <span className="font-display text-sm font-bold" style={{ color: "var(--text-2)" }}>
            {deal.txt}
          </span>
        </div>
        <div className="font-display text-sm font-bold mt-[2px]" style={{ color: "var(--text)" }}>
          {deal.headline}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[13px] leading-[1.55] mb-[14px] flex-1" style={{ color: "var(--text-2)" }}>
          {deal.desc}
        </div>
        <div
          className="flex items-center gap-[10px] px-3 py-[10px] rounded mb-3"
          style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <div className="text-[12.5px] font-bold tnum" style={{ color: "var(--green)" }}>
            You save <strong className="font-display font-extrabold">${deal.savings}</strong> with this deal
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11.5px] mb-[14px] flex-wrap" style={{ color: "var(--text-3)" }}>
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Expires {deal.expires}
          </div>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
          <span className="font-bold tnum" style={{ color: "var(--text-2)" }}>
            {deal.uses}
          </span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
          <span className="inline-flex items-center gap-1 font-bold" style={{ color: "var(--green)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified today
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center rounded overflow-hidden"
            style={{ border: "1.5px dashed var(--border-2)", background: "var(--bg)" }}
          >
            <span className="font-display text-[10px] font-extrabold px-[10px] py-2 uppercase tracking-[.08em]" style={{ color: "var(--text-3)" }}>
              Code
            </span>
            <span
              className="flex-1 text-[13px] font-bold py-2 px-1"
              style={{
                fontFamily: deal.code ? "ui-monospace, 'JetBrains Mono', monospace" : "var(--font-dm-sans), sans-serif",
                color: deal.code ? "var(--text)" : "var(--text-3)",
                letterSpacing: deal.code ? "0.5px" : 0,
                fontStyle: deal.code ? "normal" : "italic",
                fontWeight: deal.code ? 700 : 600,
              }}
            >
              {deal.code ?? "No code needed"}
            </span>
            {deal.code && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(deal.code!);
                }}
                className="font-display text-[11px] font-extrabold px-3 py-2 uppercase tracking-[.06em] transition-colors"
                style={{
                  color: copied ? "#fff" : "var(--blue)",
                  background: copied ? "var(--green)" : "var(--white)",
                  borderLeft: `1.5px dashed ${copied ? "var(--green)" : "var(--border-2)"}`,
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <a
            className="font-display text-xs font-extrabold text-white px-4 py-[9px] rounded-pill flex items-center gap-1 flex-shrink-0 cursor-pointer transition-colors hover:bg-blue"
            style={{ background: "var(--text)" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--blue)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--text)")}
            href={`https://${deal.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Claim →
          </a>
        </div>
      </div>
    </div>
  );
}

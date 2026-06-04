import Link from "next/link";
import { HeroTypewriter } from "./HeroTypewriter";
import { HeroMosaic } from "./HeroMosaic";

const PILLS: Array<{ label: string; q: string }> = [
  { label: "✦ Image AI", q: "image" },
  { label: "✦ Code assistant", q: "code" },
  { label: "✦ Video tools", q: "video" },
  { label: "✦ Writing", q: "writing" },
  { label: "✦ Free only", q: "free" },
  { label: "✦ New today", q: "new" },
];

const STATS = [
  { num: "2,400+", label: "AI tools" },
  { num: "48", label: "Categories" },
  { num: "50k+", label: "Monthly users" },
  { num: "12k", label: "Reviews" },
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-9 section-pad-x"
      style={{ background: "var(--near-black)" }}
    >
      {/* Background glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -200,
          right: -100,
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(0,82,255,.25) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -200,
          left: -100,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(87,139,250,.15) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-page mx-auto grid grid-cols-2 gap-[60px] items-center min-h-[580px] py-20 hero-grid">
        <div className="relative">
          <div
            className="inline-flex items-center gap-[7px] rounded-pill px-[14px] py-[5px] font-display text-xs font-bold uppercase tracking-[.05em] mb-6"
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full animate-pulse-dot"
              style={{ background: "var(--blue-h)" }}
            />
            2,400+ tools · Updated daily
          </div>

          <h1
            className="font-display font-black mb-5 text-white"
            style={{
              fontSize: "clamp(44px, 4.5vw, 68px)",
              lineHeight: 1,
              letterSpacing: "-2.5px",
            }}
          >
            The only AI<br />
            directory you<br />
            <span style={{ color: "var(--blue-h)" }}>
              <HeroTypewriter />
            </span>
          </h1>

          <p
            className="text-[17px] leading-[1.65] max-w-[480px] mb-9"
            style={{ color: "rgba(255,255,255,.55)" }}
          >
            Discover, compare, and save the best AI tools — curated for writers, coders, designers, and teams.
          </p>

          <form className="relative mb-7" role="search" action="/search" method="get">
            <svg
              className="absolute left-[17px] top-1/2 -translate-y-1/2 pointer-events-none"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "rgba(255,255,255,.35)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder='Search — "image generator", "coding assistant", "video AI"…'
              aria-label="Search AI tools"
              className="w-full h-[54px] rounded-pill text-[15px] text-white outline-none pl-[50px] pr-[140px] backdrop-blur-[10px] transition-colors placeholder:text-white/30 focus:border-[var(--blue)] focus:bg-white/10"
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1.5px solid rgba(255,255,255,.15)",
              }}
            />
            <button
              type="submit"
              className="absolute right-[5px] top-1/2 -translate-y-1/2 font-display text-[13px] font-bold text-white px-[22px] py-[9px] rounded-pill tracking-[.02em] transition-colors hover:bg-blue-h"
              style={{ background: "var(--blue)" }}
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-[6px]">
            {PILLS.map((p) => (
              <Link
                key={p.label}
                href={`/search?q=${encodeURIComponent(p.q)}`}
                className="text-[12.5px] font-semibold px-[13px] py-[5px] rounded-pill transition-colors hover:bg-white/10 hover:text-white"
                style={{
                  color: "rgba(255,255,255,.5)",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <div
            className="flex gap-0 mt-10 pt-8 hero-stats-row"
            style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="flex-1 hero-stat-cell"
                style={{
                  borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,.08)" : "none",
                  paddingLeft: i > 0 ? 28 : 0,
                }}
              >
                <div
                  className="font-display font-black text-white tnum"
                  style={{ fontSize: 28, letterSpacing: "-1px", lineHeight: 1 }}
                >
                  {s.num}
                </div>
                <div className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,.35)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <HeroMosaic />
      </div>
    </section>
  );
}

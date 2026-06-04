"use client";
import { useState } from "react";
import Link from "next/link";

const INTENTS = [
  { key: "popular", label: "🔥 Popular", target: "#popular" },
  { key: "all", label: "📂 All Categories", target: "#all" },
  { key: "usecase", label: "🎯 By Use Case", target: "#usecase" },
  { key: "pricing", label: "💰 By Pricing", target: "#pricing" },
  { key: "az", label: "🔤 A–Z List", target: "#az" },
  { key: "toprated", label: "⭐ Top Rated", target: "/top-rated", external: true },
  { key: "new", label: "🆕 New This Week", target: "/new", external: true },
];

export function IntentBar() {
  const [active, setActive] = useState("popular");

  const onClick = (intent: (typeof INTENTS)[number]) => {
    setActive(intent.key);
    if (intent.external) return;
    const el = document.querySelector(intent.target);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div
      className="bg-white sticky z-[100] px-9 py-6 section-pad-x"
      style={{ top: 58, borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-page mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
        <div className="font-display text-[13px] font-bold flex-shrink-0" style={{ color: "var(--text-2)" }}>
          Quick browse
        </div>
        <div className="flex gap-[6px] flex-nowrap">
          {INTENTS.map((i) => {
            const isActive = active === i.key;
            const cls = `intent-pill-hover font-display text-[12.5px] font-semibold px-[14px] py-[7px] rounded-pill whitespace-nowrap flex-shrink-0 cursor-pointer ${isActive ? "active" : ""}`;
            if (i.external) {
              return (
                <Link key={i.key} href={i.target} className={cls} style={{ color: isActive ? "#fff" : "var(--text-2)" }}>
                  {i.label}
                </Link>
              );
            }
            return (
              <button
                key={i.key}
                onClick={() => onClick(i)}
                className={cls}
                style={{ color: isActive ? "#fff" : "var(--text-2)" }}
              >
                {i.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

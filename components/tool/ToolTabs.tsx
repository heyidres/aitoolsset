"use client";
import { useState } from "react";

const TABS = [
  { key: "overview", label: "Overview", target: "#overview" },
  { key: "reviews", label: "Reviews", target: "#reviews" },
  { key: "alternatives", label: "Alternatives", target: "#related-tools" },
  { key: "pricing", label: "Pricing", target: "#pricing" },
];

export function ToolTabs({ reviewCount }: { reviewCount: number }) {
  const [active, setActive] = useState("overview");
  const onClick = (k: string, t: string) => {
    setActive(k);
    const el = document.querySelector(t);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <div
      className="sticky bg-white z-[100] px-9 section-pad-x"
      style={{ top: 58, borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-page mx-auto flex gap-0 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onClick(t.key, t.target)}
              className="font-display text-[13.5px] font-bold px-[18px] py-[14px] whitespace-nowrap transition-colors"
              style={{
                color: isActive ? "var(--blue)" : "var(--text-2)",
                borderBottom: `2px solid ${isActive ? "var(--blue)" : "transparent"}`,
              }}
            >
              {t.label}
              {t.key === "reviews" && <span> ({reviewCount.toLocaleString()})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

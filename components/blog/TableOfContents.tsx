"use client";
import { useState } from "react";

const ITEMS = [
  { id: "whats-new", label: "What's new in GPT-5", sub: false },
  { id: "whats-new", label: "1M token context", sub: true },
  { id: "whats-new", label: "Native web access", sub: true },
  { id: "whats-new", label: "Extended thinking", sub: true },
  { id: "benchmarks", label: "Benchmark results", sub: false },
  { id: "use-cases", label: "Use cases", sub: false },
  { id: "pricing", label: "Pricing & access", sub: false },
  { id: "vs-claude", label: "GPT-5 vs Claude 4", sub: false },
];

export function TableOfContents() {
  const [active, setActive] = useState(0);
  const jump = (i: number, id: string) => {
    setActive(i);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <div className="flex flex-col gap-[2px]">
      {ITEMS.map((it, i) => {
        const isActive = active === i;
        return (
          <button
            key={i}
            onClick={() => jump(i, it.id)}
            className="text-left text-[13px] py-[7px] px-[10px] rounded-sm cursor-pointer leading-[1.4] transition-all"
            style={{
              color: isActive ? "var(--blue)" : "var(--text-2)",
              background: isActive ? "var(--blue-soft)" : "transparent",
              borderLeft: `2px solid ${isActive ? "var(--blue)" : "transparent"}`,
              fontWeight: isActive ? 700 : 400,
              paddingLeft: it.sub ? 24 : 10,
              fontSize: it.sub ? 12.5 : 13,
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

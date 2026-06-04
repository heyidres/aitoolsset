"use client";
import { useState } from "react";

type Item = { q: string; a: string };

function renderMd(text: string) {
  // Render simple **bold** markers as <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text)", fontWeight: 700 }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export function FaqAccordion({ items, categoryName }: { items: Item[]; categoryName: string }) {
  const [open, setOpen] = useState(0);
  return (
    <section
      id="faq"
      className="py-[72px] px-9 bg-white section-pad-x"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-[880px] mx-auto">
        <div className="text-center mb-8">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            Common questions
          </div>
          <h2 className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-1.4px", lineHeight: 1.1 }}>
            AI {categoryName.toLowerCase()} tools FAQ
          </h2>
        </div>

        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full text-left py-5 font-display text-base font-extrabold flex justify-between items-center gap-5"
                style={{ color: "var(--text)" }}
              >
                {it.q}
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isOpen ? "var(--blue)" : "var(--surface)",
                    color: isOpen ? "#fff" : "var(--text-2)",
                    transform: isOpen ? "rotate(45deg)" : "none",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              <div
                className="overflow-hidden transition-all"
                style={{
                  maxHeight: isOpen ? 400 : 0,
                  paddingBottom: isOpen ? 20 : 0,
                  color: "var(--text-2)",
                  fontSize: 14.5,
                  lineHeight: 1.7,
                }}
              >
                {renderMd(it.a)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Accordion FAQ block rendered below a blog article. The matching
 * FAQ JSON-LD is emitted server-side in the page so Google can show
 * the rich snippet on the SERP — this client component only handles
 * the open/close interaction.
 */
export function BlogFaqs({ items }: { items: Array<{ q: string; a: string }> }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
      <h2
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-.5px",
          marginBottom: 18,
          color: "var(--text)",
        }}
      >
        Frequently asked questions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((f, i) => {
          const open = openIdx === i;
          return (
            <div
              key={i}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: open ? "var(--surface)" : "#fff",
                transition: "background .15s",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 15.5,
                  fontWeight: 700,
                  letterSpacing: "-.1px",
                  color: "var(--text)",
                  lineHeight: 1.4,
                }}
              >
                <span>{f.q}</span>
                <span
                  aria-hidden
                  style={{
                    fontSize: 22,
                    color: "var(--text-3)",
                    flexShrink: 0,
                    transform: open ? "rotate(45deg)" : "none",
                    transition: "transform .15s",
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
              </button>
              {open && (
                <div
                  className="faq-answer"
                  style={{
                    padding: "0 18px 18px",
                    fontSize: 14.5,
                    color: "var(--text-2)",
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(f.a) }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

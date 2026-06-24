"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

function renderMd(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--text)", fontWeight: 700 }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function SubmitFaq() {
  const t = useTranslations("submit");
  const [open, setOpen] = useState(-1);
  // 10 question/answer pairs — keys faq_q1…faq_q10 + faq_a1…faq_a10
  const FAQS = Array.from({ length: 10 }, (_, i) => ({
    q: t(`faq_q${i + 1}`),
    a: t(`faq_a${i + 1}`),
  }));
  return (
    <section className="py-[72px] px-9 bg-white section-pad-x">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            {t("faq_eyebrow")}
          </div>
          <h2 className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            {t("faq_heading")}
          </h2>
        </div>
        <div className="flex flex-col mt-10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex items-center justify-between w-full py-5 cursor-pointer gap-4 text-left"
                >
                  <div className="font-display text-[15.5px] font-bold flex-1" style={{ color: "var(--text)" }}>
                    {f.q}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all"
                    style={{
                      background: isOpen ? "var(--blue)" : "var(--surface)",
                      border: `1px solid ${isOpen ? "var(--blue)" : "var(--border)"}`,
                      color: isOpen ? "#fff" : "var(--text-2)",
                      transform: isOpen ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </div>
                </button>
                {isOpen && (
                  <div className="text-[14.5px] leading-[1.75] pb-5" style={{ color: "var(--text-2)" }}>
                    {renderMd(f.a)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

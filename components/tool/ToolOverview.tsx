"use client";
import { useState } from "react";
import type { ToolDetail } from "@/lib/tool-detail";
import { sanitizeHtml } from "@/lib/sanitize";

function renderMd(text: string) {
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

export type ToolOverviewOverrides = {
  features?: Array<{ title: string; desc: string }>;
  /** Concrete jobs the tool helps users complete. Rendered between features and pros/cons. */
  useCases?: string[];
  pros?: string[];
  cons?: string[];
  plans?: Array<{ name: string; price: string; period: string; popular?: boolean; feats: string[] }>;
};

export function ToolOverview({
  name,
  detail,
  descriptionHtml,
  overrides,
}: {
  name: string;
  detail: ToolDetail;
  descriptionHtml?: string;
  overrides?: ToolOverviewOverrides;
}) {
  const [expanded, setExpanded] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const hasCustomDescription = !!descriptionHtml && descriptionHtml.trim().length > 0;

  // CMS mode: any override (even an empty array) signals "use CMS data, don't fall through to dummy".
  const isCms = !!overrides;
  const features = overrides?.features ?? (isCms ? [] : detail.features);
  const useCases = overrides?.useCases ?? [];
  const pros = overrides?.pros ?? (isCms ? [] : detail.pros);
  const cons = overrides?.cons ?? (isCms ? [] : detail.cons);
  const plans = overrides?.plans ?? (isCms ? [] : detail.plans);

  return (
    <div id="overview">
      {/* What is */}
      <section className="py-9" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2
          className="font-display font-extrabold pb-[10px] mb-[14px]"
          style={{ fontSize: 20, letterSpacing: "-.4px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}
        >
          What is {name}?
        </h2>
        <div className="flex items-center gap-[6px] mb-[14px] text-[12.5px]" style={{ color: "var(--text-3)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Content last verified <strong style={{ color: "var(--text-2)", fontWeight: 600 }}>May 4, 2026</strong> by the AI Tools Set Research Team
        </div>

        {hasCustomDescription ? (
          // Editor-supplied HTML — rendered via the .tool-prose class for styling
          <div
            className="tool-prose"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(descriptionHtml) }}
          />
        ) : (
          <div className="text-[15px] leading-[1.8] break-words" style={{ color: "var(--text-2)" }}>
            {detail.whatIs.map((b, i) => (
              <p key={i} className="mb-[14px]">
                {renderMd(b.p)}
              </p>
            ))}
            {expanded && (
              <p className="mb-[14px]">
                {name}'s <strong style={{ color: "var(--text)", fontWeight: 700 }}>Custom Instructions</strong> feature lets you personalize how the AI responds — set context about yourself and how you want it to behave, making every interaction more relevant. GPTs (custom AI agents) let you build or use specialized versions of {name} for specific tasks: coding helpers, research assistants, creative writing companions, and more.
              </p>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="font-display text-[13.5px] font-bold inline-flex items-center gap-[5px] cursor-pointer mt-3"
              style={{ color: "var(--blue)" }}
            >
              {expanded ? "Show less ↑" : "Read more ↓"}
            </button>
          </div>
        )}
      </section>

      {/* Features */}
      {features.length > 0 && (
      <section className="py-9" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2
          className="font-display font-extrabold pb-[10px] mb-[14px]"
          style={{ fontSize: 20, letterSpacing: "-.4px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}
        >
          Key Features
        </h2>
        <div className="flex flex-col gap-[10px] my-3 min-w-0">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-[10px] text-[14.5px] leading-[1.55]" style={{ color: "var(--text-2)" }}>
              <div
                className="w-5 h-5 rounded-[5px] flex items-center justify-center flex-shrink-0 mt-[2px]"
                style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.15)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--blue)" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <strong style={{ color: "var(--text)", fontWeight: 700 }}>{f.title}</strong> — {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Use cases — concrete jobs the tool helps users complete */}
      {useCases.length > 0 && (
      <section className="py-9" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2
          className="font-display font-extrabold pb-[10px] mb-[14px]"
          style={{ fontSize: 20, letterSpacing: "-.4px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}
        >
          What you can do with {name}
        </h2>
        <ul className="flex flex-col gap-[10px] my-3 min-w-0 list-none pl-0">
          {useCases.map((uc) => (
            <li
              key={uc}
              className="flex items-start gap-[10px] text-[14.5px] leading-[1.55]"
              style={{ color: "var(--text-2)" }}
            >
              <div
                className="w-5 h-5 rounded-[5px] flex items-center justify-center flex-shrink-0 mt-[2px]"
                style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>{uc}</span>
            </li>
          ))}
        </ul>
      </section>
      )}

      {/* Pros & Cons */}
      {(pros.length > 0 || cons.length > 0) && (
      <section className="py-9" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2
          className="font-display font-extrabold pb-[10px] mb-[14px]"
          style={{ fontSize: 20, letterSpacing: "-.4px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}
        >
          Pros &amp; Cons
        </h2>
        <div className="grid grid-cols-2 gap-5 my-3 min-w-0 pc-grid-2">
          <div>
            <div className="font-display text-[13.5px] font-extrabold mb-[10px] flex items-center gap-[6px]" style={{ color: "var(--green)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Pros
            </div>
            <div className="flex flex-col gap-2">
              {pros.map((p) => (
                <div key={p} className="flex items-start gap-2 text-[13.5px] leading-[1.5]" style={{ color: "var(--text-2)" }}>
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-[2px]"
                    style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)" }}
                  >
                    ✓
                  </div>
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-display text-[13.5px] font-extrabold mb-[10px] flex items-center gap-[6px]" style={{ color: "#ef4444" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Cons
            </div>
            <div className="flex flex-col gap-2">
              {cons.map((c) => (
                <div key={c} className="flex items-start gap-2 text-[13.5px] leading-[1.5]" style={{ color: "var(--text-2)" }}>
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-[2px]"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444" }}
                  >
                    ✗
                  </div>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Pricing */}
      {plans.length > 0 && (
      <section id="pricing" className="py-9" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2
          className="font-display font-extrabold pb-[10px] mb-[14px]"
          style={{ fontSize: 20, letterSpacing: "-.4px", color: "var(--text)", borderBottom: "1px solid var(--border)" }}
        >
          Pricing
        </h2>
        <div className="flex gap-[6px] mb-4">
          {(["monthly", "annual"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className="font-display text-[13px] font-bold px-[14px] py-[6px] rounded-pill cursor-pointer transition-colors"
              style={{
                background: billing === b ? "var(--blue)" : "var(--white)",
                color: billing === b ? "#fff" : "var(--text)",
                border: `1.5px solid ${billing === b ? "var(--blue)" : "var(--border)"}`,
              }}
            >
              {b === "monthly" ? "Monthly" : "Annual (save 20%)"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-[10px] min-w-0 plans-grid-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className="rounded p-[18px]"
              style={{
                background: p.popular ? "var(--blue-soft)" : "var(--white)",
                border: `1.5px solid ${p.popular ? "rgba(0,82,255,.25)" : "var(--border)"}`,
              }}
            >
              {p.popular && (
                <div
                  className="text-[10px] font-extrabold uppercase tracking-[.06em] mb-[6px]"
                  style={{ color: "var(--blue)" }}
                >
                  Most popular
                </div>
              )}
              <div className="font-display text-[15px] font-extrabold mb-1">{p.name}</div>
              <div className="font-display font-black mb-3 tnum" style={{ fontSize: 24, letterSpacing: "-.5px", color: "var(--text)" }}>
                {p.price} <span className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>{p.period}</span>
              </div>
              <div className="flex flex-col gap-[6px]">
                {p.feats.map((f) => (
                  <div key={f} className="text-[12.5px] flex items-start gap-[5px] leading-[1.4]" style={{ color: "var(--text-2)" }}>
                    <span className="font-extrabold text-xs flex-shrink-0" style={{ color: "var(--green)" }}>
                      ✓
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}

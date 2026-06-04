"use client";
import { useState } from "react";
import type { Tool } from "@/lib/tools";
import { favicon } from "@/lib/tools";

export function EmbedSection({ tool }: { tool: Tool }) {
  const [copied, setCopied] = useState(false);

  const code = `<a href="https://aitoolsset.com/tools/${tool.id}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #e8e8e4;border-radius:10px;padding:8px 14px;font-family:sans-serif;text-decoration:none;"><img src="https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32" style="width:20px;height:20px;border-radius:5px;"/><span style="font-size:11px;color:#9aa0ae;display:block;line-height:1;">Featured on</span><span style="font-size:13px;font-weight:700;color:#0a0b0d;">AI Tools Set</span></a>`;

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="px-9 py-12 section-pad-x" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-page mx-auto">
        <div
          className="rounded-lg p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #0052ff 60%, #578bfa 100%)" }}
        >
          <div
            className="absolute pointer-events-none rounded-full"
            style={{ top: -40, right: -40, width: 200, height: 200, background: "rgba(255,255,255,.06)" }}
          />
          <div className="font-display text-base font-extrabold text-white mb-[18px] relative">
            Promote {tool.name} on your site
          </div>
          <div className="flex items-center gap-3 flex-wrap min-w-0 relative">
            <button
              onClick={copy}
              className="rounded-[10px] px-4 py-[10px] flex items-center gap-[10px] cursor-pointer transition-colors hover:bg-white/20"
              style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}
            >
              <div
                className="w-7 h-7 rounded-[7px] overflow-hidden flex items-center justify-center"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <img src={favicon(tool.domain, 64)} alt={tool.name} className="w-7 h-7 object-cover" />
              </div>
              <div className="leading-tight text-left">
                <div className="text-[10px] font-semibold uppercase tracking-[.05em]" style={{ color: "rgba(255,255,255,.65)" }}>
                  Featured on
                </div>
                <div className="font-display text-[13px] font-extrabold text-white">AI Tools Set</div>
              </div>
              <div className="w-px h-[30px] mx-2" style={{ background: "rgba(255,255,255,.2)" }} />
              <div className="text-[11px] flex items-center gap-1 tnum" style={{ color: "rgba(255,255,255,.6)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {tool.saves.toLocaleString()}
              </div>
            </button>
            <div className="w-px h-9" style={{ background: "rgba(255,255,255,.2)" }} />
            <button
              onClick={copy}
              className="font-display text-[13px] font-bold px-[14px] py-2 rounded-[8px] flex items-center gap-[6px] cursor-pointer transition-colors hover:bg-white/15"
              style={{ color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.2)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy Embed Code"}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs" style={{ color: "rgba(255,255,255,.5)" }}>
                Share
              </span>
              {["x", "facebook", "linkedin"].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/20"
                  style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)" }}
                  title={s}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    {s === "x" && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25z" />}
                    {s === "facebook" && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                    {s === "linkedin" && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

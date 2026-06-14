"use client";
import { useState } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { favicon } from "@/lib/tools";
import type { ToolDetail } from "@/lib/tool-detail";
import { useSaved } from "@/lib/storage";

const SOCIAL_SVGS: Record<string, React.ReactNode> = {
  x: (
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  ),
  linkedin: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  ),
  github: (
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  ),
  youtube: (
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  ),
};

export type ToolHeaderOverrides = {
  tagline?: string;
  badges?: string[];
  socials?: Array<{ kind: string; url: string }>;
  weeklyUsers?: string | null;
  startingPrice?: string | null;
  launched?: string | null;
  madeBy?: string | null;
  /** Exact website URL — falls back to `https://{tool.domain}` */
  websiteUrl?: string | null;
  /** SEO rel attribute for the "Visit website" CTA. */
  linkRel?: "dofollow" | "nofollow" | "sponsored" | "ugc" | null;
};

/**
 * Build the `rel` attribute for the public website CTA.
 * Always keeps `noopener noreferrer` for security (we open in a new tab).
 * The SEO directive ('dofollow' adds nothing, the others append their keyword).
 */
function buildLinkRel(kind: ToolHeaderOverrides["linkRel"]): string {
  const security = "noopener noreferrer";
  switch (kind) {
    case "nofollow":
      return `nofollow ${security}`;
    case "sponsored":
      return `sponsored ${security}`;
    case "ugc":
      return `ugc ${security}`;
    case "dofollow":
    default:
      return security;
  }
}

export function ToolHeader({
  tool,
  detail,
  overrides,
}: {
  tool: Tool;
  detail: ToolDetail;
  overrides?: ToolHeaderOverrides;
}) {
  const { saved, toggle } = useSaved(tool.id);
  const [copied, setCopied] = useState(false);

  // For CMS-managed tools we use the overrides. For hardcoded seed tools
  // (where overrides is absent) we keep the original ToolDetail dummy data.
  const isCms = !!overrides;
  const tagline = overrides?.tagline ?? detail.tagline;
  const badges = overrides?.badges ?? (isCms ? [] : detail.badges);
  const socials = overrides?.socials ?? (isCms ? [] : detail.socials);
  const weeklyUsers = overrides?.weeklyUsers !== undefined ? overrides.weeklyUsers : (isCms ? null : detail.weeklyUsers);
  const startingPrice = overrides?.startingPrice !== undefined ? overrides.startingPrice : (isCms ? null : detail.startingPrice);
  const launched = overrides?.launched !== undefined ? overrides.launched : (isCms ? null : detail.launched);
  const madeBy = overrides?.madeBy !== undefined ? overrides.madeBy : (isCms ? null : detail.madeBy);

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="bg-white px-9 pt-8 pb-0 overflow-hidden section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-page mx-auto">
        <div className="flex items-start gap-[18px] mb-5 flex-wrap min-w-0">
          <div
            className="w-[68px] h-[68px] rounded-[15px] overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <img
              src={favicon(tool.domain, 128)}
              alt={`${tool.name} logo`}
              width={68}
              height={68}
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-display font-black mb-1 flex items-center gap-[7px]" style={{ fontSize: 30, letterSpacing: "-1px" }}>
              {tool.name}
              {tool.verified && (
                <span className="group/v inline-flex items-center justify-center w-[26px] h-[26px] cursor-pointer relative">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" fill="#1D9BF0" />
                    <path d="M9 12l2 2.5 4.5-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 text-white text-xs font-medium px-[11px] py-[7px] rounded-lg w-[220px] pointer-events-none opacity-0 group-hover/v:opacity-100 transition-opacity z-50 shadow-lg"
                    style={{ background: "var(--near-black)" }}
                  >
                    This tool's features and capabilities have been verified by our Research Team.
                  </span>
                </span>
              )}
            </div>
            <div className="text-[15px] mb-[10px]" style={{ color: "var(--text-2)" }}>
              {tagline}
            </div>
            {badges.length > 0 && (
              <div className="flex items-center gap-[7px] flex-wrap mb-3">
                {badges.map((b, i) =>
                  // Index 0 = pricing pill (Free / Free tier available / Paid) — non-clickable status badge.
                  // Index 1+ = tags — clickable links to search results for that tag.
                  i === 0 ? (
                    <span
                      key={b}
                      className="text-[11.5px] font-bold px-[10px] py-1 rounded-pill"
                      style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
                    >
                      {b}
                    </span>
                  ) : (
                    <Link
                      key={b}
                      href={`/search?q=${encodeURIComponent(b)}`}
                      className="text-[11.5px] font-bold px-[10px] py-1 rounded-pill transition-colors hover:border-blue hover:text-blue"
                      style={{ color: "var(--text-2)", background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      {b}
                    </Link>
                  )
                )}
              </div>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-[6px]">
                {socials.map((s) => (
                  <a
                    key={s.kind}
                    href={s.url}
                    target="_blank"
                    rel="nofollow noopener"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-sm transition-colors hover:bg-near-black hover:text-white"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                    title={s.kind}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      {SOCIAL_SVGS[s.kind]}
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0 items-start flex-wrap">
            <a
              href={overrides?.websiteUrl || `https://${tool.domain}`}
              target="_blank"
              rel={buildLinkRel(overrides?.linkRel ?? "nofollow")}
              className="font-display text-[14.5px] font-bold text-white px-[26px] py-[11px] rounded-pill flex items-center gap-[7px] whitespace-nowrap transition-colors hover:bg-blue-h"
              style={{ background: "var(--blue)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Visit {tool.name}
            </a>
            <button
              onClick={toggle}
              className="font-display text-sm font-bold px-5 py-[11px] rounded-pill flex items-center gap-[6px] transition-colors"
              style={{
                background: saved ? "#fef2f2" : "var(--surface)",
                color: saved ? "#ef4444" : "var(--text)",
              }}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={copyLink}
              className="w-[42px] h-[42px] rounded-pill flex items-center justify-center transition-colors"
              style={{ background: "var(--surface)", color: "var(--text-2)" }}
              aria-label="Share"
              title="Share"
            >
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {(() => {
          type Cell = { val: React.ReactNode; label: string };
          const raw: Array<Cell | null> = [
            isCms
              ? null
              : { val: <><span style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1 }}>★★★★★</span> 4.8</>, label: `${tool.saves.toLocaleString()} reviews` },
            { val: tool.saves.toLocaleString(), label: "Saves" },
            weeklyUsers ? { val: weeklyUsers, label: "Weekly users" } : null,
            startingPrice ? { val: <span style={{ color: "var(--green)" }}>{startingPrice}</span>, label: "Starting price" } : null,
            launched ? { val: launched, label: "Launched" } : null,
            madeBy ? { val: madeBy, label: "Made by" } : null,
          ];
          const cells = raw.filter((c): c is Cell => c !== null);

          if (cells.length === 0) return null;

          return (
            <div className="flex mt-5 overflow-x-auto no-scrollbar" style={{ borderTop: "1px solid var(--border)" }}>
              {cells.map((s, i) => (
                <div
                  key={i}
                  className="pt-[14px] flex-shrink-0"
                  style={{
                    paddingLeft: i === 0 ? 0 : 22,
                    paddingRight: 22,
                    borderRight: i < cells.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div className="font-display font-extrabold text-[17px] tracking-[-.3px] flex items-center gap-[5px] mb-[3px] tnum">
                    {s.val}
                  </div>
                  <div className="text-[11.5px] pb-[14px]" style={{ color: "var(--text-3)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </section>
  );
}

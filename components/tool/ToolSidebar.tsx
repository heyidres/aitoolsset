import Link from "next/link";
import { Favicon } from "../Favicon";
import type { Tool } from "@/lib/tools";
import type { ToolDetail } from "@/lib/tool-detail";

export type ToolSidebarOverrides = {
  /** Full replacement for the Quick Info row list. */
  quickInfo?: Array<{ label: string; val: string; cls?: "green" | "blue" }>;
  /** Override for the tag pills shown in the Tags card. */
  tags?: string[];
  /** Exact website URL — falls back to `https://{tool.domain}` */
  websiteUrl?: string | null;
  /** SEO rel attribute for the Quick-Info website link. */
  linkRel?: "dofollow" | "nofollow" | "sponsored" | "ugc" | null;
};

function buildLinkRel(kind: ToolSidebarOverrides["linkRel"]): string {
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

export function ToolSidebar({
  tool,
  detail,
  overrides,
}: {
  tool: Tool;
  detail: ToolDetail;
  overrides?: ToolSidebarOverrides;
}) {
  const quickInfo = overrides?.quickInfo ?? detail.quickInfo;
  const tags = overrides?.tags ?? detail.tags;
  return (
    <aside className="flex flex-col gap-4 sticky min-w-0 w-full tool-sidebar" style={{ top: 110 }}>
      {/* Quick Info */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-[18px] py-[14px] font-display text-[13.5px] font-extrabold" style={{ borderBottom: "1px solid var(--border)" }}>
          Quick Info
        </div>
        <div className="px-[18px] py-4">
          {quickInfo.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2 text-[13px]"
              style={{ borderBottom: i < quickInfo.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <span className="font-medium" style={{ color: "var(--text-3)" }}>
                {row.label}
              </span>
              <span
                className="font-bold"
                style={{
                  color:
                    row.cls === "green" ? "var(--green)" : row.cls === "blue" ? "var(--blue)" : "var(--text)",
                }}
              >
                {row.val}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 text-[13px]">
            <span className="font-medium" style={{ color: "var(--text-3)" }}>
              Website
            </span>
            <a
              href={overrides?.websiteUrl || `https://${tool.domain}`}
              target="_blank"
              rel={buildLinkRel(overrides?.linkRel ?? "nofollow")}
              className="font-bold"
              style={{ color: "var(--blue)" }}
            >
              {tool.domain} ↗
            </a>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-[18px] py-[14px] font-display text-[13.5px] font-extrabold" style={{ borderBottom: "1px solid var(--border)" }}>
          Top Alternatives
        </div>
        <div className="px-[18px] py-[10px]">
          {detail.alternatives.map((alt, i) => (
            <Link
              key={alt.name}
              href={`/ai-tool/${alt.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group flex items-center gap-[10px] py-[9px] cursor-pointer"
              style={{ borderBottom: i < detail.alternatives.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div
                className="w-8 h-8 rounded-[7px] overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <Favicon domain={alt.domain} name={alt.name} size={32} />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[13px] font-bold transition-colors group-hover:text-blue">{alt.name}</div>
                <div className="text-[11px]" style={{ color: "var(--text-3)" }}>
                  {alt.cat}
                </div>
              </div>
              {alt.free && (
                <span
                  className="text-[10.5px] font-bold px-[7px] py-[2px] rounded-pill ml-auto flex-shrink-0"
                  style={{
                    color: "var(--green)",
                    background: "var(--green-bg)",
                    border: "1px solid var(--green-border)",
                  }}
                >
                  Free
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-[18px] py-[14px] font-display text-[13.5px] font-extrabold" style={{ borderBottom: "1px solid var(--border)" }}>
          Tags
        </div>
        <div className="px-[18px] py-4">
          <div className="flex flex-wrap gap-[6px]">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(t)}`}
                className="text-[11.5px] font-semibold px-[10px] py-1 rounded-pill cursor-pointer transition-colors hover:border-blue hover:text-blue"
                style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-lg p-[18px]" style={{ background: "var(--near-black)" }}>
        <div className="font-display text-[14px] font-extrabold text-white mb-[5px]">New AI tools, weekly.</div>
        <div className="text-xs leading-[1.55] mb-3" style={{ color: "rgba(255,255,255,.4)" }}>
          Best new tools every Tuesday. No spam, ever.
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          aria-label="Email"
          className="w-full h-[38px] rounded-pill text-[13px] text-white px-[14px] outline-none mb-2 placeholder:text-white/25"
          style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}
        />
        <button
          className="w-full font-display text-[13px] font-bold text-white rounded-pill h-9 transition-colors hover:bg-blue-h"
          style={{ background: "var(--blue)" }}
        >
          Subscribe →
        </button>
      </div>
    </aside>
  );
}

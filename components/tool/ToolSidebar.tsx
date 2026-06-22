import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Favicon } from "../Favicon";
import type { Tool } from "@/lib/tools";
import type { ToolDetail } from "@/lib/tool-detail";

/**
 * Translates well-known English-built quickInfo labels into the active locale.
 * The builder functions in app/[locale]/ai-tool/[slug]/page.tsx produce
 * hardcoded English labels — this dictionary maps them at render time
 * without needing to thread the translator down through the build chain.
 */
const SIDEBAR_LABEL_KEYS: Record<string, string> = {
  "Made by":         "sidebar_made_by",
  "Pricing":         "sidebar_pricing",
  "Starts at":       "sidebar_starts_at",
  "Launched":        "sidebar_launched",
  "Weekly users":    "sidebar_weekly_users",
  "API":             "sidebar_api",
  "Mobile app":      "sidebar_mobile_app",
  "Browser ext.":    "sidebar_browser_ext",
  "Platforms":       "sidebar_platforms",
  "Integrations":    "sidebar_integrations",
  "Last updated":    "sidebar_last_updated",
};
const SIDEBAR_VALUE_KEYS: Record<string, string> = {
  "Available":     "sidebar_api_available",
  "Not available": "sidebar_api_not_available",
  "Yes":           "sidebar_yes",
  "No":            "sidebar_no",
  "Free":          "pricing_free",
  "Free + Paid":   "pricing_freemium",
  "Paid":          "pricing_paid",
  "Free Trial":    "pricing_trial",
  "Pay-per-use":   "pricing_credit",
  "Enterprise":    "pricing_enterprise",
};

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

export async function ToolSidebar({
  tool,
  detail,
  overrides,
}: {
  tool: Tool;
  detail: ToolDetail;
  overrides?: ToolSidebarOverrides;
}) {
  const t = await getTranslations("tool_page");
  const tc = await getTranslations("tool_card");
  const quickInfoRaw = overrides?.quickInfo ?? detail.quickInfo;
  // Apply label + value translation via the known-key dictionary.
  const quickInfo = quickInfoRaw.map((row) => ({
    ...row,
    label: SIDEBAR_LABEL_KEYS[row.label] ? t(SIDEBAR_LABEL_KEYS[row.label]) : row.label,
    val:   SIDEBAR_VALUE_KEYS[row.val]   ? t(SIDEBAR_VALUE_KEYS[row.val])   : row.val,
  }));
  const tags = overrides?.tags ?? detail.tags;
  return (
    <aside className="flex flex-col gap-4 sticky min-w-0 w-full tool-sidebar" style={{ top: 110 }}>
      {/* Quick Info */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-[18px] py-[14px] font-display text-[13.5px] font-extrabold" style={{ borderBottom: "1px solid var(--border)" }}>
          {t("sidebar_quick_info")}
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
              {t("sidebar_website")}
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
          {t("sidebar_top_alternatives")}
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
                  {tc("free")}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-[18px] py-[14px] font-display text-[13.5px] font-extrabold" style={{ borderBottom: "1px solid var(--border)" }}>
          {t("sidebar_tags")}
        </div>
        <div className="px-[18px] py-4">
          <div className="flex flex-wrap gap-[6px]">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-[11.5px] font-semibold px-[10px] py-1 rounded-pill cursor-pointer transition-colors hover:border-blue hover:text-blue"
                style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-lg p-[18px]" style={{ background: "var(--near-black)" }}>
        <div className="font-display text-[14px] font-extrabold text-white mb-[5px]">{t("sidebar_newsletter_title")}</div>
        <div className="text-xs leading-[1.55] mb-3" style={{ color: "rgba(255,255,255,.4)" }}>
          {t("sidebar_newsletter_sub")}
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
          {t("sidebar_subscribe")} →
        </button>
      </div>
    </aside>
  );
}

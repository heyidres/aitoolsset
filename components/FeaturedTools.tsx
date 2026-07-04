"use client";
import { useMemo, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { TOOLS, FILTER_PILLS, type Tool } from "@/lib/tools";
import { ToolCard } from "./ToolCard";

export function FeaturedTools({ toolsOverride }: { toolsOverride?: Tool[] } = {}) {
  const t = useTranslations("home");
  // Server-side merged list (DB + hardcoded) when provided;
  // empty CMS keeps the seed catalogue working out of the box.
  const TOOLS_DATA = toolsOverride && toolsOverride.length > 0 ? toolsOverride : TOOLS;
  const [filter, setFilter] = useState("all");

  // Translate filter pill labels — map FILTER_PILLS.key → message key.
  // Falls back to the original label if a key isn't found.
  const translateFilter = (key: string, fallback: string) => {
    try { return t(`filter_${key}`); } catch { return fallback; }
  };

  const tools = useMemo(() => {
    return TOOLS_DATA.filter((t) => {
      if (filter === "all") return t.featured;
      if (filter === "free") return t.free;
      return t.cat === filter || t.tags.map((x) => x.toLowerCase()).includes(filter);
    }).slice(0, 9);
  }, [filter, TOOLS_DATA]);

  return (
    <>
      {/* Sticky filter bar */}
      <div
        className="sticky z-[100] bg-white"
        style={{ top: 58, borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-page mx-auto px-9 flex items-center gap-[6px] overflow-x-auto no-scrollbar section-pad-x" style={{ height: 52 }}>
          {FILTER_PILLS.map((p) => {
            const active = filter === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setFilter(p.key)}
                className="font-display text-[13px] font-semibold px-4 py-[6px] rounded-pill whitespace-nowrap flex-shrink-0 transition-colors"
                style={{
                  background: active ? "var(--blue)" : "var(--white)",
                  color: active ? "#fff" : "var(--text-2)",
                  border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
                }}
              >
                {translateFilter(p.key, p.label)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured grid */}
      <div className="bg-white">
        <div className="max-w-page mx-auto px-9 section-pad-x">
          <section className="py-16" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
              <div>
                <div className="eyebrow mb-[6px]">{t("featured_eyebrow")}</div>
                <h2
                  className="font-display font-extrabold tracking-[-.8px] leading-[1.1]"
                  style={{ fontSize: 28 }}
                >
                  {t("featured_heading")}
                </h2>
              </div>
              <Link
                href="/ai-tools"
                className="text-[13.5px] font-semibold transition-colors flex items-center gap-1"
                style={{ color: "var(--blue)" }}
              >
                {t("featured_browse_all", { count: "590" })} →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 tool-grid-3">
              {tools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

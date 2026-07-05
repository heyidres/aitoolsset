"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolCard } from "../ToolCard";
import { type DetailTool } from "@/lib/category-detail";
import type { Tool } from "@/lib/tools";
import type { FacetCount, PricingCount, TopTool } from "@/lib/category-stats";

/**
 * Adapt a DetailTool to the legacy Tool shape so the category grid
 * renders the SAME <ToolCard> as the homepage (save/vote/share, tags,
 * ♥ count) and links through to /ai-tool/[slug].
 */
function detailToTool(dt: DetailTool): Tool {
  return {
    id: dt.slug ?? dt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: dt.name,
    domain: dt.by,
    cat: dt.sub,
    tags: dt.tags,
    desc: dt.desc,
    saves: dt.saves ?? 0,
    free: dt.price === "Free" || dt.price === "Freemium",
    trending: false,
    featured: false,
    trendPct: null,
    link: dt.slug ? `/ai-tool/${dt.slug}` : "#",
    verified: dt.verified,
    deal: null,
  };
}

export function CategoryBrowser({
  categoryName,
  toolsOverride,
  subFacets,
  popularTags,
  pricingCounts,
  topTool,
}: {
  categoryName: string;
  toolsOverride?: DetailTool[];
  /** Tag-based facets derived from the real category tools. */
  subFacets: FacetCount[];
  popularTags: string[];
  pricingCounts: PricingCount[];
  /** Highest-ranked real tool in the category (editor's pick). */
  topTool: TopTool | null;
}) {
  // Tools come from the server page (real CMS rows). No hardcoded
  // sample fallback — an empty category shows the empty state.
  const t = useTranslations("category_page");
  const TOOLS_DATA = toolsOverride ?? [];
  const [pricing, setPricing] = useState<Set<string>>(new Set());
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [rating, setRating] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (val: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };

  const togglePricing = toggleSet(setPricing);
  const toggleSub = toggleSet(setSubs);
  const toggleTag = toggleSet(setTags);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TOOLS_DATA.filter((t) => {
      if (pricing.size && !pricing.has(t.price)) return false;
      // Sub-category + tag facets both match against the tool's tags.
      const facetSel = new Set<string>([...subs, ...tags]);
      if (facetSel.size && !t.tags.some((tag) => facetSel.has(tag))) return false;
      if (rating != null && t.rating < rating) return false;
      if (q && !(t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [pricing, subs, tags, rating, query, TOOLS_DATA]);

  const chips: { group: string; value: string; label: string }[] = [];
  pricing.forEach((p) => chips.push({ group: "pricing", value: p, label: p }));
  subs.forEach((s) => chips.push({ group: "sub", value: s, label: s }));
  tags.forEach((tg) => chips.push({ group: "tag", value: tg, label: tg }));
  if (rating != null) chips.push({ group: "rating", value: String(rating), label: `${rating}★ & up` });

  const removeChip = (group: string, val: string) => {
    if (group === "pricing") togglePricing(val);
    if (group === "sub") toggleSub(val);
    if (group === "tag") toggleTag(val);
    if (group === "rating") setRating(null);
  };

  return (
    <div className="px-9 pt-10 pb-20 section-pad-x">
      <div className="max-w-[1320px] mx-auto grid grid-cols-[260px_1fr] gap-9 items-start cat-detail-grid">
        {/* SIDEBAR */}
        <aside
          className="sticky bg-white rounded-lg p-[6px] cat-detail-side"
          style={{
            top: 74,
            border: "1px solid var(--border)",
            maxHeight: "calc(100vh - 90px)",
            overflowY: "auto",
          }}
        >
          <div className="p-[18px]">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--text-3)" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`${t("browser_search_placeholder", { name: categoryName })}…`}
                  aria-label={t("browser_search_placeholder", { name: categoryName })}
                  className="w-full h-[38px] rounded text-[13.5px] outline-none pl-9 pr-[14px] transition-colors focus:border-[var(--blue)] focus:bg-white"
                  style={{
                    background: "var(--surface)",
                    border: "1.5px solid transparent",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>

            {/* Pricing */}
            {pricingCounts.length > 0 && (
              <FilterSection
                title={t("browser_filter_pricing")}
                onClear={() => setPricing(new Set())}
                showClear={pricing.size > 0}
              >
                {pricingCounts.map((p) => (
                  <CheckRow
                    key={p.value}
                    checked={pricing.has(p.value)}
                    onToggle={() => togglePricing(p.value)}
                    label={p.value}
                    count={p.count}
                  />
                ))}
              </FilterSection>
            )}

            {/* Sub-category (real tag facets) */}
            {subFacets.length > 0 && (
              <FilterSection title={t("browser_filter_subcategory")}>
                {subFacets.map((s) => (
                  <CheckRow
                    key={s.key}
                    checked={subs.has(s.key)}
                    onToggle={() => toggleSub(s.key)}
                    label={s.label}
                    count={s.count}
                  />
                ))}
              </FilterSection>
            )}

            {/* Rating */}
            <FilterSection title={t("browser_filter_min_rating")}>
              <div className="flex gap-1 flex-wrap">
                {[4.5, 4.0, 3.5].map((r) => {
                  const active = rating === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRating(active ? null : r)}
                      className="font-display text-[11.5px] font-bold px-[9px] py-[5px] rounded-pill flex items-center gap-[3px] transition-colors"
                      style={{
                        background: active ? "var(--blue)" : "var(--surface)",
                        color: active ? "#fff" : "var(--text-2)",
                        border: "1.5px solid transparent",
                      }}
                    >
                      <span style={{ color: active ? "#fff" : "#fbbf24" }}>★</span>
                      {r}+
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* Tags (real, from the category's tools) */}
            {popularTags.length > 0 && (
              <div>
                <div className="font-display text-[11.5px] font-extrabold uppercase tracking-[.08em] mb-3" style={{ color: "var(--text-3)" }}>
                  {t("browser_filter_popular_tags")}
                </div>
                <div className="flex gap-[5px] flex-wrap">
                  {popularTags.map((tg) => {
                    const active = tags.has(tg);
                    return (
                      <button
                        key={tg}
                        onClick={() => toggleTag(tg)}
                        className="font-display text-[11.5px] font-semibold px-[10px] py-[4px] rounded-pill cursor-pointer transition-colors"
                        style={{
                          background: active ? "var(--blue)" : "var(--surface)",
                          color: active ? "#fff" : "var(--text-2)",
                          border: `1px solid ${active ? "var(--blue)" : "transparent"}`,
                        }}
                      >
                        {tg}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0">
          {/* TOPBAR */}
          <div className="flex items-center justify-between gap-4 mb-[18px] flex-wrap">
            <div className="flex items-center gap-[14px] flex-wrap">
              <div className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>
                {t.rich("browser_showing", {
                  n: filtered.length,
                  total: TOOLS_DATA.length,
                })}
              </div>
              <div className="flex gap-[6px] flex-wrap">
                {chips.map((c) => (
                  <span
                    key={`${c.group}-${c.value}`}
                    className="inline-flex items-center gap-[5px] font-display text-[11.5px] font-bold pl-[11px] pr-[6px] py-1 rounded-pill"
                    style={{ background: "var(--blue-soft)", color: "var(--blue)" }}
                  >
                    {c.label}
                    <button
                      onClick={() => removeChip(c.group, c.value)}
                      className="flex items-center justify-center w-4 h-4 rounded-full transition-colors hover:bg-blue hover:text-white"
                      style={{ background: "rgba(0,82,255,.18)", color: "var(--blue)" }}
                      aria-label={`Remove ${c.label}`}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <button
                className="flex items-center gap-[6px] font-display text-[13px] font-bold px-[14px] py-[7px] rounded-pill transition-colors hover:border-text"
                style={{
                  color: "var(--text)",
                  background: "var(--white)",
                  border: "1.5px solid var(--border)",
                }}
              >
                {t("browser_sort_editors_pick")}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="flex p-[3px] rounded-pill" style={{ background: "var(--surface)" }}>
                <button
                  onClick={() => setView("grid")}
                  className="w-[30px] h-7 rounded-pill flex items-center justify-center transition-all"
                  style={{
                    background: view === "grid" ? "var(--white)" : "transparent",
                    color: view === "grid" ? "var(--text)" : "var(--text-3)",
                    boxShadow: view === "grid" ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                  }}
                  aria-label="Grid view"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setView("list")}
                  className="w-[30px] h-7 rounded-pill flex items-center justify-center transition-all"
                  style={{
                    background: view === "list" ? "var(--white)" : "transparent",
                    color: view === "list" ? "var(--text)" : "var(--text-3)",
                    boxShadow: view === "list" ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                  }}
                  aria-label="List view"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <circle cx="4" cy="6" r="1" />
                    <circle cx="4" cy="12" r="1" />
                    <circle cx="4" cy="18" r="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Editor's Pick — the real #1 tool in this category */}
          {topTool && (
            <a
              href={`/ai-tool/${topTool.slug}`}
              id="editors-pick"
              className="rounded-lg p-6 text-white mb-6 grid grid-cols-[1fr_280px] gap-6 overflow-hidden relative editors-pick-grid cursor-pointer"
              style={{ background: "linear-gradient(120deg, #0f172a, #1e293b)" }}
            >
              <div
                className="absolute pointer-events-none"
                style={{
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  background: "radial-gradient(circle, rgba(0,82,255,.22) 0%, transparent 60%)",
                }}
              />
              <div>
                <div
                  className="inline-flex items-center gap-[5px] font-display text-[10.5px] font-extrabold uppercase tracking-[.08em] px-[10px] py-1 rounded-pill mb-[14px] relative"
                  style={{ background: "rgba(0,82,255,.18)", color: "var(--blue-h)" }}
                >
                  ⭐ Editor&apos;s pick · #1 {categoryName} AI
                </div>
                <div className="font-display font-black mb-2 relative flex items-center gap-2" style={{ fontSize: 26, letterSpacing: "-.8px", lineHeight: 1.1 }}>
                  {topTool.name}
                  {topTool.verified && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1D9BF0" className="flex-shrink-0">
                      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" />
                      <path d="M9 12l2 2.5 4.5-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                <div className="text-[13px] mb-3 relative" style={{ color: "rgba(255,255,255,.5)" }}>
                  {topTool.domain}
                </div>
                <p className="text-sm leading-[1.6] mb-4 max-w-[480px] relative" style={{ color: "rgba(255,255,255,.7)" }}>
                  {topTool.tagline}
                </p>
                <div className="flex gap-2 relative flex-wrap">
                  <span className="font-display text-[13px] font-bold bg-white px-[18px] py-[9px] rounded-pill" style={{ color: "var(--near-black)" }}>
                    {t("browser_visit")} {topTool.name} →
                  </span>
                </div>
              </div>
              <div
                className="rounded p-4 relative flex flex-col gap-3"
                style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
              >
                {[
                  topTool.rating != null
                    ? { l: "Rating", v: `${topTool.rating.toFixed(1)} ★${topTool.reviews > 0 ? ` (${topTool.reviews.toLocaleString()})` : ""}` }
                    : null,
                  { l: "Pricing", v: topTool.pricing },
                  topTool.startingPrice ? { l: "Starts at", v: topTool.startingPrice } : null,
                  topTool.verified ? { l: "Verified", v: "Yes" } : null,
                ]
                  .filter((s): s is { l: string; v: string } => s != null)
                  .map((s) => (
                    <div key={s.l} className="flex justify-between items-center text-[12.5px]" style={{ color: "rgba(255,255,255,.55)" }}>
                      <span>{s.l}</span>
                      <strong className="font-display text-[13.5px] font-extrabold text-white tnum">{s.v}</strong>
                    </div>
                  ))}
              </div>
            </a>
          )}

          {/* Tool grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "var(--text-3)" }}>
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-display text-lg font-extrabold mb-[6px]" style={{ color: "var(--text)" }}>
                No tools match your filters
              </div>
              <div className="text-sm">Try clearing some filters or searching with different keywords.</div>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: view === "list" ? "1fr" : "repeat(3, 1fr)",
              }}
            >
              {filtered.map((dt) => (
                <ToolCard key={dt.slug ?? dt.name} tool={detailToTool(dt)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
  onClear,
  showClear,
}: {
  title: string;
  children: React.ReactNode;
  onClear?: () => void;
  showClear?: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="font-display text-[11.5px] font-extrabold uppercase tracking-[.08em] mb-3 flex items-center justify-between" style={{ color: "var(--text-3)" }}>
        {title}
        {showClear && onClear && (
          <button
            onClick={onClear}
            className="font-display text-[11px] font-bold normal-case"
            style={{ color: "var(--blue)", letterSpacing: 0, textTransform: "none" }}
          >
            Clear
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function CheckRow({
  checked,
  onToggle,
  label,
  count,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  count: number;
}) {
  return (
    <label className="flex items-center gap-[9px] py-[6px] cursor-pointer text-[13px] transition-colors hover:text-blue" style={{ color: "var(--text)" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="appearance-none w-4 h-4 rounded-[4px] flex items-center justify-center cursor-pointer flex-shrink-0"
        style={{
          background: checked ? "var(--blue)" : "transparent",
          border: `1.5px solid ${checked ? "var(--blue)" : "var(--border)"}`,
        }}
      />
      {checked && (
        <span
          className="absolute"
          style={{
            width: 9,
            height: 5,
            borderLeft: "2px solid #fff",
            borderBottom: "2px solid #fff",
            transform: "translate(-22px, -2px) rotate(-45deg)",
            pointerEvents: "none",
          }}
        />
      )}
      <span className="flex-1">{label}</span>
      <span className="text-[11.5px] font-semibold tnum" style={{ color: "var(--text-3)" }}>
        {count}
      </span>
    </label>
  );
}

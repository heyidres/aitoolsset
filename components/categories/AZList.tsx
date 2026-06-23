"use client";
import { useMemo, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ALL_CATS, type SmallCategory } from "@/lib/categories";
import { CategoriesSectionHeader } from "./SectionHeader";
import { localizeCategories } from "@/lib/i18n/seed-i18n";

const TABS = ["All", "Most Popular", "Newest", "Free"] as const;
const TAB_KEYS: Record<typeof TABS[number], string> = {
  "All": "filter_all",
  "Most Popular": "sort_popular",
  "Newest": "sort_newest",
  "Free": "filter_free",
};

export function AZList({ catsOverride }: { catsOverride?: SmallCategory[] } = {}) {
  const t = useTranslations("categories_landing");
  const home = useTranslations("home");
  const cp = useTranslations("category_page");
  const search = useTranslations("search");
  const locale = useLocale();
  const raw = catsOverride && catsOverride.length > 0 ? catsOverride : ALL_CATS;
  const CATS_DATA = useMemo(() => localizeCategories(raw, locale), [raw, locale]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  // Maps tab labels to message keys across the right namespaces.
  const tabLabel = (k: typeof TABS[number]): string => {
    if (k === "All") return home("filter_all");
    if (k === "Most Popular") return cp("browser_sort_most_popular");
    if (k === "Newest") return cp("browser_sort_newest");
    if (k === "Free") return home("filter_free");
    return k;
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = CATS_DATA;
    if (tab === "Most Popular") list = [...list].sort((a, b) => b.count - a.count);
    if (tab === "Newest") list = [...list].slice(-24);
    if (tab === "Free") list = list.filter((c) => c.count > 30);
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    return list;
  }, [tab, query, CATS_DATA]);

  const groups = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    const g: Record<string, SmallCategory[]> = {};
    sorted.forEach((c) => {
      const letter = c.name[0].toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(c);
    });
    return g;
  }, [filtered]);

  const letters = Object.keys(groups).sort();

  return (
    <section id="az" className="py-[72px] px-9 bg-white section-pad-x">
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow={t("az_eyebrow")}
          title={t("az_heading")}
          sub={t("az_sub")}
        />

        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="flex p-1 rounded-pill" style={{ background: "var(--surface)" }}>
            {TABS.map((tk) => {
              const active = tab === tk;
              return (
                <button
                  key={tk}
                  onClick={() => setTab(tk)}
                  className="font-display text-[13px] font-bold px-4 py-[7px] rounded-pill transition-all"
                  style={{
                    background: active ? "var(--white)" : "transparent",
                    color: active ? "var(--text)" : "var(--text-2)",
                    boxShadow: active ? "0 2px 8px rgba(0,0,0,.06)" : "none",
                  }}
                >
                  {tabLabel(tk)}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-[240px] max-w-[380px] relative">
            <svg
              className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none"
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
              placeholder={`${search("placeholder")}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`${search("placeholder")}`}
              className="w-full h-[42px] rounded-pill text-[14px] outline-none pl-[42px] pr-4 transition-colors focus:border-[var(--blue)] focus:bg-white placeholder:text-[var(--text-3)]"
              style={{
                background: "var(--surface)",
                border: "1.5px solid transparent",
                color: "var(--text)",
              }}
            />
          </div>

          <div className="flex gap-[2px] font-display text-[11.5px] font-bold flex-wrap" style={{ color: "var(--text-3)" }}>
            {letters.map((l) => (
              <a key={l} href={`#az-${l}`} className="az-jumper-link">
                {l}
              </a>
            ))}
          </div>
        </div>

        {letters.length === 0 ? (
          <div className="text-center py-12 text-[14px]" style={{ color: "var(--text-3)" }}>
            No categories match your search.
          </div>
        ) : (
          letters.map((l) => (
            <div key={l} id={`az-${l}`} className="mb-9">
              <div
                className="font-display font-black tracking-[-.8px] mb-[14px] flex items-center gap-[14px]"
                style={{ fontSize: 24 }}
              >
                {l}
                <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
              <div className="grid grid-cols-3 gap-[2px] az-list-3">
                {groups[l].map((c) => (
                  <Link
                    key={c.slug}
                    href={`/ai-tools/${c.slug}`}
                    className="az-item-hover flex items-center justify-between px-[14px] py-[10px] rounded-sm cursor-pointer gap-[14px]"
                  >
                    <span className="az-name-h font-display text-[13.5px] font-bold" style={{ color: "var(--text)" }}>
                      {c.name}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-2 flex-shrink-0 tnum" style={{ color: "var(--text-3)" }}>
                      {c.count} tools
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

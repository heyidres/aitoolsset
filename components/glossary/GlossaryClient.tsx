"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { GLOSSARY, slugifyTerm, type GlossaryTerm } from "@/lib/glossary";
import { Favicon } from "../Favicon";
import { sanitizeHtml } from "@/lib/sanitize";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "core", label: "Core" },
  { key: "models", label: "Models" },
  { key: "training", label: "Training" },
  { key: "agents", label: "Agents" },
] as const;

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const MOST_LOOKED_UP = [
  { term: "RAG", cat: "Core · 14.2K lookups" },
  { term: "Agentic AI", cat: "Agents · 11.8K" },
  { term: "Fine-tuning", cat: "Training · 9.7K" },
  { term: "Embeddings", cat: "Core · 8.4K" },
  { term: "MCP", cat: "Agents · 7.1K" },
  { term: "LoRA", cat: "Training · 5.9K" },
];

const RECENTLY_ADDED = [
  { term: "MCP", cat: "Added May 22" },
  { term: "Test-time compute", cat: "Added May 18" },
  { term: "Deep research", cat: "Added May 12" },
];

export function GlossaryClient({ glossaryOverride }: { glossaryOverride?: GlossaryTerm[] } = {}) {
  // Same pattern as DealsClient — DB-published terms come from
  // the server page; an empty CMS keeps the hardcoded seeds.
  const GLOSSARY_DATA = glossaryOverride && glossaryOverride.length > 0 ? glossaryOverride : GLOSSARY;

  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return GLOSSARY_DATA.filter((t) => {
      if (cat !== "all" && t.cat !== cat) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        (t.acro ?? "").toLowerCase().includes(q) ||
        t.def.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [cat, query, GLOSSARY_DATA]);

  const groups = useMemo(() => {
    const g: Record<string, GlossaryTerm[]> = {};
    filtered.forEach((t) => {
      const l = t.term[0].toUpperCase();
      if (!g[l]) g[l] = [];
      g[l].push(t);
    });
    return g;
  }, [filtered]);

  const presentLetters = Object.keys(groups);

  const copyLink = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
    }
    setToast(true);
    setTimeout(() => setToast(false), 1500);
    setFlashId(id);
    setTimeout(() => setFlashId(null), 800);
  };

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-9 pt-[60px] pb-14 text-white section-pad-x"
        style={{ background: "var(--near-black)" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -150,
            right: -80,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(0,82,255,.18) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[1080px] mx-auto relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-5 flex-wrap" style={{ color: "rgba(255,255,255,.4)" }}>
            <Link href="/" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,.55)" }}>
              Home
            </Link>
            <span style={{ color: "rgba(255,255,255,.2)" }}>/</span>
            <span style={{ color: "#fff" }}>AI Glossary</span>
          </nav>

          <div
            className="inline-flex items-center gap-[7px] rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-extrabold uppercase tracking-[.07em] mb-[18px]"
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)" }}
          >
            📖 The AI Dictionary
          </div>
          <h1 className="font-display font-black mb-[14px] text-white" style={{ fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: "-2.2px", lineHeight: 1.05 }}>
            Every <span style={{ color: "var(--blue-h)" }}>AI term</span>
            <br />
            explained plainly
          </h1>
          <p className="text-[17px] leading-[1.65] max-w-[580px] mb-7" style={{ color: "rgba(255,255,255,.55)" }}>
            No jargon. No math. Just clear definitions of the AI terms you'll actually encounter — from RAG and LoRA to agentic AI, fine-tuning, and MCP. Updated weekly by our editorial team.
          </p>

          <div className="max-w-[580px] relative mb-7">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "rgba(255,255,255,.55)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search a term — "RAG", "embeddings", "agentic AI"…`}
              aria-label="Search glossary"
              className="w-full h-[54px] rounded-pill text-[15px] text-white outline-none pl-[50px] pr-[100px] transition-colors focus:border-[var(--blue)] focus:bg-white/10 placeholder:text-white/40"
              style={{ background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.15)" }}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium px-2 py-[3px] rounded-[5px]"
              style={{ fontFamily: "ui-monospace, 'JetBrains Mono', monospace", color: "rgba(255,255,255,.4)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}
            >
              ⌘K
            </span>
          </div>

          <div className="flex gap-8 flex-wrap">
            {[
              { num: filtered.length.toString(), lbl: "Terms defined" },
              { num: "9", lbl: "Categories" },
              { num: "Weekly", lbl: "Updates" },
              { num: "Free", lbl: "Forever" },
            ].map((s) => (
              <div key={s.lbl}>
                <div className="font-display font-black text-white tnum" style={{ fontSize: 24, letterSpacing: "-.8px" }}>
                  {s.num}
                </div>
                <div className="text-[12.5px] mt-[3px]" style={{ color: "rgba(255,255,255,.4)" }}>
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A-Z bar */}
      <div className="sticky z-[100] backdrop-blur-[20px]" style={{ top: 58, background: "rgba(255,255,255,.95)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[1080px] mx-auto flex items-center gap-[10px] flex-wrap px-9 py-[14px] section-pad-x">
          <span className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mr-[6px]" style={{ color: "var(--text-3)" }}>
            Jump to
          </span>
          <div className="flex gap-[2px] flex-wrap">
            {ALL_LETTERS.map((l) => {
              const present = !!groups[l];
              return (
                <a
                  key={l}
                  href={present ? `#letter-${l}` : undefined}
                  className="font-display text-xs font-extrabold w-[26px] h-[26px] rounded-[6px] flex items-center justify-center transition-colors"
                  style={{
                    color: present ? "var(--text-2)" : "var(--text-3)",
                    opacity: present ? 1 : 0.4,
                    cursor: present ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (present) {
                      e.currentTarget.style.background = "var(--blue-soft)";
                      e.currentTarget.style.color = "var(--blue)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (present) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-2)";
                    }
                  }}
                >
                  {l}
                </a>
              );
            })}
          </div>
          <div className="ml-auto flex gap-[6px]">
            {CATEGORIES.map((c) => {
              const active = cat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className="font-display text-xs font-bold px-3 py-[5px] rounded-pill cursor-pointer transition-colors"
                  style={{
                    color: active ? "#fff" : "var(--text-2)",
                    background: active ? "var(--blue)" : "var(--white)",
                    border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page grid */}
      <div className="max-w-[1080px] mx-auto px-9 pt-10 pb-16 grid grid-cols-[minmax(0,1fr)_280px] gap-12 items-start glossary-grid section-pad-x">
        {/* Terms column */}
        <div className="min-w-0">
          {presentLetters.length === 0 ? (
            <div className="text-center py-16 px-5" style={{ color: "var(--text-3)" }}>
              <div className="text-4xl mb-[14px]">🔎</div>
              <div className="font-display text-lg font-extrabold mb-[6px]" style={{ color: "var(--text)" }}>
                No terms match your search
              </div>
              <div>Try a different keyword or clear the filter.</div>
            </div>
          ) : (
            presentLetters.map((l) => (
              <section key={l} id={`letter-${l}`} className="mb-9" style={{ scrollMarginTop: 130 }}>
                <div
                  className="font-display font-black mb-[14px] flex items-center gap-[18px] pb-2"
                  style={{ fontSize: 48, letterSpacing: "-2px", borderBottom: "1px solid var(--border)" }}
                >
                  {l}
                  <span className="text-xs font-semibold tnum" style={{ color: "var(--text-3)", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {groups[l].length} {groups[l].length === 1 ? "term" : "terms"}
                  </span>
                  <span className="flex-1" />
                </div>
                {groups[l].map((t) => {
                  const id = slugifyTerm(t.term);
                  const isFlash = flashId === id;
                  return (
                    <div
                      key={id}
                      id={id}
                      className="bg-white rounded-lg py-[22px] px-6 mb-3 transition-all"
                      style={{
                        border: `1px solid ${isFlash ? "var(--blue)" : "var(--border)"}`,
                        boxShadow: isFlash ? "0 0 0 3px var(--blue-soft)" : "none",
                      }}
                    >
                      <div className="flex items-center gap-[10px] mb-2 flex-wrap">
                        <div className="font-display font-black" style={{ fontSize: 21, letterSpacing: "-.6px", color: "var(--text)" }}>
                          {t.term}
                        </div>
                        {t.acro && (
                          <span className="text-[13px] font-medium" style={{ fontFamily: "ui-monospace, 'JetBrains Mono', monospace", color: "var(--text-3)" }}>
                            {t.acro}
                          </span>
                        )}
                        <span
                          className="font-display text-[10.5px] font-extrabold uppercase tracking-[.07em] px-[9px] py-[3px] rounded-pill"
                          style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)" }}
                        >
                          {t.cat}
                        </span>
                        <button
                          onClick={() => copyLink(id)}
                          className="ml-auto font-display text-[11.5px] font-bold flex items-center gap-[5px] px-[10px] py-[5px] rounded-sm transition-colors hover:bg-surface"
                          style={{ color: "var(--text-3)" }}
                          aria-label="Copy link"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          Copy link
                        </button>
                      </div>
                      <p className="text-[15px] leading-[1.7] mb-[14px]" style={{ color: "var(--text)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t.def) }} />
                      {t.example && (
                        <div
                          className="rounded-r p-[11px] px-4 mb-[14px]"
                          style={{ background: "var(--cream)", borderLeft: "3px solid var(--blue)" }}
                        >
                          <div className="font-display text-[10.5px] font-extrabold uppercase tracking-[.08em] mb-1" style={{ color: "var(--blue)" }}>
                            Example
                          </div>
                          <div className="text-sm leading-[1.6] italic" style={{ color: "var(--text-2)" }}>
                            {t.example}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-[6px] flex-wrap pt-3" style={{ borderTop: "1px dashed var(--border)" }}>
                        <span className="font-display text-[11.5px] font-extrabold uppercase tracking-[.06em] mr-1" style={{ color: "var(--text-3)" }}>
                          Related
                        </span>
                        {t.related.map((r) => (
                          <a
                            key={r}
                            href={`#${slugifyTerm(r)}`}
                            className="font-display text-xs font-bold px-[10px] py-1 rounded-pill cursor-pointer transition-colors hover:bg-blue hover:text-white"
                            style={{ color: "var(--text-2)", background: "var(--surface)" }}
                          >
                            {r}
                          </a>
                        ))}
                        {t.tool && (
                          <Link
                            href={`/ai-tool/${slugifyTerm(t.tool.name)}`}
                            className="ml-auto inline-flex items-center gap-[5px] font-display text-[11.5px] font-bold transition-colors hover:text-blue-h"
                            style={{ color: "var(--blue)" }}
                          >
                            <Favicon domain={t.tool.domain} name={t.tool.name} size={14} />
                            {t.tool.name} →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="sticky flex flex-col gap-[18px] min-w-0 glossary-sidebar" style={{ top: 130 }}>
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-4 py-[13px] font-display text-[12.5px] font-extrabold uppercase tracking-[.07em] flex justify-between items-center" style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}>
              Most Looked Up
              <a href="#" className="text-[11px] font-bold normal-case" style={{ color: "var(--blue)", letterSpacing: 0, textTransform: "none" }}>
                All →
              </a>
            </div>
            <div className="px-4 py-[6px]">
              {MOST_LOOKED_UP.map((m, i) => (
                <a
                  key={m.term}
                  href={`#${slugifyTerm(m.term)}`}
                  className="group block py-2 cursor-pointer"
                  style={{ borderBottom: i < MOST_LOOKED_UP.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div className="font-display text-[13px] font-bold transition-colors group-hover:text-blue">{m.term}</div>
                  <div className="text-[11px] mt-[2px]" style={{ color: "var(--text-3)" }}>
                    {m.cat}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-4 py-[13px] font-display text-[12.5px] font-extrabold uppercase tracking-[.07em]" style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}>
              Recently Added
            </div>
            <div className="px-4 py-[6px]">
              {RECENTLY_ADDED.map((m, i) => (
                <a
                  key={m.term}
                  href={`#${slugifyTerm(m.term)}`}
                  className="group block py-2 cursor-pointer"
                  style={{ borderBottom: i < RECENTLY_ADDED.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div className="font-display text-[13px] font-bold transition-colors group-hover:text-blue">{m.term}</div>
                  <div className="text-[11px] mt-[2px]" style={{ color: "var(--text-3)" }}>
                    {m.cat}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-5 text-white" style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}>
            <div className="font-display font-black mb-[6px] leading-[1.2]" style={{ fontSize: 15, letterSpacing: "-.3px" }}>
              Missing a term?
              <br />
              Suggest it.
            </div>
            <div className="text-[12.5px] leading-[1.55] mb-[13px]" style={{ color: "rgba(255,255,255,.85)" }}>
              We add new AI terms every week. Tell us what should be next on the list.
            </div>
            <a href="#" className="inline-flex font-display text-xs font-extrabold px-4 py-2 rounded-pill" style={{ background: "#fff", color: "var(--blue)" }}>
              Suggest a term →
            </a>
          </div>
        </aside>
      </div>

      {/* Toast */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white font-display text-[13px] font-bold px-[18px] py-[10px] rounded-pill z-[1000] transition-all"
        style={{
          background: "var(--near-black)",
          boxShadow: "var(--shadow)",
          opacity: toast ? 1 : 0,
          transform: `translateX(-50%) translateY(${toast ? 0 : 60}px)`,
        }}
      >
        ✓ Link copied
      </div>
    </>
  );
}

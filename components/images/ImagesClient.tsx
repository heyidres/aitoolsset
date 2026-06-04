"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Favicon } from "../Favicon";
import { favicon } from "@/lib/tools";
import {
  PROMPTS,
  TRENDING_PROMPTS,
  MODEL_CARDS,
  IMG_MODELS,
  IMG_CATEGORIES,
  IMG_MODEL_FILTERS,
  gradientFor,
  type ImagePrompt,
} from "@/lib/images";

const QUICK_FILTERS = ["Cyberpunk", "Anime", "Photorealistic", "Logo", "Fantasy", "Architecture", "Fashion", "Instagram"];

export function ImagesClient() {
  const [model, setModel] = useState("all");
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState<number | null>(null);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modalSettings, setModalSettings] = useState({ seed: "428193", steps: "40" });
  const galleryRef = useRef<HTMLDivElement>(null);

  // Load state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const s = JSON.parse(localStorage.getItem("ats-img-saved") || "[]");
      setSaved(new Set(s));
    } catch {}
    if (localStorage.getItem("ats-img-theme") === "dark") {
      setDark(true);
      document.body.classList.add("imgs-dark");
    }
  }, []);

  // Persist saves
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ats-img-saved", JSON.stringify([...saved]));
    }
  }, [saved]);

  // Modal: lock scroll + esc to close
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open !== null) {
      document.body.style.overflow = "hidden";
      // Generate random seed/steps when modal opens
      setModalSettings({
        seed: String(Math.floor(Math.random() * 900000) + 100000),
        steps: [30, 40, 50, 60][Math.floor(Math.random() * 4)].toString(),
      });
    } else {
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    return PROMPTS.map((p, i) => ({ ...p, _i: i })).filter((p) => {
      if (model !== "all" && p.model !== model) return false;
      if (cat !== "all" && p.cat !== cat) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!p.prompt.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [model, cat, query]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1700);
  };

  const copyPrompt = (idx: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(PROMPTS[idx].prompt);
    }
    showToast("✓ Prompt copied to clipboard");
  };

  const toggleSave = (idx: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    if (newDark) {
      document.body.classList.add("imgs-dark");
      localStorage.setItem("ats-img-theme", "dark");
    } else {
      document.body.classList.remove("imgs-dark");
      localStorage.setItem("ats-img-theme", "light");
    }
  };

  const quickFilter = (term: string) => {
    setQuery(term);
    galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentItem = open !== null ? PROMPTS[open] : null;
  const currentModel = currentItem ? IMG_MODELS[currentItem.model] : null;

  const related = useMemo(() => {
    if (open === null) return [];
    return PROMPTS.map((_, i) => i)
      .filter((i) => i !== open)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  }, [open]);

  return (
    <>
      {/* Theme toggle anchor */}
      <button
        onClick={toggleTheme}
        className="fixed top-[12px] right-[140px] z-[201] w-9 h-9 rounded-full flex items-center justify-center text-base imgs-theme-btn"
        style={{
          background: dark ? "rgba(255,255,255,.07)" : "var(--surface)",
          color: dark ? "#fff" : "var(--text)",
        }}
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-7 py-14 text-white section-pad-x"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -200,
            left: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(124,58,237,.18) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -200,
            right: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(236,72,153,.16) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[1440px] mx-auto relative text-center">
          <div
            className="inline-flex items-center gap-[7px] rounded-pill px-[14px] py-[5px] font-display text-[11.5px] font-extrabold uppercase tracking-[.07em] mb-[18px]"
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)" }}
          >
            <span className="w-[6px] h-[6px] rounded-full animate-pulse-dot" style={{ background: "#f9a8d4" }} />
            10,000+ prompts · Updated daily
          </div>
          <h1 className="font-display font-black mb-[18px] text-white" style={{ fontSize: "clamp(40px, 5.5vw, 72px)", letterSpacing: "-2.5px", lineHeight: 1 }}>
            Discover, copy &amp; save
            <br />
            the best{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #f472b6, #a78bfa, #578bfa)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              AI image prompts
            </span>
          </h1>
          <p className="text-[17px] leading-[1.65] max-w-[580px] mx-auto mb-8" style={{ color: "rgba(255,255,255,.55)" }}>
            A visual library of AI-generated images from Midjourney, DALL·E, Stable Diffusion, Flux, Ideogram and more — with the exact prompts used to create them.
          </p>

          <form className="max-w-[680px] mx-auto mb-7 relative" role="search" onSubmit={(e) => e.preventDefault()}>
            <svg
              className="absolute left-[22px] top-1/2 -translate-y-1/2 pointer-events-none"
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "rgba(255,255,255,.55)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search prompts — "cyberpunk portrait", "minimalist logo", "fantasy landscape"…`}
              aria-label="Search prompts"
              className="w-full h-[60px] rounded-pill text-[15.5px] text-white outline-none pl-[56px] pr-[130px] backdrop-blur-[8px] transition-all focus:border-[var(--blue)] focus:bg-white/10 placeholder:text-white/40"
              style={{ background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.15)" }}
            />
            <button
              type="submit"
              className="absolute right-[6px] top-1/2 -translate-y-1/2 text-white font-display text-sm font-bold px-6 py-[11px] rounded-pill transition-colors hover:bg-blue-h"
              style={{ background: "var(--blue)" }}
            >
              Search
            </button>
          </form>

          <div className="flex justify-center gap-[7px] flex-wrap">
            {QUICK_FILTERS.map((q) => (
              <button
                key={q}
                onClick={() => quickFilter(q)}
                className="font-display text-[12.5px] font-bold px-[14px] py-[6px] rounded-pill cursor-pointer transition-colors hover:bg-blue hover:border-blue hover:text-white"
                style={{ color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
              >
                ✦ {q}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-9 flex-wrap">
            {[
              { num: "10,420", lbl: "Prompts indexed" },
              { num: "12", lbl: "AI models" },
              { num: "38", lbl: "Categories" },
              { num: "+184", lbl: "Added today" },
            ].map((s) => (
              <div key={s.lbl} className="text-center">
                <div className="font-display font-black text-white tnum" style={{ fontSize: 26, letterSpacing: "-.8px" }}>
                  {s.num}
                </div>
                <div className="text-xs mt-[2px]" style={{ color: "rgba(255,255,255,.4)" }}>
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky z-[100] backdrop-blur-[20px] imgs-bg-card" style={{ top: 58, background: "rgba(255,255,255,.95)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[1440px] mx-auto px-7 py-3 flex items-center gap-3 flex-wrap section-pad-x">
          <div className="flex items-center gap-[6px] overflow-x-auto no-scrollbar flex-1">
            <span className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mr-1 flex-shrink-0 imgs-text-3" style={{ color: "var(--text-3)" }}>
              Model
            </span>
            {IMG_MODEL_FILTERS.map((m) => {
              const active = model === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setModel(m.key)}
                  className="font-display text-[12.5px] font-bold px-[13px] py-[6px] rounded-pill whitespace-nowrap flex-shrink-0 inline-flex items-center gap-[5px] transition-colors imgs-pill"
                  style={{
                    color: active ? "#fff" : "var(--text-2)",
                    background: active ? "var(--blue)" : "var(--white)",
                    border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
                  }}
                >
                  {m.domain && <img src={favicon(m.domain, 64)} alt="" className="w-[14px] h-[14px] rounded-[3px]" />}
                  {m.label}
                </button>
              );
            })}
          </div>
          <button
            className="font-display text-[12.5px] font-bold px-[14px] py-[7px] rounded-pill flex items-center gap-[5px] flex-shrink-0"
            style={{ color: "var(--text)", background: "var(--surface)" }}
          >
            Trending
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
        <div className="max-w-[1440px] mx-auto px-7 py-3 flex items-center gap-3 section-pad-x" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-[6px] overflow-x-auto no-scrollbar flex-1">
            <span className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mr-1 flex-shrink-0" style={{ color: "var(--text-3)" }}>
              Niche
            </span>
            {IMG_CATEGORIES.map((c) => {
              const active = cat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className="font-display text-[12.5px] font-bold px-[13px] py-[6px] rounded-pill whitespace-nowrap flex-shrink-0 transition-colors"
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

      {/* Trending strip */}
      <section className="px-7 pt-7 section-pad-x">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-baseline justify-between mb-[14px]">
            <div className="font-display font-black flex items-center gap-2" style={{ fontSize: 18, letterSpacing: "-.5px" }}>
              🔥 Trending Prompts This Week
            </div>
            <a href="#" className="font-display text-[13px] font-bold" style={{ color: "var(--blue)" }}>
              View all →
            </a>
          </div>
          <div className="flex gap-[10px] overflow-x-auto no-scrollbar pb-2">
            {TRENDING_PROMPTS.map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded p-[14px] cursor-pointer transition-all hover:-translate-y-[2px] hover:border-blue"
                style={{ width: 280, background: "var(--white)", border: "1.5px solid var(--border)" }}
              >
                <div className="font-display text-[11px] font-extrabold mb-[6px]" style={{ color: "var(--text-3)" }}>
                  #{i + 1}
                </div>
                <div
                  className="font-display text-[13px] font-bold leading-[1.4] mb-2 overflow-hidden"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                >
                  {t.prompt}
                </div>
                <div className="flex items-center gap-[6px] text-[11px]" style={{ color: "var(--text-3)" }}>
                  <span className="font-display font-extrabold" style={{ color: "var(--text)" }}>
                    {t.model}
                  </span>
                  <span>·</span>
                  <span>{t.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section ref={galleryRef} className="px-7 pt-8 pb-20 section-pad-x">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-[10px]">
            <div>
              <div className="font-display font-black" style={{ fontSize: 22, letterSpacing: "-.7px" }}>
                Latest AI Generations
              </div>
              <div className="text-[13.5px] mt-1" style={{ color: "var(--text-3)" }}>
                Fresh prompts and visuals from the community, updated every hour
              </div>
            </div>
            <div className="font-display text-[13px] font-bold px-3 py-[5px] rounded-pill" style={{ color: "var(--blue)", background: "var(--blue-soft)" }}>
              {filtered.length} images
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 px-5" style={{ color: "var(--text-3)" }}>
              <div className="text-4xl mb-[14px]">🔍</div>
              <div className="font-display text-xl font-extrabold mb-[6px]" style={{ color: "var(--text)" }}>
                No prompts match your filters
              </div>
              <div className="text-sm">Try clearing filters or searching with different keywords.</div>
            </div>
          ) : (
            <div className="masonry-4">
              {filtered.map((p) => (
                <ImageCard
                  key={p._i}
                  prompt={p}
                  idx={p._i}
                  saved={saved.has(p._i)}
                  onOpen={() => setOpen(p._i)}
                  onCopy={() => copyPrompt(p._i)}
                  onSave={() => toggleSave(p._i)}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-9">
            <button
              className="font-display text-sm font-bold px-7 py-3 rounded-pill"
              style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1.5px solid rgba(0,82,255,.2)" }}
              onClick={(e) => {
                const btn = e.currentTarget;
                btn.textContent = "Loading…";
                setTimeout(() => {
                  btn.textContent = "No more images for this filter";
                  btn.style.opacity = ".5";
                  (btn as HTMLButtonElement).disabled = true;
                }, 600);
              }}
            >
              Load 24 more images
            </button>
          </div>
        </div>
      </section>

      {/* Models section (dark) */}
      <section className="py-16 px-7 text-white section-pad-x" style={{ background: "var(--near-black)" }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-8">
            <div className="font-display text-[11.5px] font-extrabold uppercase tracking-[.09em] mb-2" style={{ color: "var(--blue-h)" }}>
              Browse by Model
            </div>
            <h2 className="font-display font-black text-white" style={{ fontSize: 32, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
              Every major AI image generator, one place
            </h2>
            <p className="text-[14.5px] mt-2" style={{ color: "rgba(255,255,255,.5)" }}>
              Explore curated prompts and outputs from 12 different AI image generation tools.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 models-grid-4">
            {MODEL_CARDS.map((m) => (
              <div
                key={m.name}
                className="rounded p-[18px] cursor-pointer flex items-center gap-3 transition-all hover:-translate-y-[2px] hover:border-blue"
                style={{ background: "var(--dark-card)", border: "1px solid var(--dark-border)" }}
              >
                <div
                  className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center overflow-hidden flex-shrink-0 p-[6px]"
                  style={{ background: "rgba(255,255,255,.08)" }}
                >
                  <img src={favicon(m.domain, 128)} alt={m.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[14.5px] font-extrabold mb-[2px]">{m.name}</div>
                  <div className="text-[11.5px] tnum" style={{ color: "rgba(255,255,255,.4)" }}>
                    {m.count} prompts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {open !== null && currentItem && currentModel && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-[10px]"
          style={{ background: "rgba(0,0,0,.85)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div
            className="rounded-lg max-w-[1100px] w-full overflow-hidden grid grid-cols-[1.2fr_1fr] relative modal-grid-2"
            style={{ background: dark ? "#161718" : "var(--white)", maxHeight: "92vh" }}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-[14px] right-[14px] w-9 h-9 rounded-full flex items-center justify-center z-[5]"
              style={{ background: "rgba(255,255,255,.95)", color: "var(--text)" }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div
              className="flex items-center justify-center relative"
              style={{ background: gradientFor(open), minHeight: 420 }}
            >
              <div className="font-display font-black" style={{ fontSize: 72, letterSpacing: "-2px", color: "rgba(255,255,255,.15)" }}>
                {currentItem.label}
              </div>
            </div>
            <div className="p-7 overflow-y-auto">
              <div className="flex items-center gap-2 mb-[14px]">
                <div
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center overflow-hidden p-1"
                  style={{ background: dark ? "rgba(255,255,255,.06)" : "var(--surface)" }}
                >
                  <img src={favicon(currentModel.domain, 64)} alt={currentModel.name} className="w-full h-full object-contain" />
                </div>
                <div className="font-display text-[13.5px] font-extrabold" style={{ color: dark ? "#fff" : "var(--text)" }}>
                  {currentModel.name}
                </div>
                <span
                  className="ml-auto font-display text-[10.5px] font-extrabold uppercase tracking-[.05em] px-[9px] py-[3px] rounded-pill"
                  style={{ color: "var(--blue)", background: "var(--blue-soft)" }}
                >
                  {currentItem.style}
                </span>
              </div>
              <div className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mb-2 flex items-center justify-between" style={{ color: dark ? "rgba(255,255,255,.45)" : "var(--text-3)" }}>
                Prompt
                <button
                  onClick={() => copyPrompt(open)}
                  className="font-display text-[11.5px] font-extrabold flex items-center gap-1 normal-case cursor-pointer"
                  style={{ color: "var(--blue)", textTransform: "none", letterSpacing: 0 }}
                >
                  📋 Copy prompt
                </button>
              </div>
              <div
                className="rounded p-[14px] text-[13.5px] leading-[1.65] mb-[18px] break-words"
                style={{
                  fontFamily: "'SF Mono', Monaco, monospace",
                  background: dark ? "rgba(255,255,255,.04)" : "var(--bg)",
                  border: `1.5px solid ${dark ? "rgba(255,255,255,.1)" : "var(--border)"}`,
                  color: dark ? "rgba(255,255,255,.85)" : "var(--text)",
                }}
              >
                {currentItem.prompt}
              </div>
              <div className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mb-2" style={{ color: dark ? "rgba(255,255,255,.45)" : "var(--text-3)" }}>
                Settings
              </div>
              <div className="grid grid-cols-2 gap-2 mb-[18px]">
                {[
                  { lbl: "Aspect ratio", val: currentItem.ar },
                  { lbl: "Style", val: currentItem.style },
                  { lbl: "Seed", val: modalSettings.seed },
                  { lbl: "Steps", val: modalSettings.steps },
                ].map((s) => (
                  <div key={s.lbl} className="rounded-sm px-3 py-2" style={{ background: dark ? "rgba(255,255,255,.04)" : "var(--surface)" }}>
                    <div className="font-display text-[10px] font-extrabold uppercase tracking-[.07em] mb-[2px]" style={{ color: dark ? "rgba(255,255,255,.5)" : "var(--text-3)" }}>
                      {s.lbl}
                    </div>
                    <div className="font-display text-[12.5px] font-bold tnum" style={{ color: dark ? "#fff" : "var(--text)" }}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>
              <div className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mb-2" style={{ color: dark ? "rgba(255,255,255,.45)" : "var(--text-3)" }}>
                Tags
              </div>
              <div className="flex flex-wrap gap-[5px] mb-[18px]">
                {currentItem.tags.map((t) => (
                  <span
                    key={t}
                    className="font-display text-[11px] font-bold px-[10px] py-1 rounded-pill"
                    style={{
                      color: dark ? "rgba(255,255,255,.7)" : "var(--text-2)",
                      background: dark ? "rgba(255,255,255,.06)" : "var(--surface)",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => copyPrompt(open)}
                  className="flex-1 font-display text-[13px] font-bold text-white py-[11px] rounded-pill flex items-center justify-center gap-[6px] transition-colors hover:bg-blue-h"
                  style={{ background: "var(--blue)" }}
                >
                  📋 Copy Prompt
                </button>
                <button
                  onClick={() => toggleSave(open)}
                  className="flex-1 font-display text-[13px] font-bold py-[11px] rounded-pill flex items-center justify-center gap-[6px]"
                  style={{
                    background: dark ? "rgba(255,255,255,.06)" : "var(--surface)",
                    color: dark ? "#fff" : "var(--text)",
                  }}
                >
                  {saved.has(open) ? "❤ Saved" : "❤ Save"}
                </button>
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href + "#prompt-" + open);
                    }
                    showToast("🔗 Link copied to clipboard");
                  }}
                  className="font-display text-[13px] font-bold py-[11px] rounded-pill flex items-center justify-center"
                  style={{ flex: "0 0 44px", background: dark ? "rgba(255,255,255,.06)" : "var(--surface)", color: dark ? "#fff" : "var(--text)" }}
                  title="Share"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
              <div className="pt-[18px]" style={{ borderTop: `1px solid ${dark ? "rgba(255,255,255,.08)" : "var(--border)"}` }}>
                <div className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mb-[10px]" style={{ color: dark ? "rgba(255,255,255,.45)" : "var(--text-3)" }}>
                  Related prompts
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {related.map((i) => (
                    <div
                      key={i}
                      onClick={() => setOpen(i)}
                      className="rounded-[8px] cursor-pointer overflow-hidden flex items-center justify-center font-display font-black"
                      style={{ aspectRatio: "1", background: gradientFor(i), fontSize: 20, color: "rgba(255,255,255,.2)" }}
                    >
                      {PROMPTS[i].label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white font-display text-[13px] font-bold px-6 py-3 rounded-pill z-[1100] flex items-center gap-2 transition-all"
        style={{
          background: "var(--near-black)",
          boxShadow: "var(--shadow-lg)",
          opacity: toast ? 1 : 0,
          transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`,
        }}
      >
        {toast}
      </div>
    </>
  );
}

function ImageCard({
  prompt,
  idx,
  saved,
  onOpen,
  onCopy,
  onSave,
}: {
  prompt: ImagePrompt & { _i?: number };
  idx: number;
  saved: boolean;
  onOpen: () => void;
  onCopy: () => void;
  onSave: () => void;
}) {
  const m = IMG_MODELS[prompt.model];
  return (
    <div
      onClick={onOpen}
      className="masonry-card bg-white rounded overflow-hidden cursor-pointer relative transition-all imgs-bg-card"
      style={{ border: "1.5px solid var(--border)" }}
    >
      <div
        className="absolute top-[10px] left-[10px] backdrop-blur-md text-white font-display text-[10.5px] font-extrabold px-[9px] py-1 rounded-pill flex items-center gap-[5px]"
        style={{ background: "rgba(0,0,0,.55)" }}
      >
        <img src={favicon(m.domain, 64)} alt={m.name} className="w-3 h-3 rounded-[3px]" />
        {m.name.split(" ")[0]}
      </div>
      <div className="card-quick absolute top-[10px] right-[10px] flex gap-[5px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="w-[30px] h-[30px] rounded-full text-white flex items-center justify-center backdrop-blur-md"
          style={{
            background: saved ? "#ef4444" : "rgba(0,0,0,.55)",
            border: `1px solid ${saved ? "#ef4444" : "rgba(255,255,255,.18)"}`,
          }}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="w-[30px] h-[30px] rounded-full text-white flex items-center justify-center backdrop-blur-md"
          style={{ background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.18)" }}
          aria-label="Copy prompt"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
      <div className="w-full relative flex items-center justify-center" style={{ background: gradientFor(idx), height: prompt.h }}>
        <div className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-1px", color: "rgba(255,255,255,.18)" }}>
          {prompt.label}
        </div>
        <div
          className="card-overlay absolute inset-0 flex flex-col justify-end p-[14px]"
          style={{ background: "linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,.85) 100%)" }}
        >
          <div
            className="text-white text-[12.5px] leading-[1.5] mb-[10px] italic overflow-hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
          >
            {prompt.prompt}
          </div>
          <div className="flex items-center gap-[6px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="font-display text-[11.5px] font-extrabold px-[11px] py-[6px] rounded-pill flex items-center gap-[5px]"
              style={{ background: "rgba(255,255,255,.95)", color: "var(--text)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </button>
            <button
              className="font-display text-[11.5px] font-extrabold px-[11px] py-[6px] rounded-pill"
              style={{ background: "rgba(255,255,255,.95)", color: "var(--text)" }}
            >
              View details →
            </button>
          </div>
        </div>
      </div>
      <div className="imgs-foot px-3 py-[10px] flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: "var(--surface)" }}>
          <img src={favicon(m.domain, 64)} alt={m.name} className="w-full h-full object-cover" />
        </div>
        <span className="font-display text-[11.5px] font-extrabold imgs-text" style={{ color: "var(--text)" }}>
          {m.name}
        </span>
        <span className="text-[11px]" style={{ color: "var(--text-3)" }}>
          · {prompt.style}
        </span>
        <span className="ml-auto text-[11px] font-bold tnum" style={{ color: "var(--text-3)" }}>
          ♥ {prompt.saves.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

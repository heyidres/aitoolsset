"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogoMark } from "./Logo";
import { MegaPanel, PANELS } from "./MegaMenu";
import { MobileDrawer } from "./MobileDrawer";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Nav() {
  const t = useTranslations("nav");
  // Direct links — re-derived inside the component so locale switching
  // re-translates without a hard refresh.
  const DIRECT_LINKS = [
    { labelKey: "leaderboard", href: "/leaderboard" },
    { labelKey: "submit_a_tool", href: "/submit" },
  ];
  // Mega-menu top-level labels translated via key matching on PANELS[].key
  const PANEL_LABEL_KEYS: Record<string, string> = {
    tools: "tools",
    discover: "categories",
    learn: "blog",
  };
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const show = (key: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(key);
  };
  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };
  const keepOpen = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const close = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(null);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-[200] backdrop-blur-[20px]"
        style={{ background: "rgba(255,255,255,.92)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-page mx-auto px-9 h-[58px] flex items-center gap-0 section-pad-x relative">
          <Link
            href="/"
            onClick={close}
            className="font-display font-extrabold text-base tracking-[-.4px] flex items-center gap-2 mr-9 flex-shrink-0"
            style={{ color: "var(--text)" }}
          >
            <LogoMark />
            AI Tools Set
          </Link>

          <div className="items-center gap-[2px] flex-1 nav-links-row flex">
            {PANELS.map((p) => {
              const isOpen = open === p.key;
              return (
                <button
                  key={p.key}
                  className={`nav-link${isOpen ? " open" : ""}`}
                  onMouseEnter={() => show(p.key)}
                  onMouseLeave={hide}
                  onClick={() => setOpen(isOpen ? null : p.key)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  {PANEL_LABEL_KEYS[p.key] ? t(PANEL_LABEL_KEYS[p.key]) : p.label}
                  <svg className="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              );
            })}
            {DIRECT_LINKS.map((l) => (
              <Link key={l.labelKey} href={l.href} className="nav-link" onClick={close}>
                {t(l.labelKey)}
              </Link>
            ))}
          </div>

          <div className="items-center gap-2 flex nav-right-desktop">
            <form onSubmit={onSearch} className="nav-search-form" role="search">
              <svg
                className="nav-search-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_placeholder")}
                aria-label={t("search_placeholder")}
                className="nav-search-input"
              />
            </form>
            <LanguageSwitcher />
            <button
              className="font-display text-[13.5px] font-semibold px-4 py-[7px] rounded-pill transition-colors hover:text-text"
              style={{ color: "var(--text-2)" }}
            >
              {t("signIn")}
            </button>
            <button
              className="font-display text-[13.5px] font-bold text-white px-5 py-2 rounded-pill transition-colors hover:bg-blue-h"
              style={{ background: "var(--blue)" }}
            >
              {t("subscribe")}
            </button>
          </div>

          <button
            className="burger"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Hover bridge — closes the gap between trigger and panel */}
        {open && (
          <div
            className="mega-bridge"
            onMouseEnter={keepOpen}
            onMouseLeave={hide}
          />
        )}

        {PANELS.map((p) => (
          <MegaPanel
            key={p.key}
            panel={p}
            show={open === p.key}
            onEnter={keepOpen}
            onClose={hide}
          />
        ))}
      </nav>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}

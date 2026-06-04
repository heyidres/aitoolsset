"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "./Logo";
import { PANELS } from "./MegaMenu";

const DIRECT_LINKS = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Submit a Tool", href: "/submit" },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  tools: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  discover: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  learn: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
};

const Chev = (
  <svg className="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [acc, setAcc] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setAcc(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? " show" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer${open ? " show" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <Link
            href="/"
            onClick={onClose}
            className="font-display font-extrabold text-base tracking-[-.4px] flex items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            <LogoMark />
            AI Tools Set
          </Link>
          <button onClick={onClose} className="drawer-close" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {PANELS.map((panel) => {
            const isOpen = acc === panel.key;
            const allLinks = panel.cols.flatMap((c) =>
              (c.items
                ? c.items.map((it) => ({ label: it.title, href: it.href, badge: it.badge }))
                : (c.links ?? []).map((l) => ({ label: l.label, href: l.href, badge: undefined as undefined }))),
            );
            return (
              <div key={panel.key} className={`acc${isOpen ? " open" : ""}`}>
                <button
                  className="acc-head"
                  onClick={() => setAcc(isOpen ? null : panel.key)}
                  aria-expanded={isOpen}
                >
                  <span className="acc-head-icon">{SECTION_ICONS[panel.key]}</span>
                  {panel.label}
                  {Chev}
                </button>
                <div className="acc-body">
                  {allLinks.map((l) => (
                    <Link key={l.label + l.href} href={l.href} onClick={onClose} className="acc-link">
                      {l.label}
                      {l.badge && <span className={`mi-badge ${l.badge}`}>{l.badge === "new" ? "New" : "Hot"}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {DIRECT_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={onClose} className="acc-link direct">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="drawer-foot">
          <button className="nav-ghost">Sign in</button>
          <button className="nav-primary">Subscribe</button>
        </div>
      </aside>
    </>
  );
}

"use client";

/**
 * <LanguageSwitcher /> — dropdown in the nav for changing locale.
 *
 * UX:
 *   - Shows the current locale's flag + name, e.g. "🇺🇸 English ▾".
 *   - Click opens a list of every supported locale.
 *   - Picking a locale:
 *       1. Writes the `ats-locale` cookie (1-year) so future visits stick.
 *       2. Navigates to the SAME page in the new locale — strips the
 *          current /xx/ prefix and re-prefixes with the target locale.
 *
 * SEO:
 *   - Renders <a href> not <button> for each locale option, so crawlers
 *     see real navigable links to all locales (matches the page's hreflang).
 *   - Marked `rel="alternate"` + `hreflang` so the dropdown itself
 *     reinforces the language-alternates signal for Google.
 */

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { i18n, type Locale, isLocale } from "@/lib/i18n/config";

function pathWithoutLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (isLocale(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

function buildLocaleHref(target: Locale, basePath: string): string {
  if (target === i18n.defaultLocale) {
    return basePath || "/";
  }
  return basePath === "/" ? `/${target}` : `/${target}${basePath}`;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const current = useLocale() as Locale;
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const basePath = pathWithoutLocalePrefix(pathname);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handlePick = (locale: Locale, href: string, e: React.MouseEvent) => {
    // Allow CMD/CTRL-click to open in new tab without overriding.
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (locale === current) {
      setOpen(false);
      return;
    }
    // Persist the manual choice — 1 year.
    document.cookie = `${i18n.cookieName}=${locale}; max-age=${i18n.cookieMaxAge}; path=/; samesite=lax`;
    setOpen(false);
    // Hard navigation (not router.push) — Server Components must re-render
    // top to bottom with the new locale, and we want the URL bar to update
    // instantly without React's transition flash.
    window.location.href = href;
  };

  return (
    <div ref={ref} className="ls-root">
      <button
        type="button"
        className="ls-toggle"
        onClick={() => setOpen((x) => !x)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current language: ${i18n.localeNames[current]}. Change language.`}
      >
        <span className="ls-flag" aria-hidden="true">{i18n.localeFlags[current]}</span>
        {!compact && <span className="ls-name">{i18n.localeNames[current]}</span>}
        <svg className="ls-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="ls-menu" role="listbox" aria-label="Language">
          {i18n.locales.map((locale) => {
            const href = buildLocaleHref(locale, basePath);
            const active = locale === current;
            return (
              <li key={locale} role="option" aria-selected={active}>
                <a
                  href={href}
                  hrefLang={locale}
                  rel="alternate"
                  onClick={(e) => handlePick(locale, href, e)}
                  className={active ? "ls-item active" : "ls-item"}
                >
                  <span className="ls-flag" aria-hidden="true">{i18n.localeFlags[locale]}</span>
                  <span className="ls-name">{i18n.localeNames[locale]}</span>
                  {active && (
                    <svg className="ls-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M3 7l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <style jsx>{`
        .ls-root { position: relative; }
        .ls-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: var(--font-manrope), sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          background: #fff;
          color: var(--text);
          cursor: pointer;
          transition: border-color .15s, background .15s;
        }
        .ls-toggle:hover { border-color: var(--blue); background: var(--blue-soft); }
        .ls-flag { font-size: 13px; line-height: 1; }
        .ls-name { letter-spacing: -.1px; }
        .ls-chev { opacity: .55; flex-shrink: 0; }
        .ls-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 180px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 12px 32px rgba(0,0,0,.10);
          list-style: none;
          margin: 0;
          padding: 4px;
          z-index: 50;
          font-family: var(--font-manrope), sans-serif;
        }
        .ls-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
        }
        .ls-item:hover { background: var(--surface); color: var(--text); }
        .ls-item.active { color: var(--blue); }
        .ls-check { margin-left: auto; color: var(--blue); }
      `}</style>
    </div>
  );
}

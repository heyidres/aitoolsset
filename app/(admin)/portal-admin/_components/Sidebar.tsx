/**
 * Admin sidebar — dark navy column with grouped nav.
 *
 * Client component so it can highlight the active route via
 * usePathname() and react to live counts (passed in as props
 * from the layout, which fetches them server-side).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarCounts = {
  submissions: number;
  reviews: number;
  tools: number;
};

type SidebarUser = {
  name: string;
  email: string;
  role: string;
  image: string | null;
};

const Icon = {
  Dashboard: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Submissions: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Tools: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  News: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  Blog: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Categories: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Deals: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Glossary: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Authors: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11h-6" />
    </svg>
  ),
  Reviews: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.5 5.8 21 7 14 2 9.3 9 8.5 12 2" />
    </svg>
  ),
  Pages: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  SiteContent: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Users: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Analytics: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Settings: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  External: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

function compactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function Sidebar({ counts, user }: { counts: SidebarCounts; user: SidebarUser }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/portal-admin" ? pathname === "/portal-admin" : pathname === href || pathname?.startsWith(href + "/");

  const item = (href: string, label: string, IconCmp: () => React.JSX.Element, badge?: { value: string; alert?: boolean }) => (
    <Link href={href} className={`adm-sb-item ${isActive(href) ? "active" : ""}`}>
      <IconCmp />
      <span>{label}</span>
      {badge && (
        <span className={`adm-badge ${badge.alert ? "alert" : ""}`}>{badge.value}</span>
      )}
    </Link>
  );

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="adm-sidebar">
      <div className="adm-sb-logo">
        <div className="adm-sb-logo-mark">
          <svg viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" />
            <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity=".5" />
            <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity=".5" />
            <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" />
          </svg>
        </div>
        <div>
          <div className="adm-sb-logo-text">AI Tools Set</div>
          <div className="adm-sb-logo-sub">Admin CMS</div>
        </div>
      </div>

      <nav className="adm-sb-nav">
        <div className="adm-sb-group">
          <div className="adm-sb-group-title">Overview</div>
          {item("/portal-admin", "Dashboard", Icon.Dashboard)}
          {item("/portal-admin/submissions", "Submissions", Icon.Submissions, {
            value: String(counts.submissions),
            alert: counts.submissions > 0,
          })}
        </div>

        <div className="adm-sb-group">
          <div className="adm-sb-group-title">Content</div>
          {item("/portal-admin/tools", "Tools", Icon.Tools, { value: compactCount(counts.tools) })}
          {item("/portal-admin/news", "News", Icon.News)}
          {item("/portal-admin/news/pipeline", "News pipeline", Icon.News)}
          {item("/portal-admin/blog", "Blog", Icon.Blog)}
          {item("/portal-admin/authors", "Authors", Icon.Authors)}
          {item("/portal-admin/categories", "Categories", Icon.Categories)}
          {item("/portal-admin/deals", "Deals", Icon.Deals)}
          {item("/portal-admin/glossary", "Glossary", Icon.Glossary)}
          {item("/portal-admin/pages", "Pages", Icon.Pages)}
          {item("/portal-admin/home", "Home sections", Icon.SiteContent)}
          {item("/portal-admin/site-content", "Site content", Icon.SiteContent)}
        </div>

        <div className="adm-sb-group">
          <div className="adm-sb-group-title">Community</div>
          {item("/portal-admin/reviews", "Reviews", Icon.Reviews, {
            value: String(counts.reviews),
            alert: counts.reviews > 0,
          })}
          {item("/portal-admin/users", "Users", Icon.Users)}
        </div>

        <div className="adm-sb-group">
          <div className="adm-sb-group-title">System</div>
          {item("/portal-admin/analytics", "Analytics", Icon.Analytics)}
          {item("/portal-admin/settings", "Settings", Icon.Settings)}
        </div>
      </nav>

      <div className="adm-sb-foot">
        <Link href="/" className="adm-sb-item" style={{ marginBottom: 6 }}>
          <Icon.External />
          <span>View live site</span>
        </Link>
        <div className="adm-sb-user">
          <div className="adm-sb-user-av">
            {user.image ? <img src={user.image} alt={user.name} /> : initials}
          </div>
          <div>
            <div className="adm-sb-user-name">{user.name}</div>
            <div className="adm-sb-user-role">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

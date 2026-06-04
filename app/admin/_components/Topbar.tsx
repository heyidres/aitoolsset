/**
 * Admin topbar — sticky header with page title, search, notif
 * bell, and a context-aware primary action button.
 *
 * Title + primary action are derived from the route. New
 * sections register their copy in the ROUTE_META table below.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type RouteMeta = {
  title: string;
  action?: { label: string; href: string };
};

const ROUTE_META: Record<string, RouteMeta> = {
  "/admin": { title: "Dashboard" },
  "/admin/submissions": { title: "Submissions" },
  "/admin/tools": { title: "Tools", action: { label: "New Tool", href: "/admin/tools/new" } },
  "/admin/news": { title: "News", action: { label: "New Story", href: "/admin/news/new" } },
  "/admin/blog": { title: "Blog", action: { label: "New Article", href: "/admin/blog/new" } },
  "/admin/categories": { title: "Categories", action: { label: "Add Category", href: "/admin/categories/new" } },
  "/admin/deals": { title: "Deals", action: { label: "Add Deal", href: "/admin/deals/new" } },
  "/admin/glossary": { title: "Glossary", action: { label: "Add Term", href: "/admin/glossary/new" } },
  "/admin/pages": { title: "Pages", action: { label: "New Page", href: "/admin/pages/new" } },
  "/admin/reviews": { title: "Reviews" },
  "/admin/users": { title: "Users" },
  "/admin/analytics": { title: "Analytics" },
  "/admin/settings": { title: "Settings" },
};

function resolveMeta(pathname: string): RouteMeta {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  // Match deepest known prefix (e.g. /admin/tools/new -> Tools)
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 1) {
    segments.pop();
    const key = "/" + segments.join("/");
    if (ROUTE_META[key]) return ROUTE_META[key];
  }
  return { title: "Admin" };
}

export function Topbar() {
  const pathname = usePathname() ?? "/admin";
  const meta = resolveMeta(pathname);

  return (
    <div className="adm-topbar">
      <div className="adm-tb-title">{meta.title}</div>

      <div className="adm-tb-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input type="text" placeholder="Search anything…" />
      </div>

      <button className="adm-tb-btn" title="Notifications" aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="dot" />
      </button>

      {meta.action && (
        <Link href={meta.action.href} className="adm-tb-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {meta.action.label}
        </Link>
      )}
    </div>
  );
}

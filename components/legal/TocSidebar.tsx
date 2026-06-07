/**
 * Sticky table-of-contents with scroll-spy. Shared by Privacy,
 * Terms, and Cookies pages. Pass the list of {id, label} entries
 * matching the in-page heading IDs.
 */

"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

export function TocSidebar({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < 140) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <aside className="toc">
      <div className="toc-title">On this page</div>
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={active === it.id ? "active" : ""}
        >
          {it.label}
        </a>
      ))}
    </aside>
  );
}

"use client";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog-toc";

/**
 * Sticky in-article table of contents.
 *
 * Receives the TOC items derived server-side from the article body
 * (see lib/blog-toc.ts → extractToc). Active row tracking uses
 * IntersectionObserver so the highlight follows the scroll position
 * instead of being driven by clicks alone.
 *
 * When `items` is empty (an article with no H2/H3), the component
 * renders a soft "—" so the sidebar slot still has something to show
 * instead of an awkward gap.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;
    const elements = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    // Mark the topmost intersecting heading as active. rootMargin shifts
    // the viewport's "active band" down a bit so the heading becomes
    // active just before it scrolls into view from the top.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  const jump = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-[12.5px] py-1" style={{ color: "var(--text-3)" }}>
        — no sections —
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[2px]">
      {items.map((it) => {
        const isActive = activeId === it.id;
        return (
          <button
            key={`${it.id}-${it.level}`}
            onClick={() => jump(it.id)}
            className="text-left text-[13px] py-[7px] px-[10px] rounded-sm cursor-pointer leading-[1.4] transition-all"
            style={{
              color: isActive ? "var(--blue)" : "var(--text-2)",
              background: isActive ? "var(--blue-soft)" : "transparent",
              borderLeft: `2px solid ${isActive ? "var(--blue)" : "transparent"}`,
              fontWeight: isActive ? 700 : 400,
              paddingLeft: it.level === 3 ? 24 : 10,
              fontSize: it.level === 3 ? 12.5 : 13,
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

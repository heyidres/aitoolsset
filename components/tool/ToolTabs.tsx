"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function ToolTabs({ reviewCount }: { reviewCount: number }) {
  const t = useTranslations("tool_page");
  const [active, setActive] = useState("overview");

  const TABS = [
    { key: "overview",     label: t("tab_overview"),    target: "#overview" },
    { key: "reviews",      label: t("tab_reviews", { count: reviewCount.toLocaleString() }), target: "#reviews" },
    { key: "alternatives", label: t("tab_alternatives"), target: "#related-tools" },
    { key: "pricing",      label: t("tab_pricing"),     target: "#pricing" },
  ];

  const onClick = (k: string, target: string) => {
    setActive(k);
    const el = document.querySelector(target);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <div
      className="sticky bg-white z-[100] px-9 section-pad-x"
      style={{ top: 58, borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-page mx-auto flex gap-0 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onClick(tab.key, tab.target)}
              className="font-display text-[13.5px] font-bold px-[18px] py-[14px] whitespace-nowrap transition-colors"
              style={{
                color: isActive ? "var(--blue)" : "var(--text-2)",
                borderBottom: `2px solid ${isActive ? "var(--blue)" : "transparent"}`,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

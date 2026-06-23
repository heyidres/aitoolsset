"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

const INTENTS = [
  { key: "popular",  labelKey: "intent_popular",   target: "#popular" },
  { key: "all",      labelKey: "intent_all",       target: "#all" },
  { key: "usecase",  labelKey: "intent_usecase",   target: "#usecase" },
  { key: "pricing",  labelKey: "intent_pricing",   target: "#pricing" },
  { key: "az",       labelKey: "intent_az",        target: "#az" },
  { key: "toprated", labelKey: "intent_top_rated", target: "/top-rated", external: true },
  { key: "new",      labelKey: "intent_new",       target: "/new",       external: true },
] as const;

export function IntentBar() {
  const t = useTranslations("categories_landing");
  const [active, setActive] = useState("popular");

  const onClick = (intent: (typeof INTENTS)[number]) => {
    setActive(intent.key);
    if ("external" in intent && intent.external) return;
    const el = document.querySelector(intent.target);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div
      className="bg-white sticky z-[100] px-9 py-6 section-pad-x"
      style={{ top: 58, borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-page mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
        <div className="font-display text-[13px] font-bold flex-shrink-0" style={{ color: "var(--text-2)" }}>
          {t("intent_label")}
        </div>
        <div className="flex gap-[6px] flex-nowrap">
          {INTENTS.map((i) => {
            const isActive = active === i.key;
            const cls = `intent-pill-hover font-display text-[12.5px] font-semibold px-[14px] py-[7px] rounded-pill whitespace-nowrap flex-shrink-0 cursor-pointer ${isActive ? "active" : ""}`;
            if ("external" in i && i.external) {
              return (
                <Link key={i.key} href={i.target} className={cls} style={{ color: isActive ? "#fff" : "var(--text-2)" }}>
                  {t(i.labelKey)}
                </Link>
              );
            }
            return (
              <button
                key={i.key}
                onClick={() => onClick(i)}
                className={cls}
                style={{ color: isActive ? "#fff" : "var(--text-2)" }}
              >
                {t(i.labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

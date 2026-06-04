"use client";
import { useState } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { Favicon } from "./Favicon";
import { VerifiedBadge } from "./VerifiedBadge";
import { DealRibbon } from "./DealRibbon";
import { useSaved, useVote } from "@/lib/storage";

export function ToolCard({ tool }: { tool: Tool }) {
  const { saved, toggle: toggleSave } = useSaved(tool.id);
  const { voted, toggle: toggleVote } = useVote(tool.id);
  const [copied, setCopied] = useState(false);

  const onShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.href}#${tool.id}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Link
      href={tool.link}
      className="group tc-hover relative flex flex-col bg-white rounded-lg p-5 tnum"
    >
      {tool.deal && <DealRibbon label={tool.deal.label} expires={tool.deal.expires} />}

      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-[46px] h-[46px] rounded-[11px] overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Favicon domain={tool.domain} name={tool.name} size={46} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-extrabold text-[15px] tracking-[-.3px] mb-[2px] flex items-center gap-[5px] truncate">
            <span className="truncate">{tool.name}</span>
            {tool.verified && <VerifiedBadge />}
          </div>
          <div className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
            {tool.tags[0]}
          </div>
        </div>
        <div className="flex gap-[6px] ml-auto flex-shrink-0">
          <ActionBtn
            active={saved}
            activeColor="#ef4444"
            title={saved ? "Unsave" : "Save"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleSave();
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </ActionBtn>
          <ActionBtn
            active={voted}
            activeColor="var(--blue)"
            title="Upvote"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleVote();
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Copy link" onClick={onShare}>
            {copied ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
          </ActionBtn>
        </div>
      </div>

      <div
        className="text-[13px] leading-[1.55] mb-[14px] overflow-hidden"
        style={{
          color: "var(--text-2)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          flex: 1,
        }}
      >
        {tool.desc}
      </div>

      <div className="flex items-center gap-[6px] flex-wrap">
        {tool.free && (
          <span
            className="text-[11px] font-bold px-[9px] py-[3px] rounded-pill"
            style={{
              color: "var(--green)",
              background: "var(--green-bg)",
              border: "1px solid var(--green-border)",
            }}
          >
            Free
          </span>
        )}
        {tool.tags.map((t) => (
          <span
            key={t}
            className="text-[11px] font-semibold px-[9px] py-[3px] rounded-pill"
            style={{
              color: "var(--text-2)",
              background: "var(--white)",
              border: "1px solid var(--border)",
            }}
          >
            {t}
          </span>
        ))}
        {tool.deal && (
          <span
            className="text-[11px] font-bold px-[8px] py-[3px] rounded-pill"
            style={{ color: "#f97316", background: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            🏷️ Deal
          </span>
        )}
        <span
          className="text-[11.5px] font-semibold ml-auto flex items-center gap-[3px] group-hover:hidden tnum"
          style={{ color: "var(--text-3)" }}
        >
          ♥ {tool.saves.toLocaleString()}
        </span>
        <span
          className="font-display text-[12px] font-bold px-3 py-[5px] rounded-pill ml-auto hidden group-hover:inline-flex items-center"
          style={{
            color: "var(--blue)",
            background: "var(--blue-soft)",
            border: "1px solid rgba(0,82,255,.15)",
          }}
        >
          Visit tool →
        </span>
      </div>
    </Link>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  active,
  activeColor,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-[30px] h-[30px] rounded-sm flex items-center justify-center transition-colors hover:bg-surface"
      style={{ color: active && activeColor ? activeColor : "var(--text-3)" }}
    >
      {children}
    </button>
  );
}

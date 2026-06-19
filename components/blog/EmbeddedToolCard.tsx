"use client";

import { useState } from "react";
import Link from "next/link";
import type { CmsTool } from "@/lib/cms";
import { Favicon } from "@/components/Favicon";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useSaved, useVote } from "@/lib/storage";

/**
 * Inline tool card rendered mid-article in a blog post.
 *
 * Visual reference: the `.tool-card` block from the GPT-5 prototype
 * (blog-post.html). Layout: 46px logo | name + category subtitle |
 * action buttons. Body: one-line description. Footer: pricing pill +
 * tags + save count + persistent "Visit tool →" CTA.
 *
 * Wired to the same localStorage save/vote hooks used by ToolCard so
 * a save here is reflected on category pages and /saved.
 */
type Props = {
  /** Resolved CMS tool. null = slug couldn't be matched (deleted / unpublished). */
  tool: SerializableTool | null;
  /** Marker slug — surfaced in the warning when tool is null. */
  slug: string;
};

/**
 * Minimal shape the card needs. Defined here (instead of CmsTool)
 * so a server parent can pre-serialize the data before handing it
 * to this client component — keeps Dates / nested types out.
 */
export type SerializableTool = {
  slug: string;
  name: string;
  tagline: string;
  domain: string;
  category: string;
  tags: string[];
  pricing: CmsTool["pricing"];
  logoUrl: string | null;
  verified: boolean;
  saveCount: number;
};

export function EmbeddedToolCard({ tool, slug }: Props) {
  const id = tool?.slug ?? slug;
  const { saved, toggle: toggleSave } = useSaved(id);
  const { voted, toggle: toggleVote } = useVote(id);
  const [copied, setCopied] = useState(false);

  const onShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.href}#${id}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!tool) {
    return (
      <div
        className="not-prose"
        style={{
          margin: "28px 0",
          padding: "14px 18px",
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: 10,
          color: "#92400e",
          fontSize: 13,
        }}
      >
        ⚠ Embedded tool <code style={{ fontFamily: "var(--mono)" }}>{slug}</code> is missing or unpublished.
      </div>
    );
  }

  const isFree = tool.pricing === "free" || tool.pricing === "freemium";
  const categoryLabel = tool.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      className="not-prose embed-tc-wrap"
      style={{ margin: "32px 0", display: "block" }}
    >
      <Link
        href={`/ai-tool/${tool.slug}`}
        className="embed-tc"
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          border: "1.5px solid var(--border)",
          borderRadius: 20,
          padding: 20,
          textDecoration: "none",
          color: "inherit",
          transition: "border-color .15s, box-shadow .15s, transform .15s",
        }}
      >
        {/* TOP — logo | name+verified+category | actions */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 11,
              overflow: "hidden",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Favicon domain={tool.domain} name={tool.name} size={46} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-.3px",
                color: "var(--text)",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {tool.name}
              {tool.verified && <VerifiedBadge />}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
              {categoryLabel}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
            <ActionBtn
              title={saved ? "Unsave" : "Save"}
              active={saved}
              activeColor="#ef4444"
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
              title="Upvote"
              active={voted}
              activeColor="var(--blue)"
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
            <ActionBtn title={copied ? "Copied" : "Copy link"} onClick={onShare}>
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

        {/* DESCRIPTION */}
        <div
          style={{
            fontSize: 13,
            color: "var(--text-2)",
            lineHeight: 1.55,
            marginBottom: 14,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily: "var(--font-body)",
          }}
        >
          {tool.tagline}
        </div>

        {/* FOOTER — pricing + tags + saves + visit */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {isFree && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--green)",
                padding: "3px 9px",
                borderRadius: 100,
                border: "1px solid var(--green-border)",
                background: "var(--green-bg)",
              }}
            >
              Free
            </span>
          )}
          {tool.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-2)",
                padding: "3px 9px",
                borderRadius: 100,
                border: "1px solid var(--border)",
                background: "#fff",
              }}
            >
              {t}
            </span>
          ))}
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--text-3)",
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ♥ {tool.saveCount.toLocaleString()}
          </span>
          <span
            className="embed-tc-cta"
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--blue)",
              background: "var(--blue-soft)",
              padding: "5px 12px",
              borderRadius: 100,
              border: "1px solid rgba(0,82,255,.15)",
              transition: "background .12s, color .12s",
            }}
          >
            Visit tool →
          </span>
        </div>
      </Link>
    </div>
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
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        color: active && activeColor ? activeColor : "var(--text-3)",
        transition: "background .12s, color .12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

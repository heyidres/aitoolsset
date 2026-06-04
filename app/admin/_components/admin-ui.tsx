/**
 * Shared admin UI primitives — Pill, VerifiedTick, ToolCell, etc.
 *
 * Kept deliberately small. Most admin pages compose pages out of
 * <Panel>, <Pill>, and direct table markup so the prototype's
 * exact spacing carries through.
 *
 * ToolCell is a client component because it uses onError on the
 * <img> to render an initial-letter fallback when a favicon 404s.
 */

"use client";

import { useState } from "react";
import { favicon } from "@/lib/tools";

// ── Verified blue tick (X-style) ─────────────────────────────
export function VerifiedTick() {
  return (
    <svg className="adm-verified-tick" viewBox="0 0 24 24" fill="none" aria-label="Verified">
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z"
        fill="#1D9BF0"
      />
      <path
        d="M9 12l2 2.5 4.5-5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Pill (status badge) ──────────────────────────────────────
type PillTone = "green" | "amber" | "red" | "purple" | "gray" | "blue";

export function Pill({ tone = "gray", children }: { tone?: PillTone; children: React.ReactNode }) {
  return <span className={`adm-pill ${tone}`}>{children}</span>;
}

// ── ToolCell (logo + name + meta) ────────────────────────────
export function ToolCell({
  name,
  domain,
  verified,
}: {
  name: string;
  domain: string;
  verified?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="adm-tool-cell">
      <div className="adm-tool-logo">
        {failed ? (
          <span style={{ fontSize: 14 }}>{(name[0] ?? "?").toUpperCase()}</span>
        ) : (
          <img src={favicon(domain, 64)} alt={name} onError={() => setFailed(true)} />
        )}
      </div>
      <div>
        <div className="adm-tool-name">
          {name}
          {verified && <VerifiedTick />}
        </div>
        <div className="adm-tool-meta">{domain}</div>
      </div>
    </div>
  );
}

// ── Status pill helper for known status strings ──────────────
const STATUS_TONE: Record<string, PillTone> = {
  live: "green",
  published: "green",
  active: "green",
  approved: "green",
  draft: "gray",
  scheduled: "blue",
  pending: "amber",
  review: "amber",
  expiring: "amber",
  expired: "red",
  rejected: "red",
  flagged: "red",
};

export function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status.toLowerCase()] ?? "gray";
  return <Pill tone={tone}>{status[0]?.toUpperCase() + status.slice(1)}</Pill>;
}

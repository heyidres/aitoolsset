"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { favicon } from "@/lib/tools";

type RowPost = {
  id: string;
  slug: string;
  headline: string;
  source: string;
  sourceDomain: string;
  sourceUrl: string;
  topic: string;
  status: "draft" | "review" | "approved" | "published";
  breaking: boolean;
  publishedAt: Date;
  draftedAt: Date | null;
};

const NEXT_STATUS: Record<RowPost["status"], RowPost["status"][]> = {
  draft: ["review"],
  review: ["approved", "draft"],
  approved: ["published", "review"],
  published: [],
};

const STATUS_COLOR: Record<RowPost["status"], string> = {
  draft: "var(--text-3)",
  review: "#ea580c",
  approved: "var(--blue)",
  published: "var(--green)",
};

export function AdminRow({ post }: { post: RowPost }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const change = (status: RowPost["status"]) => {
    start(async () => {
      setErr(null);
      const res = await fetch(`/api/admin/news/${post.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
      <div
        className="w-9 h-9 rounded-[9px] overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <img src={favicon(post.sourceDomain, 64)} alt={post.source} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {post.breaking && (
            <span
              className="text-[10px] font-extrabold uppercase tracking-[.07em] px-2 py-[2px] rounded-pill"
              style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
            >
              Breaking
            </span>
          )}
          <span
            className="text-[10px] font-extrabold uppercase tracking-[.07em] px-2 py-[2px] rounded-pill"
            style={{ background: "var(--blue-soft)", color: "var(--blue)", border: "1px solid rgba(0,82,255,.18)" }}
          >
            {post.topic}
          </span>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {post.source} · {new Date(post.publishedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <Link href={`/admin/news/${post.id}/edit`} className="font-display text-[14.5px] font-extrabold leading-[1.35] mt-1 block hover:text-blue">
          {post.headline}
        </Link>
        {err && <div className="text-xs mt-1" style={{ color: "#dc2626" }}>{err}</div>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-display text-xs font-bold uppercase tracking-[.06em]" style={{ color: STATUS_COLOR[post.status] }}>
          {post.status}
        </span>
        <Link
          href={`/admin/news/${post.id}/edit`}
          className="font-display text-[11.5px] font-bold px-3 py-[5px] rounded-pill transition-colors"
          style={{ color: "var(--blue)", border: "1.5px solid var(--blue)" }}
        >
          Edit
        </Link>
        {NEXT_STATUS[post.status].map((next) => (
          <button
            key={next}
            disabled={pending}
            onClick={() => change(next)}
            className="font-display text-[11.5px] font-bold px-3 py-[5px] rounded-pill transition-colors hover:bg-blue hover:text-white disabled:opacity-50"
            style={{
              color: STATUS_COLOR[next],
              border: `1.5px solid ${STATUS_COLOR[next]}`,
            }}
          >
            → {next}
          </button>
        ))}
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open source"
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-surface"
          style={{ color: "var(--text-3)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}

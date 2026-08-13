"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "../_components/admin-ui";
import { deleteSitePage, publishAllDraftPages } from "./_actions";
import type { CmsSitePage } from "@/lib/cms";

type Tab = "all" | "published" | "draft";

function fmt(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PagesTable({ rows }: { rows: CmsSitePage[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const counts = useMemo(() => ({
    all: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
  }), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab !== "all") r = r.filter((x) => x.status === tab);
    if (q.trim()) {
      const lc = q.toLowerCase();
      r = r.filter((x) => x.title.toLowerCase().includes(lc) || x.slug.toLowerCase().includes(lc));
    }
    return r;
  }, [rows, tab, q]);

  const [bulkPending, bulkStart] = useTransition();
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setPendingId(id);
    start(async () => {
      try { await deleteSitePage(id); router.refresh(); } finally { setPendingId(null); }
    });
  };

  const publishAll = () => {
    if (!confirm(`Publish all ${counts.draft} draft page${counts.draft === 1 ? "" : "s"} now?`)) return;
    setBulkMsg(null);
    bulkStart(async () => {
      try {
        const r = await publishAllDraftPages();
        setBulkMsg(`Published ${r.published.length}: ${r.published.join(", ")}`);
        router.refresh();
      } catch (e) {
        setBulkMsg(e instanceof Error ? e.message : "Failed");
      }
    });
  };

  return (
    <div className="adm-panel">
      <div className="adm-tbl-toolbar">
        <div className="adm-tbl-tabs">
          {([["all", "All"], ["published", "Published"], ["draft", "Draft"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`adm-tbl-tab ${tab === id ? "active" : ""}`}>{label} <span className="n">{counts[id]}</span></button>
          ))}
        </div>
        <div className="adm-tbl-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Search pages…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {counts.draft > 0 && (
          <button
            type="button"
            onClick={publishAll}
            disabled={bulkPending}
            className="adm-btn-sm ghost"
            style={{ padding: "7px 14px", color: "var(--green)", borderColor: "var(--green-border)" }}
          >
            {bulkPending ? "Publishing…" : `✓ Publish all ${counts.draft} draft${counts.draft === 1 ? "" : "s"}`}
          </button>
        )}
        <Link href="/portal-admin/pages/new" className="adm-btn-sm primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Page
        </Link>
      </div>
      {bulkMsg && (
        <div style={{ padding: "10px 20px", fontSize: 12.5, fontWeight: 600, color: "var(--green)", background: "var(--green-bg)", borderBottom: "1px solid var(--green-border)" }}>
          {bulkMsg}
        </div>
      )}
      <div className="adm-panel-body flush">
        <table className="adm-tbl">
          <thead><tr><th>Title</th><th>URL</th><th>Updated</th><th>Status</th><th /></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-3)" }}>No pages match.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} style={pendingId === p.id ? { opacity: 0.5 } : undefined}>
                  <td>
                    <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: 13.5 }}>{p.title}</div>
                    {p.deck && <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{p.deck.slice(0, 70)}{p.deck.length > 70 ? "…" : ""}</div>}
                  </td>
                  <td>
                    <code style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)" }}>/{p.slug}</code>
                  </td>
                  <td>{fmt(p.updatedAt)}</td>
                  <td><StatusPill status={p.status} /></td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/portal-admin/pages/${p.id}/edit`} className="adm-ra-btn" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </Link>
                      <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="adm-ra-btn go" title="View on site">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      </a>
                      <button type="button" className="adm-ra-btn danger" title="Delete" disabled={pendingId === p.id} onClick={() => handleDelete(p.id, p.title)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

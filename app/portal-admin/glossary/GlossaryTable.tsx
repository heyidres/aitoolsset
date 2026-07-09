"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "../_components/admin-ui";
import { deleteGlossaryTerm } from "./_actions";
import type { CmsGlossaryTerm } from "@/lib/cms";

type Cat = "all" | CmsGlossaryTerm["cat"];

function stripHtml(html: string, max = 80): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export function GlossaryTable({ rows }: { rows: CmsGlossaryTerm[] }) {
  const router = useRouter();
  const [cat, setCat] = useState<Cat>("all");
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const counts = useMemo(() => ({
    all: rows.length,
    core: rows.filter((r) => r.cat === "core").length,
    models: rows.filter((r) => r.cat === "models").length,
    training: rows.filter((r) => r.cat === "training").length,
    agents: rows.filter((r) => r.cat === "agents").length,
  }), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (cat !== "all") r = r.filter((x) => x.cat === cat);
    if (q.trim()) {
      const lc = q.toLowerCase();
      r = r.filter((x) => x.term.toLowerCase().includes(lc) || (x.acronym ?? "").toLowerCase().includes(lc));
    }
    return r;
  }, [rows, cat, q]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setPendingId(id);
    start(async () => {
      try { await deleteGlossaryTerm(id); router.refresh(); } finally { setPendingId(null); }
    });
  };

  return (
    <div className="adm-panel">
      <div className="adm-tbl-toolbar">
        <div className="adm-tbl-tabs">
          {([["all", "All"], ["core", "Core"], ["models", "Models"], ["training", "Training"], ["agents", "Agents"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setCat(id)} className={`adm-tbl-tab ${cat === id ? "active" : ""}`}>{label} <span className="n">{counts[id]}</span></button>
          ))}
        </div>
        <div className="adm-tbl-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Search terms…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Link href="/portal-admin/glossary/new" className="adm-btn-sm primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Term
        </Link>
      </div>
      <div className="adm-panel-body flush">
        <table className="adm-tbl">
          <thead><tr><th>Term</th><th>Category</th><th>Definition</th><th>Linked tool</th><th /></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-3)" }}>No terms match.</td></tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} style={pendingId === t.id ? { opacity: 0.5 } : undefined}>
                  <td>
                    <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: 13.5 }}>{t.term}</div>
                    {t.acronym && <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{t.acronym}</div>}
                  </td>
                  <td><Pill tone="blue">{t.cat[0].toUpperCase() + t.cat.slice(1)}</Pill></td>
                  <td style={{ color: "var(--text-2)", maxWidth: 420 }}>{stripHtml(t.definition)}</td>
                  <td>{t.linkedToolName ? <Pill tone="gray">{t.linkedToolName}</Pill> : <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/portal-admin/glossary/${t.id}/edit`} className="adm-ra-btn" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </Link>
                      <button type="button" className="adm-ra-btn danger" title="Delete" disabled={pendingId === t.id} onClick={() => handleDelete(t.id, t.term)}>
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

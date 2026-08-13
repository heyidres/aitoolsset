"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill, ToolCell } from "../_components/admin-ui";
import { deleteDeal } from "./_actions";
import type { CmsDeal } from "@/lib/cms";

type Tab = "all" | "active" | "expiring" | "exclusive" | "blackfriday";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusOf(d: CmsDeal): "active" | "expiring" | "expired" | "inactive" {
  if (!d.active) return "inactive";
  if (!d.expiresAt) return "active";
  const days = (d.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "expired";
  if (days < 7) return "expiring";
  return "active";
}

function offerLabel(d: CmsDeal): string {
  if (d.type === "percent") return `${d.amount}% off`;
  if (d.type === "flat") return `$${d.amount} off`;
  return `${d.amount}-day trial`;
}

export function DealsTable({ rows }: { rows: CmsDeal[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.active).length,
    expiring: rows.filter((r) => statusOf(r) === "expiring").length,
    exclusive: rows.filter((r) => r.exclusive).length,
    blackfriday: rows.filter((r) => r.blackFriday).length,
  }), [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab === "active") r = r.filter((x) => x.active);
    else if (tab === "expiring") r = r.filter((x) => statusOf(x) === "expiring");
    else if (tab === "exclusive") r = r.filter((x) => x.exclusive);
    else if (tab === "blackfriday") r = r.filter((x) => x.blackFriday);
    if (q.trim()) {
      const lc = q.toLowerCase();
      r = r.filter((x) => x.headline.toLowerCase().includes(lc) || x.toolName.toLowerCase().includes(lc) || (x.code ?? "").toLowerCase().includes(lc));
    }
    return r;
  }, [rows, tab, q]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete deal for "${name}"?`)) return;
    setPendingId(id);
    start(async () => {
      try { await deleteDeal(id); router.refresh(); } finally { setPendingId(null); }
    });
  };

  return (
    <div className="adm-panel">
      <div className="adm-tbl-toolbar">
        <div className="adm-tbl-tabs">
          {([["all", "All"], ["active", "Active"], ["expiring", "Expiring"], ["exclusive", "Exclusive"], ["blackfriday", "Black Friday"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`adm-tbl-tab ${tab === id ? "active" : ""}`}>{label} <span className="n">{counts[id]}</span></button>
          ))}
        </div>
        <div className="adm-tbl-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Search deals…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Link href="/portal-admin/deals/new" className="adm-btn-sm primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Deal
        </Link>
      </div>
      <div className="adm-panel-body flush">
        <table className="adm-tbl">
          <thead><tr><th>Tool</th><th>Offer</th><th>Code</th><th>Expires</th><th>Status</th><th /></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-3)" }}>No deals match.</td></tr>
            ) : (
              filtered.map((d) => {
                const s = statusOf(d);
                return (
                  <tr key={d.id} style={pendingId === d.id ? { opacity: 0.5 } : undefined}>
                    <td><ToolCell name={d.toolName} domain={d.toolDomain} /></td>
                    <td>
                      <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: 13 }}>{offerLabel(d)}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{d.headline.slice(0, 60)}</div>
                    </td>
                    <td>{d.code ? <code style={{ fontFamily: "var(--mono)", fontSize: 12, background: "var(--surface)", padding: "3px 8px", borderRadius: 5 }}>{d.code}</code> : <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                    <td>{fmtDate(d.expiresAt)}</td>
                    <td>
                      {s === "active" && <Pill tone="green">Active</Pill>}
                      {s === "expiring" && <Pill tone="amber">Expiring</Pill>}
                      {s === "expired" && <Pill tone="red">Expired</Pill>}
                      {s === "inactive" && <Pill tone="gray">Inactive</Pill>}
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <Link href={`/portal-admin/deals/${d.id}/edit`} className="adm-ra-btn" title="Edit">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </Link>
                        <button type="button" className="adm-ra-btn danger" title="Delete" disabled={pendingId === d.id} onClick={() => handleDelete(d.id, d.toolName)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

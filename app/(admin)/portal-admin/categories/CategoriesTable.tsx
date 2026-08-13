"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "../_components/admin-ui";
import { deleteCategory } from "./_actions";
import type { CmsCategory } from "@/lib/cms";

export function CategoriesTable({ rows }: { rows: CmsCategory[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const lc = q.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(lc) || r.slug.toLowerCase().includes(lc));
  }, [rows, q]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setPendingId(id);
    start(async () => {
      try {
        await deleteCategory(id);
        router.refresh();
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="adm-panel">
      <div className="adm-tbl-toolbar">
        <div className="adm-tbl-tabs">
          <button className="adm-tbl-tab active">All <span className="n">{rows.length}</span></button>
          <button className="adm-tbl-tab">Popular <span className="n">{rows.filter((r) => r.popular).length}</span></button>
        </div>
        <div className="adm-tbl-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Search categories…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Link href="/portal-admin/categories/new" className="adm-btn-sm primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Category
        </Link>
      </div>
      <div className="adm-panel-body flush">
        <table className="adm-tbl">
          <thead><tr><th>Category</th><th>Slug</th><th>Order</th><th>Popular</th><th /></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-3)" }}>No categories match.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} style={pendingId === c.id ? { opacity: 0.5 } : undefined}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: c.color ?? "var(--surface)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {c.icon ?? "📂"}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                        {c.description && <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.description.slice(0, 60)}{c.description.length > 60 ? "…" : ""}</div>}
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)" }}>/{c.slug}</code></td>
                  <td>{c.orderIndex}</td>
                  <td>{c.popular ? <Pill tone="green">Popular</Pill> : <Pill tone="gray">—</Pill>}</td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/portal-admin/categories/${c.id}/edit`} className="adm-ra-btn" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </Link>
                      <button type="button" className="adm-ra-btn danger" title="Delete" disabled={pendingId === c.id} onClick={() => handleDelete(c.id, c.name)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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

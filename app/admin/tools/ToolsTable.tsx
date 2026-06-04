/**
 * Client-side filterable tools table.
 *
 * Tabs (All / Published / Draft / Featured / Verified) and the
 * search box filter the in-memory dataset so navigation feels
 * instant. Delete posts to the server action and refreshes.
 */

"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill, StatusPill, ToolCell } from "../_components/admin-ui";
import { deleteTool } from "./_actions";

type Row = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  websiteUrl: string;
  category: string;
  pricing: "free" | "freemium" | "paid";
  saves: number;
  verified: boolean;
  featured: boolean;
  status: "draft" | "published";
};

type Tab = "all" | "published" | "draft" | "featured" | "verified";

function pricingLabel(p: Row["pricing"]): string {
  if (p === "free") return "Free";
  if (p === "freemium") return "Free + Paid";
  return "Paid";
}

export function ToolsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      draft: rows.filter((r) => r.status === "draft").length,
      featured: rows.filter((r) => r.featured).length,
      verified: rows.filter((r) => r.verified).length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    let r = rows;
    if (tab === "published") r = r.filter((x) => x.status === "published");
    else if (tab === "draft") r = r.filter((x) => x.status === "draft");
    else if (tab === "featured") r = r.filter((x) => x.featured);
    else if (tab === "verified") r = r.filter((x) => x.verified);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.domain.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q)
      );
    }
    return r;
  }, [rows, tab, query]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteTool(id);
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
          {(
            [
              ["all", "All"],
              ["published", "Published"],
              ["draft", "Draft"],
              ["featured", "Featured"],
              ["verified", "Verified"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`adm-tbl-tab ${tab === id ? "active" : ""}`}
            >
              {label} <span className="n">{counts[id]}</span>
            </button>
          ))}
        </div>

        <div className="adm-tbl-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Link href="/admin/tools/new" className="adm-btn-sm primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Tool
        </Link>
      </div>

      <div className="adm-panel-body flush">
        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Saves</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-3)" }}>
                  No tools match.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} style={pendingId === t.id ? { opacity: 0.5 } : undefined}>
                  <td>
                    <ToolCell name={t.name} domain={t.domain} verified={t.verified} />
                  </td>
                  <td>
                    <Pill tone="gray">{t.category}</Pill>
                  </td>
                  <td>{pricingLabel(t.pricing)}</td>
                  <td>{new Intl.NumberFormat("en-US").format(t.saves)}</td>
                  <td>
                    <StatusPill status={t.status} />
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <Link
                        href={`/admin/tools/${t.id}/edit`}
                        className="adm-ra-btn"
                        title="Edit"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <a
                        href={`/ai-tool/${t.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-ra-btn go"
                        title="View on site"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        className="adm-ra-btn danger"
                        title="Delete"
                        disabled={pendingId === t.id}
                        onClick={() => handleDelete(t.id, t.name)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
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

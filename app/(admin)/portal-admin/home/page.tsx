import Link from "next/link";
import { getAllHomeSections } from "@/lib/cms";
import { deleteHomeSection, seedDefaultHomeSections } from "./_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomeSectionsAdminPage() {
  const rows = await getAllHomeSections();

  if (rows.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏠</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            No homepage sections yet
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 540, margin: "0 auto 22px" }}>
            Sections drive the &ldquo;For Writers&rdquo;, &ldquo;For Developers&rdquo;, and similar editorial blocks on the homepage. Each section has its own badge, headline, tool list, and 2×2 use-case grid.
          </p>
          <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <form action={async () => { "use server"; await seedDefaultHomeSections(); }}>
              <button type="submit" className="adm-btn-sm primary" style={{ padding: "10px 22px" }}>
                ✨ Seed Writers + Developers
              </button>
            </form>
            <Link href="/portal-admin/home/new" className="adm-btn-sm ghost" style={{ padding: "10px 22px" }}>
              + Add manually
            </Link>
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: "var(--text-3)", maxWidth: 520, marginInline: "auto", lineHeight: 1.5 }}>
            Until you create at least one section the homepage falls back to the original hardcoded Writers + Developers blocks.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="adm-panel-title">Homepage sections</div>
          <div className="adm-panel-sub">{rows.length} section{rows.length === 1 ? "" : "s"} — drag with the position field to reorder</div>
        </div>
        <Link href="/portal-admin/home/new" className="adm-btn-sm primary">+ New section</Link>
      </div>
      <table className="adm-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>Pos.</th>
            <th>Badge</th>
            <th>Title</th>
            <th>Tools</th>
            <th>Use cases</th>
            <th style={{ width: 100 }}>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ opacity: r.enabled ? 1 : 0.55 }}>
              <td style={{ fontFamily: "var(--mono)", color: "var(--text-3)", fontSize: 12 }}>{r.position}</td>
              <td style={{ fontSize: 13, fontWeight: 700 }}>{r.badge}</td>
              <td style={{ fontSize: 13 }}>{r.title}</td>
              <td style={{ fontSize: 12, color: "var(--text-3)" }}>{r.toolSlugs.length}</td>
              <td style={{ fontSize: 12, color: "var(--text-3)" }}>{r.useCases.length}</td>
              <td>
                <span style={{
                  fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em",
                  padding: "3px 8px", borderRadius: 100,
                  color: r.enabled ? "var(--green)" : "var(--text-3)",
                  background: r.enabled ? "var(--green-bg)" : "var(--surface)",
                  border: `1px solid ${r.enabled ? "var(--green-border)" : "var(--border)"}`,
                }}>
                  {r.enabled ? "Live" : "Hidden"}
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                <Link href={`/portal-admin/home/${r.id}/edit`} className="adm-btn-sm ghost" style={{ marginRight: 6 }}>Edit</Link>
                <form action={async () => { "use server"; await deleteHomeSection(r.id); }} style={{ display: "inline" }}>
                  <button type="submit" className="adm-btn-sm ghost" style={{ color: "var(--red)" }}>Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

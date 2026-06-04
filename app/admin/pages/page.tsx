import Link from "next/link";
import { getAllSitePages } from "@/lib/cms";
import { PagesTable } from "./PagesTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const rows = await getAllSitePages();

  if (rows.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>No pages yet</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 460, margin: "0 auto 20px" }}>
            Create About, Privacy, Terms, Contact — or any custom landing page. They publish at <code style={{ fontFamily: "var(--mono)", background: "var(--surface)", padding: "1px 6px", borderRadius: 4 }}>/your-slug</code>.
          </p>
          <Link href="/admin/pages/new" className="adm-btn-sm primary">+ New page</Link>
        </div>
      </div>
    );
  }

  return <PagesTable rows={rows} />;
}

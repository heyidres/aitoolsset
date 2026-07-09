import Link from "next/link";
import { getAllGlossaryTerms } from "@/lib/cms";
import { GlossaryTable } from "./GlossaryTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GlossaryAdminPage() {
  const terms = await getAllGlossaryTerms();

  if (terms.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>No glossary terms yet</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>Build the AI vocabulary that appears at /glossary.</p>
          <Link href="/portal-admin/glossary/new" className="adm-btn-sm primary">+ Add your first term</Link>
        </div>
      </div>
    );
  }

  return <GlossaryTable rows={terms} />;
}

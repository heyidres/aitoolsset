/**
 * Tools admin — lists every tool from Postgres. New/edit/delete
 * go through server actions in ./_actions.ts.
 */

import Link from "next/link";
import { getAllTools } from "@/lib/cms";
import { ToolsTable } from "./ToolsTable";
import { BulkTranslateBar } from "./BulkTranslateBar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ToolsAdminPage() {
  const tools = await getAllTools();

  const rows = tools.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    domain: t.domain,
    websiteUrl: t.websiteUrl,
    category: t.category,
    pricing: t.pricing,
    saves: t.saveCount,
    verified: t.verified,
    featured: t.featured,
    status: t.status,
  }));

  if (tools.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
          <h2
            style={{
              fontFamily: "var(--font-manrope)",
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            No tools yet
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>
            Add your first tool to start building the directory.
          </p>
          <Link href="/admin/tools/new" className="adm-btn-sm primary">
            + Add your first tool
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <BulkTranslateBar />
      <ToolsTable rows={rows} />
    </>
  );
}

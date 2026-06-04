/**
 * Categories admin — list + search + delete. New/edit go to
 * dedicated routes (categories/new, categories/[id]/edit).
 */

import Link from "next/link";
import { getAllCategories } from "@/lib/cms";
import { CategoriesTable } from "./CategoriesTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const cats = await getAllCategories();

  if (cats.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            No categories yet
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>
            Categories organise tools on the directory. Add your first one to get started.
          </p>
          <Link href="/admin/categories/new" className="adm-btn-sm primary">+ Add your first category</Link>
        </div>
      </div>
    );
  }

  return <CategoriesTable rows={cats} />;
}

/**
 * Categories admin — list + search + delete. New/edit go to
 * dedicated routes (categories/new, categories/[id]/edit).
 */

import Link from "next/link";
import { getAllCategories } from "@/lib/cms";
import { CategoriesTable } from "./CategoriesTable";
import { SeedDefaultsButton } from "./SeedDefaultsButton";

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
          <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 520, margin: "0 auto 22px" }}>
            Categories organise tools on the directory. The tool form&apos;s category dropdown reads from this list, and each category gets its own public page at <code style={{ fontFamily: "var(--mono)", background: "var(--surface)", padding: "1px 6px", borderRadius: 4 }}>/ai-tools/&lt;slug&gt;</code>.
          </p>
          <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <SeedDefaultsButton />
            <Link href="/admin/categories/new" className="adm-btn-sm ghost" style={{ padding: "10px 22px" }}>
              + Add manually
            </Link>
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: "var(--text-3)", maxWidth: 520, marginInline: "auto", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-2)" }}>Seed 48 default categories</strong> imports the curated list from <code style={{ fontFamily: "var(--mono)" }}>lib/categories.ts</code> so you have a starting point. Safe to re-run; skips any slug that already exists.
          </div>
        </div>
      </div>
    );
  }

  return <CategoriesTable rows={cats} />;
}

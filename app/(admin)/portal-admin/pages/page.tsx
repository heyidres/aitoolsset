import Link from "next/link";
import { getAllSitePages } from "@/lib/cms";
import { PagesTable } from "./PagesTable";
import { SeedDefaultsButton } from "./SeedDefaultsButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const rows = await getAllSitePages();

  if (rows.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
          <h2
            style={{
              fontFamily: "var(--font-manrope)",
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            No pages yet
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 460, margin: "0 auto 22px" }}>
            Build custom landing pages, legal pages, or anything else. They publish at{" "}
            <code
              style={{
                fontFamily: "var(--mono)",
                background: "var(--surface)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              /your-slug
            </code>
            .
          </p>
          <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <SeedDefaultsButton />
            <Link href="/portal-admin/pages/new" className="adm-btn-sm ghost" style={{ padding: "9px 18px" }}>
              + New page
            </Link>
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "var(--text-3)",
              maxWidth: 520,
              marginInline: "auto",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--text-2)" }}>Seed default pages</strong> creates 5 pre-written drafts
            — About, Privacy, Terms, Contact, Cookies — that you can review and publish. Safe to re-run; skips any slug that already exists.
          </div>
        </div>
      </div>
    );
  }

  return <PagesTable rows={rows} />;
}

/**
 * /admin/site-content — edit every named text slot used across
 * the public site. Grouped by page → section so editors can scan
 * what's editable. Each row has an inline edit form + a
 * "Reset to default" if it was overridden.
 */

import { getAllSlotsForAdmin } from "@/lib/site-content";
import { SlotRow } from "./SlotRow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const slots = await getAllSlotsForAdmin();

  // Group: page → section → [rows]
  const grouped = new Map<string, Map<string, typeof slots>>();
  for (const s of slots) {
    if (!grouped.has(s.meta.page)) grouped.set(s.meta.page, new Map());
    const pageMap = grouped.get(s.meta.page)!;
    if (!pageMap.has(s.meta.section)) pageMap.set(s.meta.section, []);
    pageMap.get(s.meta.section)!.push(s);
  }

  const overrideCount = slots.filter((s) => s.isOverride).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="adm-panel" style={{ padding: 20 }}>
        <div
          style={{
            fontFamily: "var(--font-manrope)",
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          Site content
        </div>
        <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>
          Edit any of the named text snippets that appear on the public site. Each slot has a code-side default — your override replaces it.{" "}
          <strong style={{ color: "var(--text)", fontWeight: 700 }}>{overrideCount}</strong>{" "}
          of <strong className="tnum">{slots.length}</strong> slots currently have an override.
        </div>
      </div>

      {Array.from(grouped.entries()).map(([page, sections]) => (
        <div key={page} className="adm-panel" style={{ overflow: "visible" }}>
          <div className="adm-panel-head">
            <div>
              <div className="adm-panel-title">{page}</div>
              <div className="adm-panel-sub">
                {Array.from(sections.values()).reduce((acc, rows) => acc + rows.length, 0)} editable slot
                {Array.from(sections.values()).reduce((acc, rows) => acc + rows.length, 0) === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div style={{ padding: 0 }}>
            {Array.from(sections.entries()).map(([section, rows]) => (
              <div key={section}>
                <div
                  style={{
                    padding: "10px 20px",
                    background: "var(--bg)",
                    fontFamily: "var(--font-manrope)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    borderBottom: "1px solid var(--border)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {section}
                </div>
                {rows.map((row) => (
                  <SlotRow key={row.key} slot={row} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

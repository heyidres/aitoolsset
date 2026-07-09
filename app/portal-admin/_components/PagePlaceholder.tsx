/**
 * Placeholder shown on /admin/* routes that exist in the
 * sidebar but haven't been ported yet. Keeps the nav working
 * end-to-end while phase-2/3 pages are built.
 */

import Link from "next/link";

export function PagePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: 2 | 3;
}) {
  return (
    <div className="adm-panel">
      <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-manrope)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--blue)",
            background: "var(--blue-soft)",
            border: "1px solid rgba(0,82,255,.15)",
            padding: "4px 10px",
            borderRadius: 100,
            marginBottom: 16,
          }}
        >
          Phase {phase}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-manrope)",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: 8,
          }}
        >
          {title}
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 460, margin: "0 auto 20px" }}>
          {description}
        </p>
        <Link href="/portal-admin" className="adm-btn-sm primary">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}

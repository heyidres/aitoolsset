"use client";

import { useState, useTransition } from "react";
import { bulkTranslateAllTools } from "./_translate-actions";
import { i18n } from "@/lib/i18n/config";

type Result = Awaited<ReturnType<typeof bulkTranslateAllTools>>;

/**
 * One-shot bulk translator for catching up tools that pre-date the
 * Phase 4 auto-translate-on-save hook. Picks a target locale, calls
 * the server action, and shows per-tool progress.
 *
 * Idempotent — tools that already have a translation in the target
 * locale are skipped. Safe to re-run.
 */
export function BulkTranslateBar() {
  const targets = i18n.locales.filter((l) => l !== i18n.defaultLocale);
  const [target, setTarget] = useState<string>(targets[0] ?? "ko");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  if (targets.length === 0) return null;

  const run = () => {
    if (!confirm(`Translate every published tool that doesn't yet have a ${i18n.localeNames[target]} translation? This can take ~10 minutes for 140 tools and uses ~140 Gemini calls.`)) return;
    setResult(null);
    start(async () => {
      const r = await bulkTranslateAllTools(target);
      setResult(r);
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--blue-soft), #fff)",
        border: "1.5px solid rgba(0, 82, 255, .18)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontFamily: "var(--font)", fontSize: 14, fontWeight: 800, marginBottom: 2 }}>
          🌐 Bulk translate all tools
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
          Catches up tools that don&rsquo;t yet have a Korean (or other locale) translation.
          New tools auto-translate on save — this button is for the existing 140 backlog.
        </div>
      </div>
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        disabled={pending}
        style={{
          height: 36,
          padding: "0 12px",
          fontSize: 13,
          borderRadius: 8,
          border: "1.5px solid var(--border)",
          background: "#fff",
          color: "var(--text)",
        }}
      >
        {targets.map((l) => (
          <option key={l} value={l}>
            {i18n.localeFlags[l]} {i18n.localeNames[l]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="adm-btn-sm primary"
        style={{ minWidth: 180 }}
      >
        {pending ? "Translating… (~10 min)" : "Translate all"}
      </button>
      {result && (
        <div
          style={{
            width: "100%",
            background: result.ok ? "var(--green-bg)" : "var(--red-bg)",
            border: `1px solid ${result.ok ? "var(--green-border)" : "var(--red-border)"}`,
            color: result.ok ? "var(--green)" : "var(--red)",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          {result.ok ? (
            <>
              ✓ Done. <strong>{result.translated}</strong> translated, <strong>{result.skipped}</strong> already had translations, <strong>{result.failed}</strong> failed.
              {result.errors.length > 0 && (
                <details style={{ marginTop: 6 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700 }}>Show {result.errors.length} error{result.errors.length === 1 ? "" : "s"}</summary>
                  <ul style={{ marginTop: 6, paddingLeft: 18, fontSize: 12, color: "var(--text-2)" }}>
                    {result.errors.slice(0, 20).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          ) : (
            <>⚠ {result.error}</>
          )}
        </div>
      )}
    </div>
  );
}

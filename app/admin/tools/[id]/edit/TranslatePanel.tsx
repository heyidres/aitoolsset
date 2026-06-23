"use client";

import { useState, useTransition } from "react";
import { autoTranslateTool } from "../../_translate-actions";
import { i18n } from "@/lib/i18n/config";

type Status =
  | { kind: "idle" }
  | { kind: "running"; locale: string }
  | { kind: "done"; locale: string; fields: number }
  | { kind: "error"; locale: string; error: string };

/**
 * Inline panel on /admin/tools/[id]/edit that runs Gemini→Groq→Anthropic
 * to translate the tool's editorial fields into each non-default locale
 * and persists them to tool.translations[locale].
 *
 * Locales that already have a translation get a "Re-translate" button;
 * empty ones get "Translate now".
 */
export function TranslatePanel({
  toolId,
  existingLocales,
}: {
  toolId: string;
  /** Locales that ALREADY have a saved translation row. */
  existingLocales: string[];
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, start] = useTransition();
  const [translated, setTranslated] = useState<Set<string>>(new Set(existingLocales));

  const run = (locale: string) => {
    setStatus({ kind: "running", locale });
    start(async () => {
      const result = await autoTranslateTool(toolId, locale);
      if (result.ok) {
        setStatus({ kind: "done", locale, fields: result.fieldsTranslated });
        setTranslated((prev) => new Set(prev).add(locale));
      } else {
        setStatus({ kind: "error", locale, error: result.error });
      }
    });
  };

  // Show non-default locales only — translating English into English is pointless.
  const targets = i18n.locales.filter((l) => l !== i18n.defaultLocale);

  return (
    <div className="adm-panel" style={{ marginBottom: 18 }}>
      <div className="adm-panel-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="adm-panel-title">🌐 Translations</div>
          <div className="adm-panel-sub">
            Translate this tool&rsquo;s editorial fields into each supported locale. Stored on{" "}
            <code style={{ fontSize: 11.5 }}>tool.translations[locale]</code> and rendered automatically when the public page is visited in that locale. The public English fields are never modified.
          </div>
        </div>
      </div>
      <div className="adm-panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {targets.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            No non-default locales configured. Add one in <code>lib/i18n/config.ts</code>.
          </div>
        )}
        {targets.map((locale) => {
          const has = translated.has(locale);
          const isThisRunning = status.kind === "running" && status.locale === locale;
          return (
            <div
              key={locale}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 14px",
                background: "var(--surface)",
                borderRadius: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 22 }}>{i18n.localeFlags[locale]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font)", fontSize: 14, fontWeight: 800 }}>
                  {i18n.localeNames[locale]}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {has ? "Already translated — re-run to refresh." : "Not yet translated."}
                </div>
              </div>
              <a
                href={`/${locale}/ai-tool/${toolId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn-sm ghost"
                style={{ flexShrink: 0 }}
              >
                Preview ↗
              </a>
              <button
                type="button"
                onClick={() => run(locale)}
                disabled={pending || isThisRunning}
                className={has ? "adm-btn-sm ghost" : "adm-btn-sm primary"}
                style={{ flexShrink: 0, minWidth: 140 }}
              >
                {isThisRunning ? "Translating…" : has ? "↻ Re-translate" : "Translate now"}
              </button>
            </div>
          );
        })}

        {status.kind === "done" && (
          <div
            style={{
              fontSize: 13,
              color: "var(--green)",
              background: "var(--green-bg)",
              border: "1px solid var(--green-border)",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            ✓ Translated {status.fields} field{status.fields === 1 ? "" : "s"} into {i18n.localeNames[status.locale]}.
            Click <strong>Preview ↗</strong> to see it live.
          </div>
        )}
        {status.kind === "error" && (
          <div
            style={{
              fontSize: 13,
              color: "var(--red)",
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            ⚠ {status.error}
          </div>
        )}
      </div>
    </div>
  );
}

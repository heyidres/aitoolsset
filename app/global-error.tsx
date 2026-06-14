"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches anything that escapes per-route
 * error.tsx boundaries (including throws in generateMetadata or
 * root layout). Shows the actual error so we can diagnose the
 * cause instead of staring at a generic Vercel 500.
 *
 * MUST render its own <html>/<body> because it replaces the root
 * layout when triggered.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error] uncaught", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "60px 24px",
          maxWidth: 720,
          marginInline: "auto",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#5b616e", marginBottom: 20 }}>
          An uncaught error broke this page. The details below help the dev pinpoint the cause.
        </p>
        <div
          style={{
            background: "#f4f4f6",
            border: "1px solid #e5e7eb",
            padding: 14,
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace",
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          <div>
            <strong>Message:</strong> {error.message || "(none)"}
          </div>
          {error.digest && (
            <div style={{ marginTop: 8 }}>
              <strong>Digest:</strong> {error.digest}
            </div>
          )}
          {error.stack && (
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer" }}>Stack trace</summary>
              <pre style={{ marginTop: 8, fontSize: 11 }}>{error.stack}</pre>
            </details>
          )}
        </div>
        <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 18px",
              background: "#0052ff",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: "10px 18px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              color: "#0a0b0d",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Home
          </a>
        </div>
      </body>
    </html>
  );
}

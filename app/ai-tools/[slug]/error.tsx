"use client";

import { useEffect } from "react";

/**
 * Error boundary for /ai-tools/<slug>. Surfaces the underlying
 * error message + digest so we can diagnose production failures
 * (otherwise Next.js just shows a generic 500). Also logs to the
 * browser console so it shows up in Vercel logs alongside the
 * server-side stack.
 */
export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ai-tools/[slug]] render failed", error);
  }, [error]);

  return (
    <main style={{ padding: "80px 32px", maxWidth: 720, margin: "0 auto", fontFamily: "var(--font-manrope), system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Something went wrong on this category page</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 20 }}>
        The page tried to render but threw an error. Details below — share these with the dev so they
        can fix it.
      </p>
      <div
        style={{
          background: "var(--surface)",
          padding: 16,
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          overflow: "auto",
        }}
      >
        <div><strong>Message:</strong> {error.message || "(no message)"}</div>
        {error.digest && (
          <div style={{ marginTop: 8 }}>
            <strong>Digest:</strong> {error.digest}
          </div>
        )}
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 18px",
            background: "var(--blue)",
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
          href="/ai-tools"
          style={{
            padding: "10px 18px",
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to categories
        </a>
      </div>
    </main>
  );
}

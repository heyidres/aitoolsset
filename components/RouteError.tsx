"use client";

import { useEffect } from "react";

/**
 * Shared visitor-facing error card for per-route error.tsx boundaries.
 * Renders inside the site layout (no <html>/<body>). Never exposes the
 * error message, stack, or dev language — only a friendly message and an
 * opaque reference code for support. The real error is logged for us.
 */
export function RouteError({
  error,
  reset,
  logTag,
  heading = "Something went wrong",
  message = "We hit a temporary hiccup loading this page. Please try again in a moment.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  logTag: string;
  heading?: string;
  message?: string;
}) {
  useEffect(() => {
    console.error(logTag, error);
  }, [error, logTag]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 14, color: "var(--text)" }}>
          Oops
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.4px", color: "var(--text)" }}>
          {heading}
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.55, margin: "0 0 26px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "11px 22px",
              background: "var(--blue)",
              color: "#fff",
              border: 0,
              borderRadius: 100,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: "11px 22px",
              border: "1.5px solid var(--border-2)",
              borderRadius: 100,
              color: "var(--text)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Back to homepage
          </a>
        </div>
        {error.digest && (
          <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 30 }}>Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";

/**
 * Global error boundary — the last line of defence, catching anything that
 * escapes per-route error.tsx boundaries (throws in generateMetadata, the
 * root layout, etc.). It REPLACES the root layout, so it renders its own
 * <html>/<body> and can't use the site chrome/fonts.
 *
 * VISITOR-FACING: never shows the error message, stack, or "dev" language —
 * only a friendly page and an opaque reference code for support. The real
 * error is still logged (console.error → Vercel logs) for diagnosis.
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          color: "#0a0b0d",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: 24,
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: 440,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.2px",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                borderRadius: 5,
                background: "#0052ff",
              }}
            />
            AI Tools Set
          </div>

          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 14 }}>Oops</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.4px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5b616e", fontSize: 15, lineHeight: 1.55, margin: "0 0 26px" }}>
            We hit a temporary hiccup loading this page. It&rsquo;s not you — please try again in a
            moment.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "11px 22px",
                background: "#0052ff",
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
                border: "1.5px solid rgba(91,97,110,.28)",
                borderRadius: 100,
                color: "#0a0b0d",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Back to homepage
            </a>
          </div>

          {error.digest && (
            <p style={{ color: "#9aa0ae", fontSize: 12, marginTop: 30 }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}

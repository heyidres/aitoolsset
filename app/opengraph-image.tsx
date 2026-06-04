/**
 * Homepage Open Graph image — rendered at request time by
 * Next.js's `next/og` (Vercel's Satori). Cached at the CDN edge.
 *
 * Visit /opengraph-image to preview.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Tools Set — Find the best AI tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function HomeOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0052ff 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "#0052ff",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: 4,
                width: 28,
                height: 28,
              }}
            >
              <div style={{ background: "white", borderRadius: 3 }} />
              <div style={{ background: "rgba(255,255,255,.5)", borderRadius: 3 }} />
              <div style={{ background: "rgba(255,255,255,.5)", borderRadius: 3 }} />
              <div style={{ background: "white", borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px" }}>
            AI Tools Set
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-2.5px",
              maxWidth: 1000,
              display: "flex",
            }}
          >
            Find the best AI tools.
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              opacity: 0.7,
              maxWidth: 850,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            2,400+ tools across 48 categories — curated, ranked, updated daily.
          </div>
        </div>

        {/* Footer pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            opacity: 0.55,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            aitoolsset.com
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#4ade80" }} />
            <span>Updated daily</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

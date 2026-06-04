/**
 * Per-tool Open Graph image. Pulls the tool's name, tagline,
 * and verified status from either the hardcoded TOOLS list or
 * the DB and renders a custom share card.
 *
 * Edge runtime — works on Vercel without a Node bundle. Cached
 * by the CDN; regenerated on tool edit via revalidatePath.
 */

import { ImageResponse } from "next/og";
import { TOOLS } from "@/lib/tools";
import { getToolBySlug } from "@/lib/cms";

export const runtime = "nodejs"; // need Node for the DB query
export const alt = "AI Tools Set — Tool spotlight";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Loaded = {
  name: string;
  tagline: string;
  domain: string;
  verified: boolean;
  category: string;
};

async function load(slug: string): Promise<Loaded | null> {
  const hardcoded = TOOLS.find((t) => t.id === slug);
  if (hardcoded) {
    return {
      name: hardcoded.name,
      tagline: hardcoded.desc,
      domain: hardcoded.domain,
      verified: hardcoded.verified,
      category: hardcoded.cat,
    };
  }
  const cms = await getToolBySlug(slug).catch(() => null);
  if (!cms || cms.status !== "published") return null;
  return {
    name: cms.name,
    tagline: cms.tagline,
    domain: cms.domain,
    verified: cms.verified,
    category: cms.category,
  };
}

export default async function ToolOgImage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "white",
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          AI Tools Set
        </div>
      ),
      { ...size }
    );
  }

  // Truncate tagline so it doesn't overflow
  const tagline = data.tagline.length > 130 ? data.tagline.slice(0, 127) + "…" : data.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "white",
          color: "#0a0b0d",
          fontFamily: "system-ui",
        }}
      >
        {/* Top brand pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "#0052ff",
              borderRadius: 11,
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
                gap: 3,
                width: 22,
                height: 22,
              }}
            >
              <div style={{ background: "white", borderRadius: 2 }} />
              <div style={{ background: "rgba(255,255,255,.5)", borderRadius: 2 }} />
              <div style={{ background: "rgba(255,255,255,.5)", borderRadius: 2 }} />
              <div style={{ background: "white", borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#5b616e" }}>
            AI Tools Set
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#0052ff",
            }}
          >
            <span>· {data.category}</span>
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: "-3px",
              lineHeight: 1.05,
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            {data.name}
            {data.verified && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: "#1D9BF0",
                  color: "white",
                  fontSize: 38,
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.4,
              color: "#5b616e",
              maxWidth: 1050,
              display: "flex",
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#9aa0ae",
          }}
        >
          <div>{data.domain}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            aitoolsset.com/tools/{params.slug}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

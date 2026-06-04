/**
 * Per-blog-post Open Graph image. Pulls the title, deck,
 * category, and author from the DB; falls back to a friendly
 * "AI Tools Set Blog" card for the legacy GPT-5 slug.
 */

import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/cms";

export const runtime = "nodejs";
export const alt = "AI Tools Set blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LEGACY_SLUG = "gpt-5-complete-guide";

export default async function BlogOgImage({ params }: { params: { slug: string } }) {
  const post = params.slug === LEGACY_SLUG ? null : await getBlogPostBySlug(params.slug).catch(() => null);

  const title = post?.title ?? (params.slug === LEGACY_SLUG ? "GPT-5 Complete Guide" : "AI Tools Set Blog");
  const deck = post?.deck ?? "Hands-on AI tool reviews, comparisons, and guides.";
  const category = post?.category ?? "Article";
  const author = post?.author ?? "AI Tools Set Research Team";

  const safeTitle = title.length > 110 ? title.slice(0, 107) + "…" : title;
  const safeDeck = deck.length > 160 ? deck.slice(0, 157) + "…" : deck;

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
          background: "#FBF8F1",
          color: "#0a0b0d",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "#5b616e" }}>AI Tools Set</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#0052ff",
              background: "rgba(0,82,255,.08)",
              border: "1.5px solid rgba(0,82,255,.18)",
              borderRadius: 100,
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.08,
              display: "flex",
            }}
          >
            {safeTitle}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.45, color: "#5b616e", maxWidth: 1050, display: "flex" }}>
            {safeDeck}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: "1px solid rgba(91,97,110,.18)",
            fontSize: 20,
            color: "#5b616e",
          }}
        >
          <div>{author}</div>
          <div>aitoolsset.com/blog</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

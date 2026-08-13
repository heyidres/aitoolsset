import { ImageResponse } from "next/og";

// App Router file convention — Next.js serves this as /icon and wires up
// the <link rel="icon"> tag automatically. There was previously no
// favicon.ico, app/icon.*, or <link rel="icon"> anywhere in the app, so
// browser tabs, bookmarks, and search results showed no site icon at all.
// This mirrors the LogoMark used in <Nav> (components/Logo.tsx) so the tab
// icon matches the in-app logo mark.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0052ff",
          borderRadius: 17,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" />
          <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity={0.5} />
          <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity={0.5} />
          <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

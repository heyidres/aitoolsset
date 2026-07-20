import createNextIntlPlugin from "next-intl/plugin";
import { WP_REDIRECTS } from "./redirects-wp.mjs";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons/**" },
      // Vercel Blob CDN — admin-uploaded logos / screenshots / blog covers
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Keep heavy ESM-prone server-side packages OUT of the Next bundler
  // so Node loads them natively (handles ESM correctly).
  serverExternalPackages: [
    "@anthropic-ai/sdk",
    "@google/genai",
  ],
  experimental: {
    // Cap how many pages each build worker renders at once. Default (8)
    // meant many DB-backed pages fired their queries in the same instant
    // during static generation, bursting past what a pooled free-tier
    // Postgres connection (Supabase's Transaction pooler) can serve —
    // pages then timed out and failed the build. Rendering pages more
    // serially spreads the same queries out instead of batching them.
    staticGenerationMaxConcurrency: 2,
  },
  // 301 redirects preserving SEO + bookmarks during the URL rename:
  //   /tools/<slug>     →  /ai-tool/<slug>     (tool detail, singular)
  //   /categories       →  /ai-tools           (categories landing)
  //   /categories/<x>   →  /ai-tools/<x>       (defensive — in case any old links exist)
  async redirects() {
    return [
      {
        source: "/tools/:slug",
        destination: "/ai-tool/:slug",
        permanent: true,
      },
      {
        source: "/categories",
        destination: "/ai-tools",
        permanent: true,
      },
      {
        source: "/categories/:path*",
        destination: "/ai-tools/:path*",
        permanent: true,
      },
      // WordPress → Next.js cutover map (generated from the live WP sitemap).
      ...WP_REDIRECTS,
    ];
  },
  // Security headers applied to every route. Calibrated to be
  // protective without breaking the site's own scripts/styles.
  // If something legitimate stops working, loosen the matching
  // directive — don't disable headers wholesale.
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // Next.js + Tailwind + Vercel Analytics need 'unsafe-inline' and 'unsafe-eval' for runtime
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://vitals.vercel-insights.com https://vercel.live https://*.public.blob.vercel-storage.com https://challenges.cloudflare.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // HSTS — Vercel domains are HTTPS only, so we can safely enforce
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

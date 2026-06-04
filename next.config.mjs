/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons/**" },
      // Vercel Blob CDN — admin-uploaded logos / screenshots / blog covers
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
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
    ];
  },
};

export default nextConfig;

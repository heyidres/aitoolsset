import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? "https://aitoolsset.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/saved",
          "/u/",
          "/uploads/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

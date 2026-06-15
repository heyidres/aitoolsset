/**
 * ─────────────────────────────────────────────────────────────
 *  JSON-LD structured data helpers
 * ─────────────────────────────────────────────────────────────
 *
 *  Build schema.org snippets so Google can render rich results
 *  for our pages:
 *   • Product/SoftwareApplication for tool detail pages
 *   • Article for blog posts
 *   • BreadcrumbList for tool + blog + category detail
 *   • FAQPage for any page with a Q&A section
 *
 *  Each helper returns a plain JSON object; render with
 *  <script type="application/ld+json"> { JSON.stringify(...) } </script>
 *  or via the <JsonLd> component below.
 * ─────────────────────────────────────────────────────────────
 */

import React from "react";

const SITE = process.env.SITE_URL ?? "https://aitoolsset.com";

type Json = Record<string, unknown>;

/** SoftwareApplication / Product schema for a tool detail page. */
export function toolJsonLd(args: {
  name: string;
  slug: string;
  description: string;
  category: string;
  pricing: "free" | "freemium" | "paid";
  url: string;
  imageUrl?: string | null;
  rating?: { value: number; count: number };
}): Json {
  const priceDisplay =
    args.pricing === "free" ? "Free" : args.pricing === "freemium" ? "Freemium" : "Paid";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: args.name,
    description: args.description,
    applicationCategory: args.category,
    operatingSystem: "Web",
    url: `${SITE}/ai-tool/${args.slug}`,
    image: args.imageUrl ?? undefined,
    sameAs: args.url,
    offers: {
      "@type": "Offer",
      price: args.pricing === "paid" ? undefined : "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: priceDisplay,
    },
    aggregateRating:
      args.rating && args.rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: args.rating.value.toFixed(1),
            reviewCount: args.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

/** Article schema for a blog post. */
export function articleJsonLd(args: {
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  /** Legacy free-text byline. Used when no structured authors are provided. */
  author?: string | null;
  /**
   * E-E-A-T author entities. When present, takes precedence over `author`
   * and emits a full Person graph for each (with sameAs, jobTitle, image).
   */
  authors?: Json[];
  /** Optional Person entity for the fact-checker / editor. */
  reviewedBy?: Json;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
}): Json {
  const authorField: Json | Json[] =
    args.authors && args.authors.length > 0
      ? args.authors
      : args.author
      ? { "@type": "Person", name: args.author }
      : { "@type": "Organization", name: "AI Tools Set" };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description ?? undefined,
    image: args.imageUrl ?? undefined,
    author: authorField,
    ...(args.reviewedBy ? { reviewedBy: args.reviewedBy } : {}),
    publisher: {
      "@type": "Organization",
      name: "AI Tools Set",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/opengraph-image`,
      },
    },
    datePublished: args.publishedAt?.toISOString(),
    dateModified: (args.updatedAt ?? args.publishedAt)?.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE}/blog/${args.slug}`,
    },
  };
}

/** Breadcrumb schema. */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE}${item.url}`,
    })),
  };
}

/** FAQPage schema for FAQ sections. */
export function faqJsonLd(items: Array<{ q: string; a: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/** Org / website root JSON-LD for the homepage. */
export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Tools Set",
    url: SITE,
    logo: `${SITE}/opengraph-image`,
    sameAs: [],
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Tools Set",
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Drop into any Server Component to embed schema.org data. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON has no user input — safe to render as-is.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

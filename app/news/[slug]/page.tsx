import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { NewsArticle } from "@/components/news/NewsArticle";
import { fetchAllNews, findPostBySlug } from "@/lib/news";

export const revalidate = 1800;

export async function generateStaticParams() {
  const { posts } = await fetchAllNews();
  // Cap to 50 for build time; older posts fall back to on-demand revalidation.
  return posts.slice(0, 50).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPostBySlug(slug);
  if (!post) return { title: "Article not found — AI Tools Set" };
  const title = post.draft?.seoTitle ?? post.cardTitle;
  const description = post.draft?.metaDescription ?? post.text;
  return {
    title: `${title} — AI Tools Set`,
    description,
    alternates: { canonical: `https://aitoolsset.com/news/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://aitoolsset.com/news/${post.slug}`,
      publishedTime: new Date(post.timestamp).toISOString(),
      authors: [post.source],
      siteName: "AI Tools Set",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPostBySlug(slug);
  if (!post) notFound();

  const { posts: all } = await fetchAllNews();
  const related = all.filter((p) => p.slug !== post.slug && (p.topic === post.topic || p.source === post.source)).slice(0, 6);
  const canonical = `https://aitoolsset.com/news/${post.slug}`;

  // NewsArticle JSON-LD — improves eligibility for Google News, Discover, AI Overviews
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.draft?.seoTitle ?? post.cardTitle,
    datePublished: new Date(post.timestamp).toISOString(),
    dateModified: new Date(post.editorial.publishedAt ?? post.timestamp).toISOString(),
    author: { "@type": "Organization", name: post.source, url: `https://${post.domain}` },
    publisher: {
      "@type": "Organization",
      name: "AI Tools Set",
      logo: { "@type": "ImageObject", url: "https://aitoolsset.com/logo.png" },
    },
    description: post.draft?.metaDescription ?? post.text,
    isBasedOn: post.link,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    articleSection: post.topic,
    keywords: [post.source, post.tag, ...post.categories].join(", "),
  };

  // FAQPage schema when AI draft includes FAQs
  const faqLd = post.draft?.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.draft.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <NewsArticle post={post} related={related} canonicalUrl={canonical} />
      <Footer />
    </>
  );
}

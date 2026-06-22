import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { NewsClient } from "@/components/news/NewsClient";
import { fetchAllNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "AI News Feed — AI Tools Set",
  description:
    "Live AI news from official sources — OpenAI, DeepMind, Anthropic, Microsoft, Hugging Face — plus major outlets like TechCrunch, The Verge, and VentureBeat. Updated every 30 minutes.",
  openGraph: {
    title: "AI News Feed — AI Tools Set",
    description: "Live AI news from official sources and major outlets, updated every 30 minutes.",
    url: "https://aitoolsset.com/news",
    type: "website",
  },
};

// Revalidate the whole page every 30 minutes (matches feed cache)
export const revalidate = 1800;

export default async function NewsPage() {
  const { posts, live, total } = await fetchAllNews();
  return (
    <main>
      <Nav />
      <NewsClient posts={posts} liveCount={live} totalCount={total} />
    </main>
  );
}

import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ImagesClient } from "@/components/images/ImagesClient";

export const metadata: Metadata = {
  title: "AI Images & Prompts — Discover, Copy & Save AI-Generated Art | AI Tools Set",
  description:
    "Browse 10,000+ AI-generated images with prompts from Midjourney, DALL·E, Stable Diffusion, Flux, Ideogram, Leonardo AI, and more. Copy prompts, save favorites, and discover new visual ideas.",
  openGraph: {
    title: "AI Images & Prompts — AI Tools Set",
    description: "10,000+ AI image prompts from every major model.",
    url: "https://aitoolsset.com/images",
  },
};

export default function ImagesPage() {
  return (
    <main>
      <Nav />
      <ImagesClient />
      <Footer />
    </main>
  );
}

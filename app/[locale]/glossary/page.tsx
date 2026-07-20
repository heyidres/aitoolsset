import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { GlossaryClient } from "@/components/glossary/GlossaryClient";
import { getAllGlossaryTerms } from "@/lib/cms";
import { cmsGlossaryToLegacy } from "@/lib/cms-adapters";
import { alternatesFor } from "@/lib/i18n/hreflang";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";
// Stays force-dynamic: pre-rendering the full glossary for every locale
// at build time exceeds the 60s static-generation budget (verified in a
// local build). Rendered per-request; keep-warm covers cold-start.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? alternatesFor({ locale, path: "/glossary" }) : undefined;
  return {
    title: "AI Glossary — 80+ AI Terms Explained Simply | AI Tools Set",
    description:
      "The clearest AI dictionary on the internet. Plain-English definitions for every AI term — from RAG and LoRA to agentic AI, fine-tuning, and MCP. Updated weekly.",
    alternates,
    openGraph: {
      title: "AI Glossary — 80+ AI Terms Explained Simply",
      description: "Plain-English AI definitions, updated weekly.",
      url: alternates?.canonical ?? "https://aitoolsset.com/glossary",
    },
  };
}

export default async function GlossaryPage() {
  const cmsTerms = await getAllGlossaryTerms().catch(() => []);
  const glossaryOverride = cmsTerms.length > 0 ? cmsTerms.map(cmsGlossaryToLegacy) : undefined;

  return (
    <main>
      <Nav />
      <GlossaryClient glossaryOverride={glossaryOverride} />
      <Footer />
    </main>
  );
}

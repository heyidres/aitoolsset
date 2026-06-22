import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SubmitHero } from "@/components/submit/SubmitHero";
import { PricingPlans } from "@/components/submit/PricingPlans";
import { ComparisonTable } from "@/components/submit/ComparisonTable";
import { BenefitsGrid } from "@/components/submit/BenefitsGrid";
import { SubmitForm } from "@/components/submit/SubmitForm";
import { WhyWeCharge } from "@/components/submit/WhyWeCharge";
import { SubmitFaq } from "@/components/submit/SubmitFaq";

export const metadata: Metadata = {
  title: "Submit Your AI Tool — AI Tools Set",
  description:
    "Get your AI tool in front of 50,000+ users. Free basic listings, featured placement, and enterprise plans. Submit your tool and reach the exact audience that needs it.",
  openGraph: {
    title: "Submit Your AI Tool — AI Tools Set",
    description: "Reach 50,000+ AI practitioners, developers, and early adopters. Listed within 48 hours.",
    url: "https://aitoolsset.com/submit",
  },
};

export default function SubmitPage() {
  return (
    <main>
      <Nav />
      <SubmitHero />
      <PricingPlans />
      <ComparisonTable />
      <BenefitsGrid />
      <SubmitForm />
      <WhyWeCharge />
      <SubmitFaq />
      <Footer />
    </main>
  );
}

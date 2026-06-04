import Link from "next/link";

type Props = { categoryName: string; count: number };

export function CategoryIntro({ categoryName, count }: Props) {
  const lower = categoryName.toLowerCase();
  return (
    <section className="bg-white px-9 py-12 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-[880px] mx-auto">
        <h2 className="font-display font-black mb-[14px]" style={{ fontSize: 24, letterSpacing: "-.8px", lineHeight: 1.2 }}>
          What are AI {lower} tools — and which ones are actually worth using in 2026?
        </h2>
        <p className="text-base leading-[1.75] mb-4" style={{ color: "var(--text-2)" }}>
          <strong style={{ color: "var(--text)" }}>AI {lower} tools</strong> are software platforms that use generative AI, machine learning, and natural language processing to automate, optimise, or augment {lower} tasks — from writing ad copy and emails to running A/B tests, generating images, scheduling social posts, and analysing campaign performance. The category has exploded in the past 18 months: there are now over <strong style={{ color: "var(--text)" }}>2,000 AI {lower} platforms</strong> available, but only a fraction deliver real ROI for marketers.
        </p>
        <p className="text-base leading-[1.75] mb-4" style={{ color: "var(--text-2)" }}>
          This page lists the <strong style={{ color: "var(--text)" }}>{count} best AI {lower} tools</strong> our editors recommend in 2026, broken down by what they do best — <strong style={{ color: "var(--text)" }}>AI content generation</strong>, <strong style={{ color: "var(--text)" }}>SEO automation</strong>, <strong style={{ color: "var(--text)" }}>AI copywriting</strong>, <strong style={{ color: "var(--text)" }}>email {lower}</strong>, <strong style={{ color: "var(--text)" }}>social media management</strong>, <strong style={{ color: "var(--text)" }}>ad creative generation</strong>, and <strong style={{ color: "var(--text)" }}>{lower} analytics</strong>. Each tool has been hands-on tested, and we've included real user ratings, pricing tiers, integration support, and our honest take on who it's best for.
        </p>
        <p className="text-base leading-[1.75]" style={{ color: "var(--text-2)" }}>
          Whether you're a solo founder looking for <strong style={{ color: "var(--text)" }}>free AI {lower} software</strong>, a startup picking your first <strong style={{ color: "var(--text)" }}>AI content {lower} platform</strong>, or an enterprise team evaluating <strong style={{ color: "var(--text)" }}>AI tools for digital {lower} automation</strong> — start with the filters on the left to narrow down by pricing, rating, and capability. Need a recommendation? Jump to our{" "}
          <Link href="#editors-pick" className="font-bold" style={{ color: "var(--blue)" }}>
            Editor's Pick
          </Link>{" "}
          below, or read the{" "}
          <Link href="#faq" className="font-bold" style={{ color: "var(--blue)" }}>
            FAQ
          </Link>{" "}
          at the bottom of this page.
        </p>
      </div>
    </section>
  );
}

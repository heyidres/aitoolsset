import Link from "next/link";

export function CategoryOutro({ categoryName }: { categoryName: string }) {
  const lower = categoryName.toLowerCase();
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--mint)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[880px] mx-auto">
        <h2 className="font-display font-black mb-4" style={{ fontSize: 28, letterSpacing: "-1px", lineHeight: 1.2 }}>
          The future of AI in {lower}
        </h2>
        <p className="text-[15.5px] leading-[1.75] mb-[14px]" style={{ color: "var(--text-2)" }}>
          The <strong style={{ color: "var(--text)" }}>AI {lower} tools</strong> landscape is evolving faster than any other software category in 2026. What was cutting-edge last year — basic blog post generation, simple subject-line testing — is now table stakes. The frontier is moving toward <strong style={{ color: "var(--text)" }}>autonomous {lower} agents</strong>, multi-channel campaign orchestration, and AI systems that can reason about brand voice, audience segments, and business goals end-to-end.
        </p>
        <p className="text-[15.5px] leading-[1.75] mb-[14px]" style={{ color: "var(--text-2)" }}>
          If you're picking your first AI {lower} platform in 2026, our advice is:
        </p>
        <ul className="my-[14px] mb-[18px] pl-0 list-none">
          {[
            <><strong style={{ color: "var(--text)" }}>Start with the workflow that consumes the most of your time</strong> — usually content, ad copy, or email — and pick the best AI tool for that one job.</>,
            <><strong style={{ color: "var(--text)" }}>Prioritise brand-voice training</strong> — generic AI output is the #1 reason {lower} teams churn from these tools. Look for platforms that learn your tone.</>,
            <><strong style={{ color: "var(--text)" }}>Check the integrations</strong> — your AI tool is only as useful as its connection to your CMS, CRM, email platform, and analytics stack.</>,
            <><strong style={{ color: "var(--text)" }}>Watch for hidden costs</strong> — many tools charge per word, per generation, or per seat. Calculate the all-in monthly cost before committing.</>,
          ].map((li, i) => (
            <li
              key={i}
              className="text-[15px] leading-[1.75] mb-[6px] pl-6 relative"
              style={{ color: "var(--text-2)" }}
            >
              <span className="absolute left-0 font-extrabold" style={{ color: "var(--blue)" }}>→</span>
              {li}
            </li>
          ))}
        </ul>
        <p className="text-[15.5px] leading-[1.75]" style={{ color: "var(--text-2)" }}>
          Every tool listed on this page has been vetted by our editorial team, and we update this directory weekly with new releases, pricing changes, and feature updates. If you find a great <strong style={{ color: "var(--text)" }}>AI {lower} tool</strong> that's missing,{" "}
          <Link href="/submit" className="font-bold" style={{ color: "var(--blue)" }}>
            submit it here
          </Link>{" "}
          — we review every submission within 48 hours. And if you'd like our monthly roundup of new AI {lower} software delivered to your inbox,{" "}
          <Link href="/blog" className="font-bold" style={{ color: "var(--blue)" }}>
            subscribe to our newsletter
          </Link>{" "}
          — it goes out the first Monday of every month.
        </p>
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";

const FAQS = [
  { q: "How long does the review process take?", a: "Free listings are reviewed within **5–7 business days**. Featured listings are prioritised and reviewed within **24 hours**. Enterprise submissions are reviewed same day with a dedicated point of contact." },
  { q: "What criteria does your team use to approve tools?", a: "We review every tool to ensure it's genuinely functional, solves a real problem, and has an active development team behind it. We do not list abandoned projects, scam tools, or tools that make false claims. We also check that the listing information is accurate and the website is live." },
  { q: "Do I pay before or after approval?", a: "**You do not pay until your listing is approved.** For free listings, there is no payment. For Featured, you'll receive a payment link after approval. If your submission is declined, you are not charged." },
  { q: "Can I list my tool for free?", a: "Yes. Free listings are always available and include a full tool page, search visibility, and user reviews. Free listings do not include featured placement, verified badges, or analytics. We believe every legitimate AI tool deserves to be discoverable." },
  { q: "What is the Featured badge and verified checkmark?", a: "The Featured badge gives your tool prominent placement on the homepage and at the top of relevant category pages. The verified checkmark (similar to Twitter's blue tick) tells users that your tool's features and capabilities have been manually reviewed and confirmed by our editorial team." },
  { q: "Can I update my listing after it's published?", a: "Yes. Featured and Enterprise subscribers can update their listing content, screenshots, and details at any time via their account dashboard. Free listings can request updates by emailing our team — we process these within 5 business days." },
  { q: "Is my listing permanent?", a: "Free listings remain in the directory as long as your tool is actively maintained. Featured and Enterprise listings are active for the duration of your subscription. Listings for tools that become unavailable or abandoned are removed to maintain directory quality." },
  { q: "Do you offer refunds?", a: "We offer a **7-day refund policy** for Featured subscriptions if your listing has not yet been approved. Once a listing is live and traffic has been delivered, we do not offer refunds — but you can cancel anytime to stop future billing." },
  { q: "Can I submit a competitor's tool?", a: "No. You must own the tool or have explicit written permission from the tool's owner. Submitting tools you don't own without permission violates our Terms of Service and will result in your account being banned." },
  { q: "Do you offer deals for early-stage startups?", a: "Yes — we offer a **50% discount** on Featured listings for bootstrapped founders and early-stage startups (pre-seed, no external funding). Email us at listings@aitoolsset.com with your tool URL and a brief description of your stage." },
];

function renderMd(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--text)", fontWeight: 700 }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function SubmitFaq() {
  const [open, setOpen] = useState(-1);
  return (
    <section className="py-[72px] px-9 bg-white section-pad-x">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            FAQ
          </div>
          <h2 className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            Common questions
          </h2>
        </div>
        <div className="flex flex-col mt-10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex items-center justify-between w-full py-5 cursor-pointer gap-4 text-left"
                >
                  <div className="font-display text-[15.5px] font-bold flex-1" style={{ color: "var(--text)" }}>
                    {f.q}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all"
                    style={{
                      background: isOpen ? "var(--blue)" : "var(--surface)",
                      border: `1px solid ${isOpen ? "var(--blue)" : "var(--border)"}`,
                      color: isOpen ? "#fff" : "var(--text-2)",
                      transform: isOpen ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </div>
                </button>
                {isOpen && (
                  <div className="text-[14.5px] leading-[1.75] pb-5" style={{ color: "var(--text-2)" }}>
                    {renderMd(f.a)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

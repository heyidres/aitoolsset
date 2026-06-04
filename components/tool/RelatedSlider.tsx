"use client";
import { useRef } from "react";
import Link from "next/link";
import { Favicon } from "../Favicon";

const RELATED = [
  { name: "Claude", domain: "claude.ai", cat: "AI Chat", desc: "Nuanced reasoning and long-context analysis by Anthropic.", free: true },
  { name: "Google Gemini", domain: "gemini.google.com", cat: "AI Chat", desc: "Google's multimodal AI across text, images and video.", free: true },
  { name: "Perplexity", domain: "perplexity.ai", cat: "AI Search", desc: "AI-powered search with real-time citations.", free: true },
  { name: "MS Copilot", domain: "copilot.microsoft.com", cat: "AI Chat", desc: "Microsoft's AI assistant powered by GPT-4.", free: true },
  { name: "Mistral", domain: "mistral.ai", cat: "AI Chat", desc: "Open-weight models with best-in-class efficiency.", free: true },
  { name: "Cohere", domain: "cohere.com", cat: "AI API", desc: "Enterprise-grade language AI for business teams.", free: false },
  { name: "Groq", domain: "groq.com", cat: "AI API", desc: "Ultra-fast LLM inference for developers.", free: true },
];

export function RelatedSlider({ category }: { category: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slide = (dir: number) => {
    if (trackRef.current) trackRef.current.scrollLeft += dir * 220;
  };
  return (
    <section
      id="related-tools"
      className="px-9 py-12 section-pad-x"
      style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-page mx-auto overflow-hidden">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="font-display font-extrabold" style={{ fontSize: 24, letterSpacing: "-.6px" }}>
            Related {category} Tools
          </div>
          <Link href="/categories" className="font-display text-[13.5px] font-bold" style={{ color: "var(--blue)" }}>
            View all →
          </Link>
        </div>
        <div className="relative w-full max-w-full overflow-hidden">
          <button
            onClick={() => slide(-1)}
            className="absolute top-1/2 -translate-y-1/2 left-[-16px] w-[34px] h-[34px] rounded-full flex items-center justify-center z-10 transition-colors hover:bg-near-black hover:text-white hover:border-near-black"
            style={{ background: "var(--white)", border: "1.5px solid var(--border)", color: "var(--text-2)", boxShadow: "var(--shadow)" }}
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div
            ref={trackRef}
            className="flex gap-[14px] overflow-x-auto no-scrollbar pb-1 max-w-full"
            style={{ scrollBehavior: "smooth" }}
          >
            {RELATED.map((t) => (
              <Link
                key={t.name}
                href={`/tools/${t.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="tc-hover bg-white rounded-lg p-[18px] cursor-pointer flex-shrink-0"
                style={{ minWidth: 200, maxWidth: 200 }}
              >
                <div
                  className="w-10 h-10 rounded-[9px] overflow-hidden flex items-center justify-center mb-[10px]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <Favicon domain={t.domain} name={t.name} size={40} />
                </div>
                <div className="font-display text-[13.5px] font-extrabold mb-[3px]">{t.name}</div>
                <div className="text-[11.5px] mb-2" style={{ color: "var(--text-3)" }}>
                  {t.cat}
                </div>
                <div
                  className="text-xs leading-[1.45] mb-[10px] overflow-hidden"
                  style={{
                    color: "var(--text-2)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {t.desc}
                </div>
                {t.free && (
                  <span
                    className="text-[11px] font-bold px-2 py-[2px] rounded-pill inline-flex"
                    style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
                  >
                    Free
                  </span>
                )}
              </Link>
            ))}
          </div>
          <button
            onClick={() => slide(1)}
            className="absolute top-1/2 -translate-y-1/2 right-[-16px] w-[34px] h-[34px] rounded-full flex items-center justify-center z-10 transition-colors hover:bg-near-black hover:text-white hover:border-near-black"
            style={{ background: "var(--white)", border: "1.5px solid var(--border)", color: "var(--text-2)", boxShadow: "var(--shadow)" }}
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

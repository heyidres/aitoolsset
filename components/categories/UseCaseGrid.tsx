import Link from "next/link";
import { USE_CASES } from "@/lib/categories";
import { CategoriesSectionHeader } from "./SectionHeader";

/**
 * Extract the most distinctive 2-word keyword from a use-case name so
 * the search URL hits relevant tools. e.g. "Write a blog post" -> "blog".
 * Falls back to the full name when no obvious keyword can be derived.
 */
function useCaseKeyword(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("blog")) return "blog writing";
  if (lower.includes("logo")) return "logo design";
  if (lower.includes("data")) return "data analysis";
  if (lower.includes("video")) return "video editor";
  if (lower.includes("email")) return "email assistant";
  if (lower.includes("transcribe") || lower.includes("audio")) return "transcription";
  if (lower.includes("code")) return "code generation";
  if (lower.includes("social")) return "social media";
  return name;
}

export function UseCaseGrid() {
  return (
    <section id="usecase" className="py-[72px] px-9 section-pad-x" style={{ background: "var(--cream)" }}>
      <div className="max-w-page mx-auto">
        <CategoriesSectionHeader
          eyebrow="Find Tools Faster"
          title="Browse by Use Case"
          sub="Skip the categories — tell us what you're trying to do and we'll show you the right tools."
        />
        <div className="grid grid-cols-4 gap-[18px] uc-grid-4">
          {USE_CASES.map((u) => (
            <Link
              key={u.name}
              href={`/search?q=${encodeURIComponent(useCaseKeyword(u.name))}`}
              className="uc-card-cat-hover rounded-lg p-6 cursor-pointer tnum block"
              style={{ userSelect: "text" }}
            >
              <div className="font-display font-extrabold mb-1" style={{ fontSize: 15, letterSpacing: "-.2px", color: "var(--text)" }}>
                {u.name}
              </div>
              <div className="text-[12.5px] leading-[1.5] mb-[14px]" style={{ color: "var(--text-2)" }}>
                {u.desc}
              </div>
              <span className="font-display text-[12.5px] font-bold" style={{ color: "var(--blue)" }}>
                {u.count} tools →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

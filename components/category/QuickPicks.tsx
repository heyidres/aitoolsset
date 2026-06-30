import { Link } from "@/lib/i18n/navigation";
import { Favicon } from "../Favicon";

export type QuickPickView = {
  scenario: string;
  reason: string;
  tool: { name: string; slug: string; domain: string } | null;
};

/**
 * Decision-framework rail: "If you [scenario], pick [tool] because [reason]."
 * This is the format Google answer boxes and AI assistants quote, so it's a
 * strong AEO/GEO signal. Rendered only when the editor has added picks.
 */
export function QuickPicks({ categoryName, picks }: { categoryName: string; picks: QuickPickView[] }) {
  if (picks.length === 0) return null;
  return (
    <section className="py-16 px-9 section-pad-x bg-white" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1320px] mx-auto">
        <div className="mb-[30px]">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>Quick picks</div>
          <h2 className="font-display font-black mb-2" style={{ fontSize: 32, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
            Which {categoryName.toLowerCase()} tool should you pick?
          </h2>
          <p className="text-[14.5px] leading-[1.55] max-w-[680px]" style={{ color: "var(--text-2)" }}>
            Skip the research — find your scenario below and go straight to the right tool.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 quickpicks-grid">
          {picks.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-5 flex flex-col"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="text-[13px] font-bold mb-3" style={{ color: "var(--text-3)" }}>
                If you <span style={{ color: "var(--text)" }}>{p.scenario}</span>
              </div>
              {p.tool ? (
                <Link
                  href={`/ai-tool/${p.tool.slug}`}
                  className="group flex items-center gap-[10px] mb-3 p-3 rounded-md transition-colors"
                  style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)" }}
                >
                  <div
                    className="w-9 h-9 rounded-[8px] overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: "var(--white)", border: "1px solid var(--border)" }}
                  >
                    <Favicon domain={p.tool.domain} name={p.tool.name} size={36} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-[.06em]" style={{ color: "var(--blue)" }}>
                      Pick
                    </div>
                    <div className="font-display text-[15px] font-extrabold transition-colors group-hover:text-blue" style={{ color: "var(--text)" }}>
                      {p.tool.name}
                    </div>
                  </div>
                </Link>
              ) : null}
              <div className="text-[13.5px] leading-[1.6]" style={{ color: "var(--text-2)" }}>
                {p.reason}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

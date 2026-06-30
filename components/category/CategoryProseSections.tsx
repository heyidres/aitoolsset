import { sanitizeHtml } from "@/lib/sanitize";

export type ProseSection = { heading: string; body: string };

/**
 * Renders editor-authored prose sections (buying guide, "what changed this
 * year"). Bodies may be plain text (paragraphs separated by blank lines) or
 * HTML — both are sanitized. Used for two sections via the `variant` tint.
 */
export function CategoryProseSections({
  eyebrow,
  heading,
  sections,
  tint,
}: {
  eyebrow: string;
  heading: string;
  sections: ProseSection[];
  tint: string;
}) {
  if (sections.length === 0) return null;
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: tint, borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[880px] mx-auto">
        <div className="mb-8">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>{eyebrow}</div>
          <h2 className="font-display font-black" style={{ fontSize: 32, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
            {heading}
          </h2>
        </div>
        <div className="flex flex-col gap-7">
          {sections.map((s, i) => (
            <div key={i}>
              <h3 className="font-display font-extrabold mb-2" style={{ fontSize: 19, letterSpacing: "-.4px", color: "var(--text)" }}>
                {s.heading}
              </h3>
              <div
                className="tool-prose"
                style={{ fontSize: 15.5, lineHeight: 1.75, color: "var(--text-2)" }}
                dangerouslySetInnerHTML={{ __html: bodyToHtml(s.body) }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * If the body already contains block HTML, sanitize and use as-is.
 * Otherwise treat it as plain text: split on blank lines into <p> paragraphs
 * (single newlines become <br>), escaping HTML special chars first.
 */
function bodyToHtml(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  if (/<(p|ul|ol|h[1-6]|blockquote|table|div)\b/i.test(trimmed)) {
    return sanitizeHtml(trimmed);
  }
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return trimmed
    .split(/\n\s*\n/)
    .map((para) => `<p>${esc(para).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

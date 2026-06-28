/**
 * Server-side helpers for the blog detail page sidebar.
 *
 * Two responsibilities:
 *
 *   1. extractToc(html)         — pull every <h2> and <h3> heading out of
 *                                 the article body, build a stable anchor
 *                                 id from each one, AND rewrite the html
 *                                 to inject `id=""` attributes on those
 *                                 headings so the TOC's click-to-jump
 *                                 actually lands on something.
 *   2. extractToolSlugs(html)   — scan the body for tool references and
 *                                 return the unique slug list, in the
 *                                 order they first appear. Two sources:
 *                                   • `[[tool:slug]]` markers inserted by
 *                                     the BlogForm's "+ Tool" button
 *                                   • `<a href="/ai-tool/<slug>">` links
 *                                     (with or without locale prefix)
 *
 * Pure-string, no jsdom — same ESM-crash-avoidance reason as
 * lib/sanitize.ts.
 */

export type TocItem = {
  /** Anchor id injected into the <h2|h3>. */
  id: string;
  /** Visible heading text. */
  label: string;
  /** 2 → top-level row, 3 → indented sub-row. */
  level: 2 | 3;
};

function slugifyHeading(s: string): string {
  return s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "section";
}

/**
 * Walk every <h2> / <h3> in the html. For each, capture:
 *   - the text content (for the TOC label)
 *   - an anchor id (existing one if present, else slugified from text)
 *   - the heading level (2 or 3)
 * Returns the deduplicated TOC list AND the same html with `id="..."`
 * injected on any heading that didn't already have one.
 */
export function extractToc(html: string | null | undefined): { toc: TocItem[]; htmlWithIds: string } {
  if (!html) return { toc: [], htmlWithIds: html ?? "" };

  const toc: TocItem[] = [];
  const used = new Set<string>();

  const htmlWithIds = html.replace(
    /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_full, levelStr: string, attrs: string, inner: string) => {
      const level = (levelStr === "2" ? 2 : 3) as 2 | 3;
      const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (!text) return _full;

      // Reuse existing id if present, otherwise generate from text and
      // de-duplicate against earlier headings in the same article.
      const existingIdMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
      let id = existingIdMatch ? existingIdMatch[1] : slugifyHeading(text);
      let suffix = 2;
      while (used.has(id)) id = `${id.replace(/-\d+$/, "")}-${suffix++}`;
      used.add(id);

      toc.push({ id, label: text, level });

      // Inject id if the heading didn't already have one. Otherwise leave
      // the existing markup untouched.
      if (existingIdMatch) return _full;
      const cleanAttrs = attrs.trim();
      return `<h${levelStr}${cleanAttrs ? " " + cleanAttrs : ""} id="${id}">${inner}</h${levelStr}>`;
    },
  );

  return { toc, htmlWithIds };
}

/**
 * Return tool slugs referenced in the article body, in order of first
 * appearance, deduplicated.
 *
 * Sources scanned:
 *   • `[[tool:my-slug]]` markers (BlogForm "+ Tool" button)
 *   • `<a href="/ai-tool/my-slug">`     (English / no-prefix)
 *   • `<a href="/{locale}/ai-tool/my-slug">` (locale-prefixed)
 *
 * Doesn't try to validate that the slugs exist — caller does the
 * lookup, missing slugs render nothing.
 */
export function extractToolSlugs(html: string | null | undefined): string[] {
  if (!html) return [];
  const slugs: string[] = [];
  const seen = new Set<string>();
  const push = (slug: string) => {
    const clean = slug.trim().toLowerCase();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    slugs.push(clean);
  };

  // [[tool:slug]] markers
  for (const m of html.matchAll(/\[\[tool:([a-z0-9-]+)\]\]/gi)) {
    push(m[1]);
  }
  // /ai-tool/<slug> links — optional locale prefix
  for (const m of html.matchAll(/href=["'](?:\/[a-z]{2})?\/ai-tool\/([a-z0-9-]+)/gi)) {
    push(m[1]);
  }

  return slugs;
}

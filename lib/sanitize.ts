/**
 * Server-side HTML sanitizer for rich-text fields that originate
 * from the admin (blog body, page body, glossary definition,
 * tool description, category intro, etc).
 *
 * Pure-JS implementation — NO jsdom, NO ESM-only deps. This is
 * load-bearing: the previous isomorphic-dompurify implementation
 * crashed the Vercel runtime with "require() of ES Module
 * @exodus/bytes" through the jsdom → html-encoding-sniffer chain.
 *
 * The TipTap admin editor already restricts what authors can type,
 * so this is defense-in-depth against:
 *   - Stored XSS (script / event handlers / javascript: urls) if
 *     an editor account is ever compromised
 *   - Tag/attribute drift if TipTap's whitelist changes upstream
 *
 * What it does, in order:
 *   1. Strip dangerous block tags + their CONTENTS (script, style,
 *      iframe, object, embed, form, input, link, meta, base)
 *   2. Strip on* event-handler attributes
 *   3. Strip javascript: / data: / vbscript: URIs in href / src
 *   4. Strip standalone tags not in the allowlist (keeping their
 *      inner text)
 *   5. Strip style="" attributes (CSS-based XSS vector)
 *
 * Conservative on purpose — when in doubt, leave behavior alone
 * rather than introduce a subtle parser bug.
 */

/** Tags whose contents are nuked entirely, not just unwrapped. */
const NUKE_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "link",
  "meta",
  "base",
  "svg",
  "math",
];

/** Allowed editorial tags — anything else gets unwrapped. */
const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "b", "i", "u", "s", "mark", "small", "sup", "sub",
  "a", "code", "pre", "kbd", "samp",
  "ul", "ol", "li",
  "blockquote",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "img", "figure", "figcaption",
  "span", "div", "section", "article",
]);

const DANGEROUS_URI_RE = /^\s*(javascript|data|vbscript|file):/i;

/**
 * Return a safe version of an editor-supplied HTML string.
 * Returns "" for null / undefined / empty input.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  let out = String(html);

  // 1. Nuke dangerous tag + contents (case-insensitive, multiline)
  for (const tag of NUKE_TAGS) {
    const open = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi");
    const selfClosed = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    out = out.replace(open, "");
    out = out.replace(selfClosed, "");
  }

  // 2. Strip HTML comments (potential conditional-comment XSS)
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  // 3. Walk every opening tag, scrub its attributes
  out = out.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_match, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      // Unwrap unknown tag — drop the tag but keep the content
      return "";
    }
    const cleanAttrs = scrubAttributes(rawAttrs, tag);
    return cleanAttrs ? `<${tag} ${cleanAttrs}>` : `<${tag}>`;
  });

  // 4. Walk every closing tag, drop unknown ones
  out = out.replace(/<\/([a-zA-Z][a-zA-Z0-9]*)\s*>/g, (_match, rawTag) => {
    const tag = rawTag.toLowerCase();
    return ALLOWED_TAGS.has(tag) ? `</${tag}>` : "";
  });

  return out;
}

/** Allowed attributes per tag — global plus tag-specific. */
const GLOBAL_ATTRS = new Set(["class", "id", "title"]);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "srcset", "alt", "width", "height", "loading", "decoding"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  td: new Set(["colspan", "rowspan"]),
  table: new Set(["summary"]),
};

function scrubAttributes(raw: string, tag: string): string {
  if (!raw || !raw.trim()) return "";
  const allowed = TAG_ATTRS[tag];
  const keep: string[] = [];

  // Match: name, name=value, name="value", name='value'
  const attrRe = /([a-zA-Z_:][a-zA-Z0-9_:.\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";

    // Drop all on* event handlers
    if (name.startsWith("on")) continue;
    // Drop inline style — CSS-based XSS vector
    if (name === "style") continue;

    // Allowlist check
    const isGlobal = GLOBAL_ATTRS.has(name);
    const isTagSpecific = allowed?.has(name) ?? false;
    if (!isGlobal && !isTagSpecific) continue;

    // URL attributes — reject dangerous protocols
    if ((name === "href" || name === "src" || name === "srcset") && DANGEROUS_URI_RE.test(value)) {
      continue;
    }

    // Re-quote with double quotes, escape any embedded double quotes
    const safeVal = value.replace(/"/g, "&quot;");
    keep.push(value ? `${name}="${safeVal}"` : name);
  }

  // Auto-add rel="noopener noreferrer" to <a target="_blank">
  if (tag === "a" && /\btarget\s*=\s*["']?_blank/i.test(raw) && !keep.some((a) => a.startsWith("rel="))) {
    keep.push(`rel="noopener noreferrer"`);
  }

  return keep.join(" ");
}

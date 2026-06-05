/**
 * Server-side HTML sanitizer for rich-text fields that originate
 * from the admin (blog body, page body, glossary definition,
 * tool description, etc).
 *
 * Use whenever you render DB HTML via `dangerouslySetInnerHTML`.
 * The TipTap editor doesn't allow arbitrary HTML by default, but
 * the DB is the trusted boundary — if an editor's account is ever
 * compromised, an attacker could insert `<script>` directly. This
 * sanitizer is the last line of defence.
 *
 * isomorphic-dompurify works in both Node (server components) and
 * browser bundles, so the same helper covers all callers.
 */

import DOMPurify from "isomorphic-dompurify";

/** Tags + attributes safe to render in editorial body content. */
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "b", "i", "u", "s", "mark", "small", "sup", "sub",
  "a", "code", "pre", "kbd",
  "ul", "ol", "li",
  "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "img", "figure", "figcaption",
  "span", "div",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "srcset", "alt", "title", "width", "height", "loading", "decoding",
  "class",
  "id",
  "colspan", "rowspan",
];

/**
 * Return a safe version of an editor-supplied HTML string.
 * Strips <script>, <style>, on* attribute handlers, javascript: URLs,
 * and any tag/attribute not in the allowlists above.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "form", "input", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    // Permit https/http/mailto links; reject javascript: and data: URLs
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    USE_PROFILES: { html: true },
  });
}

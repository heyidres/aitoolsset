/**
 * Renders a CMS blog body, expanding `[[tool:slug]]` markers into
 * server-rendered tool cards.
 *
 * The admin's RTE "+ Insert tool card" button writes the marker as
 * plain text. Here we split the sanitized HTML on the marker regex,
 * render each text segment via `dangerouslySetInnerHTML`, and slot
 * a `<EmbeddedToolCard>` in between.
 *
 * Server component — runs the DB lookup for each unique slug ONCE
 * via Promise.all so a 5-card article costs one round-trip.
 */

import { sanitizeHtml } from "@/lib/sanitize";
import { getToolBySlug, type CmsTool } from "@/lib/cms";
import { EmbeddedToolCard } from "./EmbeddedToolCard";

const MARKER = /\[\[tool:([a-z0-9-]+)\]\]/g;

export async function BlogBody({ html }: { html: string }) {
  // 1. Sanitize first so any unsafe HTML is stripped BEFORE we look at markers.
  const safe = sanitizeHtml(html);

  // 2. Extract every unique tool slug referenced in the body.
  const slugs = Array.from(new Set(Array.from(safe.matchAll(MARKER), (m) => m[1])));

  // 3. Fetch all referenced tools in parallel.
  const tools = await Promise.all(slugs.map((s) => getToolBySlug(s).catch(() => null)));
  const bySlug = new Map<string, CmsTool>();
  for (let i = 0; i < slugs.length; i++) {
    const t = tools[i];
    if (t && t.status === "published") bySlug.set(slugs[i], t);
  }

  // 4. Split the body on marker boundaries; for each marker chunk,
  // render either the embedded card (if the tool exists + is published)
  // or a small fallback chip noting the missing reference.
  const segments: Array<{ kind: "html"; value: string } | { kind: "tool"; slug: string }> = [];
  let lastIdx = 0;
  for (const match of safe.matchAll(MARKER)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      segments.push({ kind: "html", value: safe.slice(lastIdx, idx) });
    }
    segments.push({ kind: "tool", slug: match[1] });
    lastIdx = idx + match[0].length;
  }
  if (lastIdx < safe.length) {
    segments.push({ kind: "html", value: safe.slice(lastIdx) });
  }

  return (
    <article className="blog-prose">
      {segments.map((seg, i) =>
        seg.kind === "html" ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: stripEmptyMarkerWrapper(seg.value) }} />
        ) : (
          <EmbeddedToolCard key={i} tool={bySlug.get(seg.slug) ?? null} slug={seg.slug} />
        )
      )}
    </article>
  );
}

/**
 * The admin's "+ Insert tool card" button wraps the marker in `<p>…</p>`
 * (TipTap auto-wraps inserted text). After we strip the marker the
 * paragraph would be empty. Trim the empty wrapper so we don't ship
 * a stray `<p></p>` to the DOM.
 */
function stripEmptyMarkerWrapper(html: string): string {
  return html.replace(/<p>\s*<\/p>/g, "");
}

/**
 * Plain-text markers for content blocks in blog body HTML.
 *
 * Markers survive sanitization because they're just text. The
 * BlogBody component scans the sanitized HTML for them and renders
 * a React component in place of each one.
 *
 * SUPPORTED MARKERS
 *
 *   [[tool:slug]]
 *     Tool card. Inline single-line marker.
 *
 *   [[tldr]]Your quick answer text.[[/tldr]]
 *     TL;DR / featured-snippet box. Inline HTML allowed inside.
 *
 *   [[highlight title="TL;DR"]]Callout text.[[/highlight]]
 *     Highlight box with optional title.
 *
 *   [[verdict]]
 *     LEFT: Perplexity wins for | Research, citations, news
 *     RIGHT: ChatGPT wins for | Writing, coding, reasoning
 *     [[/verdict]]
 *
 *   [[proscons]]
 *     PROS: every answer has sources | real-time web | generous free tier
 *     CONS: weak long-form writing | no images | smaller context
 *     [[/proscons]]
 *
 *   [[round n=1 title="Research" winner="Perplexity"]]
 *     Body text here, with <strong> and full HTML.
 *     [[/round]]
 *
 *   [[usecase audience="If you're a writer" pick="Use ChatGPT"]]
 *     Why text here.
 *     [[/usecase]]
 *
 * Author tip: each block can be inserted via the editor toolbar
 * (BlogForm "+ Insert block" dropdown) which auto-fills a template.
 */

export type ParsedBlock =
  | { kind: "tool"; slug: string }
  | { kind: "tldr"; body: string }
  | { kind: "highlight"; title?: string; body: string }
  | { kind: "verdict"; left: { title: string; text: string }; right: { title: string; text: string } }
  | { kind: "proscons"; pros: string[]; cons: string[] }
  | { kind: "round"; n: number; title: string; winner?: string; body: string }
  | { kind: "usecase"; audience: string; pick: string; reason: string };

export type BodySegment =
  | { kind: "html"; value: string }
  | { kind: "block"; block: ParsedBlock };

/**
 * Master regex matching ANY supported marker. Each alternation is
 * a discrete marker shape — we discriminate on which capture group
 * matched in the parser below.
 *
 * Multiline + dotAll so block-style markers can span newlines.
 */
const ALL_MARKERS_RE =
  /\[\[tool:([a-z0-9-]+)\]\]|\[\[tldr\]\]([\s\S]*?)\[\[\/tldr\]\]|\[\[highlight(?:\s+([^\]]*))?\]\]([\s\S]*?)\[\[\/highlight\]\]|\[\[verdict\]\]([\s\S]*?)\[\[\/verdict\]\]|\[\[proscons\]\]([\s\S]*?)\[\[\/proscons\]\]|\[\[round(?:\s+([^\]]*))?\]\]([\s\S]*?)\[\[\/round\]\]|\[\[usecase(?:\s+([^\]]*))?\]\]([\s\S]*?)\[\[\/usecase\]\]/g;

/**
 * Pull `key="value"` pairs out of a marker's attribute string.
 * Tolerant of single quotes and unquoted values.
 */
function parseAttrs(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  const re = /([a-z]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    out[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? "").trim();
  }
  return out;
}

/**
 * Many editors auto-wrap inserted text in `<p>` tags. After we cut
 * the marker out, the wrapper may become `<p>…</p>` (empty/whitespace).
 * Strip those so we don't ship `<p></p>` to the DOM.
 *
 * Also strip the leading <p> / trailing </p> that frames a marker
 * surrounded by a paragraph: `<p>[[tldr]]…[[/tldr]]</p>` would leave
 * orphan tags on either side after the cut. This trims them.
 */
function cleanHtmlChunk(html: string): string {
  return html
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<p>\s*$/i, "")
    .replace(/^\s*<\/p>/i, "");
}

/**
 * Split a sanitized HTML string into segments — alternating
 * regular HTML and parsed marker blocks. Render each segment
 * accordingly in BlogBody.
 */
export function parseBlogBody(html: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let lastIdx = 0;

  for (const match of html.matchAll(ALL_MARKERS_RE)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      segments.push({ kind: "html", value: cleanHtmlChunk(html.slice(lastIdx, idx)) });
    }

    const [
      ,
      toolSlug,
      tldrBody,
      highlightAttrs,
      highlightBody,
      verdictBody,
      prosConsBody,
      roundAttrs,
      roundBody,
      useCaseAttrs,
      useCaseBody,
    ] = match;

    if (toolSlug) {
      segments.push({ kind: "block", block: { kind: "tool", slug: toolSlug } });
    } else if (tldrBody !== undefined) {
      segments.push({ kind: "block", block: { kind: "tldr", body: tldrBody.trim() } });
    } else if (highlightBody !== undefined) {
      const a = parseAttrs(highlightAttrs);
      segments.push({
        kind: "block",
        block: { kind: "highlight", title: a.title, body: highlightBody.trim() },
      });
    } else if (verdictBody !== undefined) {
      segments.push({ kind: "block", block: parseVerdict(verdictBody) });
    } else if (prosConsBody !== undefined) {
      segments.push({ kind: "block", block: parseProsCons(prosConsBody) });
    } else if (roundBody !== undefined) {
      const a = parseAttrs(roundAttrs);
      segments.push({
        kind: "block",
        block: {
          kind: "round",
          n: parseInt(a.n ?? "1", 10) || 1,
          title: a.title ?? "Round",
          winner: a.winner,
          body: roundBody.trim(),
        },
      });
    } else if (useCaseBody !== undefined) {
      const a = parseAttrs(useCaseAttrs);
      segments.push({
        kind: "block",
        block: {
          kind: "usecase",
          audience: a.audience ?? "If you're choosing",
          pick: a.pick ?? "Pick one",
          reason: useCaseBody.trim(),
        },
      });
    }

    lastIdx = idx + match[0].length;
  }

  if (lastIdx < html.length) {
    segments.push({ kind: "html", value: cleanHtmlChunk(html.slice(lastIdx)) });
  }

  return segments;
}

function parseVerdict(body: string): Extract<ParsedBlock, { kind: "verdict" }> {
  const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sides: Record<"LEFT" | "RIGHT", { title: string; text: string }> = {
    LEFT: { title: "Wins for", text: "" },
    RIGHT: { title: "Wins for", text: "" },
  };
  for (const line of lines) {
    const m = line.match(/^(LEFT|RIGHT)\s*:\s*(.+)$/i);
    if (!m) continue;
    const side = m[1].toUpperCase() as "LEFT" | "RIGHT";
    const parts = m[2].split("|").map((p) => p.trim());
    sides[side] = {
      title: parts[0] || "Wins for",
      text: parts.slice(1).join(" · ") || "",
    };
  }
  return { kind: "verdict", left: sides.LEFT, right: sides.RIGHT };
}

function parseProsCons(body: string): Extract<ParsedBlock, { kind: "proscons" }> {
  const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let pros: string[] = [];
  let cons: string[] = [];
  for (const line of lines) {
    const m = line.match(/^(PROS|CONS)\s*:\s*(.+)$/i);
    if (!m) continue;
    const items = m[2].split("|").map((p) => p.trim()).filter(Boolean);
    if (m[1].toUpperCase() === "PROS") pros = items;
    else cons = items;
  }
  return { kind: "proscons", pros, cons };
}

/**
 * Templates the "+ Insert block" toolbar offers in the BlogForm.
 * Keep label short; description appears under it in the dropdown.
 */
export const BLOCK_TEMPLATES: Array<{
  id: string;
  label: string;
  description: string;
  template: string;
}> = [
  {
    id: "tldr",
    label: "TL;DR snippet box",
    description: "Quick answer in a blue-tinted box. Featured-snippet target.",
    template: "<p>[[tldr]]Your one-paragraph answer to the article title goes here. Bold key terms.[[/tldr]]</p>",
  },
  {
    id: "highlight",
    label: "Highlight box",
    description: "Soft callout with title + body. Use for tips, notes, key facts.",
    template:
      '<p>[[highlight title="Editor\'s pick"]]Highlight body text. Brief — under 3 sentences.[[/highlight]]</p>',
  },
  {
    id: "verdict",
    label: "Verdict cards (two-side)",
    description: '"X wins for…" vs "Y wins for…" cards above the fold.',
    template:
      "<p>[[verdict]]\nLEFT: Tool A wins for | Research, citations, news summaries\nRIGHT: Tool B wins for | Writing, coding, reasoning\n[[/verdict]]</p>",
  },
  {
    id: "proscons",
    label: "Pros & Cons grid",
    description: "Green pros + red cons in two columns. Pipe-separated items.",
    template:
      "<p>[[proscons]]\nPROS: first strong point | second pro | third pro | fourth pro\nCONS: first limitation | second con | third con\n[[/proscons]]</p>",
  },
  {
    id: "round",
    label: "Round block (test result)",
    description: "Numbered head-to-head test with winner pill.",
    template:
      '<p>[[round n=1 title="Test name here" winner="Winner name"]]One-paragraph summary of what you tested and what happened. Wrap key facts in <strong>bold</strong>.[[/round]]</p>',
  },
  {
    id: "usecase",
    label: "Use-case decision card",
    description: '"If you\'re X → use Y" recommendation card.',
    template:
      '<p>[[usecase audience="If you\'re a writer" pick="Use ChatGPT"]]Reason in one short sentence.[[/usecase]]</p>',
  },
  {
    id: "tool",
    label: "Tool card",
    description: "Full embedded tool card (logo, tagline, CTA).",
    template: "<p>[[tool:replace-with-slug]]</p>",
  },
];

/**
 * Scannable content blocks rendered inside a blog article.
 *
 * Each block is invoked from the body via a plain-text marker
 * (see lib/blog-markers.ts). The marker survives any sanitizer
 * because it's just text. On render, BlogBody.tsx splits the
 * sanitized HTML on the marker regex and renders one of these
 * components in place of each marker.
 *
 * Visual reference: the perplexity-vs-chatgpt prototype.
 */

import { sanitizeHtml } from "@/lib/sanitize";

// ── 1. TL;DR / featured snippet ────────────────────────────
export function TldrBlock({ children }: { children: string }) {
  return (
    <aside className="not-prose blog-snippet">
      <div className="blog-snippet-label">⚡ Quick answer</div>
      <p
        className="blog-snippet-text"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(children) }}
      />
    </aside>
  );
}

// ── 2. Highlight box (TL;DR with title) ────────────────────
export function HighlightBlock({
  title,
  children,
}: {
  title?: string;
  children: string;
}) {
  return (
    <aside className="not-prose blog-highlight">
      <div className="blog-highlight-icon" aria-hidden>💡</div>
      <div className="blog-highlight-body">
        {title && <div className="blog-highlight-title">{title}</div>}
        <div
          className="blog-highlight-text"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(children) }}
        />
      </div>
    </aside>
  );
}

// ── 3. Verdict cards (two-side "X wins for…") ──────────────
export function VerdictBlock({
  left,
  right,
}: {
  left: { title: string; text: string };
  right: { title: string; text: string };
}) {
  return (
    <div className="not-prose blog-verdict-grid">
      <div className="blog-verdict-card">
        <div className="blog-verdict-head">
          <div className="blog-verdict-name">{left.title}</div>
          <span className="blog-verdict-tag">Best for</span>
        </div>
        <div
          className="blog-verdict-text"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(left.text) }}
        />
      </div>
      <div className="blog-verdict-card">
        <div className="blog-verdict-head">
          <div className="blog-verdict-name">{right.title}</div>
          <span className="blog-verdict-tag">Best for</span>
        </div>
        <div
          className="blog-verdict-text"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(right.text) }}
        />
      </div>
    </div>
  );
}

// ── 4. Pros & Cons (single-tool side-by-side) ──────────────
export function ProsConsBlock({
  pros,
  cons,
}: {
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="not-prose blog-pc-grid">
      <div className="blog-pc-col blog-pc-pros">
        <div className="blog-pc-title">✓ Pros</div>
        <ul className="blog-pc-items">
          {pros.map((p, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p) }} />
          ))}
        </ul>
      </div>
      <div className="blog-pc-col blog-pc-cons">
        <div className="blog-pc-title">✕ Cons</div>
        <ul className="blog-pc-items">
          {cons.map((c, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(c) }} />
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── 5. Round block (numbered head-to-head test) ────────────
export function RoundBlock({
  n,
  title,
  winner,
  children,
}: {
  n: number;
  title: string;
  winner?: string;
  children: string;
}) {
  return (
    <section className="not-prose blog-round">
      <div className="blog-round-head">
        <div className="blog-round-num">
          <div className="blog-round-badge">{n}</div>
          <div className="blog-round-title">{title}</div>
        </div>
        {winner && <div className="blog-round-winner">🏆 {winner}</div>}
      </div>
      <div
        className="blog-round-text"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(children) }}
      />
    </section>
  );
}

// ── 6. Use-case decision card ──────────────────────────────
export function UseCaseBlock({
  audience,
  pick,
  reason,
}: {
  audience: string;
  pick: string;
  reason: string;
}) {
  return (
    <div className="not-prose blog-uc-card">
      <div className="blog-uc-tag">{audience}</div>
      <div className="blog-uc-title">{pick}</div>
      <div
        className="blog-uc-reason"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(reason) }}
      />
      <span className="blog-uc-winner">→ {pick.replace(/^use\s+/i, "")}</span>
    </div>
  );
}

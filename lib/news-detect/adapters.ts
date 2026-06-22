/**
 * Detection adapters — each takes a source config + an HTTP body
 * and returns a normalized list of candidate events.
 *
 * RSS / Atom / JSON-Feed all share the same shape after parsing;
 * HTML uses a regex-based pseudo-DOM scrape (we avoid jsdom for the
 * same ESM crash reasons that killed isomorphic-dompurify earlier).
 */

import type { SourceConfig } from "./sources";

export type DetectedItem = {
  url: string;
  title: string;
  summary?: string | null;
  publishedAt?: Date | null;
  externalId?: string | null;
  /** Body text used as outlining input (pre-fetched if available). */
  rawContent?: string | null;
};

// ── HTTP fetch with browser UA + timeout ─────────────────────
export async function fetchSourceBody(url: string): Promise<{ ok: boolean; body: string; status: number }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIToolsSet-Newsroom/1.0; +https://aitoolsset.com)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, text/html",
      },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    const body = await res.text();
    return { ok: res.ok, body, status: res.status };
  } catch (e) {
    return { ok: false, body: e instanceof Error ? e.message : "fetch failed", status: 0 };
  }
}

// ── RSS / Atom — regex-based parser (no xml lib needed) ──────
/**
 * We deliberately don't use a heavy XML parser. RSS/Atom are simple
 * enough that ~50 lines of regex cover 95% of feeds. The ~5% that
 * break (unusual encodings, malformed XML) fail gracefully — the
 * cron logs the error and tries again next tick.
 */
export function parseRssAtom(body: string, source: SourceConfig): DetectedItem[] {
  // Atom uses <entry>, RSS uses <item>.
  const itemRe = /<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  const out: DetectedItem[] = [];

  for (const m of body.matchAll(itemRe)) {
    const chunk = m[1];

    const link =
      pickAttr(chunk, /<link\s+[^>]*href="([^"]+)"/i, 1) ||
      pickTag(chunk, "link") ||
      pickTag(chunk, "guid");
    if (!link) continue;
    const url = resolveUrl(link.trim(), source.feedUrl);

    const title = decodeEntities(stripTags(pickTag(chunk, "title") ?? "").trim());
    if (!title) continue;

    const summary = decodeEntities(
      stripTags(pickTag(chunk, "description") ?? pickTag(chunk, "summary") ?? pickTag(chunk, "content") ?? "")
    ).trim();

    const dateRaw =
      pickTag(chunk, "pubDate") ??
      pickTag(chunk, "published") ??
      pickTag(chunk, "updated") ??
      pickTag(chunk, "dc:date");
    const publishedAt = dateRaw ? new Date(dateRaw) : null;

    const externalId = pickTag(chunk, "guid") ?? pickTag(chunk, "id");

    out.push({
      url,
      title,
      summary: summary || null,
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null,
      externalId: externalId?.trim() || null,
    });
  }

  return out;
}

// ── JSON Feed (jsonfeed.org spec) ────────────────────────────
export function parseJsonFeed(body: string, source: SourceConfig): DetectedItem[] {
  try {
    const data = JSON.parse(body) as { items?: Array<Record<string, unknown>> };
    if (!data?.items?.length) return [];
    const out: DetectedItem[] = [];
    for (const item of data.items) {
      const url = (item.url ?? item.external_url ?? item.id) as string | undefined;
      const title = (item.title ?? "") as string;
      if (!url || !title) continue;
      const date = (item.date_published ?? item.date_modified) as string | undefined;
      out.push({
        url: resolveUrl(url, source.feedUrl),
        title: String(title).trim(),
        summary:
          (item.summary as string) ??
          (item.content_text as string) ??
          null,
        publishedAt: date ? new Date(date) : null,
        externalId: (item.id ?? null) as string | null,
      });
    }
    return out;
  } catch {
    return [];
  }
}

// ── HTML scraper — selector-driven ────────────────────────────
/**
 * Cheap regex-based selector matching for vendors that don't publish
 * RSS. We don't run a full HTML parser (no jsdom — see lib/sanitize.ts
 * for the @exodus/bytes saga). The selectors are hints; we use the
 * `item` selector to find article-shaped blocks and then look for the
 * first <a href> + heading inside each.
 */
export function parseHtmlList(body: string, source: SourceConfig): DetectedItem[] {
  // Pull every <a href> + nearby heading as a fallback. Works well
  // enough for news/index pages without needing a DOM.
  const linkRe = /<a\s+[^>]*href="([^"#?]+(?:\?[^"#]*)?)"[^>]*>([\s\S]*?)<\/a>/gi;
  const out: DetectedItem[] = [];
  const seen = new Set<string>();

  for (const m of body.matchAll(linkRe)) {
    const href = m[1];
    const inner = decodeEntities(stripTags(m[2])).trim();
    if (!href || !inner || inner.length < 12 || inner.length > 220) continue;
    if (seen.has(href)) continue;
    seen.add(href);

    const url = resolveUrl(href, source.feedUrl);
    if (!url.startsWith("http")) continue;
    // Heuristic — keep links that look like article paths from the
    // same domain as the source.
    try {
      const u = new URL(url);
      if (!u.hostname.endsWith(source.domain.replace(/^www\./, ""))) continue;
      const path = u.pathname.toLowerCase();
      if (path === "/" || path.length < 8) continue;
      if (/\.(?:css|js|png|jpg|jpeg|svg|webp|gif|ico|xml|pdf)$/i.test(path)) continue;
    } catch {
      continue;
    }

    out.push({
      url,
      title: inner,
      summary: null,
      publishedAt: null,
      externalId: null,
    });

    if (out.length >= 40) break; // soft cap per HTML run
  }
  return out;
}

// ── Helpers ──────────────────────────────────────────────────
function pickTag(chunk: string, name: string): string | null {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = chunk.match(re);
  return m ? m[1] : null;
}
function pickAttr(chunk: string, re: RegExp, group: number): string | null {
  const m = chunk.match(re);
  return m ? m[group] : null;
}
function stripTags(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "");
}
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x?\d+;/gi, " ")
    .replace(/&nbsp;/gi, " ");
}
function resolveUrl(raw: string, base: string): string {
  try {
    return new URL(raw, base).toString();
  } catch {
    return raw;
  }
}

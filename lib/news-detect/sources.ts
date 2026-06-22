/**
 * Load + validate the hand-editable newsroom watchlist from
 * sources.config.json at the project root.
 *
 * NOT cached in a long-lived variable because Next.js routes are
 * re-evaluated on each invocation and the config can be edited
 * mid-deploy. Reading a ~30KB JSON is negligible compared to
 * the cron's IO.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export type SourceKind = "rss" | "atom" | "json" | "html";
export type SourceCategory = "ai" | "security" | "policy" | "research" | "media" | "funding";

export type SourceConfig = {
  slug: string;
  name: string;
  domain: string;
  category: SourceCategory;
  kind: SourceKind;
  feedUrl: string;
  /** CSS selectors when kind='html'. */
  selectors?: {
    item?: string;
    title?: string;
    link?: string;
    summary?: string;
    publishedAt?: string;
  };
  priority: number;
  enabled: boolean;
};

export type WatchlistConfig = {
  sources: SourceConfig[];
  ignore: {
    titleSubstrings: string[];
  };
  limits: {
    maxEventsPerDetectionRun: number;
    maxDraftsPerWorkerRun: number;
    rawContentChars: number;
    groundingCharsPerSource: number;
    /** Sleep between events in the draft worker — keeps free-tier
     *  LLM rate limits happy. 5 events × 2 calls = 10 calls, with a
     *  5s gap that's 2 calls/sec average — well under 10 RPM. */
    interEventDelayMs: number;
  };
};

/** Read sources.config.json. Caller catches and falls back if missing. */
export function loadWatchlist(): WatchlistConfig {
  const path = join(process.cwd(), "sources.config.json");
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw) as Partial<WatchlistConfig>;
  if (!parsed || !Array.isArray(parsed.sources)) {
    throw new Error("sources.config.json missing or invalid — `sources` must be an array");
  }
  return {
    sources: parsed.sources.filter((s): s is SourceConfig => !!s && !!s.slug && !!s.feedUrl),
    ignore: {
      titleSubstrings: (parsed.ignore?.titleSubstrings ?? []).map((s) => s.toLowerCase()),
    },
    limits: {
      maxEventsPerDetectionRun: parsed.limits?.maxEventsPerDetectionRun ?? 80,
      maxDraftsPerWorkerRun: parsed.limits?.maxDraftsPerWorkerRun ?? 3,
      rawContentChars: parsed.limits?.rawContentChars ?? 12000,
      groundingCharsPerSource: parsed.limits?.groundingCharsPerSource ?? 4000,
      interEventDelayMs: parsed.limits?.interEventDelayMs ?? 5000,
    },
  };
}

/** Active, enabled sources sorted by priority desc. */
export function enabledSources(cfg: WatchlistConfig): SourceConfig[] {
  return cfg.sources
    .filter((s) => s.enabled)
    .sort((a, b) => b.priority - a.priority);
}

/** True if a title matches any ignore substring. */
export function shouldIgnoreTitle(title: string, cfg: WatchlistConfig): boolean {
  const lower = title.toLowerCase();
  return cfg.ignore.titleSubstrings.some((needle) => lower.includes(needle));
}

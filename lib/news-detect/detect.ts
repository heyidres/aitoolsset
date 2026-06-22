/**
 * Detection orchestrator — called by /api/cron/news-detect.
 *
 * For each enabled source: fetch, parse, dedup, insert into
 * news_detection_events. Soft caps prevent any single run from
 * blowing out the function execution budget.
 */

import crypto from "node:crypto";
import { db } from "@/lib/db";
import { newsDetectionEvents } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { loadWatchlist, enabledSources, shouldIgnoreTitle, type SourceConfig, type WatchlistConfig } from "./sources";
import { fetchSourceBody, parseRssAtom, parseJsonFeed, parseHtmlList, type DetectedItem } from "./adapters";

export type DetectRunResult = {
  startedAt: Date;
  finishedAt: Date;
  sourcesPolled: number;
  itemsParsed: number;
  itemsInserted: number;
  itemsIgnored: number;
  itemsDuplicate: number;
  perSource: Array<{
    slug: string;
    fetched: boolean;
    status: number;
    parsed: number;
    inserted: number;
    error?: string;
  }>;
};

function urlHash(url: string): string {
  return crypto.createHash("sha1").update(url.trim()).digest("hex");
}

async function pollSource(
  source: SourceConfig,
  cfg: WatchlistConfig
): Promise<{ items: DetectedItem[]; status: number; error?: string }> {
  const fetched = await fetchSourceBody(source.feedUrl);
  if (!fetched.ok) {
    return { items: [], status: fetched.status, error: fetched.body.slice(0, 200) };
  }

  let items: DetectedItem[] = [];
  try {
    if (source.kind === "json") items = parseJsonFeed(fetched.body, source);
    else if (source.kind === "html") items = parseHtmlList(fetched.body, source);
    else items = parseRssAtom(fetched.body, source); // rss + atom share the same parser
  } catch (e) {
    return { items: [], status: fetched.status, error: e instanceof Error ? e.message : "parse error" };
  }

  // Filter ignored titles + cap raw content size + tighten dates.
  const cap = cfg.limits.rawContentChars;
  return {
    status: fetched.status,
    items: items
      .filter((it) => !shouldIgnoreTitle(it.title, cfg))
      .map((it) => ({
        ...it,
        // Use the feed-provided summary as the outlining input —
        // fuller body fetch happens at draft time to keep this cron fast.
        rawContent: it.summary ? it.summary.slice(0, cap) : null,
      })),
  };
}

/**
 * Run one detection cycle across every enabled source.
 * Inserts are batched per source with ON CONFLICT DO NOTHING on
 * url_hash so a re-run is a no-op for already-detected URLs.
 */
export async function runDetection(): Promise<DetectRunResult> {
  const startedAt = new Date();
  const cfg = loadWatchlist();
  const sources = enabledSources(cfg);

  let itemsParsed = 0;
  let itemsInserted = 0;
  let itemsIgnored = 0;
  let itemsDuplicate = 0;
  const perSource: DetectRunResult["perSource"] = [];

  for (const source of sources) {
    const { items, status, error } = await pollSource(source, cfg);
    itemsParsed += items.length;

    let insertedHere = 0;
    if (items.length > 0) {
      // Trim to the global per-run cap so a single noisy feed doesn't
      // dominate the queue.
      const room = Math.max(0, cfg.limits.maxEventsPerDetectionRun - itemsInserted);
      const toInsert = items.slice(0, room);

      for (const it of toInsert) {
        const hash = urlHash(it.url);
        try {
          const result = await db
            .insert(newsDetectionEvents)
            .values({
              sourceSlug: source.slug,
              sourceName: source.name,
              sourceDomain: source.domain,
              sourceCategory: source.category,
              sourcePriority: source.priority,
              url: it.url,
              urlHash: hash,
              externalId: it.externalId ?? null,
              title: it.title.slice(0, 500),
              summary: it.summary?.slice(0, 1000) ?? null,
              publishedAt: it.publishedAt ?? null,
              rawContent: it.rawContent ?? null,
              status: "new",
            })
            .onConflictDoNothing({ target: newsDetectionEvents.urlHash })
            .returning({ id: newsDetectionEvents.id });
          if (result.length > 0) insertedHere++;
          else itemsDuplicate++;
        } catch {
          // Single-row failure shouldn't fail the whole source.
        }
      }
      itemsIgnored += items.length - toInsert.length;
    }

    itemsInserted += insertedHere;
    perSource.push({
      slug: source.slug,
      fetched: status > 0,
      status,
      parsed: items.length,
      inserted: insertedHere,
      error,
    });

    if (itemsInserted >= cfg.limits.maxEventsPerDetectionRun) break;
  }

  return {
    startedAt,
    finishedAt: new Date(),
    sourcesPolled: perSource.length,
    itemsParsed,
    itemsInserted,
    itemsIgnored,
    itemsDuplicate,
    perSource,
  };
}

/**
 * Promote a count of `new` events to `queued` for the drafting worker.
 * Returns the rows so the worker can process them directly.
 *
 * Highest priority sources first, then oldest detected.
 */
export async function claimEventsForDrafting(limit: number) {
  // Update-returning is atomic enough for our single-region worker.
  // If we ever scale to multiple cron pingers, swap for advisory lock.
  const rows = await db.execute(sql`
    WITH next AS (
      SELECT id
      FROM news_detection_event
      WHERE status = 'new'
      ORDER BY source_priority DESC, detected_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE news_detection_event e
    SET status = 'queued', updated_at = now()
    FROM next
    WHERE e.id = next.id
    RETURNING e.*
  `);
  return rows.rows as Array<typeof newsDetectionEvents.$inferSelect>;
}

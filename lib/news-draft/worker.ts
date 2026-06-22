/**
 * Drafting worker — called by /api/cron/news-draft.
 *
 * Claims up to N events from the detection queue, runs the full
 * outline → research → draft pipeline on each, writes the result
 * into news_posts as `status='review'`, and records every attempt
 * in news_draft_jobs for audit + the observability dashboard.
 */

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsDetectionEvents, newsDraftJobs, newsPosts } from "@/lib/db/schema";
import { claimEventsForDrafting } from "@/lib/news-detect/detect";
import { loadWatchlist } from "@/lib/news-detect/sources";
import { runDraftPipeline, type RunDraftResult } from "./draft";

export type WorkerRunResult = {
  startedAt: Date;
  finishedAt: Date;
  claimed: number;
  drafted: number;
  failed: number;
  skipped: number;
  perEvent: Array<{
    eventId: string;
    title: string;
    status: "drafted" | "failed" | "skipped";
    error?: string;
    newsPostSlug?: string;
  }>;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Outline-side topic → news_topic enum.
 * Enum is: llm | image | video | code | audio | policy | research | cybersecurity | startup
 * Anything unmapped falls through to 'llm' as the safest catch-all (most AI news).
 */
const TOPIC_MAP: Record<string, string> = {
  "model-release": "llm",
  funding: "startup",
  partnership: "startup",
  product: "llm",
  research: "research",
  policy: "policy",
  security: "cybersecurity",
  ecosystem: "llm",
};

export async function runDraftWorker(): Promise<WorkerRunResult> {
  const startedAt = new Date();
  const cfg = loadWatchlist();
  const events = await claimEventsForDrafting(cfg.limits.maxDraftsPerWorkerRun);

  let drafted = 0;
  let failed = 0;
  let skipped = 0;
  const perEvent: WorkerRunResult["perEvent"] = [];

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    // Free-tier LLM rate limits (Gemini 15 RPM, Groq 30 RPM) burn out
    // when 3 events fire 6+ calls in seconds. Pause between events
    // EXCEPT the first one.
    if (i > 0 && cfg.limits.interEventDelayMs > 0) {
      await sleep(cfg.limits.interEventDelayMs);
    }
    const job = await db
      .insert(newsDraftJobs)
      .values({
        eventId: event.id,
        status: "outlining",
        startedAt: new Date(),
      })
      .returning({ id: newsDraftJobs.id });
    const jobId = job[0]?.id;

    let result: RunDraftResult | null = null;
    try {
      result = await runDraftPipeline(event, cfg.limits.groundingCharsPerSource);
    } catch (e) {
      result = {
        ok: false,
        provider: "unknown",
        error: e instanceof Error ? e.message : String(e),
      };
    }

    if (!result.ok || !result.draft) {
      // Outline said "skip" OR a real error fired.
      const isSkip = result.error?.startsWith("outline skipped");
      await db
        .update(newsDetectionEvents)
        .set({
          status: isSkip ? "ignored" : "failed",
          rejectionReason: isSkip ? "non-newsworthy per outline" : null,
          updatedAt: new Date(),
        })
        .where(eq(newsDetectionEvents.id, event.id));
      if (jobId) {
        await db
          .update(newsDraftJobs)
          .set({
            status: isSkip ? "skipped" : "failed",
            provider: result.provider,
            error: result.error ?? "unknown",
            finishedAt: new Date(),
          })
          .where(eq(newsDraftJobs.id, jobId));
      }
      if (isSkip) skipped++;
      else failed++;
      perEvent.push({
        eventId: event.id,
        title: event.title,
        status: isSkip ? "skipped" : "failed",
        error: result.error,
      });
      continue;
    }

    const draft = result.draft;
    const topic = TOPIC_MAP[draft.topic] ?? "llm";
    const baseSlug = slugify(draft.headline || event.title);
    // Suffix with short hash so re-runs don't collide on the same headline.
    const slug = `${baseSlug}-${crypto.createHash("sha1").update(event.urlHash).digest("hex").slice(0, 6)}`;

    let newsPostId: string | null = null;
    try {
      const inserted = await db
        .insert(newsPosts)
        .values({
          slug,
          sourceHash: event.urlHash,
          source: event.sourceName,
          sourceDomain: event.sourceDomain,
          sourceUrl: event.url,
          tag: (draft.tag || "News").slice(0, 60),
          topic: topic as typeof newsPosts.topic.enumValues[number],
          categories: draft.categories ?? [],
          headline: (draft.headline || event.title).slice(0, 300),
          description: (draft.description || "").slice(0, 500),
          publishedAt: event.publishedAt ?? new Date(),
          breaking: !!draft.breaking,
          draft: {
            seoTitle: draft.seoTitle,
            metaDescription: draft.metaDescription,
            introduction: draft.introduction,
            keyHighlights: draft.keyHighlights,
            body: draft.body,
            expertCommentary: draft.expertCommentary,
            faqs: draft.faqs,
            internalLinks: draft.internalLinks,
            citations: draft.citations,
          },
          status: "review", // <-- key: lands in editor's review queue
          draftedAt: new Date(),
        })
        .onConflictDoNothing({ target: newsPosts.sourceHash })
        .returning({ id: newsPosts.id });
      newsPostId = inserted[0]?.id ?? null;
    } catch (e) {
      const errStr = e instanceof Error ? e.message : String(e);
      await db
        .update(newsDetectionEvents)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(newsDetectionEvents.id, event.id));
      if (jobId) {
        await db
          .update(newsDraftJobs)
          .set({ status: "failed", provider: result.provider, error: `db insert: ${errStr}`, finishedAt: new Date() })
          .where(eq(newsDraftJobs.id, jobId));
      }
      failed++;
      perEvent.push({ eventId: event.id, title: event.title, status: "failed", error: errStr });
      continue;
    }

    await db
      .update(newsDetectionEvents)
      .set({ status: "drafted", newsPostId, updatedAt: new Date() })
      .where(eq(newsDetectionEvents.id, event.id));
    if (jobId) {
      await db
        .update(newsDraftJobs)
        .set({
          status: "done",
          provider: result.provider,
          outline: result.outline ?? null,
          researchSources:
            result.research?.groundingSources.map((s) => ({
              url: s.url,
              chars: s.text.length,
              ok: s.ok,
            })) ?? [],
          promptPreview: result.prompt?.slice(0, 4000) ?? null,
          rawResponse: result.raw?.slice(0, 12000) ?? null,
          newsPostId,
          finishedAt: new Date(),
        })
        .where(eq(newsDraftJobs.id, jobId));
    }

    drafted++;
    perEvent.push({ eventId: event.id, title: event.title, status: "drafted", newsPostSlug: slug });
  }

  return {
    startedAt,
    finishedAt: new Date(),
    claimed: events.length,
    drafted,
    failed,
    skipped,
    perEvent,
  };
}

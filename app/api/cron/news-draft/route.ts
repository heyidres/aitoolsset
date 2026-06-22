/**
 * Cron — newsroom AUTO-DRAFTING worker.
 *
 * Hit by the external pinger every 5 min. Claims up to N events with
 * status='new' from news_detection_events, runs the outline → research
 * → Claude Opus 4.7 article pipeline, lands the result in news_posts
 * with status='review' for human approval.
 *
 * Auth: Bearer CRON_SECRET via the shared guardCron helper.
 */

import { runDraftWorker } from "@/lib/news-draft/worker";
import { guardCron, ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // article generation can be slow

async function handle(req: Request) {
  const guard = guardCron(req);
  if (guard) return guard;
  try {
    const result = await runDraftWorker();
    return ok({
      ok: true,
      claimed: result.claimed,
      drafted: result.drafted,
      failed: result.failed,
      skipped: result.skipped,
      durationMs: result.finishedAt.getTime() - result.startedAt.getTime(),
      perEvent: result.perEvent,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "draft worker failed", 500);
  }
}

export { handle as GET, handle as POST };

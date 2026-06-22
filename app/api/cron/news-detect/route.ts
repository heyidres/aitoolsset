/**
 * Cron — newsroom DETECTION pass.
 *
 * Hit by the external pinger every 10 min (Option C). Loops every
 * enabled source in sources.config.json, fetches the feed, dedupes
 * by url_hash, inserts new events. Auto-drafting is a separate cron.
 *
 * Auth: Bearer CRON_SECRET via the shared guardCron helper.
 */

import { runDetection } from "@/lib/news-detect/detect";
import { guardCron, ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: Request) {
  const guard = guardCron(req);
  if (guard) return guard;
  try {
    const result = await runDetection();
    return ok({
      ok: true,
      sourcesPolled: result.sourcesPolled,
      itemsParsed: result.itemsParsed,
      itemsInserted: result.itemsInserted,
      itemsDuplicate: result.itemsDuplicate,
      itemsIgnored: result.itemsIgnored,
      durationMs: result.finishedAt.getTime() - result.startedAt.getTime(),
      perSource: result.perSource,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "detect failed", 500);
  }
}

export { handle as GET, handle as POST };

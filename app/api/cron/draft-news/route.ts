/**
 * Cron job — pull new RSS items, generate AI drafts, store them.
 *
 *  Schedule: every 15 minutes (see vercel.json).
 *  Auth: requires Bearer CRON_SECRET. Vercel Cron injects this
 *  automatically when CRON_SECRET is set as a project env var.
 *
 *  Flow:
 *    1. Call fetchAllNews() (already cached 30min internally).
 *    2. For each post, check if its sourceHash is already in DB.
 *    3. If new: call Claude with the news-ai-prompt template,
 *       parse the JSON response, insert into news_post with
 *       status="draft".
 *    4. Skip duplicates (Jaccard ≥0.6 against the last 50 drafts).
 *
 *  Per-run budget: ~10 new posts max. Anthropic call is the slow
 *  step (~10–30s with extended thinking off). Run partial work
 *  and let the next tick finish.
 */

import { inArray } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { fetchAllNews } from "@/lib/news";
import { buildDraftMessages, isDuplicateOf, type DraftInput } from "@/lib/news-ai-prompt";
import type { EditorialDraft } from "@/lib/news";
import { guardCron, ok, fail } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

const MAX_PER_RUN = 10;

export async function GET(req: Request) {
  const denied = guardCron(req);
  if (denied) return denied;

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return fail("ANTHROPIC_API_KEY missing", 500);

  // 1. Fetch live RSS posts
  const { posts } = await fetchAllNews();
  if (posts.length === 0) return ok({ drafted: 0, skipped: 0, reason: "no posts" });

  // 2. Filter out posts already in the DB (by sourceHash)
  const hashes = posts.map((p) => p.id); // post.id is `${domain}-${hash(link)}`
  const existing = await db
    .select({ sourceHash: newsPosts.sourceHash })
    .from(newsPosts)
    .where(inArray(newsPosts.sourceHash, hashes));
  const existingSet = new Set(existing.map((r) => r.sourceHash));
  const fresh = posts.filter((p) => !existingSet.has(p.id)).slice(0, MAX_PER_RUN);
  if (fresh.length === 0) return ok({ drafted: 0, skipped: 0, reason: "all already drafted" });

  // 3. Pull recent titles for dedup (last 50)
  const recent = await db
    .select({ headline: newsPosts.headline })
    .from(newsPosts)
    .orderBy(desc(newsPosts.createdAt))
    .limit(50);
  const recentTitles = recent.map((r) => r.headline);

  // Dynamic import so the route still type-checks without the
  // SDK installed during scaffold phase.
  const { default: Anthropic } = await import("@anthropic-ai/sdk").catch(() => ({
    default: null as unknown as new (opts: { apiKey: string }) => {
      messages: {
        create: (args: unknown) => Promise<{ content: { type: string; text: string }[] }>;
      };
    },
  }));
  if (!Anthropic) return fail("Install @anthropic-ai/sdk first: npm install", 500);
  const client = new Anthropic({ apiKey: anthropicKey });

  let drafted = 0;
  let skipped = 0;

  for (const post of fresh) {
    if (isDuplicateOf(post.cardTitle, recentTitles)) {
      skipped++;
      continue;
    }
    const input: DraftInput = {
      title: post.cardTitle,
      description: post.text,
      sourceUrl: post.link,
      sourceName: post.source,
      publishedAt: post.timestamp,
    };
    const { system, messages } = buildDraftMessages(input);

    let draft: EditorialDraft;
    try {
      const res = await client.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 4096,
        system,
        messages,
      });
      // Anthropic's ContentBlock union (text | tool_use | ...) trips up
      // type narrowing via .filter — cast through the lenient shape.
      const text = (res.content as Array<{ type: string; text?: string }>)
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text as string)
        .join("");
      // Strip ```json fences if Claude adds them despite the prompt
      const json = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
      draft = JSON.parse(json) as EditorialDraft;
    } catch (e) {
      console.error(`[cron/draft-news] AI draft failed for ${post.cardTitle}:`, e);
      skipped++;
      continue;
    }

    try {
      await db.insert(newsPosts).values({
        slug: post.slug,
        sourceHash: post.id,
        source: post.source,
        sourceDomain: post.domain,
        sourceUrl: post.link,
        tag: post.tag,
        topic: post.topic,
        categories: post.categories,
        headline: post.cardTitle,
        description: post.text,
        publishedAt: new Date(post.timestamp),
        breaking: post.breaking,
        draft,
        status: "draft",
        draftedAt: new Date(),
      });
      drafted++;
      recentTitles.unshift(post.cardTitle);
    } catch (e) {
      console.error(`[cron/draft-news] db insert failed for ${post.cardTitle}:`, e);
      skipped++;
    }
  }

  return ok({ drafted, skipped, totalFresh: fresh.length });
}

/**
 * POST /api/portal-admin/news — create a manual news_post.
 *
 * Used by /portal-admin/news/new. The pipeline cron writes drafts through
 * lib/news-draft/worker.ts on its own; this endpoint is for the
 * "+ New Story" button when an editor wants to add a story by hand.
 *
 * Defaults status='draft'. Editor can flip to 'review'→'approved'→
 * 'published' through the same /api/portal-admin/news/[id] PATCH that the
 * pipeline drafts use.
 */

import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsPosts, auditLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api";

export const runtime = "nodejs";

const TopicEnum = z.enum(["llm", "image", "video", "code", "audio", "policy", "research", "cybersecurity", "startup"]);
const StatusEnum = z.enum(["draft", "review", "approved", "published"]);

const CreateSchema = z.object({
  headline: z.string().min(8).max(300),
  description: z.string().max(500).default(""),
  sourceUrl: z.string().url(),
  source: z.string().min(2).max(120),
  topic: TopicEnum,
  tag: z.string().min(2).max(60).default("News"),
  categories: z.array(z.string()).default([]),
  breaking: z.boolean().default(false),
  status: StatusEnum.default("draft"),
  publishedAt: z.string().datetime().optional(),
  draft: z
    .object({
      seoTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      introduction: z.string().optional(),
      keyHighlights: z.array(z.string()).optional(),
      body: z.string().optional(),
      expertCommentary: z.string().optional(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      internalLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      citations: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    })
    .optional(),
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function domainOf(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return fail("Sign in required", 401);
  if (session.user.role !== "editor" && session.user.role !== "admin") {
    return fail("Editor role required", 403);
  }

  const body = await parseBody(req, CreateSchema);
  if (body instanceof Response) return body;

  const domain = domainOf(body.sourceUrl);
  if (!domain) return fail("sourceUrl is not a valid URL", 400);

  // Hash the source URL — same dedup key the pipeline uses.
  const sourceHash = crypto.createHash("sha1").update(body.sourceUrl).digest("hex");

  // Unique slug — append a short hash to avoid collisions across same-headline stories.
  const baseSlug = slugify(body.headline);
  const slug = `${baseSlug}-${sourceHash.slice(0, 6)}`;

  try {
    const insertValues: typeof newsPosts.$inferInsert = {
      slug,
      sourceHash,
      source: body.source,
      sourceDomain: domain,
      sourceUrl: body.sourceUrl,
      tag: body.tag ?? "News",
      topic: body.topic,
      categories: body.categories ?? [],
      headline: body.headline,
      description: body.description ?? "",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      breaking: body.breaking ?? false,
      status: body.status ?? "draft",
    };
    if (body.draft) {
      insertValues.draft = body.draft;
      insertValues.draftedAt = new Date();
    }
    if (body.status === "published") {
      insertValues.publishedLiveAt = new Date();
    }

    const [inserted] = await db
      .insert(newsPosts)
      .values(insertValues)
      .returning({ id: newsPosts.id, slug: newsPosts.slug });

    if (!inserted) return fail("Could not create story", 500);

    await db.insert(auditLog).values({
      actorId: session.user.id,
      action: "news.create",
      target: `news:${inserted.id}`,
      meta: { source: body.source, sourceUrl: body.sourceUrl, status: body.status },
    });

    return ok({ id: inserted.id, slug: inserted.slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return fail("A story with this source URL or slug already exists", 409);
    }
    console.error("[admin/news] create error:", e);
    return fail("Could not create story", 500);
  }
}

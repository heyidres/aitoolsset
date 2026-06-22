/**
 * /admin/news/pipeline — observability dashboard.
 *
 * Shows what's been detected, drafted, pending review, published,
 * and failed. Per-source health. Recent detection events. Recent
 * draft jobs with their errors so the pipeline never fails silently.
 */

import Link from "next/link";
import { db } from "@/lib/db";
import { newsDetectionEvents, newsDraftJobs, newsPosts } from "@/lib/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusCount = { status: string; n: number };

async function getCounts(): Promise<{ events: StatusCount[]; posts: StatusCount[]; jobs: StatusCount[] }> {
  const events = await db
    .select({ status: newsDetectionEvents.status, n: sql<number>`count(*)::int` })
    .from(newsDetectionEvents)
    .groupBy(newsDetectionEvents.status);
  const posts = await db
    .select({ status: newsPosts.status, n: sql<number>`count(*)::int` })
    .from(newsPosts)
    .groupBy(newsPosts.status);
  const jobs = await db
    .select({ status: newsDraftJobs.status, n: sql<number>`count(*)::int` })
    .from(newsDraftJobs)
    .groupBy(newsDraftJobs.status);
  return { events, posts, jobs };
}

async function getPerSource() {
  const rows = await db
    .select({
      sourceSlug: newsDetectionEvents.sourceSlug,
      sourceName: newsDetectionEvents.sourceName,
      n: sql<number>`count(*)::int`,
      latestAt: sql<Date>`max(${newsDetectionEvents.detectedAt})`,
    })
    .from(newsDetectionEvents)
    .groupBy(newsDetectionEvents.sourceSlug, newsDetectionEvents.sourceName)
    .orderBy(desc(sql`count(*)`));
  return rows;
}

async function getRecentEvents() {
  return db
    .select()
    .from(newsDetectionEvents)
    .orderBy(desc(newsDetectionEvents.detectedAt))
    .limit(20);
}

async function getRecentFailures() {
  return db
    .select()
    .from(newsDraftJobs)
    .where(eq(newsDraftJobs.status, "failed"))
    .orderBy(desc(newsDraftJobs.createdAt))
    .limit(10);
}

function fmtRelative(d: Date | null): string {
  if (!d) return "—";
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

const STATUS_COLOR: Record<string, { fg: string; bg: string }> = {
  new: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  queued: { fg: "#a16207", bg: "#fef3c7" },
  drafted: { fg: "var(--green)", bg: "var(--green-bg)" },
  rejected: { fg: "#5b616e", bg: "var(--surface)" },
  failed: { fg: "#dc2626", bg: "#fef2f2" },
  ignored: { fg: "var(--text-3)", bg: "var(--surface)" },
  draft: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  review: { fg: "#a16207", bg: "#fef3c7" },
  approved: { fg: "var(--green)", bg: "var(--green-bg)" },
  published: { fg: "var(--green)", bg: "var(--green-bg)" },
  pending: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  outlining: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  researching: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  drafting: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  done: { fg: "var(--green)", bg: "var(--green-bg)" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? { fg: "var(--text-3)", bg: "var(--surface)" };
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em",
      padding: "3px 8px", borderRadius: 100, color: c.fg, background: c.bg,
    }}>
      {status}
    </span>
  );
}

export default async function PipelinePage() {
  const [counts, perSource, recentEvents, recentFailures] = await Promise.all([
    getCounts(),
    getPerSource(),
    getRecentEvents(),
    getRecentFailures(),
  ]);

  const eventTotal = counts.events.reduce((sum, r) => sum + r.n, 0);
  const postsInReview = counts.posts.find((p) => p.status === "review")?.n ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <Tile label="Events detected (all time)" value={eventTotal} />
        <Tile label="Pending review" value={postsInReview} highlight={postsInReview > 0} />
        <Tile label="Sources tracked" value={perSource.length} />
        <Tile
          label="Draft jobs failed"
          value={counts.jobs.find((j) => j.status === "failed")?.n ?? 0}
          danger={(counts.jobs.find((j) => j.status === "failed")?.n ?? 0) > 0}
        />
      </div>

      {/* Status breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <BreakdownCard title="Detection events" rows={counts.events} />
        <BreakdownCard title="News posts" rows={counts.posts} />
        <BreakdownCard title="Draft jobs" rows={counts.jobs} />
      </div>

      {/* Per-source health */}
      <div className="adm-panel">
        <div className="adm-panel-head">
          <div>
            <div className="adm-panel-title">Per-source health</div>
            <div className="adm-panel-sub">Events detected per source — newest first</div>
          </div>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Events detected</th>
              <th>Last detection</th>
            </tr>
          </thead>
          <tbody>
            {perSource.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", color: "var(--text-3)", padding: 24 }}>
                  No detections yet — confirm the pinger is hitting /api/cron/news-detect.
                </td>
              </tr>
            ) : (
              perSource.map((r) => (
                <tr key={r.sourceSlug}>
                  <td><strong>{r.sourceName}</strong> <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>{r.sourceSlug}</code></td>
                  <td className="tnum">{r.n}</td>
                  <td style={{ color: "var(--text-3)", fontSize: 12 }}>{fmtRelative(r.latestAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent detections */}
      <div className="adm-panel">
        <div className="adm-panel-head">
          <div>
            <div className="adm-panel-title">Recent detections</div>
            <div className="adm-panel-sub">Last 20 events across all sources</div>
          </div>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Source</th>
              <th>Status</th>
              <th>Detected</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentEvents.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-3)", padding: 24 }}>Nothing yet.</td></tr>
            ) : recentEvents.map((e) => (
              <tr key={e.id}>
                <td style={{ maxWidth: 540 }}>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text)", textDecoration: "none" }}>
                    {e.title}
                  </a>
                </td>
                <td style={{ fontSize: 12, color: "var(--text-3)" }}>{e.sourceName}</td>
                <td><StatusPill status={e.status} /></td>
                <td style={{ fontSize: 12, color: "var(--text-3)" }}>{fmtRelative(e.detectedAt)}</td>
                <td>
                  {e.newsPostId && (
                    <Link href={`/admin/news/${e.newsPostId}/edit`} className="adm-btn-sm primary" style={{ padding: "4px 10px", fontSize: 11 }}>
                      Review draft
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent failures */}
      {recentFailures.length > 0 && (
        <div className="adm-panel">
          <div className="adm-panel-head">
            <div>
              <div className="adm-panel-title" style={{ color: "var(--red)" }}>Recent draft failures</div>
              <div className="adm-panel-sub">Last 10 — investigate or retrigger via the event row</div>
            </div>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Provider</th>
                <th>Error</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {recentFailures.map((j) => (
                <tr key={j.id}>
                  <td><code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{j.eventId.slice(0, 8)}</code></td>
                  <td style={{ fontSize: 12 }}>{j.provider ?? "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--red)", maxWidth: 540 }}>{j.error}</td>
                  <td style={{ fontSize: 12, color: "var(--text-3)" }}>{fmtRelative(j.finishedAt ?? j.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, highlight, danger }: { label: string; value: number; highlight?: boolean; danger?: boolean }) {
  const color = danger ? "var(--red)" : highlight ? "var(--blue)" : "var(--text)";
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-manrope)", fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", color, marginTop: 6 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: StatusCount[] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
      <div style={{ fontFamily: "var(--font-manrope)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-2)", marginBottom: 10 }}>
        {title}
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>—</div>
      ) : (
        rows.map((r) => (
          <div key={r.status} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
            <StatusPill status={r.status} />
            <strong className="tnum" style={{ fontSize: 13 }}>{r.n}</strong>
          </div>
        ))
      )}
    </div>
  );
}

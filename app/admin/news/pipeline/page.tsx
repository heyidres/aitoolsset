/**
 * /admin/news/pipeline — observability dashboard.
 *
 * Layout: 4 stat tiles → status breakdown → per-source health table
 * → recent detections feed → recent failures (collapsible diagnostic).
 * Fully responsive: 4-col grid collapses to 2 / 1 below 1100 / 720 px.
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
      sourceCategory: newsDetectionEvents.sourceCategory,
      n: sql<number>`count(*)::int`,
      drafted: sql<number>`count(*) filter (where ${newsDetectionEvents.status} = 'drafted')::int`,
      failed: sql<number>`count(*) filter (where ${newsDetectionEvents.status} = 'failed')::int`,
      latestAt: sql<Date>`max(${newsDetectionEvents.detectedAt})`,
    })
    .from(newsDetectionEvents)
    .groupBy(newsDetectionEvents.sourceSlug, newsDetectionEvents.sourceName, newsDetectionEvents.sourceCategory)
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

const STATUS_COLOR: Record<string, { fg: string; bg: string; border: string }> = {
  new: { fg: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  queued: { fg: "#a16207", bg: "#fef3c7", border: "#fde68a" },
  drafted: { fg: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  rejected: { fg: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" },
  failed: { fg: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  ignored: { fg: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
  draft: { fg: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  review: { fg: "#a16207", bg: "#fef3c7", border: "#fde68a" },
  approved: { fg: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  published: { fg: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  pending: { fg: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  outlining: { fg: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  researching: { fg: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  drafting: { fg: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  done: { fg: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

const CATEGORY_COLOR: Record<string, { fg: string; bg: string }> = {
  ai: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  security: { fg: "#dc2626", bg: "#fef2f2" },
  policy: { fg: "#a16207", bg: "#fef3c7" },
  research: { fg: "#7c3aed", bg: "#f3e8ff" },
  media: { fg: "#0891b2", bg: "#ecfeff" },
  funding: { fg: "#16a34a", bg: "#f0fdf4" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? { fg: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em",
      padding: "3px 9px", borderRadius: 100, color: c.fg, background: c.bg,
      border: `1px solid ${c.border}`, whiteSpace: "nowrap", display: "inline-block",
    }}>
      {status}
    </span>
  );
}

function CategoryPill({ category }: { category: string }) {
  const c = CATEGORY_COLOR[category] ?? { fg: "var(--text-3)", bg: "var(--surface)" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em",
      padding: "2px 7px", borderRadius: 100, color: c.fg, background: c.bg,
      whiteSpace: "nowrap", display: "inline-block",
    }}>
      {category}
    </span>
  );
}

function shortErr(s: string | null): string {
  if (!s) return "—";
  try {
    const m = s.match(/"message":"([^"]+)"/);
    if (m) return m[1];
  } catch {}
  return s.length > 140 ? s.slice(0, 140) + "…" : s;
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
  const jobsFailed = counts.jobs.find((j) => j.status === "failed")?.n ?? 0;
  const jobsSkipped = counts.jobs.find((j) => j.status === "skipped")?.n ?? 0;
  const draftedEvents = counts.events.find((e) => e.status === "drafted")?.n ?? 0;
  const newEvents = counts.events.find((e) => e.status === "new")?.n ?? 0;
  const ignoredEvents = counts.events.find((e) => e.status === "ignored")?.n ?? 0;

  // Detect the "Anthropic credit balance too low" condition so we can show a banner.
  const creditBalanceFailure = recentFailures.some((j) =>
    (j.error ?? "").toLowerCase().includes("credit balance is too low")
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-manrope)", fontSize: 26, fontWeight: 900,
          letterSpacing: "-.6px", marginBottom: 4,
        }}>
          News pipeline
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-2)" }}>
          Detection events from {perSource.length} {perSource.length === 1 ? "source" : "sources"}, drafted into news posts for human review.
        </p>
      </div>

      {/* Credit balance banner — top priority alert */}
      {creditBalanceFailure && (
        <div style={{
          background: "linear-gradient(135deg, #fef2f2, #fff)",
          border: "1.5px solid #fecaca",
          borderLeft: "4px solid #dc2626",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#dc2626",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 18, fontWeight: 800,
          }}>!</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: 14.5, color: "#7f1d1d", marginBottom: 4 }}>
              Drafting blocked — Anthropic credit balance is empty
            </div>
            <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.55, marginBottom: 10 }}>
              The Opus 4.7 draft worker can&apos;t generate articles. Add credits to your Anthropic account to resume.
              Detection is still running — events are queued and will draft automatically once credits are restored.
            </div>
            <a
              href="https://console.anthropic.com/settings/billing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "8px 14px",
                background: "#dc2626",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Add credits at Anthropic Console →
            </a>
          </div>
        </div>
      )}

      {/* Top stat tiles — 4-col responsive */}
      <div className="np-stat-grid">
        <Tile label="Events detected" value={eventTotal} sub="all-time" tone="default" />
        <Tile
          label="Pending review"
          value={postsInReview}
          sub={postsInReview > 0 ? "Click 'News' to approve" : "queue is clear"}
          tone={postsInReview > 0 ? "blue" : "default"}
          href={postsInReview > 0 ? "/admin/news" : undefined}
        />
        <Tile label="Sources active" value={perSource.length} sub="last 30 days" tone="default" />
        <Tile
          label="Draft jobs failed"
          value={jobsFailed}
          sub={jobsFailed > 0 ? "see failures below" : "no errors"}
          tone={jobsFailed > 0 ? "red" : "default"}
        />
      </div>

      {/* Pipeline funnel — visual representation of where events sit */}
      <div className="np-card">
        <div className="np-card-head">
          <div>
            <div className="np-card-title">Pipeline funnel</div>
            <div className="np-card-sub">Where every detected event currently sits</div>
          </div>
        </div>
        <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <FunnelStep label="New" value={newEvents} color="#1d4ed8" />
          <FunnelArrow />
          <FunnelStep label="Drafted" value={draftedEvents} color="#16a34a" />
          <FunnelArrow />
          <FunnelStep label="In review" value={postsInReview} color="#a16207" />
          <FunnelArrow />
          <FunnelStep
            label="Published"
            value={counts.posts.find((p) => p.status === "published")?.n ?? 0}
            color="#16a34a"
          />
          {(ignoredEvents > 0 || jobsSkipped > 0) && (
            <>
              <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)", margin: "0 4px" }} />
              <FunnelStep
                label="Skipped (off-topic)"
                value={Math.max(ignoredEvents, jobsSkipped)}
                color="#94a3b8"
              />
            </>
          )}
        </div>
      </div>

      {/* Per-source health */}
      <div className="np-card">
        <div className="np-card-head">
          <div>
            <div className="np-card-title">Source health</div>
            <div className="np-card-sub">Detection counts per source — drafted vs failed</div>
          </div>
        </div>
        <div className="np-table-scroll">
          <table className="np-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Events</th>
                <th style={{ textAlign: "right" }}>Drafted</th>
                <th style={{ textAlign: "right" }}>Failed</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {perSource.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-3)", padding: 32, fontSize: 13 }}>
                    No detections yet — confirm cron-job.org is hitting <code>/api/cron/news-detect</code>.
                  </td>
                </tr>
              ) : perSource.map((r) => (
                <tr key={r.sourceSlug}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.sourceName}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {r.sourceSlug}
                    </div>
                  </td>
                  <td><CategoryPill category={r.sourceCategory} /></td>
                  <td className="tnum" style={{ textAlign: "right", fontWeight: 700 }}>{r.n}</td>
                  <td className="tnum" style={{ textAlign: "right", color: r.drafted > 0 ? "#16a34a" : "var(--text-3)", fontWeight: 600 }}>
                    {r.drafted || "—"}
                  </td>
                  <td className="tnum" style={{ textAlign: "right", color: r.failed > 0 ? "#dc2626" : "var(--text-3)", fontWeight: 600 }}>
                    {r.failed || "—"}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    {fmtRelative(r.latestAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent detections — feed-style */}
      <div className="np-card">
        <div className="np-card-head">
          <div>
            <div className="np-card-title">Recent detections</div>
            <div className="np-card-sub">Last 20 events across all sources</div>
          </div>
        </div>
        <div className="np-feed">
          {recentEvents.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              Nothing yet.
            </div>
          ) : recentEvents.map((e) => (
            <div key={e.id} className="np-feed-item">
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="np-feed-title"
                  title={e.url}
                >
                  {e.title}
                </a>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>
                    {e.sourceName}
                  </span>
                  <CategoryPill category={e.sourceCategory} />
                  <StatusPill status={e.status} />
                  <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                    {fmtRelative(e.detectedAt)}
                  </span>
                </div>
              </div>
              {e.newsPostId && (
                <Link
                  href={`/admin/news/${e.newsPostId}/edit`}
                  className="np-feed-cta"
                >
                  Review →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent failures — only render if there are any */}
      {recentFailures.length > 0 && (
        <div className="np-card" style={{ borderColor: "#fecaca" }}>
          <div className="np-card-head" style={{ background: "#fef2f2", borderBottomColor: "#fecaca" }}>
            <div>
              <div className="np-card-title" style={{ color: "#991b1b" }}>
                Recent draft failures
              </div>
              <div className="np-card-sub">
                Last {recentFailures.length} — investigate the error, then click Regenerate on the event row above
              </div>
            </div>
          </div>
          <div className="np-table-scroll">
            <table className="np-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Provider</th>
                  <th>Error</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {recentFailures.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                        {j.eventId.slice(0, 8)}
                      </code>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-2)" }}>{j.provider ?? "—"}</td>
                    <td style={{ fontSize: 12.5, color: "#991b1b", maxWidth: 520, lineHeight: 1.5 }}>
                      {shortErr(j.error)}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {fmtRelative(j.finishedAt ?? j.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline styles — scoped to the page */}
      <style dangerouslySetInnerHTML={{ __html: `
        .np-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .np-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .np-stat-grid { grid-template-columns: 1fr; }
        }
        .np-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .np-card-head {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          background: #fbfbfc;
        }
        .np-card-title {
          font-family: var(--font-manrope);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -.2px;
          color: var(--text);
          margin-bottom: 2px;
        }
        .np-card-sub {
          font-size: 12px;
          color: var(--text-3);
        }
        .np-table-scroll {
          overflow-x: auto;
        }
        .np-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .np-table th {
          padding: 11px 16px;
          text-align: left;
          font-family: var(--font-manrope);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .05em;
          color: var(--text-3);
          background: #fbfbfc;
          border-bottom: 1px solid var(--border);
        }
        .np-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .np-table tr:last-child td { border-bottom: 0; }
        .np-table tbody tr:hover { background: #fafafa; }
        .np-feed { padding: 4px 0; }
        .np-feed-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .np-feed-item:last-child { border-bottom: 0; }
        .np-feed-item:hover { background: #fafafa; }
        .np-feed-title {
          display: block;
          font-family: var(--font-manrope);
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.4;
          text-decoration: none;
          word-break: break-word;
        }
        .np-feed-title:hover { color: var(--blue); }
        .np-feed-cta {
          flex-shrink: 0;
          padding: 6px 12px;
          background: var(--blue);
          color: #fff;
          font-family: var(--font-manrope);
          font-size: 11.5px;
          font-weight: 700;
          border-radius: 6px;
          text-decoration: none;
          white-space: nowrap;
          align-self: center;
        }
        .np-feed-cta:hover { background: var(--blue-h); }
        @media (max-width: 640px) {
          .np-feed-item { flex-direction: column; gap: 10px; padding: 14px 16px; }
          .np-feed-cta { align-self: flex-start; }
          .np-card-head { padding: 12px 16px; }
        }
      ` }} />
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  tone,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  tone: "default" | "blue" | "red";
  href?: string;
}) {
  const accent =
    tone === "red" ? "#dc2626" : tone === "blue" ? "var(--blue)" : "var(--text)";
  const bg =
    tone === "red" ? "linear-gradient(135deg, #fef2f2 0%, #fff 70%)" :
    tone === "blue" ? "linear-gradient(135deg, var(--blue-soft) 0%, #fff 70%)" :
    "#fff";
  const Inner = (
    <div style={{
      background: bg,
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "18px 20px",
      minHeight: 110,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "transform .12s, box-shadow .12s",
      cursor: href ? "pointer" : "default",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: ".06em", color: "var(--text-3)",
      }}>
        {label}
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-manrope)",
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: "-.8px",
          color: accent,
          lineHeight: 1,
          marginBottom: sub ? 4 : 0,
        }}>
          {value.toLocaleString()}
        </div>
        {sub && (
          <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{Inner}</Link> : Inner;
}

function FunnelStep({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: "1 1 140px",
      minWidth: 130,
      padding: "12px 16px",
      background: "#fff",
      border: "1.5px solid var(--border)",
      borderRadius: 10,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-manrope)", fontSize: 22, fontWeight: 800, color, letterSpacing: "-.3px" }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function FunnelArrow() {
  return (
    <div style={{
      display: "flex", alignItems: "center", color: "var(--text-3)", fontSize: 18,
      flexShrink: 0,
    }}>
      →
    </div>
  );
}

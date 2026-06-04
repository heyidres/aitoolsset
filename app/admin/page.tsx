/**
 * Admin dashboard — landing page at /admin.
 *
 * Reads real counts where they exist (tools from Sanity,
 * reviews/submissions from Postgres) and uses clearly-marked
 * sample data for the traffic chart + revenue figures until
 * the analytics + Stripe layers are wired up in phase 3.
 */

import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolSubmissions, reviews, tools } from "@/lib/db/schema";
import { Pill, ToolCell } from "./_components/admin-ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TopTool = { id: string; name: string; slug: string; domain: string; verified: boolean; saves: number };
type DashSubmission = {
  id: string;
  name: string;
  websiteUrl: string;
  plan: string;
  submittedAt: Date;
};

async function loadDashboard() {
  const [toolCount, reviewCount, pendingSubsCount, topTools, recentSubs] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(tools)
      .then((r) => r[0]?.n ?? 0)
      .catch(() => 0),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviews)
      .then((r) => r[0]?.n ?? 0)
      .catch(() => 0),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(toolSubmissions)
      .where(sql`${toolSubmissions.status} = 'pending'`)
      .then((r) => r[0]?.n ?? 0)
      .catch(() => 0),
    db
      .select({
        id: tools.id,
        name: tools.name,
        slug: tools.slug,
        domain: tools.domain,
        verified: tools.verified,
        saves: tools.saveCount,
      })
      .from(tools)
      .orderBy(desc(tools.saveCount))
      .limit(5)
      .catch(() => [] as TopTool[]),
    db
      .select({
        id: toolSubmissions.id,
        name: toolSubmissions.name,
        websiteUrl: toolSubmissions.websiteUrl,
        plan: toolSubmissions.plan,
        submittedAt: toolSubmissions.submittedAt,
      })
      .from(toolSubmissions)
      .where(sql`${toolSubmissions.status} = 'pending'`)
      .orderBy(desc(toolSubmissions.submittedAt))
      .limit(4)
      .catch(() => [] as DashSubmission[]),
  ]);

  return { toolCount, reviewCount, pendingSubsCount, topTools, recentSubs };
}

const SAMPLE_TRAFFIC = [2100, 2400, 2200, 2800, 3100, 2900, 3400, 3200, 3600, 3300, 3800, 4100, 3900, 4300];

const SAMPLE_ACTIVITY = [
  { icon: "✓", bg: "var(--green-bg)", text: "<strong>PromptForge</strong> submission approved", when: "12 min ago" },
  { icon: "★", bg: "var(--amber-bg)", text: "New 5-star review on <strong>ChatGPT</strong>", when: "48 min ago" },
  { icon: "📝", bg: "var(--blue-soft)", text: "<strong>Sarah Park</strong> published a blog post", when: "2h ago" },
  { icon: "🏷️", bg: "var(--purple-bg)", text: "Deal added for <strong>Perplexity</strong>", when: "3h ago" },
  { icon: "⚠", bg: "var(--red-bg)", text: "A review was flagged as spam", when: "5h ago" },
];

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminDashboardPage() {
  const { toolCount, reviewCount, pendingSubsCount, topTools, recentSubs } = await loadDashboard();

  const max = Math.max(...SAMPLE_TRAFFIC);

  return (
    <>
      {/* Stat cards */}
      <div className="adm-stat-grid">
        <StatCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          iconBg="var(--blue-soft)"
          iconColor="var(--blue)"
          trend="up"
          trendValue="↑ 4.2%"
          value={fmtNumber(toolCount)}
          label="Tools listed"
        />
        <StatCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
          iconBg="var(--green-bg)"
          iconColor="var(--green)"
          trend="up"
          trendValue="↑ 12.8%"
          value="51.2k"
          label="Monthly visitors"
        />
        <StatCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.5 5.8 21 7 14 2 9.3 9 8.5 12 2" />
            </svg>
          }
          iconBg="var(--amber-bg)"
          iconColor="var(--amber)"
          trend="up"
          trendValue="↑ 6.1%"
          value={fmtNumber(reviewCount)}
          label="User reviews"
        />
        <StatCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          iconBg="var(--purple-bg)"
          iconColor="var(--purple)"
          trend="up"
          trendValue="↑ 23%"
          value="$8,940"
          label="Revenue (MTD)"
        />
      </div>

      {/* Two columns */}
      <div className="adm-dash-cols">
        {/* Left */}
        <div>
          <div className="adm-panel">
            <div className="adm-panel-head">
              <div>
                <div className="adm-panel-title">Traffic — last 14 days</div>
                <div className="adm-panel-sub">Daily unique visitors (sample data)</div>
              </div>
              <Pill tone="green">↑ 12.8% vs prev.</Pill>
            </div>
            <div className="adm-panel-body">
              <div className="adm-chart">
                {SAMPLE_TRAFFIC.map((v, i) => (
                  <div
                    key={i}
                    className="adm-chart-bar"
                    style={{ height: `${(v / max) * 100}%` }}
                    title={`${fmtNumber(v)} visitors`}
                  >
                    {i % 2 === 0 && <span>{i + 1}</span>}
                  </div>
                ))}
              </div>
              <div className="adm-chart-labels" />
            </div>
          </div>

          <div className="adm-panel">
            <div className="adm-panel-head">
              <div className="adm-panel-title">Pending Submissions</div>
              <Link href="/admin/submissions" className="adm-btn-sm ghost">
                View all →
              </Link>
            </div>
            <div className="adm-panel-body flush">
              {recentSubs.length === 0 ? (
                <div style={{ padding: 28, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                  No pending submissions.
                </div>
              ) : (
                <table className="adm-tbl">
                  <thead>
                    <tr>
                      <th>Tool</th>
                      <th>Plan</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubs.map((s) => {
                      const domain = (() => {
                        try {
                          return new URL(s.websiteUrl).hostname.replace(/^www\./, "");
                        } catch {
                          return s.websiteUrl;
                        }
                      })();
                      return (
                        <tr key={s.id}>
                          <td>
                            <ToolCell name={s.name} domain={domain} />
                          </td>
                          <td>
                            <Pill tone={s.plan === "featured" ? "blue" : "gray"}>
                              {s.plan === "featured" ? "Featured" : "Free"}
                            </Pill>
                          </td>
                          <td style={{ color: "var(--text-3)" }}>{fmtRelative(new Date(s.submittedAt))}</td>
                          <td>
                            <Pill tone="amber">Pending</Pill>
                          </td>
                          <td>
                            <Link href="/admin/submissions" className="adm-btn-sm primary">
                              Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <div className="adm-panel">
            <div className="adm-panel-head">
              <div className="adm-panel-title">Recent Activity</div>
            </div>
            <div className="adm-panel-body">
              {SAMPLE_ACTIVITY.map((a, i) => (
                <div key={i} className="adm-activity-item">
                  <div className="adm-act-dot" style={{ background: a.bg }}>
                    {a.icon}
                  </div>
                  <div className="adm-act-body">
                    <div className="adm-act-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                    <div className="adm-act-time">{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-panel">
            <div className="adm-panel-head">
              <div className="adm-panel-title">Top Tools</div>
              <span className="adm-panel-sub">{pendingSubsCount} pending</span>
            </div>
            <div className="adm-panel-body flush">
              {topTools.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                  No tools yet —{" "}
                  <Link href="/admin/tools/new" style={{ color: "var(--blue)", fontWeight: 700 }}>
                    add one
                  </Link>
                </div>
              ) : (
                <table className="adm-tbl">
                  <tbody>
                    {topTools.map((t, i) => (
                      <tr key={t.id}>
                        <td style={{ width: 30, color: "var(--text-3)", fontWeight: 800, fontFamily: "var(--font-manrope)" }}>
                          {i + 1}
                        </td>
                        <td>
                          <ToolCell name={t.name} domain={t.domain} verified={t.verified} />
                        </td>
                        <td style={{ textAlign: "right", color: "var(--text-2)" }}>{fmtNumber(t.saves ?? 0)} saves</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── small sub-components ─────────────────────────────────────
function StatCard({
  icon,
  iconBg,
  iconColor,
  trend,
  trendValue,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend: "up" | "down";
  trendValue: string;
  value: string;
  label: string;
}) {
  return (
    <div className="adm-stat-card">
      <div className="adm-sc-top">
        <div className="adm-sc-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <div className={`adm-sc-trend ${trend}`}>{trendValue}</div>
      </div>
      <div className="adm-sc-val">{value}</div>
      <div className="adm-sc-label">{label}</div>
    </div>
  );
}


/**
 * Submissions admin — Postgres-backed list with tabs for
 * pending / approved / rejected. Each pending card has Approve
 * and Reject buttons; approval creates a draft tool that the
 * editor then polishes in /portal-admin/tools/[id]/edit.
 */

import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolSubmissions } from "@/lib/db/schema";
import { SubmissionsList } from "./SubmissionsList";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SubmissionsAdminPage() {
  const [pending, approved, rejected, counts] = await Promise.all([
    db.select().from(toolSubmissions).where(sql`${toolSubmissions.status} = 'pending'`).orderBy(desc(toolSubmissions.submittedAt)),
    db.select().from(toolSubmissions).where(sql`${toolSubmissions.status} = 'approved'`).orderBy(desc(toolSubmissions.reviewedAt)).limit(50),
    db.select().from(toolSubmissions).where(sql`${toolSubmissions.status} = 'rejected'`).orderBy(desc(toolSubmissions.reviewedAt)).limit(50),
    db.select({
      pending: sql<number>`count(*) filter (where ${toolSubmissions.status} = 'pending')::int`,
      approved: sql<number>`count(*) filter (where ${toolSubmissions.status} = 'approved')::int`,
      rejected: sql<number>`count(*) filter (where ${toolSubmissions.status} = 'rejected')::int`,
    }).from(toolSubmissions),
  ]);

  return (
    <SubmissionsList
      pending={pending.map(serialise)}
      approved={approved.map(serialise)}
      rejected={rejected.map(serialise)}
      counts={counts[0] ?? { pending: 0, approved: 0, rejected: 0 }}
    />
  );
}

function serialise(s: typeof toolSubmissions.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    websiteUrl: s.websiteUrl,
    tagline: s.tagline,
    description: s.description,
    category: s.category,
    plan: s.plan,
    submitterName: s.submitterName,
    submitterEmail: s.submitterEmail,
    submittedAt: s.submittedAt.toISOString(),
    rejectionReason: s.rejectionReason,
  };
}

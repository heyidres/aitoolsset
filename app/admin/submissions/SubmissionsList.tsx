"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill, ToolCell } from "../_components/admin-ui";
import { approveSubmission, rejectSubmission } from "./_actions";

type Submission = {
  id: string;
  name: string;
  websiteUrl: string;
  tagline: string;
  description: string;
  category: string;
  plan: string;
  submitterName: string;
  submitterEmail: string;
  submittedAt: string;
  rejectionReason: string | null;
};

type Counts = { pending: number; approved: number; rejected: number };
type Tab = "pending" | "approved" | "rejected";

function fmtAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function domainFrom(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export function SubmissionsList({
  pending,
  approved,
  rejected,
  counts,
}: {
  pending: Submission[];
  approved: Submission[];
  rejected: Submission[];
  counts: Counts;
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const list = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  return (
    <div className="adm-panel">
      <div className="adm-tbl-toolbar">
        <div className="adm-tbl-tabs">
          {([["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`adm-tbl-tab ${tab === id ? "active" : ""}`}>{label} <span className="n">{counts[id]}</span></button>
          ))}
        </div>
      </div>
      <div className="adm-panel-body">
        {list.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
            No {tab} submissions.
          </div>
        ) : (
          list.map((s) => <Card key={s.id} sub={s} tab={tab} />)
        )}
      </div>
    </div>
  );
}

function Card({ sub, tab }: { sub: Submission; tab: Tab }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const approve = () => {
    setError(null); setMsg(null);
    start(async () => {
      try {
        await approveSubmission(sub.id);
        setMsg(`${sub.name} approved — draft tool created.`);
        router.refresh();
      } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    });
  };

  const reject = () => {
    const reason = prompt(`Reject "${sub.name}"? Optional reason:`) ?? "";
    if (reason === null) return;
    setError(null); setMsg(null);
    start(async () => {
      try {
        await rejectSubmission(sub.id, reason || undefined);
        setMsg(`${sub.name} rejected.`);
        router.refresh();
      } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    });
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 12, background: "var(--white)", opacity: pending ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <ToolCell name={sub.name} domain={domainFrom(sub.websiteUrl)} />
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <Pill tone={sub.plan === "featured" ? "blue" : "gray"}>{sub.plan === "featured" ? "Featured" : "Free"}</Pill>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{sub.category} · {fmtAgo(sub.submittedAt)}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6, fontFamily: "var(--font-manrope)", fontWeight: 600 }}>
        {sub.tagline}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 10 }}>
        {sub.description.slice(0, 280)}{sub.description.length > 280 ? "…" : ""}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 14 }}>
        Submitted by <strong style={{ color: "var(--text-2)" }}>{sub.submitterName}</strong> ({sub.submitterEmail})
      </div>
      {sub.rejectionReason && (
        <div style={{ fontSize: 12, color: "var(--red)", background: "var(--red-bg)", padding: "8px 10px", borderRadius: 6, marginBottom: 10 }}>
          Reason: {sub.rejectionReason}
        </div>
      )}
      {msg && <div style={{ fontSize: 12, color: "var(--green)", marginBottom: 8, fontWeight: 600 }}>{msg}</div>}
      {error && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 8, fontWeight: 600 }}>{error}</div>}
      {tab === "pending" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" disabled={pending} onClick={approve} className="adm-btn-sm primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            Approve & create draft tool
          </button>
          <button type="button" disabled={pending} onClick={reject} className="adm-btn-sm ghost" style={{ color: "var(--red)" }}>Reject</button>
          <a href={sub.websiteUrl} target="_blank" rel="noopener noreferrer" className="adm-btn-sm ghost">Visit site ↗</a>
        </div>
      )}
    </div>
  );
}

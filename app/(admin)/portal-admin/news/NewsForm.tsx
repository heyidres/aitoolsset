"use client";

/**
 * Shared form for /portal-admin/news/new (manual create) and
 * /portal-admin/news/[id]/edit (review AI-generated drafts).
 *
 * Layout — two columns at >=900px:
 *   LEFT  : metadata (headline, source, topic, status, breaking…)
 *   RIGHT : article body (intro, key highlights, body HTML, FAQs, citations)
 *
 * Save flow:
 *   - create mode → POST /api/portal-admin/news
 *   - edit mode   → PATCH /api/portal-admin/news/[id]
 *
 * Regenerate flow (edit mode only):
 *   - calls regenerateNewsDraft() server action which deletes the post
 *     and re-queues the source detection event. Next cron tick redrafts.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { regenerateNewsDraft } from "./regenerate-actions";

export type Faq = { q: string; a: string };
export type Citation = { label: string; url: string };

export type NewsFormValues = {
  headline: string;
  description: string;
  source: string;
  sourceUrl: string;
  topic: "llm" | "image" | "video" | "code" | "audio" | "policy" | "research" | "cybersecurity" | "startup";
  tag: string;
  categories: string;
  breaking: boolean;
  status: "draft" | "review" | "approved" | "published";
  publishedAt: string; // yyyy-mm-ddThh:mm
  draft: {
    seoTitle: string;
    metaDescription: string;
    introduction: string;
    keyHighlights: string; // newline-separated
    body: string;
    expertCommentary: string;
    faqs: Faq[];
    citations: Citation[];
  };
};

export const EMPTY_FORM: NewsFormValues = {
  headline: "",
  description: "",
  source: "",
  sourceUrl: "",
  topic: "llm",
  tag: "News",
  categories: "",
  breaking: false,
  status: "draft",
  publishedAt: "",
  draft: {
    seoTitle: "",
    metaDescription: "",
    introduction: "",
    keyHighlights: "",
    body: "",
    expertCommentary: "",
    faqs: [],
    citations: [],
  },
};

const TOPIC_OPTIONS: Array<{ value: NewsFormValues["topic"]; label: string }> = [
  { value: "llm", label: "LLM / model release" },
  { value: "image", label: "Image AI" },
  { value: "video", label: "Video AI" },
  { value: "code", label: "Coding AI" },
  { value: "audio", label: "Audio AI" },
  { value: "research", label: "Research" },
  { value: "policy", label: "Policy / regulation" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "startup", label: "Startup / funding" },
];

export function NewsForm({
  mode,
  initial,
  postId,
  postSlug,
}: {
  mode: "create" | "edit";
  initial: NewsFormValues;
  postId?: string;
  postSlug?: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<NewsFormValues>(initial);
  const [pending, start] = useTransition();
  const [regenPending, startRegen] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const update = <K extends keyof NewsFormValues>(k: K, val: NewsFormValues[K]) =>
    setV((x) => ({ ...x, [k]: val }));
  const updateDraft = <K extends keyof NewsFormValues["draft"]>(k: K, val: NewsFormValues["draft"][K]) =>
    setV((x) => ({ ...x, draft: { ...x.draft, [k]: val } }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    start(async () => {
      const payload = {
        headline: v.headline,
        description: v.description,
        ...(mode === "create" ? { source: v.source, sourceUrl: v.sourceUrl } : {}),
        topic: v.topic,
        tag: v.tag,
        categories: v.categories.split(",").map((s) => s.trim()).filter(Boolean),
        breaking: v.breaking,
        status: v.status,
        ...(mode === "create" && v.publishedAt
          ? { publishedAt: new Date(v.publishedAt).toISOString() }
          : {}),
        draft: {
          seoTitle: v.draft.seoTitle || undefined,
          metaDescription: v.draft.metaDescription || undefined,
          introduction: v.draft.introduction || undefined,
          keyHighlights: v.draft.keyHighlights
            ? v.draft.keyHighlights.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined,
          body: v.draft.body || undefined,
          expertCommentary: v.draft.expertCommentary || undefined,
          faqs: v.draft.faqs.length ? v.draft.faqs : undefined,
          citations: v.draft.citations.length ? v.draft.citations : undefined,
        },
      };
      const url = mode === "create" ? "/api/portal-admin/news" : `/api/portal-admin/news/${postId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error ?? `HTTP ${res.status}`);
        return;
      }
      setOk(mode === "create" ? "Story created." : "Saved.");
      if (mode === "create" && j.id) router.push(`/portal-admin/news/${j.id}/edit`);
      else router.refresh();
    });
  };

  const onRegen = () => {
    if (!postId) return;
    if (!confirm("Regenerate this draft? The current article will be deleted and the source event re-queued for the next cron tick.")) return;
    startRegen(async () => {
      try {
        await regenerateNewsDraft(postId);
        setOk("Re-queued. The draft will be rebuilt within ~5 minutes.");
        setTimeout(() => router.push("/portal-admin/news"), 1500);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Regenerate failed");
      }
    });
  };

  return (
    <form className="adm-input-wrap" onSubmit={submit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font)", fontSize: 24, fontWeight: 900, letterSpacing: "-.5px" }}>
            {mode === "create" ? "New news story" : "Edit news story"}
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
            {mode === "create"
              ? "Write a story by hand. Defaults to status='draft' — flip to 'review' to send into the editorial queue, or 'published' to ship now."
              : "Fix the AI-generated content, then approve or publish."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/portal-admin/news" className="adm-btn-sm ghost">← Back to queue</Link>
          {mode === "edit" && postSlug && (
            <a
              href={`/news/${postSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn-sm ghost"
            >
              Preview ↗
            </a>
          )}
          {mode === "edit" && postId && (
            <button
              type="button"
              onClick={onRegen}
              disabled={regenPending || pending}
              className="adm-btn-sm ghost"
              style={{ color: "var(--purple)", borderColor: "var(--purple-border)" }}
            >
              {regenPending ? "Re-queueing…" : "↻ Regenerate"}
            </button>
          )}
          <button type="submit" disabled={pending} className="adm-btn-sm primary">
            {pending ? "Saving…" : mode === "create" ? "Create story" : "Save changes"}
          </button>
        </div>
      </div>

      {err && (
        <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red)", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
          {err}
        </div>
      )}
      {ok && (
        <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
          {ok}
        </div>
      )}

      <div className="news-grid">
        {/* LEFT — metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title="Source & status">
            <Field label="Headline" required>
              <input type="text" value={v.headline} maxLength={300} onChange={(e) => update("headline", e.target.value)} required />
            </Field>
            <Field label="Description / subhead" hint="Shown under the headline on cards + the article page (max 500 chars).">
              <textarea value={v.description} maxLength={500} rows={2} onChange={(e) => update("description", e.target.value)} />
            </Field>
            {mode === "create" && (
              <>
                <Field label="Source name" required hint="e.g. 'OpenAI', 'TechCrunch', 'Anthropic Blog'">
                  <input type="text" value={v.source} maxLength={120} onChange={(e) => update("source", e.target.value)} required />
                </Field>
                <Field label="Source URL" required hint="The original announcement / article. Used for dedup + favicon.">
                  <input type="url" value={v.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} required />
                </Field>
              </>
            )}
            <div className="row-2">
              <Field label="Topic">
                <select value={v.topic} onChange={(e) => update("topic", e.target.value as NewsFormValues["topic"])}>
                  {TOPIC_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select value={v.status} onChange={(e) => update("status", e.target.value as NewsFormValues["status"])}>
                  <option value="draft">Draft (private)</option>
                  <option value="review">In review</option>
                  <option value="approved">Approved (not live yet)</option>
                  <option value="published">Published (live)</option>
                </select>
              </Field>
            </div>
            <div className="row-2">
              <Field label="Tag" hint="Short pill label, e.g. 'New', 'Breaking', 'Funding'">
                <input type="text" value={v.tag} maxLength={60} onChange={(e) => update("tag", e.target.value)} />
              </Field>
              <Field label="Categories" hint="Comma-separated, e.g. 'AI, OpenAI, Models'">
                <input type="text" value={v.categories} onChange={(e) => update("categories", e.target.value)} />
              </Field>
            </div>
            {mode === "create" && (
              <Field label="Published at" hint="Leave blank to use 'now'. UTC.">
                <input type="datetime-local" value={v.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} />
              </Field>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={v.breaking} onChange={(e) => update("breaking", e.target.checked)} />
              Mark as breaking news (red pill on cards)
            </label>
          </Panel>

          <Panel title="SEO">
            <Field label="SEO title" hint="Used in <title>. Defaults to headline if blank.">
              <input type="text" value={v.draft.seoTitle} maxLength={70} onChange={(e) => updateDraft("seoTitle", e.target.value)} />
            </Field>
            <Field label="Meta description" hint="150-160 chars ideal for search snippets.">
              <textarea value={v.draft.metaDescription} maxLength={300} rows={2} onChange={(e) => updateDraft("metaDescription", e.target.value)} />
            </Field>
          </Panel>
        </div>

        {/* RIGHT — body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title="Article body">
            <Field label="Introduction" hint="2 short paragraphs. Plain text or basic HTML.">
              <textarea value={v.draft.introduction} rows={4} onChange={(e) => updateDraft("introduction", e.target.value)} />
            </Field>
            <Field label="Key highlights" hint="One per line. Renders as a bulleted list.">
              <textarea value={v.draft.keyHighlights} rows={4} onChange={(e) => updateDraft("keyHighlights", e.target.value)} />
            </Field>
            <Field label="Body (HTML)" hint="Full article. <p>, <h2>, <a>, <ul>, <strong> etc. allowed.">
              <textarea value={v.draft.body} rows={14} onChange={(e) => updateDraft("body", e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: 12.5 }} />
            </Field>
            <Field label="Expert commentary" hint="Optional. One-paragraph editorial take.">
              <textarea value={v.draft.expertCommentary} rows={3} onChange={(e) => updateDraft("expertCommentary", e.target.value)} />
            </Field>
          </Panel>

          <Panel
            title="FAQs"
            action={
              <button
                type="button"
                className="adm-btn-sm ghost"
                onClick={() => updateDraft("faqs", [...v.draft.faqs, { q: "", a: "" }])}
              >
                + Add FAQ
              </button>
            }
          >
            {v.draft.faqs.length === 0 ? (
              <div style={{ color: "var(--text-3)", fontSize: 13, padding: "8px 0" }}>No FAQs yet.</div>
            ) : (
              v.draft.faqs.map((f, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    placeholder="Question"
                    value={f.q}
                    onChange={(e) => {
                      const next = [...v.draft.faqs];
                      next[i] = { ...next[i], q: e.target.value };
                      updateDraft("faqs", next);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Answer"
                    value={f.a}
                    onChange={(e) => {
                      const next = [...v.draft.faqs];
                      next[i] = { ...next[i], a: e.target.value };
                      updateDraft("faqs", next);
                    }}
                  />
                  <button
                    type="button"
                    className="adm-btn-sm ghost"
                    onClick={() => updateDraft("faqs", v.draft.faqs.filter((_, j) => j !== i))}
                    style={{ color: "var(--red)" }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </Panel>

          <Panel
            title="Citations"
            action={
              <button
                type="button"
                className="adm-btn-sm ghost"
                onClick={() => updateDraft("citations", [...v.draft.citations, { label: "", url: "" }])}
              >
                + Add citation
              </button>
            }
          >
            {v.draft.citations.length === 0 ? (
              <div style={{ color: "var(--text-3)", fontSize: 13, padding: "8px 0" }}>No citations yet.</div>
            ) : (
              v.draft.citations.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    placeholder="Label (e.g. 'OpenAI announcement')"
                    value={c.label}
                    onChange={(e) => {
                      const next = [...v.draft.citations];
                      next[i] = { ...next[i], label: e.target.value };
                      updateDraft("citations", next);
                    }}
                  />
                  <input
                    type="url"
                    placeholder="https://…"
                    value={c.url}
                    onChange={(e) => {
                      const next = [...v.draft.citations];
                      next[i] = { ...next[i], url: e.target.value };
                      updateDraft("citations", next);
                    }}
                  />
                  <button
                    type="button"
                    className="adm-btn-sm ghost"
                    onClick={() => updateDraft("citations", v.draft.citations.filter((_, j) => j !== i))}
                    style={{ color: "var(--red)" }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>

      <style jsx>{`
        .news-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 18px;
        }
        @media (max-width: 980px) {
          .news-grid { grid-template-columns: 1fr; }
        }
        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 560px) {
          .row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="adm-panel">
      <div className="adm-panel-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="adm-panel-title">{title}</div>
        {action}
      </div>
      <div className="adm-panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{label}{required && <span style={{ color: "var(--red)" }}> *</span>}</span>
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>
      )}
    </label>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { RichTextEditor, type RichTextEditorHandle } from "../_components/RichTextEditor";
import { BLOCK_TEMPLATES } from "@/lib/blog-markers";

const CATEGORIES = ["Guide", "Comparison", "Roundup", "Tutorial", "News", "Review", "Opinion"];

export type AuthorOpt = { slug: string; name: string };
export type ToolOpt = { slug: string; name: string };

export type BlogFormValues = {
  title: string;
  slug: string;
  category: string;
  deck: string;
  coverImageUrl: string;
  /** Legacy single-name byline (kept for back-compat). */
  author: string;
  /** E-E-A-T multi-author slugs. First = lead byline. */
  authorSlugs: string[];
  reviewedBySlug: string;
  tagsCsv: string;
  body: string;
  faqs: Array<{ q: string; a: string }>;
  readMinutes: string;
  status: "draft" | "scheduled" | "published";
  publishedAt: string; // datetime-local
  seoTitle: string;
  seoDescription: string;
};

const EMPTY: BlogFormValues = {
  title: "",
  slug: "",
  category: "Guide",
  deck: "",
  coverImageUrl: "",
  author: "",
  authorSlugs: [],
  reviewedBySlug: "",
  tagsCsv: "",
  body: "",
  faqs: [],
  readMinutes: "",
  status: "draft",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

export function BlogForm({
  initial = EMPTY,
  mode,
  action,
  authorOptions = [],
  toolOptions = [],
}: {
  initial?: BlogFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
  /** CMS authors from /admin/authors. Drives the multi-author picker + reviewed-by select. */
  authorOptions?: AuthorOpt[];
  /** Published tools — drives the "+ Tool" embed picker in the rich-text toolbar. */
  toolOptions?: ToolOpt[];
}) {
  const [values, setValues] = useState<BlogFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.title) }));
  }, [values.title, slugTouched]);

  const u = <K extends keyof BlogFormValues>(k: K, v: BlogFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9-]+$/.test(values.slug)) { setErr("Slug must be lowercase letters, numbers, and dashes only."); return; }
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try { await action(fd); } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); }
    });
  };

  return (
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28 }}>
      <input type="hidden" name="status" value={values.status} />
      <input type="hidden" name="authorSlugsJson" value={JSON.stringify(values.authorSlugs)} />
      <input type="hidden" name="faqsJson" value={JSON.stringify(values.faqs)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }}>
        <div>
          <Section title="Article">
            <Field label="Title" required>
              <input type="text" name="title" required maxLength={160} value={values.title} onChange={(e) => u("title", e.target.value)} placeholder="The 10 Best AI Coding Assistants in 2026" />
            </Field>
            <Field label="Slug" required hint="URL path — auto from title">
              <input type="text" name="slug" required pattern="[a-z0-9-]+" maxLength={160} value={values.slug}
                onChange={(e) => { setSlugTouched(true); u("slug", e.target.value); }}
                style={{ fontFamily: "var(--mono)" }} />
            </Field>
            <Field label="Deck / subtitle" hint="Optional. Shown under the title.">
              <input type="text" name="deck" maxLength={240} value={values.deck} onChange={(e) => u("deck", e.target.value)} placeholder="Hands-on with every major coding AI…" />
            </Field>
            <Field label="Category" required>
              <select name="category" required value={values.category} onChange={(e) => u("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field
              label="Authors (E-E-A-T)"
              hint="Click chips to add/remove. First selected = lead byline. Each links to a Person JSON-LD entity with credentials + external profiles."
            >
              <AuthorChips
                allAuthors={authorOptions}
                selected={values.authorSlugs}
                onChange={(slugs) => u("authorSlugs", slugs)}
              />
            </Field>
            <Field
              label="Reviewed by"
              hint="Optional fact-checker / editor. Renders as a separate Reviewed-By byline — strongest E-E-A-T signal for YMYL content."
            >
              <select
                value={values.reviewedBySlug}
                onChange={(e) => u("reviewedBySlug", e.target.value)}
                name="reviewedBySlug"
              >
                <option value="">— No reviewer —</option>
                {authorOptions
                  .filter((a) => !values.authorSlugs.includes(a.slug))
                  .map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </Field>
            <Field
              label="Legacy byline (back-compat)"
              hint="Only used when no CMS authors are picked above. Plain text. Leave blank if you're using the multi-author picker."
            >
              <input type="text" name="author" value={values.author} onChange={(e) => u("author", e.target.value)} placeholder="Sarah Park" />
            </Field>
            <Row>
              <Field label="Tags" hint="Comma-separated">
                <input type="text" name="tagsCsv" value={values.tagsCsv} onChange={(e) => u("tagsCsv", e.target.value)} placeholder="Code, Productivity, Review" />
              </Field>
              <Field label="Read time (minutes)" hint="Optional. Auto-estimate later.">
                <input type="number" name="readMinutes" min={1} max={120} value={values.readMinutes} onChange={(e) => u("readMinutes", e.target.value)} placeholder="7" />
              </Field>
            </Row>
          </Section>

          <Section title="Cover image">
            <CoverImageField value={values.coverImageUrl} onChange={(v) => u("coverImageUrl", v)} />
          </Section>

          <Section title="Body">
            <Field
              label="Article body"
              required
              hint={
                'Use H2/H3 for sections. To embed a tool card mid-article, click "+ Tool" in the toolbar and pick one — it inserts a marker like [[tool:slug]] that renders as a full card on the public page.'
              }
            >
              <BodyEditor
                value={values.body}
                onChange={(v) => u("body", v)}
                toolOptions={toolOptions}
              />
            </Field>
          </Section>

          <Section title="FAQs">
            <Field
              label="Frequently asked questions"
              hint="Renders below the article as accordion AND emitted as FAQ JSON-LD so Google can show the FAQ rich-snippet on the SERP. 3-8 entries work best."
            >
              <FaqEditor faqs={values.faqs} onChange={(f) => u("faqs", f)} />
            </Field>
          </Section>

          <Section title="SEO (optional)">
            <Field label="Meta title" hint="Defaults to article title if blank. Max 60 chars.">
              <input type="text" name="seoTitle" maxLength={60} value={values.seoTitle} onChange={(e) => u("seoTitle", e.target.value)} />
            </Field>
            <Field label="Meta description" hint="Max 160 chars">
              <textarea name="seoDescription" rows={3} maxLength={160} value={values.seoDescription} onChange={(e) => u("seoDescription", e.target.value)} />
            </Field>
          </Section>
        </div>

        {/* Sidebar — publish controls */}
        <div>
          <div style={{ position: "sticky", top: 90, border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "var(--bg)" }}>
            <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 800, marginBottom: 14, letterSpacing: "-0.2px" }}>Publish</div>

            <div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Status</div>
            <select value={values.status} onChange={(e) => u("status", e.target.value as BlogFormValues["status"])}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--white)", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              <option value="draft">Draft (hidden)</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published (live)</option>
            </select>

            <Field label={values.status === "scheduled" ? "Publish at" : "Override publish date"} hint="Leave blank to use 'now' on publish">
              <input type="datetime-local" name="publishedAt" value={values.publishedAt} onChange={(e) => u("publishedAt", e.target.value)} />
            </Field>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}>
                {pending ? "Saving…" : mode === "create" ? "Create article" : "Save changes"}
              </button>
              <Link href="/admin/blog" className="adm-btn-sm ghost" style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}>Cancel</Link>
            </div>

            {err && (<div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>{err}</div>)}
          </div>
        </div>
      </div>
    </form>
  );
}

function CoverImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Browsers refuse to load file:// URLs from https:// pages. If an editor
  // types or drags a local path into the URL input, the image is broken
  // forever on prod. Flag it loudly so they upload via the button instead.
  const isLocalFileUrl = /^file:\/\//i.test(value.trim());
  const hasValidValue = !!value && !isLocalFileUrl;

  const handleFile = async (file: File) => {
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Upload failed (HTTP ${res.status})`);
      if (!json.url) throw new Error("Upload returned no URL");
      onChange(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ width: "100%", aspectRatio: "1200 / 630", borderRadius: 10, border: "1.5px dashed var(--border)", background: "var(--bg)", overflow: "hidden", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {hasValidValue ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: "var(--text-3)", fontSize: 13, textAlign: "center", padding: "0 24px" }}>
            {isLocalFileUrl
              ? "⚠ Local file paths (file://) don't work — click \"Upload image\" below."
              : "No cover image yet — click \"Upload image\" to add one."}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <label className="adm-btn-sm primary" style={{ cursor: "pointer", padding: "8px 14px" }}>
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
        </label>
        {value && <button type="button" onClick={() => { onChange(""); setErr(null); }} className="adm-btn-sm ghost" style={{ padding: "8px 14px", color: "var(--red)" }}>Remove</button>}
      </div>
      <input
        type="url"
        name="coverImageUrl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a public URL: https://example.com/cover.jpg"
        style={{
          width: "100%",
          border: `1.5px solid ${isLocalFileUrl ? "var(--red-border)" : "var(--border)"}`,
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 13,
          background: isLocalFileUrl ? "var(--red-bg)" : "var(--white)",
          color: isLocalFileUrl ? "var(--red)" : "var(--text)",
          outline: "none",
        }}
      />
      {isLocalFileUrl && (
        <div style={{ marginTop: 6, color: "var(--red)", fontSize: 12, fontWeight: 600 }}>
          That&apos;s a local file path on your computer — browsers can&apos;t load it on the live site. Clear this field and click <strong>Upload image</strong> above instead.
        </div>
      )}
      {err && <div style={{ marginTop: 6, color: "var(--red)", fontSize: 12, fontWeight: 600 }}>⚠ {err}</div>}
    </div>
  );
}

/**
 * RichTextEditor wrapper that adds a "+ Tool" button to the toolbar.
 * Clicking opens a slug picker; pick a tool and we insert a marker
 * `[[tool:<slug>]]` on its own line. The public blog renderer splits
 * the body on these markers and renders a server-side tool card in
 * place of each one.
 */
function BodyEditor({
  value,
  onChange,
  toolOptions,
}: {
  value: string;
  onChange: (v: string) => void;
  toolOptions: ToolOpt[];
}) {
  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState("");
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  // Imperative handle into TipTap. We push insertions straight to the
  // editor instead of mutating parent state — TipTap owns the doc.
  const editorRef = useRef<RichTextEditorHandle | null>(null);

  // Silence the "unused prop" lint — value/onChange are kept on the
  // signature for back-compat with anywhere that still drives the
  // editor via initial value; the editor's own onUpdate keeps the
  // hidden input + form state in sync.
  void value;
  void onChange;

  const insertMarker = (slug: string) => {
    editorRef.current?.insertContent(`<p>[[tool:${slug}]]</p>`);
    setPicking(false);
    setSearch("");
  };

  const insertBlock = (template: string) => {
    editorRef.current?.insertContent(template);
    setBlockMenuOpen(false);
  };

  const filtered = toolOptions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, position: "relative", flexWrap: "wrap" }}>
        <button
          type="button"
          // preventDefault on mousedown so the editor doesn't lose its
          // selection — without this, clicking the button would blur
          // the editor and any subsequent insert would land at the end.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPicking(true)}
          className="adm-btn-sm primary"
          style={{ padding: "6px 12px", fontSize: 12 }}
        >
          + Insert tool card
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setBlockMenuOpen((s) => !s)}
          className="adm-btn-sm ghost"
          style={{ padding: "6px 12px", fontSize: 12, border: "1.5px solid var(--border)" }}
        >
          + Insert block ▾
        </button>
        <div style={{ fontSize: 11.5, color: "var(--text-3)", alignSelf: "center" }}>
          Blocks insert text markers like <code style={{ fontFamily: "var(--mono)" }}>[[tldr]]…[[/tldr]]</code>. Public page renders them as styled cards.
        </div>

        {blockMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              zIndex: 50,
              width: 360,
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,.12)",
              padding: 6,
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {BLOCK_TEMPLATES.map((b) => (
              <button
                key={b.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlock(b.template)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: "transparent",
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {b.label}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2, lineHeight: 1.4 }}>
                  {b.description}
                </div>
              </button>
            ))}
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                borderTop: "1px solid var(--border)",
                fontSize: 11,
                color: "var(--text-3)",
                lineHeight: 1.5,
              }}
            >
              💡 After insert, edit the template text inline. Markers like <code style={{ fontFamily: "var(--mono)" }}>[[tldr]]</code> survive saving and render as cards on the public page.
            </div>
          </div>
        )}
      </div>
      <RichTextEditor ref={editorRef} name="body" defaultValue={value} placeholder="Open with a strong hook…" />

      {picking && (
        <div
          onClick={() => setPicking(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "70vh",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-manrope)", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
                Insert a tool card
              </div>
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools…"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1.5px solid var(--border)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                  No tools match.
                </div>
              ) : (
                filtered.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertMarker(t.slug)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      padding: "10px 16px",
                      background: "transparent",
                      border: 0,
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 13,
                    }}
                  >
                    <strong style={{ fontWeight: 700 }}>{t.name}</strong>
                    <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>{t.slug}</code>
                  </button>
                ))
              )}
            </div>
            <div style={{ padding: 12, textAlign: "right", borderTop: "1px solid var(--border)" }}>
              <button type="button" onClick={() => setPicking(false)} className="adm-btn-sm ghost" style={{ padding: "6px 14px", fontSize: 12 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthorChips({
  allAuthors,
  selected,
  onChange,
}: {
  allAuthors: AuthorOpt[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  if (allAuthors.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
        No authors yet. <Link href="/admin/authors/new" style={{ color: "var(--blue)" }}>Add an author</Link> to attribute this post.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {allAuthors.map((a) => {
        const idx = selected.indexOf(a.slug);
        const active = idx >= 0;
        const isLead = idx === 0;
        return (
          <button
            key={a.slug}
            type="button"
            onClick={() => toggle(a.slug)}
            title={isLead ? "Lead byline" : undefined}
            style={{
              padding: "5px 12px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
              background: active ? "var(--blue)" : "var(--white)",
              color: active ? "#fff" : "var(--text-2)",
              cursor: "pointer",
            }}
          >
            {isLead ? "★ " : ""}{a.name}
          </button>
        );
      })}
    </div>
  );
}

function FaqEditor({
  faqs,
  onChange,
}: {
  faqs: Array<{ q: string; a: string }>;
  onChange: (next: Array<{ q: string; a: string }>) => void;
}) {
  const update = (i: number, patch: Partial<{ q: string; a: string }>) => {
    const next = faqs.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));
  const add = () => onChange([...faqs, { q: "", a: "" }]);

  if (faqs.length === 0) {
    return (
      <button type="button" onClick={add} className="adm-btn-sm ghost" style={{ padding: "8px 14px" }}>
        + Add first FAQ
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {faqs.map((f, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
          <input
            type="text"
            value={f.q}
            onChange={(e) => update(i, { q: e.target.value })}
            placeholder="Question"
            style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, marginBottom: 8, outline: "none", fontWeight: 600 }}
          />
          <textarea
            rows={3}
            value={f.a}
            onChange={(e) => update(i, { a: e.target.value })}
            placeholder="Answer (plain text or basic HTML — links, bold, italics allowed)"
            style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }}
          />
          <button type="button" onClick={() => remove(i)} className="adm-btn-sm ghost" style={{ marginTop: 6, color: "var(--red)" }}>
            Remove FAQ
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="adm-btn-sm ghost" style={{ padding: "8px 14px" }}>
        + Add another FAQ
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ marginBottom: 28 }}><div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>{title}</div>{children}</div>; }
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontFamily: "var(--font-manrope)", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</label><div className="adm-input-wrap">{children}</div>{hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}</div>; }
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }

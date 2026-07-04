"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { RichTextEditor } from "../_components/RichTextEditor";

export type PageFormValues = {
  title: string;
  slug: string;
  deck: string;
  coverImageUrl: string;
  body: string;
  status: "draft" | "published";
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

const EMPTY: PageFormValues = {
  title: "",
  slug: "",
  deck: "",
  coverImageUrl: "",
  body: "",
  status: "draft",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

// Quick-start templates the editor can drop into the body.
const TEMPLATES: Array<{ name: string; title: string; slug: string; body: string }> = [
  {
    name: "About",
    title: "About AI Tools Set",
    slug: "about",
    body: "<h2>Who we are</h2><p>AI Tools Set is a curated directory of the best AI tools across every category. We test every tool ourselves before listing it.</p><h2>What we do</h2><p>We maintain a hand-checked catalogue of 590+ AI tools updated daily.</p>",
  },
  {
    name: "Privacy Policy",
    title: "Privacy Policy",
    slug: "privacy",
    body: "<h2>Information we collect</h2><p>We collect minimal personal data needed to operate the directory: email when you sign in, and IP address logs for security.</p><h2>How we use it</h2><p>We never sell your data. We use it solely to deliver the service.</p>",
  },
  {
    name: "Terms of Service",
    title: "Terms of Service",
    slug: "terms",
    body: "<h2>Acceptable use</h2><p>By using AI Tools Set you agree to use the service lawfully and to respect other users.</p><h2>Disclaimers</h2><p>Tool listings are editorial opinions. We make no warranty as to accuracy.</p>",
  },
  {
    name: "Contact",
    title: "Contact",
    slug: "contact",
    body: "<h2>Get in touch</h2><p>Email us at <a href='mailto:hello@aitoolsset.com'>hello@aitoolsset.com</a>. We reply within 48 hours.</p>",
  },
];

export function PageForm({
  initial = EMPTY,
  mode,
  action,
}: {
  initial?: PageFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
}) {
  const [values, setValues] = useState<PageFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [bodyVersion, setBodyVersion] = useState(0); // bumped to reseed the rich editor

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.title) }));
  }, [values.title, slugTouched]);

  const u = <K extends keyof PageFormValues>(k: K, v: PageFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setValues((s) => ({
      ...s,
      title: s.title || t.title,
      slug: s.slug || t.slug,
      body: t.body,
    }));
    setSlugTouched(true);
    setBodyVersion((n) => n + 1);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(values.slug)) {
      setErr("Slug must be lowercase letters, numbers, and dashes only.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try { await action(fd); } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); }
    });
  };

  return (
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28 }}>
      <input type="hidden" name="status" value={values.status} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }}>
        <div>
          {mode === "create" && (
            <div
              style={{
                marginBottom: 22,
                padding: 14,
                border: "1.5px dashed rgba(0,82,255,.25)",
                background: "var(--blue-soft)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontFamily: "var(--font-manrope)", fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                Quick-start template
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="adm-btn-sm ghost"
                    style={{ background: "var(--white)", padding: "7px 14px" }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Section title="Page">
            <Field label="Title" required>
              <input
                type="text"
                name="title"
                required
                maxLength={160}
                value={values.title}
                onChange={(e) => u("title", e.target.value)}
                placeholder="About AI Tools Set"
              />
            </Field>
            <Field label="Slug" required hint="URL path — visitors will see /your-slug">
              <input
                type="text"
                name="slug"
                required
                pattern="[a-z0-9][a-z0-9-]*"
                maxLength={120}
                value={values.slug}
                onChange={(e) => { setSlugTouched(true); u("slug", e.target.value); }}
                placeholder="about"
                style={{ fontFamily: "var(--mono)" }}
              />
            </Field>
            <Field label="Subtitle / deck" hint="Optional. Shown under the title.">
              <input
                type="text"
                name="deck"
                maxLength={240}
                value={values.deck}
                onChange={(e) => u("deck", e.target.value)}
                placeholder="What we do, who we are, and why we built this."
              />
            </Field>
          </Section>

          <Section title="Cover image (optional)">
            <CoverImageField value={values.coverImageUrl} onChange={(v) => u("coverImageUrl", v)} />
          </Section>

          <Section title="Body">
            <Field label="Page content" required hint="Use H2/H3 for sections, links to cite sources.">
              <RichTextEditor
                key={`body-${bodyVersion}`}
                name="body"
                defaultValue={values.body}
                placeholder="Start with a strong opening paragraph…"
              />
            </Field>
          </Section>

          <Section title="SEO (optional)">
            <Field label="Meta title" hint="Defaults to page title if blank. Max 60 chars.">
              <input
                type="text"
                name="seoTitle"
                maxLength={60}
                value={values.seoTitle}
                onChange={(e) => u("seoTitle", e.target.value)}
              />
            </Field>
            <Field label="Meta description" hint="Max 160 chars">
              <textarea
                name="seoDescription"
                rows={3}
                maxLength={160}
                value={values.seoDescription}
                onChange={(e) => u("seoDescription", e.target.value)}
              />
            </Field>
          </Section>
        </div>

        {/* Sidebar — publish controls */}
        <div>
          <div style={{ position: "sticky", top: 90, border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "var(--bg)" }}>
            <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 800, marginBottom: 14, letterSpacing: "-0.2px" }}>
              Publish
            </div>

            <div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
              Status
            </div>
            <select
              value={values.status}
              onChange={(e) => u("status", e.target.value as PageFormValues["status"])}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--white)", fontSize: 13, fontWeight: 600, marginBottom: 14 }}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published (live)</option>
            </select>

            <Field label="Override publish date" hint="Leave blank to use 'now' on publish">
              <input type="datetime-local" name="publishedAt" value={values.publishedAt} onChange={(e) => u("publishedAt", e.target.value)} />
            </Field>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}>
                {pending ? "Saving…" : mode === "create" ? "Create page" : "Save changes"}
              </button>
              {mode === "edit" && values.status === "published" && values.slug && (
                <a
                  href={`/${values.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn-sm ghost"
                  style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}
                >
                  View on site ↗
                </a>
              )}
              <Link href="/admin/pages" className="adm-btn-sm ghost" style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}>
                Cancel
              </Link>
            </div>

            {err && (
              <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>
                {err}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function CoverImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErr(null); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Upload failed (HTTP ${res.status})`);
      onChange(json.url);
    } catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); } finally { setUploading(false); }
  };

  return (
    <div>
      <div style={{ width: "100%", aspectRatio: "1200 / 630", borderRadius: 10, border: "1.5px dashed var(--border)", background: "var(--bg)", overflow: "hidden", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: "var(--text-3)", fontSize: 13 }}>No cover image</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <label className="adm-btn-sm primary" style={{ cursor: "pointer", padding: "8px 14px" }}>
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
        </label>
        {value && <button type="button" onClick={() => onChange("")} className="adm-btn-sm ghost" style={{ padding: "8px 14px", color: "var(--red)" }}>Remove</button>}
      </div>
      <input type="url" name="coverImageUrl" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Or paste a URL: https://example.com/cover.jpg" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "var(--white)", outline: "none" }} />
      {err && <div style={{ marginTop: 6, color: "var(--red)", fontSize: 12, fontWeight: 600 }}>{err}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ marginBottom: 28 }}><div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>{title}</div>{children}</div>; }
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontFamily: "var(--font-manrope)", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</label><div className="adm-input-wrap">{children}</div>{hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}</div>; }

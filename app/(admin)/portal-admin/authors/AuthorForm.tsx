"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { RichTextEditor } from "../_components/RichTextEditor";

export type AuthorFormValues = {
  name: string;
  slug: string;
  role: string;
  bioHtml: string;
  photoUrl: string;
  credentialsCsv: string;
  websiteUrl: string;
  linkedinUrl: string;
  xUrl: string;
  githubUrl: string;
  email: string;
};

const EMPTY: AuthorFormValues = {
  name: "",
  slug: "",
  role: "",
  bioHtml: "",
  photoUrl: "",
  credentialsCsv: "",
  websiteUrl: "",
  linkedinUrl: "",
  xUrl: "",
  githubUrl: "",
  email: "",
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function AuthorForm({
  initial = EMPTY,
  mode,
  action,
}: {
  initial?: AuthorFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
}) {
  const [values, setValues] = useState<AuthorFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.name) }));
  }, [values.name, slugTouched]);

  const update = <K extends keyof AuthorFormValues>(k: K, v: AuthorFormValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!/^[a-z0-9-]+$/.test(values.slug)) {
      setError("Slug must be lowercase letters, numbers, and dashes only.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await action(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="adm-panel" style={{ padding: 28 }}>
      <input type="hidden" name="bioHtml" value={values.bioHtml} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>
        <div>
          <Sec title="Basics">
            <Field label="Full name" required>
              <input
                type="text"
                name="name"
                required
                maxLength={80}
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </Field>
            <Field label="Slug" required hint="URL: /blog/author/<slug>">
              <input
                type="text"
                name="slug"
                required
                pattern="[a-z0-9-]+"
                maxLength={80}
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value);
                }}
                style={{ fontFamily: "var(--mono)" }}
              />
            </Field>
            <Field label="Role / Headline" hint="Surfaced under the byline. Builds E-E-A-T authority signal.">
              <input
                type="text"
                name="role"
                maxLength={120}
                value={values.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="e.g. Senior AI Researcher, Editor-in-Chief"
              />
            </Field>
            <Field label="Photo URL" hint="Square works best. Used as the byline avatar + author card.">
              <input
                type="url"
                name="photoUrl"
                value={values.photoUrl}
                onChange={(e) => update("photoUrl", e.target.value)}
                placeholder="https://…/avatar.jpg"
              />
            </Field>
          </Sec>

          <Sec title="Bio">
            <Field
              label="Bio"
              hint="2-3 sentences. Concrete experience: prior roles, projects shipped, publications. Drives the E-E-A-T 'Experience' signal."
            >
              <RichTextEditor
                name="bioHtml"
                defaultValue={values.bioHtml}
                placeholder="Sarah leads AI research at AI Tools Set. Previously ML Engineer at Anthropic; PhD in NLP from Stanford. Published in NeurIPS and ICML."
              />
            </Field>
          </Sec>

          <Sec title="Credentials">
            <Field
              label="Credentials"
              hint="Comma-separated. e.g. 'PhD Stanford, Ex-OpenAI, Published in NeurIPS'. Each chip renders as a verified-style badge."
            >
              <input
                type="text"
                name="credentialsCsv"
                value={values.credentialsCsv}
                onChange={(e) => update("credentialsCsv", e.target.value)}
                placeholder="PhD Stanford, Ex-OpenAI, ML Engineer @ Google"
              />
            </Field>
          </Sec>

          <Sec title="External profiles">
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, marginTop: -6 }}>
              Verifiable links matter most. Google reads these as <code>sameAs</code> in the Person JSON-LD and uses them to consolidate identity across the web.
            </div>
            <Row>
              <Field label="Personal website / portfolio">
                <input type="url" name="websiteUrl" value={values.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://sarahchen.dev" />
              </Field>
              <Field label="LinkedIn">
                <input type="url" name="linkedinUrl" value={values.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/…" />
              </Field>
            </Row>
            <Row>
              <Field label="X / Twitter">
                <input type="url" name="xUrl" value={values.xUrl} onChange={(e) => update("xUrl", e.target.value)} placeholder="https://x.com/…" />
              </Field>
              <Field label="GitHub">
                <input type="url" name="githubUrl" value={values.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} placeholder="https://github.com/…" />
              </Field>
            </Row>
            <Field label="Contact email" hint="Optional. Shown on author page; not exposed in JSON-LD.">
              <input type="email" name="email" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="sarah@aitoolsset.com" />
            </Field>
          </Sec>
        </div>

        <div>
          <div style={{ position: "sticky", top: 90, border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "var(--bg)" }}>
            <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 800, marginBottom: 14 }}>
              Author profile
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}>
                {pending ? "Saving…" : mode === "create" ? "Create author" : "Save changes"}
              </button>
              <Link href="/portal-admin/authors" className="adm-btn-sm ghost" style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}>
                Cancel
              </Link>
              {mode === "edit" && values.slug && (
                <a
                  href={`/blog/author/${values.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn-sm ghost"
                  style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}
                >
                  View on site ↗
                </a>
              )}
            </div>
            {error && (
              <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "var(--font-manrope)", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}
      </label>
      <div className="adm-input-wrap">{children}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

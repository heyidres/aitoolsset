"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { RichTextEditor } from "../_components/RichTextEditor";

export type GlossaryFormValues = {
  term: string;
  slug: string;
  acronym: string;
  cat: "core" | "models" | "training" | "agents";
  definition: string; // HTML
  example: string;
  relatedCsv: string;
  linkedToolId: string;
};

const EMPTY: GlossaryFormValues = {
  term: "",
  slug: "",
  acronym: "",
  cat: "core",
  definition: "",
  example: "",
  relatedCsv: "",
  linkedToolId: "",
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function GlossaryForm({
  initial = EMPTY,
  mode,
  action,
  toolOptions,
}: {
  initial?: GlossaryFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
  toolOptions: Array<{ id: string; name: string }>;
}) {
  const [values, setValues] = useState<GlossaryFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.term) }));
  }, [values.term, slugTouched]);

  const u = <K extends keyof GlossaryFormValues>(k: K, v: GlossaryFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

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
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28, maxWidth: 880 }}>
      <Section title="Term">
        <Row>
          <Field label="Term" required>
            <input type="text" name="term" required maxLength={80} value={values.term} onChange={(e) => u("term", e.target.value)} placeholder="e.g. Large Language Model" />
          </Field>
          <Field label="Acronym" hint="Optional. e.g. LLM">
            <input type="text" name="acronym" maxLength={20} value={values.acronym} onChange={(e) => u("acronym", e.target.value)} placeholder="LLM" />
          </Field>
        </Row>
        <Row>
          <Field label="Slug" required hint="URL path — auto from term">
            <input type="text" name="slug" required pattern="[a-z0-9-]+" maxLength={80} value={values.slug}
              onChange={(e) => { setSlugTouched(true); u("slug", e.target.value); }}
              style={{ fontFamily: "var(--mono)" }} placeholder="large-language-model" />
          </Field>
          <Field label="Category" required>
            <select name="cat" required value={values.cat} onChange={(e) => u("cat", e.target.value as GlossaryFormValues["cat"])}>
              <option value="core">Core</option>
              <option value="models">Models</option>
              <option value="training">Training</option>
              <option value="agents">Agents</option>
            </select>
          </Field>
        </Row>
      </Section>

      <Section title="Definition">
        <Field label="Definition" required hint="Rich text. Keep it accurate and concise (2-4 sentences).">
          <RichTextEditor name="definition" defaultValue={values.definition} placeholder="A neural network trained on…" />
        </Field>
        <Field label="Example" hint="Optional concrete example">
          <textarea name="example" rows={3} value={values.example} onChange={(e) => u("example", e.target.value)} placeholder="GPT-4 is a well-known example of an LLM…" />
        </Field>
      </Section>

      <Section title="Cross-references">
        <Field label="Related term labels" hint="Comma-separated. Shown as chips on the public page.">
          <input type="text" name="relatedCsv" value={values.relatedCsv} onChange={(e) => u("relatedCsv", e.target.value)} placeholder="Transformer, Attention, Pre-training" />
        </Field>
        <Field label="Linked tool" hint="Optional — surfaces a tool chip on the term card">
          <select name="linkedToolId" value={values.linkedToolId} onChange={(e) => u("linkedToolId", e.target.value)}>
            <option value="">— None —</option>
            {toolOptions.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </Field>
      </Section>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ padding: "10px 18px", fontSize: 13 }}>
          {pending ? "Saving…" : mode === "create" ? "Create term" : "Save changes"}
        </button>
        <Link href="/admin/glossary" className="adm-btn-sm ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Cancel</Link>
      </div>

      {err && (<div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>{err}</div>)}
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ marginBottom: 22 }}><div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>{title}</div>{children}</div>; }
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontFamily: "var(--font-manrope)", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</label><div className="adm-input-wrap">{children}</div>{hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}</div>; }
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }

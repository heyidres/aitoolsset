"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

export type CategoryFormValues = {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  popular: boolean;
  orderIndex: number;
  parentSlug: string;
};

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  icon: "",
  color: "#0052ff",
  description: "",
  popular: false,
  orderIndex: 0,
  parentSlug: "",
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function CategoryForm({
  initial = EMPTY,
  mode,
  action,
  allCategories,
}: {
  initial?: CategoryFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
  allCategories: Array<{ slug: string; name: string }>;
}) {
  const [values, setValues] = useState<CategoryFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.name) }));
  }, [values.name, slugTouched]);

  const u = <K extends keyof CategoryFormValues>(k: K, v: CategoryFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9-]+$/.test(values.slug)) {
      setErr("Slug must be lowercase letters, numbers, and dashes only.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await action(fd);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Save failed");
      }
    });
  };

  return (
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28, maxWidth: 760 }}>
      <input type="hidden" name="popular" value={values.popular ? "on" : ""} />
      <input type="hidden" name="orderIndex" value={values.orderIndex} />

      <Section title="Basics">
        <Field label="Name" required>
          <input type="text" name="name" required maxLength={80} value={values.name} onChange={(e) => u("name", e.target.value)} placeholder="e.g. Image Generation" />
        </Field>
        <Field label="Slug" required hint="URL path — auto from name">
          <input type="text" name="slug" required pattern="[a-z0-9-]+" maxLength={80} value={values.slug}
            onChange={(e) => { setSlugTouched(true); u("slug", e.target.value); }}
            style={{ fontFamily: "var(--mono)" }} placeholder="e.g. image-generation" />
        </Field>
        <Row>
          <Field label="Icon" hint="Emoji or short string">
            <input type="text" name="icon" maxLength={4} value={values.icon} onChange={(e) => u("icon", e.target.value)} placeholder="🎨" />
          </Field>
          <Field label="Accent colour" hint="Hex code">
            <input type="text" name="color" maxLength={20} value={values.color} onChange={(e) => u("color", e.target.value)} placeholder="#FF8800" />
          </Field>
        </Row>
        <Field label="Description" hint="Optional short blurb">
          <textarea name="description" rows={3} value={values.description} onChange={(e) => u("description", e.target.value)} placeholder="What this category covers…" />
        </Field>
        <Row>
          <Field label="Display order" hint="Lower numbers come first">
            <input type="number" min={0} max={1000} value={values.orderIndex} onChange={(e) => u("orderIndex", parseInt(e.target.value || "0", 10))} />
          </Field>
          <Field label="Parent category" hint="Optional — for sub-categories">
            <select name="parentSlug" value={values.parentSlug} onChange={(e) => u("parentSlug", e.target.value)}>
              <option value="">— None —</option>
              {allCategories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </Field>
        </Row>
        <ToggleRow title="Popular" desc="Surface on the homepage categories rail" on={values.popular} onChange={(v) => u("popular", v)} />
      </Section>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ padding: "10px 18px", fontSize: 13 }}>
          {pending ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
        </button>
        <Link href="/admin/categories" className="adm-btn-sm ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Cancel</Link>
      </div>

      {err && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>{err}</div>
      )}
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontFamily: "var(--font-manrope)", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}
      </label>
      <div className="adm-input-wrap">{children}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }
function ToggleRow({ title, desc, on, onChange }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>{desc}</div>
      </div>
      <button type="button" onClick={() => onChange(!on)} aria-pressed={on}
        style={{ width: 42, height: 24, borderRadius: 100, background: on ? "var(--blue)" : "var(--border-2)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "#fff", top: 3, left: 3, transform: on ? "translateX(18px)" : "translateX(0)", transition: "transform .2s" }} />
      </button>
    </div>
  );
}

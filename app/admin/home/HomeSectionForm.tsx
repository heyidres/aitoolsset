"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

export type HomeSectionFormValues = {
  slug: string;
  badge: string;
  title: string;
  deck: string;
  bgColor: string;
  imageSide: "left" | "right";
  position: string;
  enabled: boolean;
  toolSlugs: string[];
  useCases: Array<{ name: string; desc: string; label: string; grad: string }>;
};

const EMPTY: HomeSectionFormValues = {
  slug: "",
  badge: "",
  title: "",
  deck: "",
  bgColor: "var(--mint)",
  imageSide: "right",
  position: "10",
  enabled: true,
  toolSlugs: [],
  useCases: [],
};

const BG_PRESETS = [
  { label: "Mint (default)", value: "var(--mint)" },
  { label: "Cream", value: "var(--cream)" },
  { label: "Lavender", value: "var(--lavender)" },
  { label: "Sand", value: "var(--sand)" },
  { label: "Surface (light grey)", value: "var(--surface)" },
];

function slugifyText(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function HomeSectionForm({
  initial = EMPTY,
  mode,
  action,
  toolOptions,
}: {
  initial?: HomeSectionFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
  toolOptions: Array<{ slug: string; name: string }>;
}) {
  const [values, setValues] = useState<HomeSectionFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugifyText(v.badge) }));
  }, [values.badge, slugTouched]);

  const update = <K extends keyof HomeSectionFormValues>(k: K, v: HomeSectionFormValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const toggleTool = (slug: string) => {
    setValues((s) => ({
      ...s,
      toolSlugs: s.toolSlugs.includes(slug)
        ? s.toolSlugs.filter((x) => x !== slug)
        : [...s.toolSlugs, slug],
    }));
  };

  const moveTool = (slug: string, dir: -1 | 1) => {
    setValues((s) => {
      const idx = s.toolSlugs.indexOf(slug);
      if (idx < 0) return s;
      const next = s.toolSlugs.slice();
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return s;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...s, toolSlugs: next };
    });
  };

  const updateUseCase = (i: number, patch: Partial<HomeSectionFormValues["useCases"][number]>) =>
    setValues((s) => {
      const next = s.useCases.slice();
      next[i] = { ...next[i], ...patch };
      return { ...s, useCases: next };
    });
  const removeUseCase = (i: number) =>
    setValues((s) => ({ ...s, useCases: s.useCases.filter((_, idx) => idx !== i) }));
  const addUseCase = () =>
    setValues((s) => ({
      ...s,
      useCases: [
        ...s.useCases,
        { name: "", desc: "", label: "", grad: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
      ],
    }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  };

  const toolByslug = new Map(toolOptions.map((t) => [t.slug, t.name]));

  return (
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28 }}>
      <input type="hidden" name="enabled" value={values.enabled ? "on" : ""} />
      <input type="hidden" name="toolSlugsJson" value={JSON.stringify(values.toolSlugs)} />
      <input type="hidden" name="useCasesJson" value={JSON.stringify(values.useCases)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>
        <div>
          <Sec title="Header">
            <Field label="Badge / eyebrow" required hint='Small pill above the title. e.g. "✦ For Writers"'>
              <input
                type="text"
                name="badge"
                required
                maxLength={80}
                value={values.badge}
                onChange={(e) => update("badge", e.target.value)}
                placeholder="✦ For Writers"
              />
            </Field>
            <Field label="Title" required hint='Big headline. Line breaks OK — newlines render as <br>.'>
              <input
                type="text"
                name="title"
                required
                maxLength={160}
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Write better, publish faster."
              />
            </Field>
            <Field label="Deck / description" hint="One-line paragraph under the title.">
              <textarea
                rows={2}
                name="deck"
                maxLength={300}
                value={values.deck}
                onChange={(e) => update("deck", e.target.value)}
                placeholder="From blog posts to screenplays — the best AI writing tools to supercharge your workflow."
              />
            </Field>
            <Row>
              <Field label="Background color" hint="Pick a preset or paste any CSS color/var.">
                <select
                  name="bgColor"
                  value={values.bgColor}
                  onChange={(e) => update("bgColor", e.target.value)}
                >
                  {BG_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Use-case grid position" hint="Which side of the headline the 2x2 use-case grid sits on.">
                <select
                  name="imageSide"
                  value={values.imageSide}
                  onChange={(e) => update("imageSide", e.target.value as "left" | "right")}
                >
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
            </Row>
            <Field label="Slug" required hint="Internal identifier (lowercase, dashes only). Auto-derived from badge.">
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
          </Sec>

          <Sec title="Tools to feature">
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, marginTop: -6 }}>
              Pick up to ~6 published tools. The first 4 render as the tool list under the headline. Drag with the arrows to reorder.
            </div>

            {values.toolSlugs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {values.toolSlugs.map((slug, i) => (
                  <div key={slug} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", width: 18, textAlign: "right" }}>
                      {i + 1}.
                    </span>
                    <strong style={{ fontSize: 13, flex: 1 }}>
                      {toolByslug.get(slug) ?? slug}
                    </strong>
                    <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
                      {slug}
                    </code>
                    <button type="button" onClick={() => moveTool(slug, -1)} className="adm-btn-sm ghost" style={{ padding: "4px 8px", fontSize: 11 }} disabled={i === 0}>
                      ↑
                    </button>
                    <button type="button" onClick={() => moveTool(slug, 1)} className="adm-btn-sm ghost" style={{ padding: "4px 8px", fontSize: 11 }} disabled={i === values.toolSlugs.length - 1}>
                      ↓
                    </button>
                    <button type="button" onClick={() => toggleTool(slug)} className="adm-btn-sm ghost" style={{ padding: "4px 10px", fontSize: 11, color: "var(--red)" }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", marginBottom: 8 }}>
              Add a tool
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {toolOptions
                .filter((t) => !values.toolSlugs.includes(t.slug))
                .map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => toggleTool(t.slug)}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 600,
                      border: "1.5px solid var(--border)",
                      background: "#fff",
                      color: "var(--text-2)",
                      cursor: "pointer",
                    }}
                  >
                    + {t.name}
                  </button>
                ))}
            </div>
          </Sec>

          <Sec title="Use cases (2×2 grid)">
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, marginTop: -6 }}>
              4 tiles work best (2×2 grid). Each tile has a small label, a name, and a one-line description. Pick a gradient for the label background.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {values.useCases.map((uc, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "var(--bg)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={uc.name}
                      onChange={(e) => updateUseCase(i, { name: e.target.value })}
                      placeholder="Name (e.g. SEO content)"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      value={uc.label}
                      onChange={(e) => updateUseCase(i, { label: e.target.value })}
                      placeholder="Label chip (e.g. SEO)"
                      style={inputStyle}
                    />
                    <input
                      type="color"
                      value={extractFirstHex(uc.grad) ?? "#0052ff"}
                      onChange={(e) => updateUseCase(i, { grad: makeGradient(e.target.value) })}
                      title="Pick a gradient base color"
                      style={{ width: "100%", height: 36, borderRadius: 6, border: "1.5px solid var(--border)", cursor: "pointer" }}
                    />
                  </div>
                  <input
                    type="text"
                    value={uc.desc}
                    onChange={(e) => updateUseCase(i, { desc: e.target.value })}
                    placeholder="Short description (one sentence)"
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  <input
                    type="text"
                    value={uc.grad}
                    onChange={(e) => updateUseCase(i, { grad: e.target.value })}
                    placeholder="linear-gradient(135deg,#000,#333)"
                    style={{ ...inputStyle, fontSize: 11, color: "var(--text-3)" }}
                  />
                  <button type="button" onClick={() => removeUseCase(i)} className="adm-btn-sm ghost" style={{ marginTop: 6, color: "var(--red)" }}>
                    Remove use case
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addUseCase} className="adm-btn-sm ghost" style={{ marginTop: 12, padding: "8px 14px" }}>
              + Add use case
            </button>
          </Sec>
        </div>

        {/* Sidebar — publish controls */}
        <div>
          <div style={{ position: "sticky", top: 90, border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "var(--bg)" }}>
            <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Publish</div>

            <ToggleRow title="Enabled" desc="Show this section on the homepage" on={values.enabled} onChange={(v) => update("enabled", v)} />

            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />

            <Field label="Position" hint="Lower numbers render first. Reserve 10s for spacing (10, 20, 30)…">
              <input
                type="number"
                name="position"
                value={values.position}
                onChange={(e) => update("position", e.target.value)}
                step={5}
                min={0}
              />
            </Field>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}>
                {pending ? "Saving…" : mode === "create" ? "Create section" : "Save changes"}
              </button>
              <Link href="/admin/home" className="adm-btn-sm ghost" style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}>
                Cancel
              </Link>
              {mode === "edit" && (
                <Link href="/" target="_blank" className="adm-btn-sm ghost" style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}>
                  View on site ↗
                </Link>
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

// ── helpers ─────────────────────────────────────────────────
function extractFirstHex(gradient: string): string | null {
  const m = gradient.match(/#[0-9a-f]{3,6}/i);
  return m ? m[0] : null;
}
function makeGradient(hex: string): string {
  // Build a subtle 135deg gradient from the chosen color to ~25% darker.
  return `linear-gradient(135deg,${hex},${darken(hex, 25)})`;
}
function darken(hex: string, pct: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 255) - Math.round(255 * (pct / 100)));
  const g = Math.max(0, ((num >> 8) & 255) - Math.round(255 * (pct / 100)));
  const b = Math.max(0, (num & 255) - Math.round(255 * (pct / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 13,
  background: "var(--white)",
  outline: "none",
};

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
    <div style={{ marginBottom: 14 }}>
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
function ToggleRow({ title, desc, on, onChange }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        aria-pressed={on}
        style={{ width: 42, height: 24, borderRadius: 100, background: on ? "var(--blue)" : "var(--border-2)", position: "relative", transition: "background .2s", flexShrink: 0 }}
      >
        <span style={{ position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "#fff", top: 3, left: 3, transform: on ? "translateX(18px)" : "translateX(0)", transition: "transform .2s" }} />
      </button>
    </div>
  );
}

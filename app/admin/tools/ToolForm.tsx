/**
 * Shared tool form — used by /admin/tools/new and
 * /admin/tools/[id]/edit.
 *
 * Slug auto-derives from name (until manually edited). Domain
 * auto-derives from website URL. Description uses TipTap.
 *
 * The "✨ Auto-fill with AI" button calls the autofillTool
 * server action which uses Claude to read the homepage + fill
 * every editorial field. The user reviews + clicks Save to
 * persist.
 */

"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ALL_CATS } from "@/lib/categories";
import { RichTextEditor } from "../_components/RichTextEditor";
import { autofillTool } from "./_actions";
import type { AutofillResult } from "@/lib/tool-ai-fill";

type Socials = {
  x?: string | null;
  linkedin?: string | null;
  github?: string | null;
  youtube?: string | null;
};
type Feature = { title: string; desc: string };
type Plan = { name: string; price: string; period: string; popular?: boolean; feats: string[] };

export type ToolFormValues = {
  name: string;
  slug: string;
  tagline: string;
  domain: string;
  websiteUrl: string;
  category: string;
  pricing: "free" | "freemium" | "paid";
  description: string;
  tagsCsv: string;
  logoUrl: string;
  screenshotUrl: string;
  verified: boolean;
  featured: boolean;
  status: "draft" | "published";
  // Editorial detail
  madeBy: string;
  launched: string;
  weeklyUsers: string;
  startingPrice: string;
  hasApi: "" | "true" | "false";
  mobileApp: string;
  browserExtension: "" | "true" | "false";
  socials: Socials;
  features: Feature[];
  pros: string[];
  cons: string[];
  plans: Plan[];
};

const EMPTY: ToolFormValues = {
  name: "",
  slug: "",
  tagline: "",
  domain: "",
  websiteUrl: "",
  category: "",
  pricing: "freemium",
  description: "",
  tagsCsv: "",
  logoUrl: "",
  screenshotUrl: "",
  verified: false,
  featured: false,
  status: "draft",
  madeBy: "",
  launched: "",
  weeklyUsers: "",
  startingPrice: "",
  hasApi: "",
  mobileApp: "",
  browserExtension: "",
  socials: {},
  features: [],
  pros: [],
  cons: [],
  plans: [],
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function ToolForm({
  initial = EMPTY,
  mode,
  action,
}: {
  initial?: ToolFormValues;
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
}) {
  const [values, setValues] = useState<ToolFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [domainTouched, setDomainTouched] = useState(!!initial.domain);
  const [error, setError] = useState<string | null>(null);
  const [autoMsg, setAutoMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [autoPending, startAuto] = useTransition();

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.name) }));
  }, [values.name, slugTouched]);

  useEffect(() => {
    if (!domainTouched) {
      const d = domainFromUrl(values.websiteUrl);
      if (d) setValues((v) => ({ ...v, domain: d }));
    }
  }, [values.websiteUrl, domainTouched]);

  const update = <K extends keyof ToolFormValues>(key: K, value: ToolFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!/^[a-z0-9-]+$/.test(values.slug)) {
      setError("Slug must be lowercase letters, numbers, and dashes only.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  };

  const runAutofill = () => {
    setAutoMsg(null);
    setError(null);
    if (!values.name.trim() || !values.websiteUrl.trim()) {
      setError("Fill in Name and Website URL before running auto-fill.");
      return;
    }
    startAuto(async () => {
      try {
        const r: AutofillResult = await autofillTool({
          name: values.name,
          websiteUrl: values.websiteUrl,
        });
        setValues((v) => ({
          ...v,
          tagline: r.tagline || v.tagline,
          description: r.description || v.description,
          madeBy: r.madeBy ?? v.madeBy,
          launched: r.launched ?? v.launched,
          weeklyUsers: r.weeklyUsers ?? v.weeklyUsers,
          startingPrice: r.startingPrice ?? v.startingPrice,
          hasApi: r.hasApi === null ? v.hasApi : r.hasApi ? "true" : "false",
          mobileApp: r.mobileApp ?? v.mobileApp,
          browserExtension:
            r.browserExtension === null ? v.browserExtension : r.browserExtension ? "true" : "false",
          socials: r.socials ?? v.socials,
          features: r.features ?? v.features,
          pros: r.pros ?? v.pros,
          cons: r.cons ?? v.cons,
          plans: r.plans ?? v.plans,
        }));
        setAutoMsg("AI auto-fill complete — review the fields then click Save.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auto-fill failed");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="adm-panel" style={{ padding: 28 }}>
      {/* Hidden fields */}
      <input type="hidden" name="status" value={values.status} />
      <input type="hidden" name="verified" value={values.verified ? "on" : ""} />
      <input type="hidden" name="featured" value={values.featured ? "on" : ""} />
      <input type="hidden" name="hasApi" value={values.hasApi} />
      <input type="hidden" name="browserExtension" value={values.browserExtension} />
      <input type="hidden" name="socialsJson" value={JSON.stringify(values.socials)} />
      <input type="hidden" name="featuresJson" value={JSON.stringify(values.features)} />
      <input type="hidden" name="prosJson" value={JSON.stringify(values.pros)} />
      <input type="hidden" name="consJson" value={JSON.stringify(values.cons)} />
      <input type="hidden" name="plansJson" value={JSON.stringify(values.plans)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>
        {/* MAIN COLUMN */}
        <div>
          <Section title="Basics">
            <Field label="Name" required>
              <input
                type="text"
                name="name"
                required
                maxLength={80}
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Midjourney"
              />
            </Field>

            <Field label="Slug" required hint="URL path — auto-generated from name">
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
                placeholder="e.g. midjourney"
                style={{ fontFamily: "var(--mono)" }}
              />
            </Field>

            <Field label="Tagline" required hint="One-sentence pitch shown on cards (max 140 chars)">
              <input
                type="text"
                name="tagline"
                required
                maxLength={140}
                value={values.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="e.g. The gold standard for AI art generation."
              />
            </Field>

            <Row>
              <Field label="Website URL" required>
                <input
                  type="url"
                  name="websiteUrl"
                  required
                  value={values.websiteUrl}
                  onChange={(e) => update("websiteUrl", e.target.value)}
                  placeholder="https://midjourney.com"
                />
              </Field>
              <Field label="Bare domain" required hint="Used for the favicon">
                <input
                  type="text"
                  name="domain"
                  required
                  value={values.domain}
                  onChange={(e) => {
                    setDomainTouched(true);
                    update("domain", e.target.value);
                  }}
                  placeholder="e.g. midjourney.com"
                />
              </Field>
            </Row>

            <Row>
              <Field label="Category" required>
                <select
                  name="category"
                  required
                  value={values.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="">Choose…</option>
                  {ALL_CATS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Pricing" required>
                <select
                  name="pricing"
                  required
                  value={values.pricing}
                  onChange={(e) => update("pricing", e.target.value as ToolFormValues["pricing"])}
                >
                  <option value="free">Free</option>
                  <option value="freemium">Free + Paid (freemium)</option>
                  <option value="paid">Paid</option>
                </select>
              </Field>
            </Row>

            <Field label="Tags" hint="Comma-separated. e.g. Image, Generative, Art">
              <input
                type="text"
                name="tagsCsv"
                value={values.tagsCsv}
                onChange={(e) => update("tagsCsv", e.target.value)}
                placeholder="Image, Generative"
              />
            </Field>
          </Section>

          {/* AI AUTO-FILL */}
          <div
            style={{
              border: "1.5px dashed rgba(0,82,255,.25)",
              background: "var(--blue-soft)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 24 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                Auto-fill with Claude AI
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                Reads the homepage and fills description, made-by, launched, pricing, features, pros/cons, plans, socials.
              </div>
              {autoMsg && (
                <div style={{ fontSize: 12, color: "var(--green)", marginTop: 6, fontWeight: 600 }}>
                  {autoMsg}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={runAutofill}
              disabled={autoPending}
              className="adm-btn-sm primary"
              style={{ flexShrink: 0, padding: "10px 16px" }}
            >
              {autoPending ? "Working…" : "Auto-fill"}
            </button>
          </div>

          <Section title="Content">
            <Field
              label="Description"
              required
              hint="Full description for the tool page. Use H2/H3 for sections, bold/italic for emphasis, links to cite sources."
            >
              <RichTextEditor
                name="description"
                defaultValue={values.description}
                placeholder="Tell users what it does, who it's for, and why it stands out…"
              />
            </Field>
          </Section>

          <Section title="Quick info">
            <Row>
              <Field label="Made by" hint="Company that built the tool">
                <input
                  type="text"
                  name="madeBy"
                  value={values.madeBy}
                  onChange={(e) => update("madeBy", e.target.value)}
                  placeholder="e.g. OpenAI"
                />
              </Field>
              <Field label="Launched" hint="Short date">
                <input
                  type="text"
                  name="launched"
                  value={values.launched}
                  onChange={(e) => update("launched", e.target.value)}
                  placeholder="e.g. Nov 2022"
                />
              </Field>
            </Row>
            <Row>
              <Field label="Weekly users" hint="Estimate, optional">
                <input
                  type="text"
                  name="weeklyUsers"
                  value={values.weeklyUsers}
                  onChange={(e) => update("weeklyUsers", e.target.value)}
                  placeholder="e.g. 200M+"
                />
              </Field>
              <Field label="Starting price" hint="Display string">
                <input
                  type="text"
                  name="startingPrice"
                  value={values.startingPrice}
                  onChange={(e) => update("startingPrice", e.target.value)}
                  placeholder="e.g. Free or $10/mo"
                />
              </Field>
            </Row>
            <Row>
              <Field label="Has API">
                <select value={values.hasApi} onChange={(e) => update("hasApi", e.target.value as ToolFormValues["hasApi"])}>
                  <option value="">— Unknown —</option>
                  <option value="true">Available</option>
                  <option value="false">Not available</option>
                </select>
              </Field>
              <Field label="Mobile app">
                <input
                  type="text"
                  name="mobileApp"
                  value={values.mobileApp}
                  onChange={(e) => update("mobileApp", e.target.value)}
                  placeholder="e.g. iOS & Android"
                />
              </Field>
            </Row>
            <Field label="Browser extension">
              <select
                value={values.browserExtension}
                onChange={(e) => update("browserExtension", e.target.value as ToolFormValues["browserExtension"])}
              >
                <option value="">— Unknown —</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
          </Section>

          <Section title="Social links">
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, marginTop: -6 }}>
              Leave a field blank to hide that platform on the public page. e.g. fill only YouTube and the X/LinkedIn/GitHub icons won't appear.
            </div>
            <Row>
              <Field label="X / Twitter URL">
                <input
                  type="url"
                  value={values.socials.x ?? ""}
                  onChange={(e) => update("socials", { ...values.socials, x: e.target.value })}
                  placeholder="https://x.com/openai"
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  type="url"
                  value={values.socials.linkedin ?? ""}
                  onChange={(e) => update("socials", { ...values.socials, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/openai"
                />
              </Field>
            </Row>
            <Row>
              <Field label="GitHub URL">
                <input
                  type="url"
                  value={values.socials.github ?? ""}
                  onChange={(e) => update("socials", { ...values.socials, github: e.target.value })}
                  placeholder="https://github.com/openai"
                />
              </Field>
              <Field label="YouTube URL">
                <input
                  type="url"
                  value={values.socials.youtube ?? ""}
                  onChange={(e) => update("socials", { ...values.socials, youtube: e.target.value })}
                  placeholder="https://youtube.com/@openai"
                />
              </Field>
            </Row>
          </Section>

          <Section title="Key features">
            <ListEditor
              items={values.features.map((f) => `${f.title} — ${f.desc}`)}
              placeholder="Title — short description"
              onChange={(items) =>
                update(
                  "features",
                  items.map((s) => {
                    const idx = s.indexOf(" — ");
                    return idx > -1
                      ? { title: s.slice(0, idx).trim(), desc: s.slice(idx + 3).trim() }
                      : { title: s.trim(), desc: "" };
                  })
                )
              }
              hint="Format: Title — short description. One per line."
            />
          </Section>

          <Row>
            <Section title="Pros">
              <ListEditor
                items={values.pros}
                placeholder="Strong point of this tool"
                onChange={(items) => update("pros", items)}
              />
            </Section>
            <Section title="Cons">
              <ListEditor
                items={values.cons}
                placeholder="Weakness or limitation"
                onChange={(items) => update("cons", items)}
              />
            </Section>
          </Row>

          <Section title="Pricing plans">
            <PlansEditor plans={values.plans} onChange={(p) => update("plans", p)} />
          </Section>

          <Section title="Media">
            <Field label="Logo" hint="Upload a PNG/JPG/SVG (max 5 MB) or paste an external URL.">
              <ImageUpload
                name="logoUrl"
                value={values.logoUrl}
                onChange={(url) => update("logoUrl", url)}
                previewSize={64}
              />
            </Field>
            <Field label="Screenshot" hint="Upload or paste a URL.">
              <ImageUpload
                name="screenshotUrl"
                value={values.screenshotUrl}
                onChange={(url) => update("screenshotUrl", url)}
                previewSize={120}
              />
            </Field>
          </Section>
        </div>

        {/* SIDEBAR — publish controls */}
        <div>
          <div
            style={{
              position: "sticky",
              top: 90,
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 18,
              background: "var(--bg)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 14,
                letterSpacing: "-0.2px",
              }}
            >
              Publish
            </div>

            <ToggleRow
              title="Verified"
              desc="Show the blue verified tick"
              on={values.verified}
              onChange={(v) => update("verified", v)}
            />
            <ToggleRow
              title="Featured"
              desc="Surface on homepage rail"
              on={values.featured}
              onChange={(v) => update("featured", v)}
            />

            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />

            <div
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 8,
              }}
            >
              Status
            </div>

            <select
              value={values.status}
              onChange={(e) => update("status", e.target.value as ToolFormValues["status"])}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border)",
                background: "var(--white)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published (live)</option>
            </select>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}>
                {pending ? "Saving…" : mode === "create" ? "Create tool" : "Save changes"}
              </button>
              <Link href="/admin/tools" className="adm-btn-sm ghost" style={{ width: "100%", padding: "10px 14px", justifyContent: "center", fontSize: 13 }}>
                Cancel
              </Link>
            </div>

            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  background: "var(--red-bg)",
                  border: "1px solid var(--red-border)",
                  borderRadius: 8,
                  color: "var(--red)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  wordBreak: "break-word",
                }}
              >
                <ErrorWithLinks text={error} />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Sub-components ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily: "var(--font-manrope)",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--blue)",
          textTransform: "uppercase",
          letterSpacing: ".08em",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-manrope)",
          fontSize: 12.5,
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
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

function ToggleRow({
  title,
  desc,
  on,
  onChange,
}: {
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
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
        style={{
          width: 42,
          height: 24,
          borderRadius: 100,
          background: on ? "var(--blue)" : "var(--border-2)",
          position: "relative",
          transition: "background .2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            top: 3,
            left: 3,
            transform: on ? "translateX(18px)" : "translateX(0)",
            transition: "transform .2s",
          }}
        />
      </button>
    </div>
  );
}

/**
 * Simple textarea-backed list editor — one item per line.
 * Cheaper than per-row inputs and pastes nicely from Claude's
 * auto-fill output (which we serialise as newline-joined).
 */
function ListEditor({
  items,
  placeholder,
  hint,
  onChange,
}: {
  items: string[];
  placeholder: string;
  hint?: string;
  onChange: (items: string[]) => void;
}) {
  const value = items.join("\n");
  return (
    <Field label="" hint={hint}>
      <textarea
        rows={Math.max(4, items.length + 1)}
        value={value}
        placeholder={placeholder + "\n(one per line)"}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
      />
    </Field>
  );
}

function PlansEditor({ plans, onChange }: { plans: Plan[]; onChange: (p: Plan[]) => void }) {
  const update = (i: number, patch: Partial<Plan>) => {
    const next = plans.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(plans.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...plans, { name: "Free", price: "$0", period: "/month", popular: false, feats: [] }]);

  if (plans.length === 0) {
    return (
      <button type="button" onClick={add} className="adm-btn-sm ghost">
        + Add pricing plan
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {plans.map((p, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 10 }}>
            <input
              type="text"
              value={p.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Plan name"
              style={inputStyle}
            />
            <input
              type="text"
              value={p.price}
              onChange={(e) => update(i, { price: e.target.value })}
              placeholder="$0"
              style={inputStyle}
            />
            <input
              type="text"
              value={p.period}
              onChange={(e) => update(i, { period: e.target.value })}
              placeholder="/month"
              style={inputStyle}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={!!p.popular}
                onChange={(e) => update(i, { popular: e.target.checked })}
              />
              Popular
            </label>
          </div>
          <textarea
            rows={3}
            value={p.feats.join("\n")}
            placeholder="One feature per line"
            onChange={(e) =>
              update(i, {
                feats: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            style={{ ...inputStyle, fontFamily: "var(--font-body)" }}
          />
          <button type="button" onClick={() => remove(i)} className="adm-btn-sm ghost" style={{ marginTop: 6, color: "var(--red)" }}>
            Remove plan
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="adm-btn-sm ghost">
        + Add another plan
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  background: "var(--white)",
  outline: "none",
};

/**
 * Image upload + URL input combo. Shows a thumbnail of the
 * current image, lets the user either upload a new file
 * (POSTs to /api/admin/upload) or paste a URL directly.
 * Keeps a hidden input matching the parent form's name so the
 * server action picks up the final URL via FormData.
 */
function ImageUpload({
  name,
  value,
  onChange,
  previewSize = 64,
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  previewSize?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error ?? `Upload failed (HTTP ${res.status})`);
      }
      onChange(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {/* Preview */}
        <div
          style={{
            width: previewSize,
            height: previewSize,
            borderRadius: 10,
            border: "1.5px dashed var(--border)",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{ color: "var(--text-3)" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="adm-btn-sm primary" style={{ cursor: "pointer", padding: "8px 14px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              style={{ display: "none" }}
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                // Reset so the same file can be reuploaded
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="adm-btn-sm ghost"
              style={{ padding: "8px 14px", color: "var(--red)" }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Or paste a URL */}
      <input
        type="url"
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a URL: https://example.com/image.png"
        style={inputStyle}
      />

      {err && (
        <div
          style={{
            marginTop: 6,
            color: "var(--red)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {err}
        </div>
      )}
    </div>
  );
}

/** Renders error text with any embedded URLs as clickable links. */
function ErrorWithLinks({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--red)", textDecoration: "underline", fontWeight: 700 }}
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

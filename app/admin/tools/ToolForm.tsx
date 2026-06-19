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
import { useEffect, useRef, useState, useTransition } from "react";
import { ALL_CATS } from "@/lib/categories";
import { RichTextEditor, type RichTextEditorHandle } from "../_components/RichTextEditor";
import { autofillTool } from "./_actions";
import type { AutofillResult } from "@/lib/tool-ai-fill";

type CategoryOption = { slug: string; name: string };

type Socials = {
  x?: string | null;
  linkedin?: string | null;
  github?: string | null;
  youtube?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  discord?: string | null;
};
type Feature = { title: string; desc: string };
type Plan = { name: string; price: string; period: string; popular?: boolean; feats: string[] };
type ConfidenceMap = Record<string, "high" | "medium" | "low">;

export type PricingKind = "free" | "freemium" | "paid" | "credit" | "trial" | "enterprise";

export type LinkRel = "dofollow" | "nofollow" | "sponsored" | "ugc";

export type ToolFormValues = {
  name: string;
  slug: string;
  tagline: string;
  domain: string;
  websiteUrl: string;
  linkRel: LinkRel;
  category: string;
  /** Additional category slugs (excluding the primary). */
  extraCategories: string[];
  pricing: PricingKind;
  description: string;
  tagsCsv: string;
  logoUrl: string;
  screenshotUrl: string;
  verified: boolean;
  featured: boolean;
  /** Manual pin for homepage Trending + Popular. Blank = organic sort. */
  homepageOrder: string;
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
  useCases: string[];
  platforms: string[];
  integrations: string[];
  pros: string[];
  cons: string[];
  plans: Plan[];
  // SEO overrides — blank = use auto-generated defaults
  seoTitle: string;
  seoDescription: string;
};

const EMPTY: ToolFormValues = {
  name: "",
  slug: "",
  tagline: "",
  domain: "",
  websiteUrl: "",
  linkRel: "nofollow",
  category: "",
  extraCategories: [],
  pricing: "freemium",
  description: "",
  tagsCsv: "",
  logoUrl: "",
  screenshotUrl: "",
  verified: false,
  featured: false,
  homepageOrder: "",
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
  useCases: [],
  platforms: [],
  integrations: [],
  pros: [],
  cons: [],
  plans: [],
  seoTitle: "",
  seoDescription: "",
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
  categoryOptions,
}: {
  initial?: ToolFormValues;
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  /**
   * CMS-managed categories from /admin/categories. When empty
   * (fresh install) the form falls back to the hardcoded ALL_CATS
   * list so the user can still create a tool. The "Add a category"
   * link in the empty state points them to the right place.
   */
  categoryOptions?: CategoryOption[];
}) {
  const cats: CategoryOption[] =
    categoryOptions && categoryOptions.length > 0
      ? categoryOptions
      : ALL_CATS.map((c) => ({ slug: c.slug, name: c.name }));
  const usingFallback = !categoryOptions || categoryOptions.length === 0;
  const [values, setValues] = useState<ToolFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [domainTouched, setDomainTouched] = useState(!!initial.domain);
  const [error, setError] = useState<string | null>(null);
  const [autoMsg, setAutoMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [autoPending, startAuto] = useTransition();
  /**
   * Per-field confidence from the last auto-fill run. Form renders a
   * yellow "Verify" badge on every field marked "low" so the editor
   * double-checks before publishing.
   */
  const [confidence, setConfidence] = useState<ConfidenceMap>({});

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
        // Hard caps so the AI can never push values past the server-side
        // zod limits (tagline 200, seoTitle 120, seoDescription 300).
        // Trim on a word boundary when possible, then add an ellipsis.
        const cap = (s: string | null | undefined, max: number): string | undefined => {
          if (!s) return undefined;
          if (s.length <= max) return s;
          const sliced = s.slice(0, max - 1);
          const lastSpace = sliced.lastIndexOf(" ");
          return (lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced).trimEnd() + "…";
        };
        setValues((v) => ({
          ...v,
          tagline: cap(r.tagline, 200) ?? v.tagline,
          description: r.description || v.description,
          seoTitle: cap(r.seoTitle, 120) ?? v.seoTitle,
          seoDescription: cap(r.seoDescription, 300) ?? v.seoDescription,
          madeBy: r.madeBy ?? v.madeBy,
          launched: r.launched ?? v.launched,
          weeklyUsers: r.weeklyUsers ?? v.weeklyUsers,
          startingPrice: r.startingPrice ?? v.startingPrice,
          pricing: r.pricing ?? v.pricing,
          hasApi: r.hasApi === null ? v.hasApi : r.hasApi ? "true" : "false",
          mobileApp: r.mobileApp ?? v.mobileApp,
          browserExtension:
            r.browserExtension === null ? v.browserExtension : r.browserExtension ? "true" : "false",
          socials: r.socials ?? v.socials,
          features: r.features ?? v.features,
          useCases: r.useCases ?? v.useCases,
          platforms: r.platforms ?? v.platforms,
          integrations: r.integrations ?? v.integrations,
          // Merge AI-extracted tags into existing CSV (deduped)
          tagsCsv: r.tags && r.tags.length > 0
            ? Array.from(new Set([
                ...v.tagsCsv.split(",").map((s) => s.trim()).filter(Boolean),
                ...r.tags,
              ])).join(", ")
            : v.tagsCsv,
          pros: r.pros ?? v.pros,
          cons: r.cons ?? v.cons,
          plans: r.plans ?? v.plans,
        }));
        setConfidence(r._confidence ?? {});
        const lowCount = Object.values(r._confidence ?? {}).filter((c) => c === "low").length;
        setAutoMsg(
          lowCount > 0
            ? `AI auto-fill complete — ${lowCount} field${lowCount === 1 ? "" : "s"} flagged for review (look for the ⚠ badges below).`
            : "AI auto-fill complete — every field verified against the live site. Review and click Save."
        );
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
      <input type="hidden" name="useCasesJson" value={JSON.stringify(values.useCases)} />
      <input type="hidden" name="platformsJson" value={JSON.stringify(values.platforms)} />
      <input type="hidden" name="integrationsJson" value={JSON.stringify(values.integrations)} />
      <input type="hidden" name="prosJson" value={JSON.stringify(values.pros)} />
      <input type="hidden" name="consJson" value={JSON.stringify(values.cons)} />
      <input type="hidden" name="plansJson" value={JSON.stringify(values.plans)} />
      <input type="hidden" name="extraCategoriesJson" value={JSON.stringify(values.extraCategories)} />

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

            <Field
              label="Tagline"
              required
              confidence={confidence.tagline}
              hint={`One-sentence pitch shown on cards. ${values.tagline.length}/200 chars${
                values.tagline.length > 140 ? " — consider trimming for best card display" : ""
              }`}
            >
              <input
                type="text"
                name="tagline"
                required
                maxLength={200}
                value={values.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="e.g. The gold standard for AI art generation."
                style={
                  values.tagline.length > 200
                    ? { borderColor: "var(--red)" }
                    : values.tagline.length > 140
                    ? { borderColor: "#f59e0b" }
                    : undefined
                }
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

            <Field
              label="Link rel"
              required
              hint="SEO rel attribute on the public 'Visit website' button. Dofollow passes PageRank; nofollow is the safe default for free listings; sponsored is for paid/affiliate; ugc is for user submissions."
            >
              <select
                name="linkRel"
                required
                value={values.linkRel}
                onChange={(e) => update("linkRel", e.target.value as LinkRel)}
              >
                <option value="nofollow">nofollow (default — no PageRank passed)</option>
                <option value="dofollow">dofollow (search engines follow normally)</option>
                <option value="sponsored">sponsored (paid placement / affiliate)</option>
                <option value="ugc">ugc (user-generated content)</option>
              </select>
            </Field>

            <Row>
              <Field
                label="Primary category"
                required
                hint={
                  usingFallback
                    ? "No CMS categories yet — showing default list. Add categories in /admin/categories to manage your own."
                    : "Used for the breadcrumb + canonical URL. Pick additional categories below."
                }
              >
                <select
                  name="category"
                  required
                  value={values.category}
                  onChange={(e) => {
                    const newPrimary = e.target.value;
                    update("category", newPrimary);
                    // Drop the new primary from extras if it was there
                    update(
                      "extraCategories",
                      values.extraCategories.filter((s) => s !== newPrimary)
                    );
                  }}
                >
                  <option value="">Choose…</option>
                  {cats.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Pricing" required confidence={confidence.pricing}>
                <select
                  name="pricing"
                  required
                  value={values.pricing}
                  onChange={(e) => update("pricing", e.target.value as ToolFormValues["pricing"])}
                >
                  <option value="free">Free (no paid tier)</option>
                  <option value="freemium">Freemium (free + paid)</option>
                  <option value="paid">Paid (no free tier)</option>
                  <option value="trial">Free Trial (then paid)</option>
                  <option value="credit">Credit-Based (pay-per-use)</option>
                  <option value="enterprise">Enterprise (custom / sales-led)</option>
                </select>
              </Field>
            </Row>

            <Field
              label="Additional categories"
              hint="Tool also surfaces on each of these category pages. Click to add or remove."
            >
              <CategoryChipsPicker
                allCategories={cats}
                primary={values.category}
                selected={values.extraCategories}
                onChange={(next) => update("extraCategories", next)}
              />
            </Field>

            <Field label="Tags / Keywords" confidence={confidence.tags} hint="Comma-separated. Doubles as SEO keywords woven into the description. Auto-fill mixes the primary category, use-case keywords, and audience tags.">
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
              confidence={confidence.description}
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
              <Field label="Made by" confidence={confidence.madeBy} hint="Company that built the tool">
                <input
                  type="text"
                  name="madeBy"
                  value={values.madeBy}
                  onChange={(e) => update("madeBy", e.target.value)}
                  placeholder="e.g. OpenAI"
                />
              </Field>
              <Field label="Launched" confidence={confidence.launched} hint="Short date">
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
              <Field label="Weekly users" confidence={confidence.weeklyUsers} hint="Estimate, optional">
                <input
                  type="text"
                  name="weeklyUsers"
                  value={values.weeklyUsers}
                  onChange={(e) => update("weeklyUsers", e.target.value)}
                  placeholder="e.g. 200M+"
                />
              </Field>
              <Field label="Starting price" confidence={confidence.startingPrice} hint="Display string">
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
              <Field label="Has API" confidence={confidence.hasApi}>
                <select value={values.hasApi} onChange={(e) => update("hasApi", e.target.value as ToolFormValues["hasApi"])}>
                  <option value="">— Unknown —</option>
                  <option value="true">Available</option>
                  <option value="false">Not available</option>
                </select>
              </Field>
              <Field label="Mobile app" confidence={confidence.mobileApp}>
                <input
                  type="text"
                  name="mobileApp"
                  value={values.mobileApp}
                  onChange={(e) => update("mobileApp", e.target.value)}
                  placeholder="e.g. iOS & Android"
                />
              </Field>
            </Row>
            <Field label="Browser extension" confidence={confidence.browserExtension}>
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
            <Row>
              <Field label="Facebook URL">
                <input
                  type="url"
                  value={values.socials.facebook ?? ""}
                  onChange={(e) => update("socials", { ...values.socials, facebook: e.target.value })}
                  placeholder="https://facebook.com/openai"
                />
              </Field>
              <Field label="Instagram URL">
                <input
                  type="url"
                  value={values.socials.instagram ?? ""}
                  onChange={(e) => update("socials", { ...values.socials, instagram: e.target.value })}
                  placeholder="https://instagram.com/openai"
                />
              </Field>
            </Row>
            <Field label="Discord invite URL">
              <input
                type="url"
                value={values.socials.discord ?? ""}
                onChange={(e) => update("socials", { ...values.socials, discord: e.target.value })}
                placeholder="https://discord.gg/openai"
              />
            </Field>
          </Section>

          <Section title="Use cases">
            <RichListEditor
              items={values.useCases}
              hint='Each <li> is one use case. Use bold/links/H4 from the toolbar. Press Enter for a new item.'
              onChange={(items) => update("useCases", items)}
            />
          </Section>

          <Section title="Platforms">
            <ListEditor
              items={values.platforms}
              placeholder="Web, macOS, iOS, Android, API, Chrome Extension…"
              hint="One platform per line. Only include surfaces the tool genuinely ships on."
              onChange={(items) => update("platforms", items)}
            />
          </Section>

          <Section title="Integrations">
            <ListEditor
              items={values.integrations}
              placeholder="Zapier, Slack, Notion, Figma, Google Drive…"
              hint="Third-party tools this integrates with. One per line. Auto-fill pulls these from the /features and /integrations pages when present."
              onChange={(items) => update("integrations", items)}
            />
          </Section>

          <Section title="Key features">
            <RichListEditor
              items={values.features.map((f) =>
                f.title ? `<strong>${f.title}:</strong> ${f.desc}` : f.desc
              )}
              hint='Each <li> = one feature. Use "<strong>Feature name:</strong> description" so the bold title shows on the public page.'
              onChange={(items) =>
                update(
                  "features",
                  items.map((s) => {
                    // Pull "<strong>Title:</strong> rest" or "<b>Title</b> — rest"
                    const m = s.match(/<(?:strong|b)>([^<]+)<\/(?:strong|b)>[:\s—-]*([\s\S]*)/i);
                    if (m) return { title: m[1].trim().replace(/:$/, ""), desc: m[2].trim() };
                    // Fallback: plain "Title: desc"
                    const colon = s.indexOf(":");
                    if (colon > 0 && colon < 80) {
                      return { title: s.slice(0, colon).trim(), desc: s.slice(colon + 1).trim() };
                    }
                    return { title: "", desc: s.trim() };
                  })
                )
              }
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

          <Section title="SEO (optional)">
            <Field
              label="Meta title"
              confidence={confidence.seoTitle}
              hint="Overrides the public <title> tag. Leave blank to auto-generate from name + tagline. Max ~60 chars for full Google display."
            >
              <input
                type="text"
                name="seoTitle"
                value={values.seoTitle}
                onChange={(e) => update("seoTitle", e.target.value)}
                maxLength={120}
                placeholder="e.g. Midjourney Review 2026 — Best AI Image Generator?"
              />
            </Field>
            <Field
              label="Meta description"
              confidence={confidence.seoDescription}
              hint="Search-result snippet (150-160 chars). Blank = uses the tagline. Auto-fill writes one optimized for click-through."
            >
              <textarea
                name="seoDescription"
                rows={3}
                value={values.seoDescription}
                onChange={(e) => update("seoDescription", e.target.value)}
                maxLength={300}
                placeholder="e.g. Hands-on Midjourney review — pricing, output quality, prompt examples, and how it compares to DALL-E 3 and Stable Diffusion."
              />
            </Field>
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

            <div style={{ marginTop: 4, marginBottom: 4 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-manrope)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Homepage pin order
              </label>
              <input
                type="number"
                name="homepageOrder"
                step={1}
                min={0}
                value={values.homepageOrder}
                onChange={(e) => update("homepageOrder", e.target.value)}
                placeholder="blank = organic"
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1.5px solid var(--border)",
                  fontSize: 13,
                }}
              />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>
                Lower numbers pin higher in Trending + Popular on the homepage. Blank = sort by saves.
              </div>
            </div>

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
  confidence,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** When set to "low", renders a "Verify" warning chip next to the label. */
  confidence?: "high" | "medium" | "low";
  children: React.ReactNode;
}) {
  const showWarning = confidence === "low";
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-manrope)",
          fontSize: 12.5,
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        <span>
          {label}
          {required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}
        </span>
        {showWarning && (
          <span
            title="AI auto-fill flagged this field as low confidence. Verify the value against the source before publishing."
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".04em",
              padding: "2px 7px",
              borderRadius: 100,
              background: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fcd34d",
            }}
          >
            ⚠ Verify
          </span>
        )}
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

/**
 * Rich list editor — wraps RichTextEditor in list mode. Each `<li>` in
 * the body's HTML becomes one entry in the `items` string[] (with
 * inline HTML like `<strong>`/`<a>` preserved). Lets editors author
 * use cases / key features with bold, links, and full formatting.
 *
 * The internal `RichTextEditor` has its own toolbar (H1-H4, bold,
 * italic, link, lists, etc) so the editor can do everything they'd
 * do in the main description body.
 */
function RichListEditor({
  items,
  hint,
  onChange,
}: {
  items: string[];
  hint?: string;
  onChange: (items: string[]) => void;
}) {
  const editorRef = useRef<RichTextEditorHandle | null>(null);
  // Always re-mount as a list when items change externally (e.g. AI
  // auto-fill). We don't track per-keystroke changes — instead, parse
  // the editor's HTML out of the hidden input on every blur / form save.
  const initialHtml =
    items.length > 0
      ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`
      : "<ul><li></li></ul>";

  // Sync items out by scraping the hidden input on every change.
  const hiddenName = `richlist-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <Field label="" hint={hint}>
      <RichTextEditor
        ref={editorRef}
        name={hiddenName}
        defaultValue={initialHtml}
        placeholder="Add one bullet per line. Use the H1-H4 / bold / link toolbar."
      />
      {/* The hidden field RichTextEditor renders is what we read from.
          Every change fires onInput on the wrapping div — parse <li>s
          out and emit them to the parent. */}
      <ParsedListOut
        watchName={hiddenName}
        onParsed={(parsedItems) => onChange(parsedItems)}
      />
    </Field>
  );
}

/**
 * Tiny syncer — watches the hidden input that RichTextEditor mirrors
 * its HTML into, and re-emits the parsed <li> items whenever the input's
 * value changes. Lives outside RichTextEditor so we don't have to fork
 * the shared editor just for this one use case.
 */
function ParsedListOut({
  watchName,
  onParsed,
}: {
  watchName: string;
  onParsed: (items: string[]) => void;
}) {
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>(`input[name="${watchName}"]`);
    if (!input) return;
    let last = input.value;
    const tick = () => {
      if (input.value !== last) {
        last = input.value;
        // Extract every <li>…</li> body, trim, drop empties.
        const items = Array.from(input.value.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
          .map((m) => m[1].trim())
          .filter(Boolean);
        onParsed(items);
      }
    };
    const id = window.setInterval(tick, 350);
    return () => window.clearInterval(id);
  }, [watchName, onParsed]);
  return null;
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

/**
 * Multi-select category chips. The "primary" category (chosen via
 * the dropdown above) is shown as a disabled chip with a star
 * indicator and cannot be removed here — to swap it, change the
 * dropdown selection.
 */
function CategoryChipsPicker({
  allCategories,
  primary,
  selected,
  onChange,
}: {
  allCategories: CategoryOption[];
  primary: string;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (slug: string) => {
    if (slug === primary) return; // primary is managed via the dropdown
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  if (allCategories.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
        No categories available. Add some at /admin/categories first.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {allCategories.map((c) => {
        const isPrimary = c.slug === primary;
        const isSelected = selected.includes(c.slug);
        const active = isPrimary || isSelected;
        return (
          <button
            key={c.slug}
            type="button"
            onClick={() => toggle(c.slug)}
            disabled={isPrimary}
            title={isPrimary ? "Primary category (change via dropdown above)" : undefined}
            style={{
              padding: "5px 12px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
              background: active ? "var(--blue)" : "var(--white)",
              color: active ? "#fff" : "var(--text-2)",
              cursor: isPrimary ? "default" : "pointer",
              opacity: isPrimary ? 0.85 : 1,
              transition: "all .15s",
            }}
          >
            {isPrimary ? "★ " : ""}
            {c.name}
          </button>
        );
      })}
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

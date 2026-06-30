"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { RichTextEditor } from "../_components/RichTextEditor";

type Faq = { q: string; a: string };
type QuickPick = { scenario: string; toolSlug: string; reason: string };
type CompareRow = { toolSlug: string; keyFeature: string; bestFor: string };
type GuideSection = { heading: string; body: string };
type StatOverride = { label: string; value: string };

export type CategoryFormValues = {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  popular: boolean;
  orderIndex: number;
  parentSlug: string;
  // Editorial fields rendered on the public category page
  bannerImageUrl: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  introHtml: string;
  seoTitle: string;
  seoDescription: string;
  featuredToolSlugs: string[];
  // Editorial / SEO-AEO repeater fields
  faqs: Faq[];
  quickPicks: QuickPick[];
  comparisonRows: CompareRow[];
  buyingGuide: GuideSection[];
  trends: GuideSection[];
  relatedPostSlugs: string[];
  statsOverrides: StatOverride[];
  toolRelevance: Record<string, number>;
  relevanceThreshold: number;
  lastReviewedAt: string; // yyyy-mm-dd
  focusKeyword: string;
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
  bannerImageUrl: "",
  heroEyebrow: "",
  heroTitle: "",
  heroSubtitle: "",
  introHtml: "",
  seoTitle: "",
  seoDescription: "",
  featuredToolSlugs: [],
  faqs: [],
  quickPicks: [],
  comparisonRows: [],
  buyingGuide: [],
  trends: [],
  relatedPostSlugs: [],
  statsOverrides: [],
  toolRelevance: {},
  relevanceThreshold: 0,
  lastReviewedAt: "",
  focusKeyword: "",
};

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function CategoryForm({
  initial = EMPTY,
  mode,
  action,
  allCategories,
  toolsInCategory,
  blogPosts,
}: {
  initial?: CategoryFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
  allCategories: Array<{ slug: string; name: string }>;
  /** Tools currently assigned to this category — used by the editor's-pick chooser. */
  toolsInCategory?: Array<{ id: string; name: string; slug: string }>;
  /** Published blog posts — for the related-posts selector. */
  blogPosts?: Array<{ slug: string; title: string }>;
}) {
  const [values, setValues] = useState<CategoryFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [introVersion] = useState(0);

  const tools = toolsInCategory ?? [];
  const posts = blogPosts ?? [];

  useEffect(() => {
    if (!slugTouched) setValues((v) => ({ ...v, slug: slugify(v.name) }));
  }, [values.name, slugTouched]);

  const u = <K extends keyof CategoryFormValues>(k: K, v: CategoryFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  const togglePick = (slug: string) => {
    setValues((s) => {
      const picks = new Set(s.featuredToolSlugs);
      if (picks.has(slug)) picks.delete(slug);
      else picks.add(slug);
      return { ...s, featuredToolSlugs: Array.from(picks) };
    });
  };

  const toggleRelatedPost = (slug: string) => {
    setValues((s) => {
      const set = new Set(s.relatedPostSlugs);
      if (set.has(slug)) set.delete(slug);
      else set.add(slug);
      return { ...s, relatedPostSlugs: Array.from(set) };
    });
  };

  const setRelevance = (slug: string, score: number) => {
    setValues((s) => ({ ...s, toolRelevance: { ...s.toolRelevance, [slug]: score } }));
  };

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
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28, maxWidth: 980 }}>
      <input type="hidden" name="popular" value={values.popular ? "on" : ""} />
      <input type="hidden" name="orderIndex" value={values.orderIndex} />
      <input type="hidden" name="featuredToolSlugsJson" value={JSON.stringify(values.featuredToolSlugs)} />
      <input type="hidden" name="faqsJson" value={JSON.stringify(values.faqs)} />
      <input type="hidden" name="quickPicksJson" value={JSON.stringify(values.quickPicks)} />
      <input type="hidden" name="comparisonRowsJson" value={JSON.stringify(values.comparisonRows)} />
      <input type="hidden" name="buyingGuideJson" value={JSON.stringify(values.buyingGuide)} />
      <input type="hidden" name="trendsJson" value={JSON.stringify(values.trends)} />
      <input type="hidden" name="relatedPostSlugsJson" value={JSON.stringify(values.relatedPostSlugs)} />
      <input type="hidden" name="statsOverridesJson" value={JSON.stringify(values.statsOverrides)} />
      <input type="hidden" name="toolRelevanceJson" value={JSON.stringify(values.toolRelevance)} />

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
        <Field label="Short description" hint="Used as a fallback subtitle. Keep under 200 chars.">
          <textarea name="description" rows={2} maxLength={200} value={values.description} onChange={(e) => u("description", e.target.value)} placeholder="What this category covers…" />
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

      <Section title="Public page hero">
        <Field label="Banner image">
          <BannerUpload value={values.bannerImageUrl} onChange={(v) => u("bannerImageUrl", v)} />
        </Field>
        <Field label="Eyebrow pill" hint='Tiny pill above the headline. e.g. "CATEGORY · IMAGE GENERATION"'>
          <input type="text" name="heroEyebrow" maxLength={80} value={values.heroEyebrow} onChange={(e) => u("heroEyebrow", e.target.value)} placeholder="CATEGORY · IMAGE GENERATION" />
        </Field>
        <Field label="Headline" hint="Big H1. Falls back to a generated one if blank.">
          <input type="text" name="heroTitle" maxLength={160} value={values.heroTitle} onChange={(e) => u("heroTitle", e.target.value)} placeholder="Best AI image generation tools for 2026, ranked & reviewed" />
        </Field>
        <Field label="Subhead" hint="Short paragraph under the headline.">
          <textarea name="heroSubtitle" rows={3} maxLength={400} value={values.heroSubtitle} onChange={(e) => u("heroSubtitle", e.target.value)} placeholder="Hand-picked AI image generation software for SEO, content, ad copy…" />
        </Field>
      </Section>

      <Section title="Intro prose">
        <Field label="Intro body" hint="Long-form prose shown between the hero and the tools grid. Use H2/H3, bold/italic, links, lists.">
          <RichTextEditor
            key={`intro-${introVersion}`}
            name="introHtml"
            defaultValue={values.introHtml}
            placeholder="What are AI image generation tools — and which ones are actually worth using in 2026?"
          />
        </Field>
      </Section>

      {/* ── FAQ editor — biggest AEO win. Renders FAQPage JSON-LD. ── */}
      <Section title={`FAQ (${values.faqs.length}) · AEO`}>
        <Hint>
          Category-specific question/answer pairs. Aim for 4–6 unique to this category. Each renders on the page
          <strong> and</strong> as FAQPage schema (Google answer boxes, ChatGPT/Perplexity citations).
        </Hint>
        <Repeater
          items={values.faqs}
          onChange={(faqs) => u("faqs", faqs)}
          empty={{ q: "", a: "" }}
          addLabel="+ Add FAQ"
          render={(item, set) => (
            <>
              <SubField label="Question">
                <input type="text" value={item.q} onChange={(e) => set({ ...item, q: e.target.value })} placeholder="What is the best AI ___ tool in 2026?" />
              </SubField>
              <SubField label="Answer">
                <textarea rows={3} value={item.a} onChange={(e) => set({ ...item, a: e.target.value })} placeholder="Use **bold** for tool names. Be specific and current." />
              </SubField>
            </>
          )}
        />
      </Section>

      {/* ── Quick-pick decision framework ── */}
      <Section title={`Quick picks by scenario (${values.quickPicks.length})`}>
        <Hint>
          &ldquo;If you [scenario], pick [tool] because [reason].&rdquo; This is what Google and AI assistants quote in answers.
        </Hint>
        <Repeater
          items={values.quickPicks}
          onChange={(qp) => u("quickPicks", qp)}
          empty={{ scenario: "", toolSlug: tools[0]?.slug ?? "", reason: "" }}
          addLabel="+ Add quick pick"
          render={(item, set) => (
            <>
              <SubField label="If you…">
                <input type="text" value={item.scenario} onChange={(e) => set({ ...item, scenario: e.target.value })} placeholder="need the fastest autocomplete in your IDE" />
              </SubField>
              <Row>
                <SubField label="Pick tool">
                  <ToolSelect tools={tools} value={item.toolSlug} onChange={(v) => set({ ...item, toolSlug: v })} />
                </SubField>
                <SubField label="Because">
                  <input type="text" value={item.reason} onChange={(e) => set({ ...item, reason: e.target.value })} placeholder="it has the lowest latency and best language coverage" />
                </SubField>
              </Row>
            </>
          )}
        />
      </Section>

      {/* ── Comparison overrides ── */}
      <Section title={`Comparison overrides (${values.comparisonRows.length})`}>
        <Hint>
          The comparison table auto-fills pricing/rating from each tool. Add a row here to attach an editorial
          <strong> Key feature</strong> and <strong>Best for</strong> column for specific tools.
        </Hint>
        <Repeater
          items={values.comparisonRows}
          onChange={(rows) => u("comparisonRows", rows)}
          empty={{ toolSlug: tools[0]?.slug ?? "", keyFeature: "", bestFor: "" }}
          addLabel="+ Add comparison row"
          render={(item, set) => (
            <>
              <SubField label="Tool">
                <ToolSelect tools={tools} value={item.toolSlug} onChange={(v) => set({ ...item, toolSlug: v })} />
              </SubField>
              <Row>
                <SubField label="Key feature">
                  <input type="text" value={item.keyFeature} onChange={(e) => set({ ...item, keyFeature: e.target.value })} placeholder="Multi-file context" />
                </SubField>
                <SubField label="Best for">
                  <input type="text" value={item.bestFor} onChange={(e) => set({ ...item, bestFor: e.target.value })} placeholder="Large codebases" />
                </SubField>
              </Row>
            </>
          )}
        />
      </Section>

      {/* ── Buying guide ── */}
      <Section title={`Buying guide (${values.buyingGuide.length})`}>
        <Hint>&ldquo;How to choose&rdquo; sections. Adds unique content + keyword coverage. One paragraph per line break.</Hint>
        <Repeater
          items={values.buyingGuide}
          onChange={(g) => u("buyingGuide", g)}
          empty={{ heading: "", body: "" }}
          addLabel="+ Add guide section"
          render={(item, set) => (
            <>
              <SubField label="Heading">
                <input type="text" value={item.heading} onChange={(e) => set({ ...item, heading: e.target.value })} placeholder="Match the tool to your stack" />
              </SubField>
              <SubField label="Body">
                <textarea rows={4} value={item.body} onChange={(e) => set({ ...item, body: e.target.value })} placeholder="Write 1–3 paragraphs. Separate paragraphs with a blank line." />
              </SubField>
            </>
          )}
        />
      </Section>

      {/* ── Trends / what changed this year ── */}
      <Section title={`What changed this year (${values.trends.length})`}>
        <Hint>Specific, current, dated. Freshness signal for ranking.</Hint>
        <Repeater
          items={values.trends}
          onChange={(g) => u("trends", g)}
          empty={{ heading: "", body: "" }}
          addLabel="+ Add trend section"
          render={(item, set) => (
            <>
              <SubField label="Heading">
                <input type="text" value={item.heading} onChange={(e) => set({ ...item, heading: e.target.value })} placeholder="Agentic coding went mainstream" />
              </SubField>
              <SubField label="Body">
                <textarea rows={4} value={item.body} onChange={(e) => set({ ...item, body: e.target.value })} placeholder="What specifically changed in 2026, with dates." />
              </SubField>
            </>
          )}
        />
      </Section>

      {/* ── Stats overrides ── */}
      <Section title={`Stats overrides (${values.statsOverrides.length})`}>
        <Hint>Override the auto-computed &ldquo;at a glance&rdquo; facts with something specific. Leave empty to use computed stats.</Hint>
        <Repeater
          items={values.statsOverrides}
          onChange={(s) => u("statsOverrides", s)}
          empty={{ label: "", value: "" }}
          addLabel="+ Add stat"
          render={(item, set) => (
            <Row>
              <SubField label="Label">
                <input type="text" value={item.label} onChange={(e) => set({ ...item, label: e.target.value })} placeholder="Top use case" />
              </SubField>
              <SubField label="Value">
                <input type="text" value={item.value} onChange={(e) => set({ ...item, value: e.target.value })} placeholder="Autonomous agents" />
              </SubField>
            </Row>
          )}
        />
      </Section>

      {mode === "edit" && tools.length > 0 && (
        <Section title={`Editor's picks (${values.featuredToolSlugs.length} selected)`}>
          <Hint>Pick the tools highlighted at the top of this category page. Click a chip to toggle.</Hint>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tools.map((t) => {
              const isPicked = values.featuredToolSlugs.includes(t.slug);
              return (
                <button key={t.slug} type="button" onClick={() => togglePick(t.slug)} className="adm-btn-sm"
                  style={{ padding: "6px 12px", fontSize: 12.5, background: isPicked ? "var(--blue)" : "var(--surface)", color: isPicked ? "#fff" : "var(--text)", border: `1.5px solid ${isPicked ? "var(--blue)" : "var(--border)"}`, borderRadius: 100, cursor: "pointer" }}>
                  {isPicked ? "★ " : ""}{t.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Tool relevance scoring ── */}
      {mode === "edit" && tools.length > 0 && (
        <Section title="Tool relevance (0–100)">
          <Hint>
            Score how relevant each tool is to this category. Tools scoring <strong>below the threshold</strong> are hidden
            from this page — use it to drop loosely-tagged tools. Blank = 100 (always shown).
          </Hint>
          <Field label="Relevance threshold" hint="Tools below this score are hidden. 0 = show all.">
            <input type="number" min={0} max={100} name="relevanceThreshold" value={values.relevanceThreshold}
              onChange={(e) => u("relevanceThreshold", Math.max(0, Math.min(100, parseInt(e.target.value || "0", 10))))} style={{ maxWidth: 120 }} />
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {tools.map((t) => {
              const score = values.toolRelevance[t.slug];
              const hidden = values.relevanceThreshold > 0 && (score ?? 100) < values.relevanceThreshold;
              return (
                <div key={t.slug} style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10, alignItems: "center", opacity: hidden ? 0.5 : 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {t.name}
                    {hidden && <span style={{ color: "var(--red)", fontSize: 11, marginLeft: 8 }}>hidden</span>}
                  </span>
                  <input type="number" min={0} max={100} value={score ?? ""} placeholder="100"
                    onChange={(e) => setRelevance(t.slug, Math.max(0, Math.min(100, parseInt(e.target.value || "0", 10))))} />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Related blog posts ── */}
      {posts.length > 0 && (
        <Section title={`Related blog posts (${values.relatedPostSlugs.length} selected)`}>
          <Hint>Internal links boost ranking. Pick 3–5 related posts to link from the page footer.</Hint>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {posts.map((p) => {
              const on = values.relatedPostSlugs.includes(p.slug);
              return (
                <button key={p.slug} type="button" onClick={() => toggleRelatedPost(p.slug)} className="adm-btn-sm"
                  style={{ padding: "6px 12px", fontSize: 12.5, background: on ? "var(--blue)" : "var(--surface)", color: on ? "#fff" : "var(--text)", border: `1.5px solid ${on ? "var(--blue)" : "var(--border)"}`, borderRadius: 100, cursor: "pointer", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {on ? "✓ " : ""}{p.title}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="SEO & freshness">
        <Field label="Meta title" hint="Defaults to the category name if blank. Max 60 chars.">
          <input type="text" name="seoTitle" maxLength={60} value={values.seoTitle} onChange={(e) => u("seoTitle", e.target.value)} />
        </Field>
        <Field label="Meta description" hint="Max 160 chars">
          <textarea name="seoDescription" rows={3} maxLength={160} value={values.seoDescription} onChange={(e) => u("seoDescription", e.target.value)} />
        </Field>
        <Row>
          <Field label="Last reviewed" hint="Shown in the footer. Freshness ranking signal.">
            <input type="date" name="lastReviewedAt" value={values.lastReviewedAt} onChange={(e) => u("lastReviewedAt", e.target.value)} />
          </Field>
          <Field label="Focus keyword" hint="Internal tracking only — never rendered.">
            <input type="text" name="focusKeyword" maxLength={120} value={values.focusKeyword} onChange={(e) => u("focusKeyword", e.target.value)} placeholder="best ai coding assistant" />
          </Field>
        </Row>
      </Section>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ padding: "10px 18px", fontSize: 13 }}>
          {pending ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
        </button>
        {mode === "edit" && values.slug && (
          <a href={`/ai-tools/${values.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn-sm ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
            View on site ↗
          </a>
        )}
        <Link href="/admin/categories" className="adm-btn-sm ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Cancel</Link>
      </div>

      {err && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>{err}</div>
      )}
    </form>
  );
}

/** Generic add/remove/reorder repeater for jsonb array fields. */
function Repeater<T>({
  items,
  onChange,
  empty,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  empty: T;
  addLabel: string;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
}) {
  const setAt = (i: number, next: T) => onChange(items.map((it, idx) => (idx === i ? next : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10, background: "var(--bg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-3)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <MiniBtn title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</MiniBtn>
              <MiniBtn title="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</MiniBtn>
              <MiniBtn title="Remove" danger onClick={() => removeAt(i)}>✕</MiniBtn>
            </div>
          </div>
          {render(item, (next) => setAt(i, next))}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, structuredClone(empty)])} className="adm-btn-sm ghost" style={{ padding: "7px 14px", fontSize: 12.5 }}>
        {addLabel}
      </button>
    </div>
  );
}

function ToolSelect({ tools, value, onChange }: { tools: Array<{ slug: string; name: string }>; value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {tools.length === 0 && <option value="">— no tools in this category —</option>}
      {tools.map((t) => (
        <option key={t.slug} value={t.slug}>{t.name}</option>
      ))}
    </select>
  );
}

function MiniBtn({ children, onClick, disabled, danger, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean; title: string }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--white)", color: danger ? "var(--red)" : "var(--text-2)", fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

function BannerUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
      if (!res.ok) throw new Error(json.error ?? `Upload failed (HTTP ${res.status})`);
      onChange(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ width: "100%", aspectRatio: "1600 / 500", borderRadius: 10, border: "1.5px dashed var(--border)", background: "var(--bg)", overflow: "hidden", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: "var(--text-3)", fontSize: 13 }}>No banner uploaded</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <label className="adm-btn-sm primary" style={{ cursor: "pointer", padding: "8px 14px" }}>
          {uploading ? "Uploading…" : value ? "Replace banner" : "Upload banner"}
          <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="adm-btn-sm ghost" style={{ padding: "8px 14px", color: "var(--red)" }}>Remove</button>
        )}
      </div>
      <input type="url" name="bannerImageUrl" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a URL: https://example.com/banner.jpg"
        style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "var(--white)", outline: "none" }} />
      {err && <div style={{ marginTop: 6, color: "var(--red)", fontSize: 12, fontWeight: 600 }}>{err}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
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
function SubField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-2)", marginBottom: 4 }}>{label}</label>
      <div className="adm-input-wrap">{children}</div>
    </div>
  );
}
function Hint({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, lineHeight: 1.5 }}>{children}</div>;
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

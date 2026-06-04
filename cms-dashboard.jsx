/**
 * ─────────────────────────────────────────────────────────────
 *  AI Tools Set — CMS Dashboard prototype (single-file React)
 * ─────────────────────────────────────────────────────────────
 *
 *  Standalone, no external state. Drop into any React 18+ host:
 *
 *    import CmsDashboard from "./cms-dashboard.jsx";
 *    export default function Page() { return <CmsDashboard />; }
 *
 *  Or mount as a Next.js page:
 *
 *    // app/cms-preview/page.tsx
 *    "use client";
 *    import CmsDashboard from "@/cms-dashboard.jsx";
 *    export default CmsDashboard;
 *
 *  Inline styles only. Loads Manrope + DM Sans from Google Fonts
 *  on mount. All design tokens match the public site
 *  (--blue: #0052ff, --r-lg: 20px, etc.).
 *
 *  Uses document.execCommand in the blog editor — yes, deprecated,
 *  yes, still works in every browser, yes, that's the request.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

// ── Design tokens ──────────────────────────────────────────
const T = {
  blue: "#0052ff",
  blueH: "#578bfa",
  blueSoft: "rgba(0,82,255,.08)",
  white: "#fff",
  bg: "#f8f9fa",
  surface: "#eef0f3",
  cream: "#FBF8F1",
  mint: "#F1F7F3",
  lavender: "#F4F2FA",
  sand: "#F6F2EC",
  nearBlack: "#0F172A",
  darkCard: "#1E293B",
  text: "#0a0b0d",
  text2: "#5b616e",
  text3: "#9aa0ae",
  border: "rgba(91,97,110,.18)",
  border2: "rgba(91,97,110,.28)",
  green: "#16a34a",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  red: "#ef4444",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
  orange: "#ea580c",
  orangeBg: "#fff7ed",
  orangeBorder: "#fed7aa",
  yellow: "#fbbf24",
  rSm: 6,
  r: 12,
  rLg: 20,
  rPill: 100,
  shadow: "0 4px 16px rgba(0,0,0,.08)",
  shadowLg: "0 12px 40px rgba(0,0,0,.12)",
  font: '"Manrope", system-ui, sans-serif',
  fontBody: '"DM Sans", system-ui, sans-serif',
};

// ── Seed data ──────────────────────────────────────────────
const seed = {
  tools: [
    { id: "t1", name: "ChatGPT", tagline: "The world's leading AI for writing, coding, brainstorming.", logo: "https://www.google.com/s2/favicons?domain=chat.openai.com&sz=128", website: "https://chat.openai.com", categories: ["chat", "writing"], tags: ["GPT-5", "Free tier"], pricing: "freemium", description: "<p>The world's most used AI for writing, coding, brainstorming, and creative tasks. Trusted by millions globally.</p>", featured: true, verified: true, saves: 6338, updatedAt: "2026-06-01" },
    { id: "t2", name: "Midjourney", tagline: "Transform text into breathtaking imagery.", logo: "https://www.google.com/s2/favicons?domain=midjourney.com&sz=128", website: "https://midjourney.com", categories: ["image"], tags: ["Diffusion", "Pro plan"], pricing: "paid", description: "<p>Transform text descriptions into breathtaking imagery. The gold standard for AI art generation.</p>", featured: true, verified: true, saves: 3887, updatedAt: "2026-05-30" },
    { id: "t3", name: "Claude", tagline: "Thoughtful AI for nuanced reasoning.", logo: "https://www.google.com/s2/favicons?domain=claude.ai&sz=128", website: "https://claude.ai", categories: ["chat", "writing"], tags: ["Claude 4", "Free tier"], pricing: "freemium", description: "<p>Anthropic's thoughtful AI for nuanced reasoning, long-context analysis, and safe, helpful responses.</p>", featured: true, verified: true, saves: 2807, updatedAt: "2026-05-28" },
    { id: "t4", name: "Cursor", tagline: "The AI-first IDE.", logo: "https://www.google.com/s2/favicons?domain=cursor.sh&sz=128", website: "https://cursor.sh", categories: ["code"], tags: ["IDE", "Pro"], pricing: "freemium", description: "<p>The AI-first IDE. Write, debug, and refactor code with an AI that understands your entire codebase.</p>", featured: true, verified: true, saves: 1289, updatedAt: "2026-05-26" },
    { id: "t5", name: "Suno", tagline: "Make full songs from a prompt.", logo: "https://www.google.com/s2/favicons?domain=suno.ai&sz=128", website: "https://suno.ai", categories: ["audio"], tags: ["Music"], pricing: "freemium", description: "<p>Create full-length, radio-quality songs from a text prompt. Lyrics, melody, and mastering — all AI.</p>", featured: false, verified: true, saves: 698, updatedAt: "2026-05-22" },
    { id: "t6", name: "Runway", tagline: "Pro-grade AI video editing.", logo: "https://www.google.com/s2/favicons?domain=runwayml.com&sz=128", website: "https://runwayml.com", categories: ["video"], tags: ["Editing", "Generation"], pricing: "paid", description: "<p>Professional-grade AI video generation, editing, and visual effects for filmmakers and creators.</p>", featured: false, verified: false, saves: 741, updatedAt: "2026-05-18" },
    { id: "t7", name: "ElevenLabs", tagline: "Ultra-realistic voice cloning.", logo: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128", website: "https://elevenlabs.io", categories: ["audio"], tags: ["Voice", "TTS"], pricing: "freemium", description: "<p>Ultra-realistic AI voice cloning and text-to-speech in 32 languages.</p>", featured: false, verified: true, saves: 612, updatedAt: "2026-05-15" },
    { id: "t8", name: "v0 by Vercel", tagline: "AI-generated UI components.", logo: "https://www.google.com/s2/favicons?domain=v0.dev&sz=128", website: "https://v0.dev", categories: ["code", "design"], tags: ["UI", "React"], pricing: "freemium", description: "<p>Generate production-ready React + Tailwind UI components from natural language descriptions.</p>", featured: false, verified: false, saves: 589, updatedAt: "2026-05-12" },
  ],
  deals: [
    { id: "d1", toolId: "t2", pct: 20, code: "MJ20", type: "percent", description: "20% off the Annual Pro plan from Midjourney.", expires: "2026-08-15", active: true, updatedAt: "2026-05-25" },
    { id: "d2", toolId: "t4", pct: 50, code: "CURSORSET50", type: "percent", description: "Cursor Pro at 50% off for your first 3 months.", expires: "2026-09-30", active: true, updatedAt: "2026-05-20" },
    { id: "d3", toolId: "t5", pct: 100, code: "SUNO3FREE", type: "trial", description: "3 months of Suno Pro free for new accounts.", expires: "2026-07-15", active: true, updatedAt: "2026-05-12" },
    { id: "d4", toolId: "t7", pct: 30, code: "VOICE30", type: "percent", description: "30% off any annual ElevenLabs plan.", expires: "2026-04-01", active: false, updatedAt: "2026-03-29" },
  ],
  posts: [
    { id: "p1", title: "GPT-5 complete guide: everything you need to know", slug: "gpt-5-complete-guide", excerpt: "Everything you need to know about OpenAI's most powerful model — context, reasoning, real-time web access.", cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800", category: "Guide", tags: ["GPT-5", "OpenAI"], author: "Alex Johnson", body: "<h2>What's new in GPT-5</h2><p>The headline feature is the dramatic context expansion to 1M tokens. In practice, this means you can paste your full codebase, an entire research paper collection, or hours of meeting transcripts.</p><h3>Native real-time web access</h3><p>GPT-5 can run continuous searches, follow citations, cross-reference sources.</p><blockquote>The MATH improvement is the most surprising. GPT-4o frequently slipped up on multi-step problems.</blockquote>", status: "published", publishedAt: "2026-05-26", scheduledFor: null, updatedAt: "2026-05-26" },
    { id: "p2", title: "ChatGPT vs Claude 4 in 2026: which AI wins?", slug: "chatgpt-vs-claude-4-2026", excerpt: "We tested both for 30 days across 12 different tasks. Here's the honest verdict.", cover: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800", category: "Comparison", tags: ["ChatGPT", "Claude 4"], author: "Sarah Park", body: "<p>After thirty days of intensive use, here's how the two giants stack up across writing, code, reasoning, and conversation.</p>", status: "published", publishedAt: "2026-05-01", scheduledFor: null, updatedAt: "2026-05-01" },
    { id: "p3", title: "The 7 best free AI tools for marketers in 2026", slug: "best-free-ai-marketing-tools-2026", excerpt: "Stop paying $99/month for tools you can replace with free alternatives that perform 90% as well.", cover: "", category: "Roundup", tags: ["Marketing", "Free"], author: "Priya Nair", body: "<p>Draft content.</p>", status: "draft", publishedAt: null, scheduledFor: null, updatedAt: "2026-05-30" },
  ],
  categories: [
    { id: "c1", name: "AI Chat", slug: "chat", icon: "💬", color: "#0052ff", description: "Conversational AI assistants for writing, brainstorming, and answers.", parent: null },
    { id: "c2", name: "Writing & Editing", slug: "writing", icon: "✍️", color: "#7c3aed", description: "Generate, edit, and polish text — blog posts, marketing copy, fiction.", parent: null },
    { id: "c3", name: "Image Generation", slug: "image", icon: "🎨", color: "#ec4899", description: "Create images, illustrations, and art from text prompts.", parent: null },
    { id: "c4", name: "Code & Developer", slug: "code", icon: "💻", color: "#059669", description: "AI pair programmers, code reviewers, and full-stack generators.", parent: null },
    { id: "c5", name: "Marketing", slug: "marketing", icon: "📈", color: "#ea580c", description: "AI tools for SEO, ad copy, email automation, and analytics.", parent: "c2" },
  ],
  glossary: [
    { id: "g1", term: "RAG", slug: "rag", category: "core", definition: "<p><strong>Retrieval-Augmented Generation</strong> — a technique that lets the AI look up information from a database before answering, instead of relying only on training.</p>", related: ["Embeddings", "Vector database"] },
    { id: "g2", term: "LLM", slug: "llm", category: "models", definition: "<p>A <strong>Large Language Model</strong> — neural network trained on massive amounts of text to predict the next word.</p>", related: ["Transformer", "GPT", "Parameters"] },
    { id: "g3", term: "Embeddings", slug: "embeddings", category: "core", definition: "<p>A way of representing text as a list of numbers that captures meaning. Two pieces of text with similar meaning will have similar embeddings.</p>", related: ["RAG", "Vector database"] },
    { id: "g4", term: "Fine-tuning", slug: "fine-tuning", category: "training", definition: "<p>Taking a pre-trained model and training it further on your own data so it learns your style or domain better.</p>", related: ["LoRA", "Pre-training", "RLHF"] },
    { id: "g5", term: "Agentic AI", slug: "agentic-ai", category: "agents", definition: "<p>AI systems that can <strong>plan, execute, and self-correct</strong> over multi-step tasks autonomously.</p>", related: ["MCP", "Tool use"] },
  ],
};

const PRICING_OPTIONS = [
  { value: "free", label: "Free", color: T.green, bg: T.greenBg, border: T.greenBorder },
  { value: "freemium", label: "Freemium", color: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe" },
  { value: "paid", label: "Paid", color: "#a16207", bg: "#fef3c7", border: "#fde68a" },
];

const POST_STATUS = [
  { value: "draft", label: "Draft", color: T.text3, bg: T.surface, border: T.border },
  { value: "scheduled", label: "Scheduled", color: T.orange, bg: T.orangeBg, border: T.orangeBorder },
  { value: "published", label: "Published", color: T.green, bg: T.greenBg, border: T.greenBorder },
];

const DEAL_TYPES = [
  { value: "percent", label: "% off" },
  { value: "flat", label: "Flat amount" },
  { value: "trial", label: "Free trial" },
];

const GLOSSARY_CATS = ["core", "models", "training", "agents"];

// ── Helpers ────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
const todayISO = () => new Date().toISOString().slice(0, 10);
const stripHtml = (html) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const readingMin = (html) => Math.max(1, Math.round(stripHtml(html).split(" ").length / 220));
const isExpired = (iso) => iso && new Date(iso) < new Date();

// ── UI primitives ──────────────────────────────────────────
const Btn = ({ children, variant = "primary", size = "md", icon, onClick, type = "button", disabled, style = {} }) => {
  const base = {
    fontFamily: T.font,
    fontWeight: 700,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: T.rPill,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    transition: "background .15s, color .15s, border-color .15s, transform .12s",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const sizes = {
    sm: { fontSize: 12, padding: "6px 12px" },
    md: { fontSize: 13, padding: "8px 16px" },
    lg: { fontSize: 14, padding: "11px 22px" },
  };
  const variants = {
    primary: { background: T.blue, color: "#fff" },
    secondary: { background: T.surface, color: T.text, border: `1.5px solid ${T.border}` },
    ghost: { background: "transparent", color: T.text2 },
    danger: { background: T.red, color: "#fff" },
    outline: { background: "transparent", color: T.text, border: `1.5px solid ${T.border}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onMouseOver={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = T.blueH;
        if (variant === "secondary") e.currentTarget.style.background = "#dde0e5";
        if (variant === "ghost") e.currentTarget.style.background = T.surface;
        if (variant === "danger") e.currentTarget.style.background = "#dc2626";
        if (variant === "outline") e.currentTarget.style.borderColor = T.blue;
      }}
      onMouseOut={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = T.blue;
        if (variant === "secondary") e.currentTarget.style.background = T.surface;
        if (variant === "ghost") e.currentTarget.style.background = "transparent";
        if (variant === "danger") e.currentTarget.style.background = T.red;
        if (variant === "outline") e.currentTarget.style.borderColor = T.border;
      }}
    >
      {icon}
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = "text", error, style = {}, ...rest }) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%",
      height: 40,
      padding: "0 14px",
      fontFamily: T.fontBody,
      fontSize: 14,
      color: T.text,
      background: T.white,
      border: `1.5px solid ${error ? T.red : T.border}`,
      borderRadius: T.r,
      outline: "none",
      transition: "border-color .12s, box-shadow .12s",
      ...style,
    }}
    onFocus={(e) => {
      if (!error) {
        e.currentTarget.style.borderColor = T.blue;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${T.blueSoft}`;
      }
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = error ? T.red : T.border;
      e.currentTarget.style.boxShadow = "none";
    }}
    {...rest}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 4, error }) => (
  <textarea
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: "100%",
      padding: "10px 14px",
      fontFamily: T.fontBody,
      fontSize: 14,
      color: T.text,
      background: T.white,
      border: `1.5px solid ${error ? T.red : T.border}`,
      borderRadius: T.r,
      outline: "none",
      resize: "vertical",
      lineHeight: 1.5,
    }}
  />
);

const Select = ({ value, onChange, options, error }) => (
  <select
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      height: 40,
      padding: "0 14px",
      fontFamily: T.fontBody,
      fontSize: 14,
      color: T.text,
      background: T.white,
      border: `1.5px solid ${error ? T.red : T.border}`,
      borderRadius: T.r,
      outline: "none",
      cursor: "pointer",
    }}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const Label = ({ children, required }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontFamily: T.font,
      fontSize: 12.5,
      fontWeight: 700,
      color: T.text,
      marginBottom: 6,
    }}
  >
    {children}
    {required && <span style={{ color: T.red, fontSize: 11 }}>*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? <div style={{ fontSize: 12, color: T.red, marginTop: 4, fontWeight: 500 }}>{msg}</div> : null;

const Pill = ({ children, color, bg, border, size = "md" }) => (
  <span
    style={{
      fontFamily: T.font,
      fontSize: size === "sm" ? 10.5 : 11,
      fontWeight: 800,
      padding: size === "sm" ? "2px 7px" : "3px 9px",
      borderRadius: T.rPill,
      color,
      background: bg ?? "transparent",
      border: border ? `1px solid ${border}` : "none",
      textTransform: "uppercase",
      letterSpacing: ".04em",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const Card = ({ children, padding = 24, style = {} }) => (
  <div
    style={{
      background: T.white,
      borderRadius: T.rLg,
      border: `1px solid ${T.border}`,
      padding,
      ...style,
    }}
  >
    {children}
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <label
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      fontFamily: T.fontBody,
      fontSize: 13.5,
      color: T.text,
    }}
  >
    <span
      style={{
        position: "relative",
        width: 38,
        height: 22,
        background: value ? T.blue : T.surface,
        borderRadius: T.rPill,
        transition: "background .15s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 18 : 2,
          width: 18,
          height: 18,
          background: "#fff",
          borderRadius: "50%",
          transition: "left .15s",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </span>
    <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ display: "none" }} />
    {label}
  </label>
);

const Toast = ({ message, kind = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [onClose]);
  const colours = {
    success: { bg: T.green, fg: "#fff" },
    error: { bg: T.red, fg: "#fff" },
    info: { bg: T.nearBlack, fg: "#fff" },
  };
  const c = colours[kind];
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: c.bg,
        color: c.fg,
        fontFamily: T.font,
        fontWeight: 700,
        fontSize: 13.5,
        padding: "10px 20px",
        borderRadius: T.rPill,
        boxShadow: T.shadowLg,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 15 }}>{kind === "success" ? "✓" : kind === "error" ? "✕" : "•"}</span>
      {message}
    </div>
  );
};

const Modal = ({ title, children, onClose, width = 720, footer }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,.55)",
      zIndex: 9000,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "5vh 24px",
      overflowY: "auto",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: T.white,
        borderRadius: T.rLg,
        width: "100%",
        maxWidth: width,
        boxShadow: T.shadowLg,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 28px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0, fontFamily: T.font, fontSize: 18, fontWeight: 900, letterSpacing: "-.4px", color: T.text }}>
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: T.text2,
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div style={{ padding: 28 }}>{children}</div>
      {footer && <div style={{ padding: "16px 28px", borderTop: `1px solid ${T.border}`, background: T.bg, display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
    </div>
  </div>
);

const Confirm = ({ title, body, onConfirm, onCancel, confirmLabel = "Delete" }) => (
  <Modal
    title={title}
    onClose={onCancel}
    width={440}
    footer={
      <>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm}>{confirmLabel}</Btn>
      </>
    }
  >
    <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: 14.5, lineHeight: 1.6, color: T.text2 }}>{body}</p>
  </Modal>
);

// ── Rich text editor (contentEditable + execCommand) ──────
const RichEditor = ({ value, onChange, height = 320, placeholder = "Start writing…" }) => {
  const ref = useRef(null);
  const lastValueRef = useRef(value);
  const [, force] = useState(0);

  // Sync external value → DOM only when it changes from outside
  useEffect(() => {
    if (ref.current && value !== lastValueRef.current) {
      ref.current.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  const exec = (cmd, arg) => {
    document.execCommand(cmd, false, arg);
    ref.current?.focus();
    handleInput();
    force((x) => x + 1);
  };

  const handleInput = () => {
    if (ref.current) {
      const html = ref.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
    }
  };

  const promptLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const promptImage = () => {
    const url = window.prompt("Image URL:");
    if (url) exec("insertImage", url);
  };

  const ToolBtn = ({ cmd, label, arg, title, onClickCustom }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => (onClickCustom ? onClickCustom() : exec(cmd, arg))}
      style={{
        width: 32,
        height: 32,
        border: "none",
        background: "transparent",
        color: T.text,
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: T.font,
        fontSize: 13,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = T.surface)}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: T.r, background: T.white, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: 6,
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
          flexWrap: "wrap",
        }}
      >
        <ToolBtn cmd="formatBlock" arg="<h1>" label="H1" title="Heading 1" />
        <ToolBtn cmd="formatBlock" arg="<h2>" label="H2" title="Heading 2" />
        <ToolBtn cmd="formatBlock" arg="<h3>" label="H3" title="Heading 3" />
        <ToolBtn cmd="formatBlock" arg="<p>" label="¶" title="Paragraph" />
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        <ToolBtn cmd="bold" label={<b>B</b>} title="Bold (Ctrl+B)" />
        <ToolBtn cmd="italic" label={<i>I</i>} title="Italic (Ctrl+I)" />
        <ToolBtn cmd="underline" label={<u>U</u>} title="Underline" />
        <ToolBtn cmd="strikeThrough" label={<s>S</s>} title="Strikethrough" />
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        <ToolBtn cmd="formatBlock" arg="<blockquote>" label="”" title="Blockquote" />
        <ToolBtn cmd="formatBlock" arg="<pre>" label="</>" title="Code block" />
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        <ToolBtn cmd="insertUnorderedList" label="•≡" title="Bulleted list" />
        <ToolBtn cmd="insertOrderedList" label="1≡" title="Numbered list" />
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        <ToolBtn cmd="" label="🔗" title="Insert link" onClickCustom={promptLink} />
        <ToolBtn cmd="" label="🖼" title="Insert image" onClickCustom={promptImage} />
        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
        <ToolBtn cmd="removeFormat" label="✕" title="Clear formatting" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: height,
          padding: 18,
          fontFamily: T.fontBody,
          fontSize: 15,
          lineHeight: 1.7,
          color: T.text,
          outline: "none",
        }}
      />
      <style>{`
        [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: ${T.text3};
        }
        [contenteditable] h1 { font-family: ${T.font}; font-size: 26px; font-weight: 900; letter-spacing: -.8px; margin: 18px 0 10px; }
        [contenteditable] h2 { font-family: ${T.font}; font-size: 22px; font-weight: 900; letter-spacing: -.6px; margin: 16px 0 8px; }
        [contenteditable] h3 { font-family: ${T.font}; font-size: 18px; font-weight: 800; letter-spacing: -.4px; margin: 14px 0 6px; }
        [contenteditable] p { margin: 0 0 12px; }
        [contenteditable] blockquote {
          border-left: 3px solid ${T.blue};
          background: ${T.cream};
          padding: 12px 18px;
          margin: 14px 0;
          border-radius: 0 ${T.r}px ${T.r}px 0;
          font-style: italic;
        }
        [contenteditable] pre {
          background: ${T.surface};
          padding: 12px 16px;
          border-radius: 8px;
          font-family: 'JetBrains Mono', Menlo, monospace;
          font-size: 13.5px;
          overflow-x: auto;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 0 0 12px; }
        [contenteditable] li { margin-bottom: 4px; }
        [contenteditable] a { color: ${T.blue}; text-decoration: underline; }
        [contenteditable] img { max-width: 100%; border-radius: ${T.r}px; margin: 10px 0; }
      `}</style>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "tools", label: "Tools", icon: "🛠️" },
  { key: "deals", label: "Deals", icon: "🏷️" },
  { key: "posts", label: "Blog Posts", icon: "📝" },
  { key: "categories", label: "Categories", icon: "📂" },
  { key: "glossary", label: "Glossary", icon: "📖" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

const Sidebar = ({ view, setView, collapsed, mobileOpen, onMobileClose }) => {
  const desktopWidth = collapsed ? 72 : 240;
  return (
    <>
      {/* Backdrop on mobile */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.5)",
            zIndex: 70,
            display: "none",
          }}
          className="cms-mobile-backdrop"
        />
      )}
      <aside
        style={{
          width: desktopWidth,
          background: T.nearBlack,
          color: "#fff",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          transition: "width .2s",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 80,
        }}
        className={`cms-sidebar ${mobileOpen ? "is-open" : ""}`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "16px 12px" : "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            height: 60,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: T.blue,
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity=".5" />
              <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity=".5" />
              <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 14, letterSpacing: "-.3px" }}>
              AI Tools Set
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>CMS Admin</div>
            </div>
          )}
        </div>
        <nav style={{ flex: 1, padding: 8, overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setView(item.key);
                  onMobileClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: collapsed ? "10px 8px" : "10px 14px",
                  background: active ? "rgba(0,82,255,.18)" : "transparent",
                  color: active ? T.blueH : "rgba(255,255,255,.7)",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: T.font,
                  fontSize: 13.5,
                  fontWeight: active ? 800 : 600,
                  textAlign: "left",
                  marginBottom: 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "background .12s, color .12s",
                }}
                onMouseOver={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,.05)";
                }}
                onMouseOut={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>
        <div
          style={{
            padding: collapsed ? "12px 8px" : "16px 20px",
            borderTop: "1px solid rgba(255,255,255,.07)",
            fontSize: 11.5,
            color: "rgba(255,255,255,.35)",
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {collapsed ? "v1" : "Prototype v1.0 · Single file"}
        </div>
      </aside>
    </>
  );
};

// ── Top bar ────────────────────────────────────────────────
const TopBar = ({ title, subtitle, onMenuClick, onToggleCollapse, action }) => (
  <header
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 28px",
      background: T.white,
      borderBottom: `1px solid ${T.border}`,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}
  >
    <button
      onClick={onMenuClick}
      className="cms-mobile-only"
      style={{
        background: T.surface,
        border: "none",
        width: 36,
        height: 36,
        borderRadius: 8,
        cursor: "pointer",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
      }}
    >
      ☰
    </button>
    <button
      onClick={onToggleCollapse}
      className="cms-desktop-only"
      style={{
        background: T.surface,
        border: "none",
        width: 32,
        height: 32,
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        color: T.text2,
      }}
      title="Collapse sidebar"
    >
      ⋮⋮
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h1 style={{ margin: 0, fontFamily: T.font, fontSize: 20, fontWeight: 900, letterSpacing: "-.6px", color: T.text }}>
        {title}
      </h1>
      {subtitle && (
        <div style={{ fontSize: 12.5, color: T.text3, marginTop: 2, fontFamily: T.fontBody }}>{subtitle}</div>
      )}
    </div>
    {action}
  </header>
);

// ── Search bar ─────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder, right }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.text3, fontSize: 14, pointerEvents: "none" }}>
        🔍
      </span>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? "Search…"}
        style={{ paddingLeft: 36 }}
      />
    </div>
    {right}
  </div>
);

// ── Empty state ────────────────────────────────────────────
const Empty = ({ emoji, title, body, action }) => (
  <div style={{ padding: 56, textAlign: "center" }}>
    <div style={{ fontSize: 44, marginBottom: 10 }}>{emoji}</div>
    <div style={{ fontFamily: T.font, fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 6 }}>{title}</div>
    <div style={{ fontFamily: T.fontBody, fontSize: 13.5, color: T.text2, marginBottom: 18 }}>{body}</div>
    {action}
  </div>
);

// ── Tag input ──────────────────────────────────────────────
const TagInput = ({ value = [], onChange, placeholder = "Add tag, then Enter" }) => {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
  };
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 8,
        background: T.white,
        border: `1.5px solid ${T.border}`,
        borderRadius: T.r,
      }}
    >
      {value.map((t) => (
        <span
          key={t}
          style={{
            background: T.blueSoft,
            color: T.blue,
            fontFamily: T.font,
            fontSize: 12,
            fontWeight: 700,
            padding: "4px 4px 4px 10px",
            borderRadius: T.rPill,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {t}
          <button
            onClick={() => onChange(value.filter((x) => x !== t))}
            style={{ background: "rgba(0,82,255,.2)", color: T.blue, border: "none", width: 18, height: 18, borderRadius: "50%", cursor: "pointer", fontSize: 11 }}
            aria-label={`Remove ${t}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
          if (e.key === "Backspace" && !text && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length ? "" : placeholder}
        style={{
          flex: 1,
          minWidth: 120,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: T.fontBody,
          fontSize: 13.5,
          padding: "4px 8px",
        }}
      />
    </div>
  );
};

// ── Multi-checkbox (for category multi-select) ────────────
const MultiCheck = ({ value = [], onChange, options }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
    {options.map((o) => {
      const on = value.includes(o.value);
      return (
        <label
          key={o.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 8,
            border: `1.5px solid ${on ? T.blue : T.border}`,
            background: on ? T.blueSoft : T.white,
            cursor: "pointer",
            fontFamily: T.fontBody,
            fontSize: 13,
            fontWeight: on ? 700 : 500,
            color: on ? T.blue : T.text,
          }}
        >
          <input
            type="checkbox"
            checked={on}
            onChange={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            style={{ accentColor: T.blue }}
          />
          {o.label}
        </label>
      );
    })}
  </div>
);

// ────────────────────────────────────────────────────────────
// ── VIEWS ──────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────

// ── Dashboard ──────────────────────────────────────────────
const StatCard = ({ label, value, delta, icon, color }) => (
  <Card padding={20}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div
        style={{
          width: 36,
          height: 36,
          background: color + "1a",
          color,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text2 }}>{label}</div>
    </div>
    <div style={{ fontFamily: T.font, fontSize: 32, fontWeight: 900, letterSpacing: "-1px", color: T.text, lineHeight: 1 }}>
      {value}
    </div>
    {delta && (
      <div style={{ fontSize: 12, color: T.green, marginTop: 8, fontWeight: 700 }}>
        ↑ {delta} this week
      </div>
    )}
  </Card>
);

const DashboardView = ({ data, setView, openTool, openDeal, openPost }) => {
  const recent = useMemo(() => {
    const mix = [
      ...data.tools.map((t) => ({ type: "tool", item: t, ts: t.updatedAt })),
      ...data.deals.map((d) => ({ type: "deal", item: d, ts: d.updatedAt })),
      ...data.posts.map((p) => ({ type: "post", item: p, ts: p.updatedAt })),
    ];
    return mix.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6);
  }, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard label="Tools" value={data.tools.length} delta="3" icon="🛠️" color="#0052ff" />
        <StatCard label="Active deals" value={data.deals.filter((d) => d.active && !isExpired(d.expires)).length} delta="1" icon="🏷️" color="#ea580c" />
        <StatCard label="Blog posts" value={data.posts.length} delta="1" icon="📝" color="#7c3aed" />
        <StatCard label="Categories" value={data.categories.length} icon="📂" color="#059669" />
        <StatCard label="Glossary terms" value={data.glossary.length} icon="📖" color="#0891b2" />
      </div>

      <Card padding={0}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontFamily: T.font, fontSize: 17, fontWeight: 900, letterSpacing: "-.4px" }}>
              Recent activity
            </h2>
            <div style={{ fontSize: 12.5, color: T.text3, marginTop: 2 }}>Latest edits across every collection</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn size="sm" onClick={() => { setView("tools"); openTool(); }} icon="＋">Add tool</Btn>
            <Btn size="sm" variant="secondary" onClick={() => { setView("posts"); openPost(); }} icon="✎">Write post</Btn>
            <Btn size="sm" variant="secondary" onClick={() => { setView("deals"); openDeal(); }} icon="＋">Add deal</Btn>
          </div>
        </div>
        <div>
          {recent.map((r, i) => {
            const meta = {
              tool: { emoji: "🛠️", label: "Tool", text: r.item.name },
              deal: { emoji: "🏷️", label: "Deal", text: `${r.item.pct}% off code: ${r.item.code || "—"}` },
              post: { emoji: "📝", label: "Post", text: r.item.title },
            }[r.type];
            return (
              <div
                key={`${r.type}-${r.item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 24px",
                  borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: T.surface,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  {meta.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 700, color: T.text }}>
                    {meta.text}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.text3, marginTop: 2 }}>
                    {meta.label} · updated {r.ts}
                  </div>
                </div>
                <Pill color={T.blue} bg={T.blueSoft} border="rgba(0,82,255,.15)">
                  {meta.label}
                </Pill>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ── Tools Manager ─────────────────────────────────────────
const ToolForm = ({ initial, categories, onSubmit, onCancel }) => {
  const [data, setData] = useState(
    initial ?? {
      name: "",
      tagline: "",
      logo: "",
      website: "",
      categories: [],
      tags: [],
      pricing: "freemium",
      description: "",
      featured: false,
      verified: false,
      saves: 0,
    }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Name is required";
    if (!data.tagline.trim()) e.tagline = "Tagline is required";
    if (data.tagline.length > 140) e.tagline = "Max 140 characters";
    if (data.website && !/^https?:\/\//i.test(data.website)) e.website = "Must start with http(s)://";
    if (data.categories.length === 0) e.categories = "Pick at least one category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({ ...data, updatedAt: todayISO(), id: data.id ?? uid() });
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Label required>Tool name</Label>
          <Input value={data.name} onChange={(v) => setData({ ...data, name: v })} placeholder="ChatGPT" error={errors.name} />
          <FieldError msg={errors.name} />
        </div>
        <div>
          <Label>Logo URL</Label>
          <Input value={data.logo} onChange={(v) => setData({ ...data, logo: v })} placeholder="https://…/logo.png" />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Label required>Tagline <span style={{ color: T.text3, fontWeight: 500, marginLeft: 6 }}>{data.tagline.length}/140</span></Label>
        <Input value={data.tagline} onChange={(v) => setData({ ...data, tagline: v })} placeholder="One-sentence pitch" error={errors.tagline} />
        <FieldError msg={errors.tagline} />
      </div>
      <div style={{ marginTop: 14 }}>
        <Label>Website URL</Label>
        <Input value={data.website} onChange={(v) => setData({ ...data, website: v })} placeholder="https://example.com" error={errors.website} />
        <FieldError msg={errors.website} />
      </div>
      <div style={{ marginTop: 14 }}>
        <Label required>Categories</Label>
        <MultiCheck
          value={data.categories}
          onChange={(v) => setData({ ...data, categories: v })}
          options={categories.map((c) => ({ value: c.slug, label: `${c.icon} ${c.name}` }))}
        />
        <FieldError msg={errors.categories} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
        <div>
          <Label>Tags</Label>
          <TagInput value={data.tags} onChange={(v) => setData({ ...data, tags: v })} />
        </div>
        <div>
          <Label>Pricing model</Label>
          <Select value={data.pricing} onChange={(v) => setData({ ...data, pricing: v })} options={PRICING_OPTIONS.map((p) => ({ value: p.value, label: p.label }))} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Label>Description</Label>
        <RichEditor value={data.description} onChange={(v) => setData({ ...data, description: v })} height={180} />
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 18, flexWrap: "wrap" }}>
        <Toggle value={data.featured} onChange={(v) => setData({ ...data, featured: v })} label="Featured on homepage" />
        <Toggle value={data.verified} onChange={(v) => setData({ ...data, verified: v })} label="Verified by editorial team" />
        <div>
          <Label>Saves count</Label>
          <Input type="number" value={data.saves} onChange={(v) => setData({ ...data, saves: Number(v) || 0 })} style={{ width: 120, height: 36 }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={submit}>{initial ? "Save changes" : "Create tool"}</Btn>
      </div>
    </>
  );
};

const ToolsView = ({ data, setData, openToast, openEditorRef }) => {
  const [search, setSearch] = useState("");
  const [pricingFilter, setPricingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Expose openEditor to parent
  useEffect(() => {
    if (openEditorRef) openEditorRef.current = () => setEditing({});
  }, [openEditorRef]);

  const filtered = data.tools.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (pricingFilter !== "all" && t.pricing !== pricingFilter) return false;
    if (categoryFilter !== "all" && !t.categories.includes(categoryFilter)) return false;
    return true;
  });

  const save = (tool) => {
    const exists = data.tools.find((t) => t.id === tool.id);
    if (exists) {
      setData((d) => ({ ...d, tools: d.tools.map((t) => (t.id === tool.id ? tool : t)) }));
      openToast(`"${tool.name}" updated`, "success");
    } else {
      setData((d) => ({ ...d, tools: [tool, ...d.tools] }));
      openToast(`"${tool.name}" created`, "success");
    }
    setEditing(null);
  };

  const remove = (tool) => {
    setData((d) => ({ ...d, tools: d.tools.filter((t) => t.id !== tool.id) }));
    openToast(`"${tool.name}" deleted`, "error");
    setConfirmDelete(null);
  };

  return (
    <Card padding={0}>
      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tools…"
          right={
            <>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: "all", label: "All categories" }, ...data.categories.map((c) => ({ value: c.slug, label: c.name }))]}
              />
              <Select
                value={pricingFilter}
                onChange={setPricingFilter}
                options={[{ value: "all", label: "Any pricing" }, ...PRICING_OPTIONS.map((p) => ({ value: p.value, label: p.label }))]}
              />
              <Btn onClick={() => setEditing({})} icon="＋">Add tool</Btn>
            </>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <Empty
          emoji="🔎"
          title="No tools match"
          body="Try clearing filters or add a new tool."
          action={<Btn onClick={() => setEditing({})} icon="＋">Add tool</Btn>}
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.bg }}>
                <Th>Tool</Th>
                <Th>Categories</Th>
                <Th>Pricing</Th>
                <Th>Status</Th>
                <Th right>Saves</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const pricing = PRICING_OPTIONS.find((p) => p.value === t.pricing);
                return (
                  <tr key={t.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <Td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {t.logo ? (
                            <img src={t.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 800, color: T.text2 }}>{t.name[0]}</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 5 }}>
                            {t.name}
                            {t.verified && <span title="Verified" style={{ color: "#1D9BF0" }}>✓</span>}
                          </div>
                          <div style={{ fontSize: 12, color: T.text3, marginTop: 1 }}>{t.tagline}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {t.categories.map((slug) => {
                          const c = data.categories.find((cc) => cc.slug === slug);
                          return c ? (
                            <Pill key={slug} color={T.text2} bg={T.surface} border={T.border} size="sm">
                              {c.icon} {c.name}
                            </Pill>
                          ) : null;
                        })}
                      </div>
                    </Td>
                    <Td>
                      <Pill color={pricing.color} bg={pricing.bg} border={pricing.border} size="sm">
                        {pricing.label}
                      </Pill>
                    </Td>
                    <Td>
                      {t.featured ? (
                        <Pill color={T.blue} bg={T.blueSoft} border="rgba(0,82,255,.15)" size="sm">⭐ Featured</Pill>
                      ) : (
                        <span style={{ fontSize: 12, color: T.text3 }}>—</span>
                      )}
                    </Td>
                    <Td right>
                      <span style={{ fontFamily: T.font, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        {t.saves.toLocaleString()}
                      </span>
                    </Td>
                    <Td right>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Btn size="sm" variant="ghost" onClick={() => setEditing(t)}>Edit</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(t)} style={{ color: T.red }}>Delete</Btn>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? `Edit "${editing.name}"` : "Add a new tool"} onClose={() => setEditing(null)} width={840}>
          <ToolForm
            initial={editing.id ? editing : null}
            categories={data.categories}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm
          title="Delete this tool?"
          body={`This permanently removes "${confirmDelete.name}" from the directory. This cannot be undone.`}
          onConfirm={() => remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Card>
  );
};

// ── Table helpers ─────────────────────────────────────────
const Th = ({ children, right }) => (
  <th
    style={{
      textAlign: right ? "right" : "left",
      fontFamily: T.font,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      color: T.text3,
      padding: "12px 16px",
    }}
  >
    {children}
  </th>
);

const Td = ({ children, right }) => (
  <td
    style={{
      padding: "14px 16px",
      fontFamily: T.fontBody,
      fontSize: 13.5,
      color: T.text,
      textAlign: right ? "right" : "left",
      verticalAlign: "middle",
    }}
  >
    {children}
  </td>
);

// ── Deals Manager ─────────────────────────────────────────
const DealForm = ({ initial, tools, onSubmit, onCancel }) => {
  const [data, setData] = useState(
    initial ?? { toolId: tools[0]?.id ?? "", pct: 20, code: "", type: "percent", description: "", expires: "", active: true }
  );
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.toolId) e.toolId = "Pick a tool";
    if (!data.description.trim()) e.description = "Description required";
    if (data.pct == null || data.pct < 0) e.pct = "Must be 0+";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = () => {
    if (!validate()) return;
    onSubmit({ ...data, id: data.id ?? uid(), updatedAt: todayISO() });
  };
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Label required>Tool</Label>
          <Select
            value={data.toolId}
            onChange={(v) => setData({ ...data, toolId: v })}
            options={tools.map((t) => ({ value: t.id, label: t.name }))}
          />
          <FieldError msg={errors.toolId} />
        </div>
        <div>
          <Label>Deal type</Label>
          <Select
            value={data.type}
            onChange={(v) => setData({ ...data, type: v })}
            options={DEAL_TYPES}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 14 }}>
        <div>
          <Label>Discount {data.type === "flat" ? "$" : "%"}</Label>
          <Input type="number" value={data.pct} onChange={(v) => setData({ ...data, pct: Number(v) || 0 })} error={errors.pct} />
          <FieldError msg={errors.pct} />
        </div>
        <div>
          <Label>Coupon code</Label>
          <Input value={data.code} onChange={(v) => setData({ ...data, code: v.toUpperCase() })} placeholder="OPTIONAL" />
        </div>
        <div>
          <Label>Expires</Label>
          <Input type="date" value={data.expires} onChange={(v) => setData({ ...data, expires: v })} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Label required>Description</Label>
        <Textarea
          value={data.description}
          onChange={(v) => setData({ ...data, description: v })}
          placeholder="What does the user get?"
          rows={3}
          error={errors.description}
        />
        <FieldError msg={errors.description} />
      </div>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Toggle value={data.active} onChange={(v) => setData({ ...data, active: v })} label="Active" />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn onClick={submit}>{initial ? "Save changes" : "Create deal"}</Btn>
        </div>
      </div>
    </>
  );
};

const DealsView = ({ data, setData, openToast, openEditorRef }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (openEditorRef) openEditorRef.current = () => setEditing({});
  }, [openEditorRef]);

  const enriched = data.deals.map((d) => ({
    ...d,
    tool: data.tools.find((t) => t.id === d.toolId),
    expired: isExpired(d.expires),
  }));

  const filtered = enriched.filter((d) => {
    if (search && !(d.tool?.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter === "active" && (!d.active || d.expired)) return false;
    if (statusFilter === "expired" && !d.expired) return false;
    if (statusFilter === "inactive" && d.active) return false;
    return true;
  });

  const save = (deal) => {
    const exists = data.deals.find((d) => d.id === deal.id);
    if (exists) {
      setData((s) => ({ ...s, deals: s.deals.map((d) => (d.id === deal.id ? deal : d)) }));
      openToast("Deal updated", "success");
    } else {
      setData((s) => ({ ...s, deals: [deal, ...s.deals] }));
      openToast("Deal created", "success");
    }
    setEditing(null);
  };

  const remove = (deal) => {
    setData((s) => ({ ...s, deals: s.deals.filter((d) => d.id !== deal.id) }));
    openToast("Deal deleted", "error");
    setConfirmDelete(null);
  };

  return (
    <Card padding={0}>
      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by tool or code…"
          right={
            <>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All deals" },
                  { value: "active", label: "Active only" },
                  { value: "expired", label: "Expired" },
                  { value: "inactive", label: "Paused" },
                ]}
              />
              <Btn onClick={() => setEditing({})} icon="＋">Add deal</Btn>
            </>
          }
        />
      </div>
      {filtered.length === 0 ? (
        <Empty emoji="🏷️" title="No deals to show" body="Adjust the filter or add a new deal." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.bg }}>
                <Th>Tool</Th>
                <Th>Discount</Th>
                <Th>Code</Th>
                <Th>Expires</Th>
                <Th>Status</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} style={{ borderTop: `1px solid ${T.border}` }}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {d.tool?.logo && (
                        <img src={d.tool.logo} alt="" style={{ width: 28, height: 28, borderRadius: 7, background: T.surface }} />
                      )}
                      <div>
                        <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 13.5 }}>{d.tool?.name ?? "—"}</div>
                        <div style={{ fontSize: 12, color: T.text3 }}>{d.description.slice(0, 60)}{d.description.length > 60 ? "…" : ""}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span style={{ fontFamily: T.font, fontWeight: 800, fontSize: 17, color: T.orange }}>
                      {d.type === "trial" ? "Free trial" : d.type === "flat" ? `$${d.pct}` : `${d.pct}%`}
                    </span>
                  </Td>
                  <Td>
                    {d.code ? (
                      <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, background: T.surface, padding: "3px 8px", borderRadius: 6 }}>
                        {d.code}
                      </code>
                    ) : (
                      <span style={{ fontSize: 12, color: T.text3, fontStyle: "italic" }}>No code</span>
                    )}
                  </Td>
                  <Td>
                    <span style={{ fontSize: 12.5, color: d.expired ? T.red : T.text2 }}>
                      {d.expires || "No expiry"}
                    </span>
                  </Td>
                  <Td>
                    {d.expired ? (
                      <Pill color={T.red} bg={T.redBg} border={T.redBorder} size="sm">Expired</Pill>
                    ) : d.active ? (
                      <Pill color={T.green} bg={T.greenBg} border={T.greenBorder} size="sm">Active</Pill>
                    ) : (
                      <Pill color={T.text3} bg={T.surface} border={T.border} size="sm">Paused</Pill>
                    )}
                  </Td>
                  <Td right>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <Btn size="sm" variant="ghost" onClick={() => setEditing(d)}>Edit</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(d)} style={{ color: T.red }}>Delete</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={editing.id ? "Edit deal" : "Add a new deal"} onClose={() => setEditing(null)} width={680}>
          <DealForm initial={editing.id ? editing : null} tools={data.tools} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm
          title="Delete this deal?"
          body={`The ${confirmDelete.pct}% deal for ${confirmDelete.tool?.name} will be permanently removed.`}
          onConfirm={() => remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Card>
  );
};

// ── Blog Editor ───────────────────────────────────────────
const BLOG_CATS = ["Guide", "Comparison", "Roundup", "Tutorial", "News"];

const PostEditor = ({ initial, categories, onSubmit, onCancel }) => {
  const [data, setData] = useState(
    initial ?? {
      title: "",
      slug: "",
      excerpt: "",
      cover: "",
      category: "Guide",
      tags: [],
      author: "",
      body: "",
      status: "draft",
      publishedAt: null,
      scheduledFor: null,
    }
  );
  const [autoSlug, setAutoSlug] = useState(!initial);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (autoSlug) setData((d) => ({ ...d, slug: slugify(d.title) }));
  }, [data.title, autoSlug]);

  const minutes = readingMin(data.body);

  const validate = () => {
    const e = {};
    if (!data.title.trim()) e.title = "Title required";
    if (!data.slug.trim()) e.slug = "Slug required";
    if (data.status === "scheduled" && !data.scheduledFor) e.scheduledFor = "Pick a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const out = { ...data, id: data.id ?? uid(), updatedAt: todayISO() };
    if (out.status === "published" && !out.publishedAt) out.publishedAt = todayISO();
    onSubmit(out);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Title */}
      <div>
        <Label required>Title</Label>
        <input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Untitled post"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontFamily: T.font,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "-.8px",
            color: T.text,
            padding: "8px 0",
            background: "transparent",
            borderBottom: `1.5px solid ${errors.title ? T.red : T.border}`,
          }}
        />
        <FieldError msg={errors.title} />
      </div>

      {/* Slug + reading time + preview toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Label>Slug</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              value={data.slug}
              onChange={(v) => { setAutoSlug(false); setData({ ...data, slug: slugify(v) }); }}
              error={errors.slug}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}
            />
            <Btn size="sm" variant="secondary" onClick={() => { setAutoSlug(true); setData({ ...data, slug: slugify(data.title) }); }}>
              Auto
            </Btn>
          </div>
        </div>
        <div>
          <Label>Reading time</Label>
          <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.text2, padding: "10px 0" }}>
            ⏱️ {minutes} min
          </div>
        </div>
        <div style={{ marginLeft: "auto", paddingTop: 22 }}>
          <Btn size="sm" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "✓ Preview" : "Preview"}
          </Btn>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <Label>Excerpt</Label>
        <Textarea
          value={data.excerpt}
          onChange={(v) => setData({ ...data, excerpt: v })}
          placeholder="1–2 sentence summary (appears on cards and search results)"
          rows={2}
        />
      </div>

      {/* Cover + category + author */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
        <div>
          <Label>Cover image URL</Label>
          <Input value={data.cover} onChange={(v) => setData({ ...data, cover: v })} placeholder="https://…/cover.jpg" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={data.category} onChange={(v) => setData({ ...data, category: v })} options={BLOG_CATS.map((c) => ({ value: c, label: c }))} />
        </div>
        <div>
          <Label>Author</Label>
          <Input value={data.author} onChange={(v) => setData({ ...data, author: v })} placeholder="Your name" />
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <TagInput value={data.tags} onChange={(v) => setData({ ...data, tags: v })} />
      </div>

      {/* Body — editor or split-preview */}
      <div>
        <Label>Body</Label>
        {showPreview ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <RichEditor value={data.body} onChange={(v) => setData({ ...data, body: v })} height={400} />
            <div
              style={{
                border: `1.5px solid ${T.border}`,
                borderRadius: T.r,
                padding: 24,
                background: T.cream,
                overflow: "auto",
                maxHeight: 480,
              }}
            >
              <div style={{ fontFamily: T.font, fontSize: 11, fontWeight: 800, color: T.blue, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                Live preview
              </div>
              <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 28, fontWeight: 600, letterSpacing: "-.6px", margin: "0 0 12px", lineHeight: 1.15 }}>
                {data.title || "Untitled post"}
              </h1>
              {data.excerpt && (
                <p style={{ fontSize: 15, lineHeight: 1.6, color: T.text2, margin: "0 0 16px" }}>{data.excerpt}</p>
              )}
              <div
                className="cms-preview-body"
                dangerouslySetInnerHTML={{ __html: data.body || `<p style="color:${T.text3}">Body will render here…</p>` }}
              />
              <style>{`
                .cms-preview-body { font-family: ${T.fontBody}; font-size: 15px; line-height: 1.75; color: ${T.text}; }
                .cms-preview-body h1 { font-family: ${T.font}; font-size: 24px; font-weight: 900; margin: 16px 0 8px; }
                .cms-preview-body h2 { font-family: ${T.font}; font-size: 20px; font-weight: 900; margin: 14px 0 6px; }
                .cms-preview-body h3 { font-family: ${T.font}; font-size: 17px; font-weight: 800; margin: 12px 0 6px; }
                .cms-preview-body blockquote { border-left: 3px solid ${T.blue}; background: ${T.white}; padding: 10px 16px; margin: 12px 0; border-radius: 0 ${T.r}px ${T.r}px 0; font-style: italic; }
                .cms-preview-body a { color: ${T.blue}; text-decoration: underline; }
                .cms-preview-body ul, .cms-preview-body ol { padding-left: 22px; margin: 0 0 10px; }
              `}</style>
            </div>
          </div>
        ) : (
          <RichEditor value={data.body} onChange={(v) => setData({ ...data, body: v })} height={420} />
        )}
      </div>

      {/* Status row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, paddingTop: 4 }}>
        <div>
          <Label>Status</Label>
          <Select value={data.status} onChange={(v) => setData({ ...data, status: v })} options={POST_STATUS.map((s) => ({ value: s.value, label: s.label }))} />
        </div>
        {data.status === "scheduled" && (
          <div>
            <Label required>Schedule for</Label>
            <Input type="date" value={data.scheduledFor ?? ""} onChange={(v) => setData({ ...data, scheduledFor: v })} error={errors.scheduledFor} />
            <FieldError msg={errors.scheduledFor} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={submit}>{initial ? "Save changes" : "Create post"}</Btn>
      </div>
    </div>
  );
};

const PostsView = ({ data, setData, openToast, openEditorRef }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (openEditorRef) openEditorRef.current = () => setEditing({});
  }, [openEditorRef]);

  const filtered = data.posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const save = (post) => {
    const exists = data.posts.find((p) => p.id === post.id);
    if (exists) {
      setData((s) => ({ ...s, posts: s.posts.map((p) => (p.id === post.id ? post : p)) }));
      openToast(`"${post.title}" saved`, "success");
    } else {
      setData((s) => ({ ...s, posts: [post, ...s.posts] }));
      openToast(`"${post.title}" created`, "success");
    }
    setEditing(null);
  };

  const remove = (post) => {
    setData((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== post.id) }));
    openToast("Post deleted", "error");
    setConfirmDelete(null);
  };

  if (editing) {
    return (
      <Card padding={32}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: T.font, fontWeight: 800, color: T.blue, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>
              {editing.id ? "Edit post" : "New post"}
            </div>
            <h2 style={{ margin: 0, fontFamily: T.font, fontSize: 22, fontWeight: 900, letterSpacing: "-.6px" }}>
              {editing.id ? editing.title : "Write a blog post"}
            </h2>
          </div>
        </div>
        <PostEditor
          initial={editing.id ? editing : null}
          categories={data.categories}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      </Card>
    );
  }

  return (
    <Card padding={0}>
      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title…"
          right={
            <>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[{ value: "all", label: "All posts" }, ...POST_STATUS.map((s) => ({ value: s.value, label: s.label }))]}
              />
              <Btn onClick={() => setEditing({})} icon="✎">Write post</Btn>
            </>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <Empty emoji="📝" title="No posts yet" body="Start by drafting your first article." action={<Btn onClick={() => setEditing({})}>Write post</Btn>} />
      ) : (
        <div>
          {filtered.map((p, i) => {
            const status = POST_STATUS.find((s) => s.value === p.status);
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 20,
                  borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 64,
                    borderRadius: 10,
                    background: p.cover ? `url(${p.cover}) center / cover` : "linear-gradient(135deg,#0f172a,#1e3a5f)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <Pill color={status.color} bg={status.bg} border={status.border} size="sm">
                      {status.label}
                    </Pill>
                    <Pill color={T.blue} bg={T.blueSoft} border="rgba(0,82,255,.15)" size="sm">{p.category}</Pill>
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: T.font,
                      fontSize: 16,
                      fontWeight: 800,
                      letterSpacing: "-.3px",
                      color: T.text,
                      cursor: "pointer",
                    }}
                    onClick={() => setEditing(p)}
                  >
                    {p.title}
                  </h3>
                  <div style={{ fontSize: 12.5, color: T.text2, marginTop: 4 }}>
                    {p.excerpt}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11.5, color: T.text3 }}>
                    <span>{p.author || "—"}</span>
                    <span>·</span>
                    <span>{p.publishedAt || p.updatedAt}</span>
                    <span>·</span>
                    <span>{readingMin(p.body)} min read</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <Btn size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(p)} style={{ color: T.red }}>Delete</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {confirmDelete && (
        <Confirm
          title="Delete this post?"
          body={`"${confirmDelete.title}" will be permanently removed.`}
          onConfirm={() => remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Card>
  );
};

// ── Categories Manager ────────────────────────────────────
const CategoryForm = ({ initial, all, onSubmit, onCancel }) => {
  const [data, setData] = useState(
    initial ?? { name: "", slug: "", icon: "✨", color: "#0052ff", description: "", parent: null }
  );
  const [autoSlug, setAutoSlug] = useState(!initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (autoSlug) setData((d) => ({ ...d, slug: slugify(d.name) }));
  }, [data.name, autoSlug]);

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Name required";
    if (!data.slug.trim()) e.slug = "Slug required";
    const collision = all.find((c) => c.slug === data.slug && c.id !== data.id);
    if (collision) e.slug = "Slug must be unique";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({ ...data, id: data.id ?? uid() });
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "span 2" }}>
          <Label required>Name</Label>
          <Input value={data.name} onChange={(v) => setData({ ...data, name: v })} placeholder="Image Generation" error={errors.name} />
          <FieldError msg={errors.name} />
        </div>
        <div>
          <Label>Icon</Label>
          <Input value={data.icon} onChange={(v) => setData({ ...data, icon: v })} placeholder="🎨" style={{ textAlign: "center", fontSize: 18 }} />
        </div>
        <div>
          <Label>Color</Label>
          <input
            type="color"
            value={data.color}
            onChange={(e) => setData({ ...data, color: e.target.value })}
            style={{ width: "100%", height: 40, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: 4, background: T.white, cursor: "pointer" }}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div>
          <Label>Slug</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              value={data.slug}
              onChange={(v) => { setAutoSlug(false); setData({ ...data, slug: slugify(v) }); }}
              error={errors.slug}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}
            />
            <Btn size="sm" variant="secondary" onClick={() => { setAutoSlug(true); setData({ ...data, slug: slugify(data.name) }); }}>Auto</Btn>
          </div>
          <FieldError msg={errors.slug} />
        </div>
        <div>
          <Label>Parent category</Label>
          <Select
            value={data.parent ?? ""}
            onChange={(v) => setData({ ...data, parent: v || null })}
            options={[
              { value: "", label: "None (top-level)" },
              ...all.filter((c) => c.id !== data.id).map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
            ]}
          />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Label>Description</Label>
        <Textarea value={data.description} onChange={(v) => setData({ ...data, description: v })} rows={3} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={submit}>{initial ? "Save changes" : "Create category"}</Btn>
      </div>
    </>
  );
};

const CategoriesView = ({ data, setData, openToast }) => {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const countFor = (slug) => data.tools.filter((t) => t.categories.includes(slug)).length;

  const filtered = data.categories.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const save = (cat) => {
    const exists = data.categories.find((c) => c.id === cat.id);
    if (exists) {
      setData((s) => ({ ...s, categories: s.categories.map((c) => (c.id === cat.id ? cat : c)) }));
      openToast(`"${cat.name}" updated`, "success");
    } else {
      setData((s) => ({ ...s, categories: [...s.categories, cat] }));
      openToast(`"${cat.name}" created`, "success");
    }
    setEditing(null);
  };

  const remove = (cat) => {
    setData((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== cat.id) }));
    openToast(`"${cat.name}" deleted`, "error");
    setConfirmDelete(null);
  };

  // Build tree for display
  const tops = filtered.filter((c) => !c.parent);
  const children = (parentId) => filtered.filter((c) => c.parent === parentId);

  return (
    <Card padding={0}>
      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search categories…"
          right={<Btn onClick={() => setEditing({})} icon="＋">Add category</Btn>}
        />
      </div>
      {tops.length === 0 ? (
        <Empty emoji="📂" title="No categories" body="Create your first category to organise tools." action={<Btn onClick={() => setEditing({})}>Add category</Btn>} />
      ) : (
        <div>
          {tops.map((c, i) => (
            <React.Fragment key={c.id}>
              <CategoryRow cat={c} count={countFor(c.slug)} onEdit={() => setEditing(c)} onDelete={() => setConfirmDelete(c)} topBorder={i > 0} />
              {children(c.id).map((sub) => (
                <CategoryRow key={sub.id} cat={sub} count={countFor(sub.slug)} indent onEdit={() => setEditing(sub)} onDelete={() => setConfirmDelete(sub)} topBorder />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
      {editing && (
        <Modal title={editing.id ? `Edit "${editing.name}"` : "Add a new category"} onClose={() => setEditing(null)} width={620}>
          <CategoryForm initial={editing.id ? editing : null} all={data.categories} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm
          title="Delete this category?"
          body={`"${confirmDelete.name}" will be permanently removed. Tools assigned to it won't be deleted, but they'll lose this label.`}
          onConfirm={() => remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Card>
  );
};

const CategoryRow = ({ cat, count, indent, onEdit, onDelete, topBorder }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 24px",
      paddingLeft: indent ? 64 : 24,
      borderTop: topBorder ? `1px solid ${T.border}` : "none",
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: cat.color + "1a",
        color: cat.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0,
      }}
    >
      {cat.icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: T.font, fontSize: 14.5, fontWeight: 800, color: T.text }}>
        {cat.name}
        <code style={{ marginLeft: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: T.text3, fontWeight: 400 }}>
          /{cat.slug}
        </code>
      </div>
      {cat.description && <div style={{ fontSize: 12.5, color: T.text2, marginTop: 2 }}>{cat.description}</div>}
    </div>
    <div style={{ textAlign: "right", flexShrink: 0 }}>
      <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.text }}>{count}</div>
      <div style={{ fontSize: 11, color: T.text3 }}>tools</div>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      <Btn size="sm" variant="ghost" onClick={onEdit}>Edit</Btn>
      <Btn size="sm" variant="ghost" onClick={onDelete} style={{ color: T.red }}>Delete</Btn>
    </div>
  </div>
);

// ── Glossary Manager ──────────────────────────────────────
const GlossaryForm = ({ initial, allTerms, onSubmit, onCancel }) => {
  const [data, setData] = useState(
    initial ?? { term: "", slug: "", category: "core", definition: "", related: [] }
  );
  const [autoSlug, setAutoSlug] = useState(!initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (autoSlug) setData((d) => ({ ...d, slug: slugify(d.term) }));
  }, [data.term, autoSlug]);

  const validate = () => {
    const e = {};
    if (!data.term.trim()) e.term = "Term required";
    if (!data.slug.trim()) e.slug = "Slug required";
    if (!stripHtml(data.definition).trim()) e.definition = "Definition required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({ ...data, id: data.id ?? uid() });
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <Label required>Term</Label>
          <Input value={data.term} onChange={(v) => setData({ ...data, term: v })} placeholder="RAG" error={errors.term} />
          <FieldError msg={errors.term} />
        </div>
        <div>
          <Label>Slug</Label>
          <div style={{ display: "flex", gap: 6 }}>
            <Input
              value={data.slug}
              onChange={(v) => { setAutoSlug(false); setData({ ...data, slug: slugify(v) }); }}
              error={errors.slug}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}
            />
            <Btn size="sm" variant="secondary" onClick={() => { setAutoSlug(true); setData({ ...data, slug: slugify(data.term) }); }}>Auto</Btn>
          </div>
          <FieldError msg={errors.slug} />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={data.category} onChange={(v) => setData({ ...data, category: v })} options={GLOSSARY_CATS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Label required>Definition</Label>
        <RichEditor value={data.definition} onChange={(v) => setData({ ...data, definition: v })} height={200} />
        <FieldError msg={errors.definition} />
      </div>
      <div style={{ marginTop: 14 }}>
        <Label>Related terms</Label>
        <TagInput value={data.related} onChange={(v) => setData({ ...data, related: v })} placeholder="e.g. Embeddings — then Enter" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={submit}>{initial ? "Save changes" : "Add term"}</Btn>
      </div>
    </>
  );
};

const GlossaryView = ({ data, setData, openToast }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = data.glossary
    .filter((g) => !search || g.term.toLowerCase().includes(search.toLowerCase()) || stripHtml(g.definition).toLowerCase().includes(search.toLowerCase()))
    .filter((g) => catFilter === "all" || g.category === catFilter)
    .sort((a, b) => a.term.localeCompare(b.term));

  const save = (term) => {
    const exists = data.glossary.find((g) => g.id === term.id);
    if (exists) {
      setData((s) => ({ ...s, glossary: s.glossary.map((g) => (g.id === term.id ? term : g)) }));
      openToast(`"${term.term}" updated`, "success");
    } else {
      setData((s) => ({ ...s, glossary: [...s.glossary, term] }));
      openToast(`"${term.term}" added`, "success");
    }
    setEditing(null);
  };

  const remove = (term) => {
    setData((s) => ({ ...s, glossary: s.glossary.filter((g) => g.id !== term.id) }));
    openToast("Term deleted", "error");
    setConfirmDelete(null);
  };

  return (
    <Card padding={0}>
      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search terms or definitions…"
          right={
            <>
              <Select
                value={catFilter}
                onChange={setCatFilter}
                options={[{ value: "all", label: "All categories" }, ...GLOSSARY_CATS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))]}
              />
              <Btn onClick={() => setEditing({})} icon="＋">Add term</Btn>
            </>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <Empty emoji="📖" title="No terms" body="Start documenting AI concepts." action={<Btn onClick={() => setEditing({})}>Add term</Btn>} />
      ) : (
        <div>
          {filtered.map((g, i) => (
            <div key={g.id} style={{ padding: "18px 24px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`, display: "flex", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontFamily: T.font, fontSize: 17, fontWeight: 900, letterSpacing: "-.3px", color: T.text }}>{g.term}</h3>
                  <Pill color={T.blue} bg={T.blueSoft} border="rgba(0,82,255,.15)" size="sm">{g.category}</Pill>
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: g.definition }}
                  style={{ fontFamily: T.fontBody, fontSize: 13.5, lineHeight: 1.6, color: T.text2 }}
                />
                {g.related.length > 0 && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginRight: 4 }}>Related:</span>
                    {g.related.map((r) => (
                      <Pill key={r} color={T.text2} bg={T.surface} border={T.border} size="sm">
                        {r}
                      </Pill>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <Btn size="sm" variant="ghost" onClick={() => setEditing(g)}>Edit</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(g)} style={{ color: T.red }}>Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? `Edit "${editing.term}"` : "Add a glossary term"} onClose={() => setEditing(null)} width={760}>
          <GlossaryForm initial={editing.id ? editing : null} allTerms={data.glossary} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm
          title="Delete this term?"
          body={`"${confirmDelete.term}" will be removed from the glossary.`}
          onConfirm={() => remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Card>
  );
};

// ── Settings View ─────────────────────────────────────────
const SettingsView = ({ settings, setSettings, openToast }) => {
  const [local, setLocal] = useState(settings);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      <Card>
        <h2 style={{ margin: 0, fontFamily: T.font, fontSize: 17, fontWeight: 900, letterSpacing: "-.4px", marginBottom: 4 }}>Site settings</h2>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: T.text3 }}>These values appear in the public site's nav, head, and brand chrome.</p>

        <div style={{ marginBottom: 16 }}>
          <Label>Site name</Label>
          <Input value={local.name} onChange={(v) => setLocal({ ...local, name: v })} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Label>Tagline</Label>
          <Input value={local.tagline} onChange={(v) => setLocal({ ...local, tagline: v })} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Label>Accent colour</Label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="color"
              value={local.accent}
              onChange={(e) => setLocal({ ...local, accent: e.target.value })}
              style={{ width: 60, height: 40, border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: 4, cursor: "pointer", background: T.white }}
            />
            <Input value={local.accent} onChange={(v) => setLocal({ ...local, accent: v })} style={{ fontFamily: '"JetBrains Mono", monospace', flex: 1 }} />
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <Label>Default newsletter source label</Label>
          <Input value={local.newsletterLabel} onChange={(v) => setLocal({ ...local, newsletterLabel: v })} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="secondary" onClick={() => setLocal(settings)}>Revert</Btn>
          <Btn onClick={() => { setSettings(local); openToast("Settings saved", "success"); }}>Save changes</Btn>
        </div>
      </Card>

      <Card style={{ background: T.nearBlack, color: "#fff", border: "none" }}>
        <div style={{ fontSize: 11, fontFamily: T.font, fontWeight: 800, color: T.blueH, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
          Live preview
        </div>
        <div
          style={{
            background: local.accent,
            color: "#fff",
            padding: "20px 24px",
            borderRadius: T.r,
            marginBottom: 16,
            fontFamily: T.font,
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          {local.name}
          <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginTop: 4 }}>{local.tagline}</div>
        </div>
        <button
          style={{
            background: local.accent,
            color: "#fff",
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            padding: "10px 22px",
            borderRadius: T.rPill,
            cursor: "default",
          }}
        >
          Primary button
        </button>
        <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>
          The accent colour applies to: primary buttons, focused inputs, sidebar active state, tag pills, link colour, and brand chrome on tool cards.
        </div>
      </Card>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// ── Main App ───────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
export default function CmsDashboard() {
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(seed);
  const [settings, setSettings] = useState({
    name: "AI Tools Set",
    tagline: "The cleanest AI tools directory",
    accent: T.blue,
    newsletterLabel: "Weekly AI insights",
  });
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Refs let the Dashboard quick-actions open the editor in the target view
  const toolEditorRef = useRef(null);
  const dealEditorRef = useRef(null);
  const postEditorRef = useRef(null);

  // Load Google Fonts once on mount
  useEffect(() => {
    if (document.getElementById("ats-cms-fonts")) return;
    const link = document.createElement("link");
    link.id = "ats-cms-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&family=Lora:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const openToast = (message, kind = "success") => setToast({ message, kind, id: uid() });

  // Subtle global CSS (responsive)
  useEffect(() => {
    if (document.getElementById("ats-cms-css")) return;
    const style = document.createElement("style");
    style.id = "ats-cms-css";
    style.textContent = `
      .cms-mobile-only { display: none !important; }
      .cms-desktop-only { display: inline-flex; }
      @media (max-width: 768px) {
        .cms-mobile-only { display: flex !important; }
        .cms-desktop-only { display: none !important; }
        .cms-sidebar {
          position: fixed !important;
          left: 0; top: 0;
          transform: translateX(-100%);
          transition: transform .25s !important;
        }
        .cms-sidebar.is-open { transform: translateX(0); }
        .cms-mobile-backdrop { display: block !important; }
      }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(style);
  }, []);

  const titles = {
    dashboard: { title: "Dashboard", subtitle: "What's happening across your CMS" },
    tools: { title: "Tools", subtitle: "Add, edit, and feature AI tools" },
    deals: { title: "Deals", subtitle: "Manage active coupons and discounts" },
    posts: { title: "Blog posts", subtitle: "Write, schedule, and publish editorial content" },
    categories: { title: "Categories", subtitle: "Organise tools into browsable categories" },
    glossary: { title: "Glossary", subtitle: "Curate AI terms and definitions" },
    settings: { title: "Settings", subtitle: "Site-wide identity and theme" },
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: T.bg,
        fontFamily: T.fontBody,
        color: T.text,
      }}
    >
      <Sidebar
        view={view}
        setView={setView}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          title={titles[view].title}
          subtitle={titles[view].subtitle}
          onMenuClick={() => setMobileOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div style={{ padding: 28, flex: 1 }}>
          {view === "dashboard" && (
            <DashboardView
              data={data}
              setView={setView}
              openTool={() => toolEditorRef.current?.()}
              openDeal={() => dealEditorRef.current?.()}
              openPost={() => postEditorRef.current?.()}
            />
          )}
          {view === "tools" && (
            <ToolsView data={data} setData={setData} openToast={openToast} openEditorRef={toolEditorRef} />
          )}
          {view === "deals" && (
            <DealsView data={data} setData={setData} openToast={openToast} openEditorRef={dealEditorRef} />
          )}
          {view === "posts" && (
            <PostsView data={data} setData={setData} openToast={openToast} openEditorRef={postEditorRef} />
          )}
          {view === "categories" && (
            <CategoriesView data={data} setData={setData} openToast={openToast} />
          )}
          {view === "glossary" && (
            <GlossaryView data={data} setData={setData} openToast={openToast} />
          )}
          {view === "settings" && (
            <SettingsView settings={settings} setSettings={setSettings} openToast={openToast} />
          )}
        </div>
      </main>
      {toast && <Toast key={toast.id} message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />}
    </div>
  );
}

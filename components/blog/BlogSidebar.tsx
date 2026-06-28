import Link from "next/link";
import { Favicon } from "../Favicon";
import { favicon } from "@/lib/tools";
import { TableOfContents } from "./TableOfContents";
import type { TocItem } from "@/lib/blog-toc";

/** Per-article data: TOC + the tools the editor referenced in the body. */
export type SidebarArticleData = {
  toc: TocItem[];
  toolsInArticle: Array<{
    name: string;
    domain: string;
    cat: string;
    verified: boolean;
    free: boolean;
    slug: string;
  }>;
};

const TRENDING = [
  { rank: 1, title: "ChatGPT vs Claude 4: the definitive comparison", meta: "12 min · 22.1K views", slug: "chatgpt-vs-claude-4" },
  { rank: 2, title: "10 best free AI image generators in 2026", meta: "7 min · 14.8K views", slug: "best-free-ai-image-generators" },
  { rank: 3, title: "The complete guide to AI writing tools", meta: "18 min · 9.2K views", slug: "ai-writing-tools-guide" },
  { rank: 4, title: "Cursor vs GitHub Copilot: 3 months later", meta: "11 min · 8.7K views", slug: "cursor-vs-copilot" },
];

const NEWS = [
  { source: "OpenAI", domain: "openai.com", time: "2h ago", title: "GPT-5 rolls out to all ChatGPT Plus users", tag: "Breaking" },
  { source: "Google DeepMind", domain: "deepmind.google", time: "4h ago", title: "Gemini 2.5 launches with multimodal upgrades", tag: "Research" },
  { source: "Anthropic", domain: "anthropic.com", time: "6h ago", title: "Claude 4 brings extended thinking mode", tag: "Product" },
];

const CATEGORIES = [
  { icon: "✍️", name: "Writing", slug: "writing-and-editing" },
  { icon: "💻", name: "Code", slug: "code-and-developer" },
  { icon: "🎨", name: "Image AI", slug: "image-generation" },
  { icon: "🎬", name: "Video", slug: "video" },
  { icon: "📈", name: "Marketing", slug: "marketing-and-sales" },
  { icon: "🎵", name: "Audio", slug: "audio-and-music" },
  { icon: "📊", name: "Analytics", slug: "data-visualization" },
  { icon: "🤖", name: "AI Agents", slug: "ai-agents" },
];

const RELATED_POSTS = [
  { tag: "Comparison", title: "ChatGPT vs Claude 4 in 2026", img: "ChatGPT vs Claude", grad: "linear-gradient(135deg,#1a0533,#4c1d95)", slug: "chatgpt-vs-claude-4" },
  { tag: "Guide", title: "The best prompt engineering techniques", img: "Prompts", grad: "linear-gradient(135deg,#022c22,#065f46)", slug: "prompt-engineering" },
  { tag: "Tutorial", title: "How to use Claude 4 extended thinking", img: "Claude 4", grad: "linear-gradient(135deg,#1c1917,#7c3a20)", slug: "claude-4-extended-thinking" },
];

function VerifiedSmall() {
  return (
    <svg className="flex-shrink-0 ml-[3px]" width="11" height="11" viewBox="0 0 24 24" fill="#1D9BF0">
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" />
      <path d="M9 12l2 2.5 4.5-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Card({ header, headerLink, children, padBody }: { header: string; headerLink?: { label: string; href: string }; children: React.ReactNode; padBody?: string }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div
        className="px-[18px] py-[14px] font-display text-[12.5px] font-extrabold uppercase tracking-[.07em] flex items-center justify-between"
        style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
      >
        {header}
        {headerLink && (
          <Link href={headerLink.href} className="text-[11px] font-bold normal-case" style={{ color: "var(--blue)", letterSpacing: 0, textTransform: "none" }}>
            {headerLink.label}
          </Link>
        )}
      </div>
      <div className={padBody ?? "px-[18px] py-4"}>{children}</div>
    </div>
  );
}

export function BlogSidebar({ article }: { article?: SidebarArticleData } = {}) {
  const toc = article?.toc ?? [];
  const tools = article?.toolsInArticle ?? [];
  return (
    <aside className="sticky flex flex-col gap-[18px] min-w-0 blog-sidebar" style={{ top: 80 }}>
      <Card header="In this article">
        <TableOfContents items={toc} />
      </Card>

      {tools.length > 0 && (
        <Card header="Tools in this article" headerLink={{ label: "All →", href: "/ai-tools" }} padBody="px-[18px] py-2">
          {tools.map((t, i) => (
            <Link
              key={t.slug}
              href={`/ai-tool/${t.slug}`}
              className="group flex items-center gap-[10px] py-[9px] cursor-pointer"
              style={{ borderBottom: i < tools.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div
                className="w-[30px] h-[30px] rounded-[7px] overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <Favicon domain={t.domain} name={t.name} size={30} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[13px] font-bold transition-colors group-hover:text-blue inline-flex items-center">
                  {t.name}
                  {t.verified && <VerifiedSmall />}
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-3)" }}>
                  {t.cat}
                </div>
              </div>
              {t.free && (
                <span
                  className="text-[10.5px] font-extrabold px-[7px] py-[2px] rounded-pill flex-shrink-0"
                  style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
                >
                  Free
                </span>
              )}
            </Link>
          ))}
        </Card>
      )}

      <Card header="Trending on the blog" headerLink={{ label: "All →", href: "/blog" }} padBody="px-[18px] py-2">
        {TRENDING.map((t, i) => (
          <Link
            key={t.rank}
            href={`/blog/${t.slug}`}
            className="group flex items-center gap-[10px] py-[9px] cursor-pointer"
            style={{ borderBottom: i < TRENDING.length - 1 ? "1px solid var(--border)" : "none" }}
          >
            <div
              className="font-display text-sm font-black flex-shrink-0 tnum"
              style={{ color: "var(--blue-soft)", width: 20, letterSpacing: "-.5px" }}
            >
              <span style={{ color: "var(--blue)" }}>{t.rank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[12.5px] font-bold leading-[1.35] transition-colors group-hover:text-blue mb-[2px]">
                {t.title}
              </div>
              <div className="text-[11px] tnum" style={{ color: "var(--text-3)" }}>
                {t.meta}
              </div>
            </div>
          </Link>
        ))}
      </Card>

      <Card header="From AI News" headerLink={{ label: "All →", href: "/news" }} padBody="px-[18px] py-2">
        {NEWS.map((n, i) => (
          <Link
            key={n.title}
            href="/news"
            className="group block py-[10px] cursor-pointer"
            style={{ borderBottom: i < NEWS.length - 1 ? "1px solid var(--border)" : "none" }}
          >
            <div className="text-[10.5px] font-extrabold uppercase tracking-[.06em] mb-[3px] flex items-center gap-[5px]" style={{ color: "var(--text-3)" }}>
              <img src={favicon(n.domain, 32)} alt={`${n.source} icon`} width={11} height={11} loading="lazy" decoding="async" className="w-[11px] h-[11px] rounded-[2px]" />
              {n.source} · {n.time}
            </div>
            <div className="font-display text-[12.5px] font-bold leading-[1.35] transition-colors group-hover:text-blue mb-[3px]">
              {n.title}
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-3)" }}>
              {n.tag}
            </div>
          </Link>
        ))}
      </Card>

      <div className="rounded-lg p-5" style={{ background: "var(--near-black)" }}>
        <div className="font-display text-[10px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "rgba(255,255,255,.4)" }}>
          Newsletter · 28k subscribers
        </div>
        <div className="font-display font-extrabold text-white mb-[6px] leading-[1.2]" style={{ fontSize: 17, letterSpacing: "-.3px" }}>
          Weekly AI insights, in your inbox.
        </div>
        <div className="text-xs leading-[1.55] mb-[14px]" style={{ color: "rgba(255,255,255,.4)" }}>
          Every Tuesday — guides, reviews, and the AI tools we tested this week.
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          aria-label="Email"
          className="w-full h-[38px] rounded-pill text-[12.5px] text-white px-[13px] outline-none mb-[7px] placeholder:text-white/30"
          style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}
        />
        <button
          className="w-full font-display text-[12.5px] font-bold text-white rounded-pill h-9"
          style={{ background: "var(--blue)" }}
        >
          Subscribe for free →
        </button>
      </div>

      <Card header="Browse categories" headerLink={{ label: "All 48 →", href: "/ai-tools" }}>
        <div className="flex flex-wrap gap-[6px]">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/ai-tools/${c.slug}`}
              className="font-display text-[11.5px] font-bold px-[11px] py-[5px] rounded-pill transition-colors hover:bg-blue hover:text-white"
              style={{ color: "var(--text-2)", background: "var(--surface)" }}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </Card>

      <Card header="Keep reading" padBody="px-[18px] py-2">
        {RELATED_POSTS.map((p, i) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex gap-[10px] py-[10px] cursor-pointer items-start"
            style={{ borderBottom: i < RELATED_POSTS.length - 1 ? "1px solid var(--border)" : "none" }}
          >
            <div
              className="w-16 h-12 rounded-[7px] flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: p.grad }}
            >
              <div
                className="font-display font-black"
                style={{ fontSize: 11, color: "rgba(255,255,255,.25)", letterSpacing: "-.3px" }}
              >
                {p.img}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[.06em] mb-[3px]" style={{ color: "var(--blue)" }}>
                {p.tag}
              </div>
              <div className="font-display text-[12.5px] font-bold leading-[1.35] transition-colors group-hover:text-blue">
                {p.title}
              </div>
            </div>
          </Link>
        ))}
      </Card>

      <div className="rounded-lg p-[22px] text-white" style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}>
        <div className="font-display font-black mb-[6px] leading-[1.2]" style={{ fontSize: 16, letterSpacing: "-.3px" }}>
          Built an AI tool?
          <br />
          Get discovered.
        </div>
        <div className="text-[12.5px] leading-[1.55] mb-[14px]" style={{ color: "rgba(255,255,255,.85)" }}>
          Reach 50,000+ AI users every month. Submit your tool to AI Tools Set.
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-[5px] font-display text-[12.5px] font-bold px-4 py-[9px] rounded-pill"
          style={{ background: "#fff", color: "var(--blue)" }}
        >
          Submit a Tool →
        </Link>
      </div>
    </aside>
  );
}

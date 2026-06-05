import Link from "next/link";
import type { NewsPost } from "@/lib/news";
import { favicon } from "@/lib/tools";
import { ReadingProgress } from "../blog/ReadingProgress";
import { AiSummarize } from "./AiSummarize";
import { sanitizeHtml } from "@/lib/sanitize";

function authorInitials(source: string): string {
  return source
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function topicLabel(topic: NewsPost["topic"]): string {
  const map: Record<NewsPost["topic"], string> = {
    llm: "LLMs",
    image: "Image AI",
    video: "Video AI",
    code: "Code AI",
    audio: "Audio AI",
    policy: "Policy",
    research: "Research",
    cybersecurity: "Cybersecurity",
    startup: "Startup",
  };
  return map[topic];
}

function fmtDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function NewsArticle({
  post,
  related,
  canonicalUrl,
}: {
  post: NewsPost;
  related: NewsPost[];
  canonicalUrl: string;
}) {
  const draft = post.draft;
  const intro = draft?.introduction ?? post.text;
  const highlights = draft?.keyHighlights ?? [];
  const bodyHtml = draft?.body ?? "";
  const expert = draft?.expertCommentary;
  const faqs = draft?.faqs ?? [];
  const citations = draft?.citations ?? [
    { label: `${post.source} — ${post.cardTitle}`, url: post.link },
  ];

  return (
    <main>
      <ReadingProgress />

      {/* Article header */}
      <section className="bg-white px-9 pt-10 pb-7 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[780px] mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-[18px] flex-wrap" style={{ color: "var(--text-3)" }}>
            <Link href="/" style={{ color: "var(--text-3)" }}>
              Home
            </Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <Link href="/news" style={{ color: "var(--text-3)" }}>
              News
            </Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <Link href="/news" style={{ color: "var(--text-3)" }}>
              {topicLabel(post.topic)}
            </Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <span style={{ color: "var(--text-2)" }}>{post.cardTitle.slice(0, 50)}</span>
          </nav>

          <div className="flex gap-2 mb-4 flex-wrap">
            {post.breaking && <span className="b-breaking-badge">Breaking</span>}
            <span
              className="inline-flex font-display text-[11px] font-extrabold uppercase tracking-[.07em] px-[11px] py-[4px] rounded-pill"
              style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)", color: "var(--blue)" }}
            >
              {topicLabel(post.topic)} · {post.tag}
            </span>
          </div>

          <h1 className="news-article-h1 mb-4">{draft?.seoTitle ?? post.cardTitle}</h1>

          <p className="text-[17px] leading-[1.65] mb-6" style={{ color: "var(--text-2)" }}>
            {intro}
          </p>

          {/* Source attribution row — drives backlinks */}
          <div className="source-attr-row">
            <span className="font-display text-[11px] font-extrabold uppercase tracking-[.07em]" style={{ color: "var(--text-3)" }}>
              Original source
            </span>
            <div
              className="w-[22px] h-[22px] rounded-[5px] overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <img src={favicon(post.domain, 64)} alt={post.source} className="w-[18px] h-[18px]" />
            </div>
            <div className="font-display text-sm font-extrabold" style={{ color: "var(--text)" }}>
              {post.source}
            </div>
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="source-attr-link">
              Read on {post.domain}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>

          {/* Author + meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-[9px]">
              <div
                className="w-[38px] h-[38px] rounded-full text-white font-display text-[13px] font-extrabold flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}
              >
                {authorInitials(post.source)}
              </div>
              <div>
                <div className="font-display text-[13.5px] font-extrabold">{post.source}</div>
                <div className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
                  {post.handle}
                </div>
              </div>
            </div>
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
            <div className="text-[12.5px] flex items-center gap-[5px] font-medium" style={{ color: "var(--text-2)" }}>
              📅 {fmtDate(post.timestamp)}
            </div>
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
            <div className="text-[12.5px] font-medium" style={{ color: "var(--text-2)" }}>
              ⏱️ {Math.max(2, Math.ceil(intro.length / 280))} min read
            </div>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <div className="max-w-[1080px] mx-auto px-9 pt-6 section-pad-x">
        <div
          className="rounded-lg relative overflow-hidden flex items-center justify-center"
          style={{ background: post.cardImg, height: 380 }}
        >
          <div
            className="absolute pointer-events-none"
            style={{ top: -100, right: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 60%)" }}
          />
          <div className="font-display font-black relative" style={{ fontSize: 96, letterSpacing: "-3px", color: "rgba(255,255,255,.12)" }}>
            {post.cardImgText}
          </div>
          <div
            className="absolute bottom-[14px] left-[14px] backdrop-blur-md font-display text-[11px] font-bold uppercase tracking-[.07em] px-3 py-[5px] rounded-pill"
            style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.7)" }}
          >
            Illustration · AI Tools Set
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1320px] mx-auto px-9 py-10 grid grid-cols-[minmax(0,1fr)_320px] gap-12 items-start news-article-layout section-pad-x">
        {/* Article body */}
        <article className="news-article-body">
          <AiSummarize articleUrl={canonicalUrl} />

          {highlights.length > 0 && (
            <div
              className="rounded p-5 mb-6"
              style={{
                background: "var(--blue-soft)",
                border: "1px solid rgba(0,82,255,.18)",
                borderLeft: "3px solid var(--blue)",
              }}
            >
              <div className="font-display text-[11px] font-extrabold uppercase tracking-[.08em] mb-[6px]" style={{ color: "var(--blue)" }}>
                Key highlights
              </div>
              <ul className="!my-0">
                {highlights.map((h, i) => (
                  <li key={i} className="!text-[15px] !leading-[1.65]">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }} />
          ) : (
            <>
              <p>{intro}</p>
              <p>
                <strong>This is a syndicated headline from {post.source}.</strong> The full article is published on{" "}
                <a href={post.link} target="_blank" rel="noopener noreferrer">
                  {post.domain}
                </a>
                . The AI Tools Set editorial team is currently reviewing the announcement and will publish our full analysis shortly.
              </p>
              <p>
                In the meantime, you can <strong>read the original source</strong> or use one of the AI summary tools above to get a quick recap and ask follow-up questions about the story.
              </p>
            </>
          )}

          {expert && (
            <>
              <h2>What this means</h2>
              <p>{expert}</p>
            </>
          )}

          {/* Sources & further reading */}
          <div
            className="rounded-lg p-[22px] my-8"
            style={{ background: "var(--cream)", border: "1px solid var(--border)" }}
          >
            <div className="font-display text-sm font-extrabold mb-[14px] flex items-center gap-2" style={{ letterSpacing: "-.2px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--blue)" }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Sources &amp; further reading
            </div>
            {citations.map((c, i) => {
              let domain = "";
              try {
                domain = new URL(c.url).hostname.replace(/^www\./, "");
              } catch {}
              return (
                <a
                  key={c.url}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-[11px] py-[10px]"
                  style={{ borderBottom: i < citations.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div
                    className="w-[22px] h-[22px] rounded-[5px] overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--white)", border: "1px solid var(--border)" }}
                  >
                    <img src={favicon(domain || post.domain, 64)} alt="" className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[13.5px] font-bold leading-[1.35] transition-colors group-hover:text-blue" style={{ color: "var(--text)" }}>
                      {c.label}
                    </div>
                    <div className="text-[11.5px] mt-[2px]" style={{ color: "var(--text-3)" }}>
                      {domain || c.url}
                    </div>
                  </div>
                  <svg className="flex-shrink-0 transition-colors group-hover:text-blue" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-3)" }}>
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              );
            })}
          </div>

          {/* FAQs */}
          {faqs.length > 0 && (
            <>
              <h2>Frequently asked questions</h2>
              {faqs.map((f) => (
                <div key={f.q} className="mb-5">
                  <h3 style={{ margin: "20px 0 6px" }}>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-[6px] mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            {[post.source, post.tag, topicLabel(post.topic), ...(post.breaking ? ["Breaking"] : []), "AI Tools Set"].map((t) => (
              <span
                key={t}
                className="font-display text-xs font-semibold px-3 py-[5px] rounded-pill transition-colors hover:border-blue hover:text-blue"
                style={{ color: "var(--text-2)", border: "1px solid var(--border)", background: "var(--white)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="sticky flex flex-col gap-[18px] news-article-sidebar" style={{ top: 80 }}>
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-4 py-[13px] font-display text-[12.5px] font-extrabold uppercase tracking-[.07em]" style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}>
              Story facts
            </div>
            <div className="px-4 py-[14px] text-[13px] flex flex-col gap-[10px]">
              {[
                { label: "Source", val: post.source },
                { label: "Date", val: new Date(post.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                { label: "Category", val: topicLabel(post.topic) },
                { label: "Type", val: post.tag },
                { label: "Impact", val: post.breaking ? "High" : "Standard", color: post.breaking ? "#dc2626" : "var(--text)" },
                { label: "Status", val: post.editorial.status.charAt(0).toUpperCase() + post.editorial.status.slice(1) },
              ].map((r, i) => (
                <div key={r.label} className="flex justify-between pb-2" style={{ borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--text-3)" }}>{r.label}</span>
                  <strong style={{ color: r.color ?? "var(--text)" }}>{r.val}</strong>
                </div>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="px-4 py-[13px] font-display text-[12.5px] font-extrabold uppercase tracking-[.07em] flex justify-between items-center" style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}>
                More AI News
                <Link href="/news" className="text-[11px] font-bold normal-case" style={{ color: "var(--blue)", letterSpacing: 0, textTransform: "none" }}>
                  All →
                </Link>
              </div>
              <div className="px-4 py-[10px]">
                {related.slice(0, 4).map((r, i) => (
                  <Link
                    key={r.id}
                    href={`/news/${r.slug}`}
                    className="group block py-[10px] cursor-pointer"
                    style={{ borderBottom: i < Math.min(3, related.length - 1) ? "1px solid var(--border)" : "none" }}
                  >
                    <div className="text-[10.5px] font-extrabold uppercase tracking-[.06em] mb-1 flex items-center gap-[5px]" style={{ color: "var(--text-3)" }}>
                      <img src={favicon(r.domain, 32)} alt="" className="w-[11px] h-[11px] rounded-[2px]" />
                      {r.source} · {r.time} ago
                    </div>
                    <div className="font-display text-[13px] font-bold leading-[1.35] transition-colors group-hover:text-blue">{r.cardTitle}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg p-5" style={{ background: "var(--near-black)" }}>
            <div className="font-display text-[10px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "rgba(255,255,255,.4)" }}>
              Newsletter · 28k subscribers
            </div>
            <div className="font-display text-base font-extrabold text-white mb-[6px] leading-[1.2]" style={{ letterSpacing: "-.3px" }}>
              Daily AI news, in your inbox.
            </div>
            <div className="text-xs leading-[1.55] mb-[14px]" style={{ color: "rgba(255,255,255,.4)" }}>
              Every morning — the most important stories from official AI sources, curated.
            </div>
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email"
              className="w-full h-[38px] rounded-pill text-[12.5px] text-white px-[13px] outline-none mb-[7px] placeholder:text-white/30"
              style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}
            />
            <button className="w-full font-display text-[12.5px] font-bold text-white rounded-pill h-9" style={{ background: "var(--blue)" }}>
              Subscribe for free →
            </button>
          </div>
        </aside>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-12 px-9 section-pad-x" style={{ background: "var(--cream)", borderTop: "1px solid var(--border)" }}>
          <div className="max-w-[1320px] mx-auto">
            <div className="flex items-end justify-between mb-7 flex-wrap gap-[14px]">
              <div>
                <div className="font-display text-[11.5px] font-bold uppercase tracking-[.09em] mb-[6px]" style={{ color: "var(--blue)" }}>
                  Continue reading
                </div>
                <div className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
                  More AI news today
                </div>
              </div>
              <Link href="/news" className="font-display text-[13.5px] font-bold" style={{ color: "var(--blue)" }}>
                All stories →
              </Link>
            </div>
            <div className="news-related-3">
              {related.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.slug}`}
                  className="blog-card-hover rounded-lg overflow-hidden group cursor-pointer"
                >
                  <div className="flex items-center justify-center" style={{ height: 140, background: r.cardImg }}>
                    <div className="font-display font-black" style={{ fontSize: 32, color: "rgba(255,255,255,.15)" }}>
                      {r.cardImgText}
                    </div>
                  </div>
                  <div className="p-[18px]">
                    <div className="text-[10.5px] font-extrabold uppercase tracking-[.07em] mb-[7px] flex items-center gap-[5px]" style={{ color: "var(--blue)" }}>
                      <img src={favicon(r.domain, 32)} alt="" className="w-[11px] h-[11px] rounded-[2px]" />
                      {r.source}
                    </div>
                    <div className="font-display text-[15.5px] font-extrabold leading-[1.3] mb-2 transition-colors group-hover:text-blue" style={{ letterSpacing: "-.3px" }}>
                      {r.cardTitle}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-3)" }}>
                      {r.time} ago
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

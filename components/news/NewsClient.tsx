"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { favicon } from "@/lib/tools";
import type { NewsPost, Topic } from "@/lib/news";
import { TRENDING_TOPICS, FOLLOW_LIST } from "@/lib/news";

const TOPICS: { key: Topic | "all"; label: string; icon: React.ReactNode }[] = [
  {
    key: "all",
    label: "All",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  { key: "llm", label: "LLMs", icon: <span style={{ fontSize: 14 }}>🧠</span> },
  { key: "image", label: "Image AI", icon: <span style={{ fontSize: 14 }}>🎨</span> },
  { key: "video", label: "Video AI", icon: <span style={{ fontSize: 14 }}>🎬</span> },
  { key: "code", label: "Code AI", icon: <span style={{ fontSize: 14 }}>💻</span> },
  { key: "audio", label: "Audio AI", icon: <span style={{ fontSize: 14 }}>🎵</span> },
  { key: "policy", label: "Policy", icon: <span style={{ fontSize: 14 }}>📜</span> },
  { key: "research", label: "Research", icon: <span style={{ fontSize: 14 }}>🔬</span> },
];

const TABS = ["For You", "Latest", "Breaking", "Research"] as const;

const VerifiedBadge = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
    <path
      d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z"
      fill="#1D9BF0"
    />
    <path d="M9 12l2 2.5 4.5-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function fmt(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export function NewsClient({ posts, liveCount, totalCount }: { posts: NewsPost[]; liveCount: number; totalCount: number }) {
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [tab, setTab] = useState<(typeof TABS)[number]>("For You");
  const [query, setQuery] = useState("");
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Load persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setLikes(JSON.parse(localStorage.getItem("ats-nl") || "{}"));
      setBookmarks(new Set(JSON.parse(localStorage.getItem("ats-nb") || "[]")));
      setFollowing(new Set(JSON.parse(localStorage.getItem("ats-nf") || "[]")));
    } catch {}
  }, []);

  // "New posts" banner appears after 8s
  useEffect(() => {
    if (bannerDismissed) return;
    const t = setTimeout(() => setShowBanner(true), 8000);
    return () => clearTimeout(t);
  }, [bannerDismissed]);

  const persist = (l: Record<string, number>, b: Set<string>, f: Set<string>) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ats-nl", JSON.stringify(l));
    localStorage.setItem("ats-nb", JSON.stringify([...b]));
    localStorage.setItem("ats-nf", JSON.stringify([...f]));
  };

  const toggleLike = (id: string) => {
    const next = { ...likes };
    next[id] = (next[id] || 0) > 0 ? 0 : 1;
    setLikes(next);
    persist(next, bookmarks, following);
  };
  const toggleBookmark = (id: string) => {
    const next = new Set(bookmarks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarks(next);
    persist(likes, next, following);
  };
  const toggleFollow = (domain: string) => {
    const next = new Set(following);
    if (next.has(domain)) next.delete(domain);
    else next.add(domain);
    setFollowing(next);
    persist(likes, bookmarks, next);
  };

  const filtered = useMemo(() => {
    let result = posts;
    if (topic !== "all") result = result.filter((p) => p.topic === topic);
    if (tab === "Breaking") result = result.filter((p) => p.breaking);
    if (tab === "Research") result = result.filter((p) => p.topic === "research");
    if (tab === "Latest") result = [...result].sort((a, b) => b.timestamp - a.timestamp);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.source.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q) ||
          p.cardTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, topic, tab, query]);

  const liveLabel = liveCount > 0 ? `Live · ${liveCount} from RSS` : "Live · cached";

  return (
    <div className="twitter-layout">
      {/* LEFT SIDEBAR */}
      <aside className="news-left-sidebar">
        <div className="mb-7">
          <div className="font-display text-[11px] font-bold uppercase tracking-[.08em] mb-[10px] pl-[10px]" style={{ color: "var(--text-3)" }}>
            Feed
          </div>
          <button className="ls-item active">
            <div className="ls-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="ls-name font-display text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
              All News
            </span>
            <span className="ml-auto text-[11px] font-semibold tnum" style={{ color: "var(--text-3)" }}>
              {totalCount}
            </span>
          </button>
          <button className="ls-item">
            <div className="ls-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="ls-name font-display text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
              Saved ({bookmarks.size})
            </span>
          </button>
        </div>

        <div className="mb-7">
          <div className="font-display text-[11px] font-bold uppercase tracking-[.08em] mb-[10px] pl-[10px]" style={{ color: "var(--text-3)" }}>
            Topics
          </div>
          {TOPICS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTopic(t.key)}
              className={`ls-item${topic === t.key ? " active" : ""}`}
            >
              <div className="ls-icon-wrap">{t.icon}</div>
              <span className="ls-name font-display text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <div>
          <div className="font-display text-[11px] font-bold uppercase tracking-[.08em] mb-[10px] pl-[10px]" style={{ color: "var(--text-3)" }}>
            Official Sources
          </div>
          {[
            { name: "OpenAI", domain: "openai.com" },
            { name: "DeepMind", domain: "deepmind.google" },
            { name: "Anthropic", domain: "anthropic.com" },
            { name: "Hugging Face", domain: "huggingface.co" },
            { name: "Microsoft", domain: "microsoft.com" },
            { name: "Mistral AI", domain: "mistral.ai" },
          ].map((s) => (
            <button key={s.name} className="ls-item">
              <div className="ls-source-logo">
                <img src={favicon(s.domain, 64)} alt={s.name} />
              </div>
              <span className="ls-name font-display text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN FEED */}
      <div className="news-main-feed">
        <div className="sticky z-[50] backdrop-blur-[16px] px-5 py-4" style={{ top: 58, background: "rgba(255,255,255,.95)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-[17px] font-extrabold" style={{ letterSpacing: "-.4px" }}>
              AI News Feed
            </div>
            <div
              className="flex items-center gap-[5px] font-display text-[11.5px] font-bold px-[10px] py-1 rounded-pill"
              style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)" }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full animate-pulse-dot"
                style={{ background: "var(--green)" }}
              />
              {liveLabel}
            </div>
          </div>
          <div className="flex gap-0">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="font-display text-[13px] font-bold px-4 py-2 cursor-pointer transition-colors"
                style={{
                  color: tab === t ? "var(--blue)" : "var(--text-3)",
                  borderBottom: `2px solid ${tab === t ? "var(--blue)" : "transparent"}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {showBanner && !bannerDismissed && (
          <button
            onClick={() => {
              setShowBanner(false);
              setBannerDismissed(true);
            }}
            className="w-full text-white text-center py-[10px] font-display text-[13px] font-bold cursor-pointer transition-colors hover:bg-blue-h"
            style={{ background: "var(--blue)" }}
          >
            ↑ New stories — tap to refresh
          </button>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 px-5" style={{ color: "var(--text-3)" }}>
            <div className="text-4xl mb-[14px]">🔎</div>
            <div className="font-display text-lg font-extrabold mb-[6px]" style={{ color: "var(--text)" }}>
              No posts match
            </div>
            <div className="text-sm">Try clearing filters or switching to All News.</div>
          </div>
        ) : (
          filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              liked={(likes[p.id] || 0) > 0}
              bookmarked={bookmarks.has(p.id)}
              onLike={() => toggleLike(p.id)}
              onBookmark={() => toggleBookmark(p.id)}
            />
          ))
        )}

        <div className="text-center p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            className="font-display text-[13px] font-bold px-7 py-[10px] rounded-pill"
            style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1.5px solid rgba(0,82,255,.15)" }}
          >
            Show older stories
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="news-right-sidebar">
        <div className="bg-white rounded-lg px-4 py-[14px] mb-4" style={{ border: "1px solid var(--border)" }}>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-3)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search AI news…"
              aria-label="Search AI news"
              className="w-full h-10 rounded-pill text-[13.5px] outline-none pl-[38px] pr-[14px] transition-colors focus:border-[var(--blue)] focus:bg-white placeholder:text-[var(--text-3)]"
              style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        <Card title="Trending in AI">
          {TRENDING_TOPICS.map((t, i) => (
            <div
              key={t.topic}
              className="group py-[10px] cursor-pointer"
              style={{ borderBottom: i < TRENDING_TOPICS.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div className="text-[11px] mb-[2px]" style={{ color: "var(--text-3)" }}>
                {t.cat}
              </div>
              <div className="font-display text-[13.5px] font-extrabold transition-colors group-hover:text-blue">{t.topic}</div>
              <div className="text-[11.5px] mt-[2px] tnum" style={{ color: "var(--text-3)" }}>
                {t.posts}
              </div>
            </div>
          ))}
        </Card>

        <Card title="Official AI Sources">
          {FOLLOW_LIST.map((s, i) => (
            <div key={s.name} className="flex items-center gap-[10px] py-[10px]" style={{ borderBottom: i < FOLLOW_LIST.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <img src={favicon(s.domain, 64)} alt={s.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[13px] font-extrabold flex items-center gap-1">
                  {s.name}
                  {VerifiedBadge}
                </div>
                <div className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
                  {s.handle}
                </div>
              </div>
              <button
                onClick={() => toggleFollow(s.domain)}
                className="font-display text-xs font-bold px-[14px] py-[5px] rounded-pill flex-shrink-0 transition-colors"
                style={
                  following.has(s.domain)
                    ? { background: "var(--surface)", color: "var(--text)", border: "1.5px solid var(--border)" }
                    : { background: "var(--near-black)", color: "#fff" }
                }
              >
                {following.has(s.domain) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </Card>

        <div className="rounded-lg p-[18px] mb-4" style={{ background: "var(--near-black)" }}>
          <div className="font-display text-sm font-extrabold text-white mb-[5px]">AI News, every morning.</div>
          <div className="text-xs leading-[1.55] mb-3" style={{ color: "rgba(255,255,255,.4)" }}>
            The most important stories from official AI sources — curated and delivered daily.
          </div>
          <input
            type="email"
            placeholder="your@email.com"
            aria-label="Email"
            className="w-full h-[38px] rounded-pill text-[13px] text-white px-[14px] outline-none mb-2 placeholder:text-white/30"
            style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}
          />
          <button
            className="w-full font-display text-[13px] font-bold text-white rounded-pill h-9 transition-colors hover:bg-blue-h"
            style={{ background: "var(--blue)" }}
          >
            Subscribe →
          </button>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg mb-4 overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="px-4 py-[14px] font-display text-[13.5px] font-extrabold" style={{ borderBottom: "1px solid var(--border)" }}>
        {title}
      </div>
      <div className="px-4 py-[6px]">{children}</div>
    </div>
  );
}

function PostCard({
  post,
  liked,
  bookmarked,
  onLike,
  onBookmark,
}: {
  post: NewsPost;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}) {
  const openArticle = () => {
    if (typeof window !== "undefined") window.location.href = `/news/${post.slug}`;
  };

  return (
    <article
      className="post-card-news"
      onClick={openArticle}
      role="article"
    >
      <div className="flex-shrink-0">
        <div
          className="w-[42px] h-[42px] rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}
        >
          <img src={favicon(post.domain, 64)} alt={post.source} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[6px] mb-1 flex-wrap">
          <span className="font-display text-sm font-extrabold" style={{ color: "var(--text)" }}>
            {post.source}
          </span>
          {VerifiedBadge}
          <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
            {post.handle}
          </span>
          <span className="ml-auto text-[12.5px] flex-shrink-0 tnum" style={{ color: "var(--text-3)" }}>
            {post.time}
          </span>
        </div>
        <div
          className="inline-flex text-[11px] font-extrabold uppercase tracking-[.05em] px-2 py-[2px] rounded-pill mb-[6px]"
          style={{
            color: post.tagColor,
            background: `${post.tagColor}18`,
            border: `1px solid ${post.tagColor}30`,
          }}
        >
          {post.tag}
        </div>
        <div className="text-[14.5px] leading-[1.6] mb-[10px] break-words" style={{ color: "var(--text)" }}>
          {post.text}
        </div>

        <div
          className="pc-embed cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            openArticle();
          }}
        >
          <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 160, background: post.cardImg }}>
            <div className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-1.5px", opacity: 0.15, color: "#fff" }}>
              {post.cardImgText}
            </div>
            {post.breaking && (
              <div
                className="absolute top-[10px] left-[10px] text-white font-display text-[10px] font-extrabold px-2 py-[3px] rounded-pill"
                style={{ background: "#ef4444", letterSpacing: ".05em" }}
              >
                BREAKING
              </div>
            )}
          </div>
          <div className="px-4 py-[14px]">
            <div className="text-[11px] font-bold uppercase tracking-[.06em] mb-1 flex items-center gap-[5px]" style={{ color: "var(--text-3)" }}>
              <img src={favicon(post.domain, 32)} alt={post.source} className="w-3 h-3 rounded-[2px]" />
              {post.source}
            </div>
            <div className="font-display text-sm font-extrabold mb-1 leading-[1.3]" style={{ letterSpacing: "-.2px", color: "var(--text)" }}>
              {post.cardTitle}
            </div>
            <div className="text-xs" style={{ color: "var(--text-3)" }}>
              {post.cardSource}
            </div>
          </div>
        </div>

        {post.tools.length > 0 && (
          <div className="flex items-center gap-[6px] flex-wrap mt-[6px] mb-2">
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>
              Related tools:
            </span>
            {post.tools.map((t) => (
              <Link
                key={t.name}
                href={`/tools/${t.name.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => e.stopPropagation()}
                className="post-tool-chip"
              >
                <img src={favicon(t.domain, 32)} alt={t.name} className="w-[14px] h-[14px] rounded-[3px] flex-shrink-0" />
                {t.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-0 mt-2">
          <button
            className="post-action"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Reply"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="tnum">{fmt(post.replies)}</span>
          </button>
          <button
            className="post-action repost"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Repost"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span className="tnum">{fmt(post.reposts)}</span>
          </button>
          <button
            className={`post-action like${liked ? " liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="tnum">{fmt(post.likes + (liked ? 1 : 0))}</span>
          </button>
          <button
            className={`post-action bookmark${bookmarked ? " saved" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark();
            }}
            aria-label={bookmarked ? "Unsave" : "Save"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button
            className="post-action ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(post.link);
              }
            }}
            aria-label="Share"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

"use client";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";

type Badge = "new" | "hot";

type MegaItem = {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  badge?: Badge;
};

type MegaLink = { label: string; href: string; count?: string };

type Feature = {
  eyebrow: string;
  imgLabel: string;
  imgBg: string;
  title: string;
  desc: string;
  ctaLabel: string;
  ctaHref: string;
};

type Panel = {
  key: "tools" | "discover" | "learn";
  label: string;
  cols: { title: string; items?: MegaItem[]; links?: MegaLink[] }[];
  feature: Feature;
};

const Icon = {
  grid: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  star: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.5 5.8 21 7 14 2 9.3 9 8.5 12 2" />
    </svg>
  ),
  up: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6m0 0l3-3m-3 3L9 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  ),
  bars: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  news: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  image: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  tag: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  book: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  bookmark: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  swap: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" />
      <path d="M8 3H3v5" />
      <path d="M21 3l-7 7" />
      <path d="M3 3l7 7" />
      <path d="M12 22v-8" />
    </svg>
  ),
};

export const PANELS: Panel[] = [
  {
    key: "tools",
    label: "Tools",
    cols: [
      {
        title: "Browse Tools",
        items: [
          { title: "All AI Tools", desc: "Browse 590+ hand-reviewed tools", href: "/", icon: Icon.grid },
          { title: "Top Rated", desc: "Highest-reviewed by users", href: "/top-rated", icon: Icon.star },
          { title: "New Arrivals", desc: "Just added this week", href: "/new", icon: Icon.up, badge: "new" },
          { title: "Model Leaderboard", desc: "Ranked by intelligence & cost", href: "/leaderboard", icon: Icon.bars },
        ],
      },
      {
        title: "Popular Categories",
        links: [
          { label: "Marketing", href: "/ai-tools/marketing-and-sales", count: "108" },
          { label: "Writing & Editing", href: "/ai-tools/writing-and-editing", count: "312" },
          { label: "Image Generation", href: "/ai-tools/image-generation", count: "218" },
          { label: "Code & Developer", href: "/ai-tools/code-and-developer", count: "187" },
          { label: "Video & Animation", href: "/ai-tools/video-and-animation", count: "142" },
          { label: "Audio & Music", href: "/ai-tools/audio-and-music", count: "96" },
        ],
      },
      {
        title: "By Pricing",
        links: [
          { label: "Free tools", href: "/ai-tools", count: "412" },
          { label: "Freemium", href: "/ai-tools", count: "1,184" },
          { label: "Paid", href: "/ai-tools", count: "628" },
          { label: "On sale 🔥", href: "/deals", count: "34" },
          { label: "All 80+ categories →", href: "/ai-tools" },
        ],
      },
    ],
    feature: {
      eyebrow: "Featured",
      imgLabel: "GPT-5",
      imgBg: "linear-gradient(135deg,#1e3a5f,#0052ff)",
      title: "Tool of the week",
      desc: "ChatGPT now runs on GPT-5 — 1M token context, real-time reasoning, and native web access.",
      ctaLabel: "View tool →",
      ctaHref: "/ai-tool/chatgpt",
    },
  },
  {
    key: "discover",
    label: "Discover",
    cols: [
      {
        title: "Stay Updated",
        items: [
          { title: "AI News Feed", desc: "Official updates, Twitter-style", href: "/news", icon: Icon.news, badge: "hot" },
          { title: "Images & Prompts", desc: "Copy prompts from every model", href: "/images", icon: Icon.image },
          { title: "Deals & Discounts", desc: "Verified coupon codes", href: "/deals", icon: Icon.tag, badge: "hot" },
        ],
      },
      {
        title: "Trending Now",
        links: [
          { label: "GPT-5 launch", href: "/news" },
          { label: "Claude 4.5 Opus", href: "/news" },
          { label: "Sora 2.0 video", href: "/news" },
          { label: "Cyberpunk prompts", href: "/images" },
          { label: "Black Friday deals 🔥", href: "/deals" },
        ],
      },
      {
        title: "Quick Links",
        links: [
          { label: "Model Leaderboard", href: "/leaderboard" },
          { label: "Methodology", href: "/leaderboard/methodology" },
          { label: "Browse Categories", href: "/ai-tools" },
          { label: "Submit a Tool", href: "/submit" },
        ],
      },
    ],
    feature: {
      eyebrow: "Newsletter",
      imgLabel: "📬",
      imgBg: "linear-gradient(135deg,#7c2d12,#ea580c)",
      title: "AI news, weekly",
      desc: "Join 28,000 readers getting the best AI tools and news every Tuesday.",
      ctaLabel: "Subscribe free →",
      ctaHref: "#",
    },
  },
  {
    key: "learn",
    label: "Learn",
    cols: [
      {
        title: "Editorial",
        items: [
          { title: "Blog", desc: "Guides, reviews & deep dives", href: "/blog", icon: Icon.book },
          { title: "AI Glossary", desc: "80+ AI terms explained simply", href: "/glossary", icon: Icon.bookmark, badge: "new" },
          { title: "Comparisons", desc: "Head-to-head tool battles", href: "/blog/perplexity-vs-chatgpt", icon: Icon.swap },
        ],
      },
      {
        title: "Popular Guides",
        links: [
          { label: "GPT-5 complete guide", href: "/blog/gpt-5-complete-guide" },
          { label: "Perplexity vs ChatGPT", href: "/blog/perplexity-vs-chatgpt" },
          { label: "Best free AI image tools", href: "/blog" },
          { label: "AI writing tools in 2026", href: "/blog" },
          { label: "Prompt engineering 101", href: "/blog" },
        ],
      },
      {
        title: "By Role",
        links: [
          { label: "For Writers", href: "/ai-tools" },
          { label: "For Developers", href: "/ai-tools" },
          { label: "For Marketers", href: "/ai-tools" },
          { label: "For Founders", href: "/ai-tools" },
          { label: "For Designers", href: "/ai-tools" },
        ],
      },
    ],
    feature: {
      eyebrow: "Editor's Pick",
      imgLabel: "VS",
      imgBg: "linear-gradient(135deg,#1a0533,#7c3aed)",
      title: "Perplexity vs ChatGPT",
      desc: "We tested both for 30 days across 12 tasks. Here's the honest verdict.",
      ctaLabel: "Read article →",
      ctaHref: "/blog/perplexity-vs-chatgpt",
    },
  },
];

function Badge({ kind, tBadge }: { kind: Badge; tBadge: (k: string) => string }) {
  return <span className={`mi-badge ${kind}`}>{kind === "new" ? tBadge("badge_new") : tBadge("badge_hot")}</span>;
}

/**
 * Maps the English source strings in PANELS to their megamenu.* message keys.
 * The PANELS data structure stays English-source so it can be reused for SEO
 * fallbacks, but every visible label/desc is looked up here at render time.
 */
const MEGAMENU_LABEL_KEYS: Record<string, string> = {
  // Column titles
  "Browse Tools":         "col_browse_tools",
  "Popular Categories":   "col_popular_categories",
  "By Pricing":           "col_by_pricing",
  "Stay Updated":         "col_stay_updated",
  "Trending Now":         "col_trending_now",
  "Quick Links":          "col_quick_links",
  "Editorial":            "col_editorial",
  "Popular Guides":       "col_popular_guides",
  "By Role":              "col_by_role",
  // Item titles
  "All AI Tools":         "all_ai_tools",
  "Top Rated":            "top_rated",
  "New Arrivals":         "new_arrivals",
  "Model Leaderboard":    "model_leaderboard",
  "AI News Feed":         "ai_news_feed",
  "Images & Prompts":     "images_prompts",
  "Deals & Discounts":    "deals_discounts",
  "Blog":                 "blog_item",
  "AI Glossary":          "glossary_item",
  "Comparisons":          "comparisons",
  // Item descriptions
  "Browse 590+ hand-reviewed tools":  "all_ai_tools_desc",
  "Highest-reviewed by users":        "top_rated_desc",
  "Just added this week":             "new_arrivals_desc",
  "Ranked by intelligence & cost":    "model_leaderboard_desc",
  "Official updates, Twitter-style":  "ai_news_feed_desc",
  "Copy prompts from every model":    "images_prompts_desc",
  "Verified coupon codes":            "deals_discounts_desc",
  "Guides, reviews & deep dives":     "blog_desc",
  "80+ AI terms explained simply":    "glossary_desc",
  "Head-to-head tool battles":        "comparisons_desc",
  // Links
  "Free tools":           "free_tools",
  "Freemium":             "freemium",
  "Paid":                 "paid",
  "On sale 🔥":           "on_sale",
  "All 80+ categories →":  "all_categories_arrow",
  "Submit a Tool":        "submit_a_tool",
  "Methodology":          "methodology",
  "Browse Categories":    "browse_categories",
  "For Writers":          "for_writers",
  "For Developers":       "for_developers",
  "For Marketers":        "for_marketers",
  "For Founders":         "for_founders",
  "For Designers":        "for_designers",
  // Feature card
  "Featured":             "featured",
  "Tool of the week":     "tool_of_week",
  "ChatGPT now runs on GPT-5 — 1M token context, real-time reasoning, and native web access.": "tool_of_week_desc",
  "View tool →":          "view_tool",
  "Newsletter":           "newsletter",
  "AI news, weekly":      "ai_news_weekly",
  "Join 28,000 readers getting the best AI tools and news every Tuesday.": "ai_news_weekly_desc",
  "Subscribe free →":     "subscribe_free",
  "Editor's Pick":        "editors_pick",
  "Read article →":       "read_article",
};

export function MegaPanel({
  panel,
  show,
  onClose,
  onEnter,
}: {
  panel: Panel;
  show: boolean;
  onClose: () => void;
  onEnter: () => void;
}) {
  const t = useTranslations("megamenu");
  /** Translate a known English label/desc via the dictionary; pass through unknown strings. */
  const tr = (s: string): string => {
    const key = MEGAMENU_LABEL_KEYS[s];
    return key ? t(key) : s;
  };
  return (
    <div className="mega-wrap" onMouseEnter={onEnter} onMouseLeave={onClose}>
      <div className={`mega${show ? " show" : ""}`}>
        <div className="mega-inner">
          {panel.cols.map((col) => (
            <div key={col.title} className="mega-col">
              <div className="mega-col-title">{tr(col.title)}</div>
              {col.items && (
                <div>
                  {col.items.map((it) => (
                    <Link key={it.title} href={it.href} className="mega-item" onClick={onClose}>
                      <div className="mi-icon">{it.icon}</div>
                      <div className="mi-body">
                        <div className="mi-title">
                          {tr(it.title)}
                          {it.badge && <Badge kind={it.badge} tBadge={t} />}
                        </div>
                        <div className="mi-desc">{tr(it.desc)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {col.links && (
                <div className="mega-links">
                  {col.links.map((l) => (
                    <Link key={l.label} href={l.href} className="mega-link" onClick={onClose}>
                      {tr(l.label)}
                      {l.count && <span className="count">{l.count}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mega-feature">
            <div className="mf-eyebrow">{tr(panel.feature.eyebrow)}</div>
            <div className="mf-img" style={{ background: panel.feature.imgBg }}>
              {panel.feature.imgLabel}
            </div>
            <div className="mf-title">{tr(panel.feature.title)}</div>
            <div className="mf-desc">{tr(panel.feature.desc)}</div>
            <Link href={panel.feature.ctaHref} className="mf-btn" onClick={onClose}>
              {tr(panel.feature.ctaLabel)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

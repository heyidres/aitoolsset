export type Topic =
  | "llm"
  | "image"
  | "video"
  | "code"
  | "audio"
  | "policy"
  | "research"
  | "cybersecurity"
  | "startup";

export type EditorialStatus = "draft" | "review" | "approved" | "published";

export type EditorialMeta = {
  status: EditorialStatus;
  /** When the AI drafted the article. Set by the cron/AI worker. */
  draftedAt?: number;
  /** Editor who approved. Set by the editor UI. */
  approvedBy?: string;
  /** When the editor approved. */
  approvedAt?: number;
  /** When the article was published live. */
  publishedAt?: number;
};

/**
 * Editorial draft fields produced by the Claude prompt in lib/news-ai-prompt.ts.
 * For RSS-only items these are empty; the page falls back to the RSS description.
 */
export type EditorialDraft = {
  seoTitle?: string;
  metaDescription?: string;
  introduction?: string;
  keyHighlights?: string[];
  body?: string; // HTML — Markdown is rendered server-side before storage
  expertCommentary?: string;
  faqs?: { q: string; a: string }[];
  internalLinks?: { label: string; href: string }[];
  citations?: { label: string; url: string }[];
};

export type FeedSource = {
  source: string;
  handle: string;
  domain: string;
  url: string;
  tagColor: string;
  defaultTag: string;
  official: boolean;
  /** If true, filter posts to only those mentioning AI keywords (for general-news feeds). */
  filterAI?: boolean;
};

export type NewsPost = {
  id: string;
  slug: string;
  source: string;
  handle: string;
  domain: string;
  tagColor: string;
  tag: string;
  topic: Topic;
  /** Higher-level categories used on the news hub index. */
  categories: string[];
  text: string;
  cardTitle: string;
  cardSource: string;
  cardImg: string;
  cardImgText: string;
  link: string;
  timestamp: number;
  time: string;
  likes: number;
  reposts: number;
  replies: number;
  breaking: boolean;
  tools: { name: string; domain: string }[];
  editorial: EditorialMeta;
  draft?: EditorialDraft;
};

export const FEEDS: FeedSource[] = [
  { source: "OpenAI", handle: "@OpenAI", domain: "openai.com", url: "https://openai.com/news/rss.xml", tagColor: "#0052ff", defaultTag: "Product", official: true },
  { source: "Google DeepMind", handle: "@GoogleDeepMind", domain: "deepmind.google", url: "https://deepmind.google/blog/rss.xml", tagColor: "#4285f4", defaultTag: "Research", official: true },
  { source: "Anthropic", handle: "@AnthropicAI", domain: "anthropic.com", url: "https://www.anthropic.com/news/feed.xml", tagColor: "#d97757", defaultTag: "Product", official: true },
  { source: "Hugging Face", handle: "@huggingface", domain: "huggingface.co", url: "https://huggingface.co/blog/feed.xml", tagColor: "#ff9d00", defaultTag: "Platform", official: true },
  { source: "MIT Tech Review", handle: "@techreview", domain: "technologyreview.com", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", tagColor: "#a3262d", defaultTag: "Analysis", official: false },
  { source: "TechCrunch AI", handle: "@TechCrunch", domain: "techcrunch.com", url: "https://techcrunch.com/category/artificial-intelligence/feed/", tagColor: "#00d96b", defaultTag: "News", official: false },
  { source: "The Verge", handle: "@verge", domain: "theverge.com", url: "https://www.theverge.com/rss/index.xml", tagColor: "#5200ff", defaultTag: "News", official: false, filterAI: true },
  { source: "VentureBeat AI", handle: "@VentureBeat", domain: "venturebeat.com", url: "https://venturebeat.com/category/ai/feed/", tagColor: "#ee2b34", defaultTag: "News", official: false },
];

const GRADIENTS = [
  "linear-gradient(135deg,#0f172a,#1e3a5f)",
  "linear-gradient(135deg,#0a3d62,#1a6bb5)",
  "linear-gradient(135deg,#1c1917,#7c3a20)",
  "linear-gradient(135deg,#0d1117,#6d28d9)",
  "linear-gradient(135deg,#0a2a4a,#0078d4)",
  "linear-gradient(135deg,#1a0a00,#b45309)",
  "linear-gradient(135deg,#1a1000,#92400e)",
  "linear-gradient(135deg,#062019,#065f46)",
  "linear-gradient(135deg,#0f2d1a,#166534)",
  "linear-gradient(135deg,#0f1f3d,#1d4ed8)",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function gradientFor(url: string): string {
  return GRADIENTS[hash(url) % GRADIENTS.length];
}

function fakeStats(url: string) {
  const r = hash(url);
  return {
    likes: 500 + (r % 9500),
    reposts: 100 + ((r >> 4) % 3000),
    replies: 50 + ((r >> 8) % 1000),
  };
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function extractTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1]).trim() : null;
}

function extractAttr(block: string, tag: string, attr: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["']`));
  return m ? m[1] : null;
}

function extractAtomLink(block: string): string | null {
  // <link rel="alternate" href="..."/> or <link href="..."/>
  const m = block.match(/<link[^>]*\s(?:href=["']([^"']+)["'])[^>]*>/);
  return m ? m[1] : null;
}

export function inferTopic(title: string, desc: string): Topic {
  const t = (title + " " + desc).toLowerCase();
  if (/\b(breach|hack|cve|vulnerab|exploit|ransomware|malware|phishing|cybersecurity|infosec|zero.?day|jailbreak|prompt.?injection)\b/.test(t)) return "cybersecurity";
  if (/\b(seed|series.[a-d]|funding|raised|valuation|ipo|acquired|acquisition|y combinator|yc.\d)\b/.test(t)) return "startup";
  if (/\b(sora|video|veo|runway|pika|kling|heygen)\b/.test(t)) return "video";
  if (/\b(dall.?e|midjourney|stable.?diffusion|flux|ideogram|leonardo|image gen|emu|firefly)\b/.test(t)) return "image";
  if (/\b(copilot|cursor|github|coding|programming|developer|code(?:base|gen)?)\b/.test(t)) return "code";
  if (/\b(elevenlabs|suno|udio|voice|audio|music|whisper|speech)\b/.test(t)) return "audio";
  if (/\b(regulation|act|law|policy|safety|alignment|govern|ethic|harm)\b/.test(t)) return "policy";
  if (/\b(research|paper|arxiv|study|benchmark|evaluation|technique|framework)\b/.test(t)) return "research";
  return "llm";
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function inferCategories(topic: Topic, breaking: boolean): string[] {
  const cats: string[] = [];
  if (breaking) cats.push("Breaking");
  const topicLabel: Record<Topic, string> = {
    llm: "AI Industry",
    image: "AI Industry",
    video: "AI Industry",
    code: "AI Industry",
    audio: "AI Industry",
    policy: "Policy",
    research: "Research",
    cybersecurity: "Cybersecurity",
    startup: "Startup",
  };
  cats.push(topicLabel[topic]);
  return cats;
}

export function formatTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function imgText(title: string): string {
  const w = title.split(/\s+/).filter((x) => x.length >= 2 && /^[A-Za-z0-9]+/.test(x));
  return w.slice(0, 2).join(" ") || title.slice(0, 8);
}

function isBreaking(title: string, desc: string, hoursOld: number): boolean {
  if (hoursOld > 12) return false;
  return /\b(launch|introduc|announc|releas|debut|unveil|breaking|live now)\b/i.test(title + " " + desc);
}

function makeItem(feed: FeedSource, title: string, link: string, pubDate: string | null, description: string | null): NewsPost | null {
  if (!title || !link) return null;
  const d = pubDate ? new Date(pubDate) : new Date();
  if (isNaN(d.getTime())) return null;
  // Drop posts older than 60 days
  if (Date.now() - d.getTime() > 60 * 86400000) return null;
  const cleanTitle = stripTags(title).trim();
  const cleanDesc = description ? stripTags(description).trim() : "";
  const truncatedDesc = cleanDesc.length > 280 ? cleanDesc.slice(0, 277) + "…" : cleanDesc;
  const topic = inferTopic(cleanTitle, cleanDesc);
  const stats = fakeStats(link);
  const hoursOld = (Date.now() - d.getTime()) / 3600000;
  const breaking = isBreaking(cleanTitle, cleanDesc, hoursOld);
  const slug = slugify(cleanTitle);
  return {
    id: `${feed.domain}-${hash(link)}`,
    slug,
    source: feed.source,
    handle: feed.handle,
    domain: feed.domain,
    tagColor: feed.tagColor,
    tag: feed.defaultTag,
    topic,
    categories: inferCategories(topic, breaking),
    text: truncatedDesc || cleanTitle,
    cardTitle: cleanTitle,
    cardSource: feed.domain,
    cardImg: gradientFor(link),
    cardImgText: imgText(cleanTitle),
    link,
    timestamp: d.getTime(),
    time: formatTime(d),
    likes: stats.likes,
    reposts: stats.reposts,
    replies: stats.replies,
    breaking,
    tools: [],
    editorial: {
      status: "published",
      draftedAt: d.getTime(),
      publishedAt: d.getTime(),
    },
  };
}

function parseFeed(xml: string, feed: FeedSource): NewsPost[] {
  const items: NewsPost[] = [];

  // RSS 2.0 items
  const itemRegex = /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate") ?? extractTag(block, "dc:date");
    const desc = extractTag(block, "description") ?? extractTag(block, "content:encoded");
    if (title && link) {
      const item = makeItem(feed, title, link, pubDate, desc);
      if (item) items.push(item);
    }
  }

  // Atom entries
  const entryRegex = /<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/g;
  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = extractTag(block, "title");
    const link = extractAtomLink(block) ?? extractTag(block, "id");
    const pubDate = extractTag(block, "published") ?? extractTag(block, "updated");
    const desc = extractTag(block, "summary") ?? extractTag(block, "content");
    if (title && link) {
      const item = makeItem(feed, title, link, pubDate, desc);
      if (item) items.push(item);
    }
  }

  return items;
}

const UA = "Mozilla/5.0 (compatible; AItoolssetBot/1.0; +https://aitoolsset.com/news)";

async function fetchFeed(feed: FeedSource): Promise<NewsPost[]> {
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": UA,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) {
      console.warn(`[news] ${feed.source}: HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    let items = parseFeed(xml, feed);
    if (feed.filterAI) {
      const aiRe = /\b(ai|gpt|llm|chatgpt|claude|openai|gemini|anthropic|copilot|midjourney|sora|deepmind|mistral|huggingface|hugging.face|nvidia|stable.diffusion|dall.?e|llama|machine.learning|neural|generative|prompt|agent)\b/i;
      items = items.filter((p) => aiRe.test(p.cardTitle + " " + p.text));
    }
    return items.slice(0, 5);
  } catch (e) {
    console.warn(`[news] ${feed.source} fetch failed:`, e instanceof Error ? e.message : e);
    return [];
  }
}

export async function fetchAllNews(): Promise<{ posts: NewsPost[]; live: number; total: number }> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const live = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => b.timestamp - a.timestamp);
  const liveCount = live.length;
  const merged = live.length >= 6 ? live : [...live, ...FALLBACK_POSTS.filter((f) => !live.some((l) => l.cardTitle === f.cardTitle))];
  return { posts: merged.slice(0, 30), live: liveCount, total: merged.length };
}

// Fallback static posts (used when feeds fail or aren't enough)
const FALLBACK_RAW = [
  { source: "OpenAI", handle: "@OpenAI", domain: "openai.com", tagColor: "#0052ff", tag: "Product Launch", topic: "llm" as Topic, text: "Introducing GPT-5 — our most capable model yet. 1M token context, real-time reasoning, and native web access. Available now for Plus and Pro users, rolling out to free tier next week.", title: "Introducing GPT-5 — OpenAI's most capable model", source_domain: "blog.openai.com", hours: 2, breaking: true, tools: [{ name: "ChatGPT", domain: "chat.openai.com" }] },
  { source: "Google DeepMind", handle: "@GoogleDeepMind", domain: "deepmind.google", tagColor: "#4285f4", tag: "Research", topic: "research" as Topic, text: "We're releasing our latest research on Chain-of-Thought 2.0 — a new reasoning paradigm that reduces hallucinations by 43% on MMLU benchmarks. Open-source weights available on HuggingFace.", title: "Chain-of-Thought 2.0: Reducing AI Hallucinations at Scale", source_domain: "deepmind.google", hours: 4, breaking: false, tools: [{ name: "Gemini", domain: "gemini.google.com" }] },
  { source: "Anthropic", handle: "@AnthropicAI", domain: "anthropic.com", tagColor: "#d97757", tag: "Product Launch", topic: "llm" as Topic, text: "Claude 4 is here. Extended thinking mode, computer use 2.0, and a 500K context window for all API users. We believe this is our safest and most capable model to date.", title: "Introducing Claude 4 — Extended Thinking & Computer Use 2.0", source_domain: "anthropic.com", hours: 6, breaking: true, tools: [{ name: "Claude", domain: "claude.ai" }] },
  { source: "OpenAI", handle: "@OpenAI", domain: "openai.com", tagColor: "#7c3aed", tag: "Video AI", topic: "video" as Topic, text: "Sora 2.0 is now available. Create up to 5 minutes of 4K video from text or images, with AI-generated synchronized audio and sound effects. Generating cinema-quality content from a prompt.", title: "Sora 2.0 — 4K Video Generation with AI Audio", source_domain: "openai.com/sora", hours: 6, breaking: false, tools: [{ name: "Sora", domain: "openai.com" }] },
  { source: "Microsoft AI", handle: "@MSFTAI", domain: "microsoft.com", tagColor: "#0078d4", tag: "Business", topic: "llm" as Topic, text: "Copilot Wave 3 brings autonomous task execution across Microsoft 365, real-time Python code execution, and Copilot Studio for enterprise customization. Starting rollout today.", title: "Microsoft Copilot Wave 3 — Autonomous Tasks & 365 Integration", source_domain: "microsoft.com/copilot", hours: 8, breaking: false, tools: [{ name: "Copilot", domain: "copilot.microsoft.com" }] },
  { source: "Mistral AI", handle: "@MistralAI", domain: "mistral.ai", tagColor: "#ff7000", tag: "Research", topic: "llm" as Topic, text: "Mixtral 9x22B is now open source. Our new sparse MoE model achieves GPT-4 level performance at 3x lower inference cost. Download on HuggingFace, deploy anywhere.", title: "Mixtral 9x22B — Open Source, GPT-4 Performance", source_domain: "mistral.ai", hours: 10, breaking: false, tools: [{ name: "Mistral", domain: "mistral.ai" }] },
  { source: "Hugging Face", handle: "@huggingface", domain: "huggingface.co", tagColor: "#ff9d00", tag: "Platform", topic: "research" as Topic, text: "We just hit 1 million public models on the Hub. From tiny 7B models to frontier 405B parameters — the open AI ecosystem has never been bigger. Browse the collection.", title: "Hugging Face Hub hits 1 million public AI models", source_domain: "huggingface.co", hours: 12, breaking: false, tools: [{ name: "Hugging Face", domain: "huggingface.co" }] },
  { source: "Google DeepMind", handle: "@GoogleDeepMind", domain: "deepmind.google", tagColor: "#4285f4", tag: "Video AI", topic: "video" as Topic, text: "Veo 3 now supports real-time video generation from live camera input. Directors can control lighting, depth of field, and camera movement with natural language instructions.", title: "Veo 3 — Real-time AI Video from Live Camera", source_domain: "deepmind.google", hours: 14, breaking: false, tools: [{ name: "Gemini", domain: "gemini.google.com" }] },
  { source: "Anthropic", handle: "@AnthropicAI", domain: "anthropic.com", tagColor: "#d97757", tag: "Policy", topic: "policy" as Topic, text: "We've published our updated responsible scaling policy following the EU AI Act enforcement start. Detailed transparency report, risk assessments, and capability evaluations now public.", title: "Anthropic's Updated Responsible Scaling Policy — 2026", source_domain: "anthropic.com/policy", hours: 16, breaking: false, tools: [] },
  { source: "Meta AI", handle: "@MetaAI", domain: "meta.ai", tagColor: "#1877f2", tag: "Image AI", topic: "image" as Topic, text: "Introducing Emu Edit 2 — our best image editing model. Describe any change in natural language and watch your photo transform. Preserves context while applying targeted edits.", title: "Emu Edit 2 — Natural Language Image Editing", source_domain: "ai.meta.com", hours: 18, breaking: false, tools: [{ name: "Meta AI", domain: "meta.ai" }] },
];

const FALLBACK_POSTS: NewsPost[] = FALLBACK_RAW.map((r) => {
  const timestamp = Date.now() - r.hours * 3600000;
  const link = `https://${r.domain}/seed-${hash(r.title)}`;
  return {
    id: `fallback-${hash(r.title)}`,
    slug: slugify(r.title),
    source: r.source,
    handle: r.handle,
    domain: r.domain,
    tagColor: r.tagColor,
    tag: r.tag,
    topic: r.topic,
    categories: inferCategories(r.topic, r.breaking),
    text: r.text,
    cardTitle: r.title,
    cardSource: r.source_domain,
    cardImg: gradientFor(link),
    cardImgText: imgText(r.title),
    link,
    timestamp,
    time: formatTime(new Date(timestamp)),
    likes: fakeStats(link).likes,
    reposts: fakeStats(link).reposts,
    replies: fakeStats(link).replies,
    breaking: r.breaking,
    tools: r.tools,
    editorial: {
      status: "published",
      draftedAt: timestamp,
      publishedAt: timestamp,
    },
  };
});

/**
 * Find a single news post by slug — used by /news/[slug] dynamic route.
 * Returns null if no match. Walks the same fetched feed list /news uses,
 * so it picks up RSS items + fallback data identically.
 */
export async function findPostBySlug(slug: string): Promise<NewsPost | null> {
  const { posts } = await fetchAllNews();
  return posts.find((p) => p.slug === slug) ?? null;
}

/**
 * For generateStaticParams — returns all known slugs.
 * In production this should be capped to the most recent N (e.g. 100)
 * to keep the static build fast.
 */
export async function allSlugs(): Promise<string[]> {
  const { posts } = await fetchAllNews();
  return posts.map((p) => p.slug);
}

export const TRENDING_TOPICS = [
  { cat: "LLMs · Trending", topic: "GPT-5", posts: "28.4K posts" },
  { cat: "Video AI · Trending", topic: "Sora 2.0", posts: "14.2K posts" },
  { cat: "Google · Trending", topic: "Gemini 2.5", posts: "11.7K posts" },
  { cat: "Code AI · Trending", topic: "#CursorIDE", posts: "8.9K posts" },
  { cat: "Policy · Trending", topic: "EU AI Act", posts: "6.3K posts" },
  { cat: "Image AI", topic: "Midjourney V7", posts: "5.1K posts" },
];

export const FOLLOW_LIST = FEEDS.slice(0, 5).map((f) => ({
  name: f.source,
  handle: f.handle,
  domain: f.domain,
}));

export type Tool = {
  id: string;
  name: string;
  domain: string;
  cat: string;
  tags: string[];
  desc: string;
  saves: number;
  free: boolean;
  trending: boolean;
  featured: boolean;
  trendPct: number | null;
  link: string;
  verified: boolean;
  deal: { label: string; expires: string } | null;
};

export const TOOLS: Tool[] = [
  { id: "chatgpt", name: "ChatGPT", domain: "chat.openai.com", cat: "chat", tags: ["Chat", "Writing"], desc: "The world's leading AI for writing, coding, brainstorming, and creative tasks. Trusted by millions globally.", saves: 6338, free: true, trending: false, featured: true, trendPct: null, link: "/tools/chatgpt", verified: true, deal: null },
  { id: "midjourney", name: "Midjourney", domain: "midjourney.com", cat: "image", tags: ["Image"], desc: "Transform text descriptions into breathtaking imagery. The gold standard for AI art generation.", saves: 3887, free: false, trending: true, featured: true, trendPct: 184, link: "/tools/midjourney", verified: true, deal: { label: "20% off annual", expires: "May 15" } },
  { id: "claude", name: "Claude", domain: "claude.ai", cat: "chat", tags: ["Chat", "Writing"], desc: "Anthropic's thoughtful AI for nuanced reasoning, long-context analysis, and safe, helpful responses.", saves: 2807, free: true, trending: false, featured: true, trendPct: null, link: "/tools/claude", verified: true, deal: null },
  { id: "perplexity", name: "Perplexity", domain: "perplexity.ai", cat: "research", tags: ["Search", "Research"], desc: "AI-powered search engine that finds, summarizes, and cites trustworthy information in real time.", saves: 1317, free: true, trending: false, featured: true, trendPct: null, link: "/tools/perplexity", verified: true, deal: { label: "3 months free Pro", expires: "May 31" } },
  { id: "cursor", name: "Cursor", domain: "cursor.sh", cat: "code", tags: ["Code"], desc: "The AI-first IDE. Write, debug, and refactor code with an AI that understands your entire codebase.", saves: 1289, free: true, trending: true, featured: true, trendPct: 121, link: "/tools/cursor", verified: true, deal: null },
  { id: "runway", name: "Runway", domain: "runwayml.com", cat: "video", tags: ["Video"], desc: "Professional-grade AI video generation, editing, and visual effects for filmmakers and creators.", saves: 741, free: false, trending: false, featured: true, trendPct: null, link: "/tools/runway", verified: false, deal: { label: "50% off first month", expires: "May 5" } },
  { id: "suno", name: "Suno", domain: "suno.ai", cat: "audio", tags: ["Audio", "Music"], desc: "Create full-length, radio-quality songs from a text prompt. Lyrics, melody, and mastering — all AI.", saves: 698, free: true, trending: true, featured: true, trendPct: 197, link: "/tools/suno", verified: true, deal: null },
  { id: "elevenlabs", name: "ElevenLabs", domain: "elevenlabs.io", cat: "audio", tags: ["Voice", "Audio"], desc: "Ultra-realistic AI voice cloning and text-to-speech in 32 languages. Industry-leading voice AI.", saves: 612, free: true, trending: false, featured: true, trendPct: null, link: "/tools/elevenlabs", verified: true, deal: { label: "30% off Starter plan", expires: "Jun 1" } },
  { id: "v0", name: "v0 by Vercel", domain: "v0.dev", cat: "code", tags: ["Code", "Design"], desc: "Generate production-ready React + Tailwind UI components from natural language descriptions.", saves: 589, free: true, trending: true, featured: false, trendPct: 156, link: "/tools/v0", verified: false, deal: null },
  { id: "gemini", name: "Google Gemini", domain: "gemini.google.com", cat: "chat", tags: ["Chat", "Research"], desc: "Google's multimodal AI for reasoning across text, images, audio, video, and code simultaneously.", saves: 1177, free: true, trending: false, featured: false, trendPct: null, link: "/tools/gemini", verified: true, deal: null },
  { id: "ideogram", name: "Ideogram v3", domain: "ideogram.ai", cat: "image", tags: ["Image"], desc: "Typography-first image generation. Perfect text rendering inside images — best-in-class for design.", saves: 441, free: true, trending: true, featured: false, trendPct: 284, link: "/tools/ideogram", verified: false, deal: { label: "Free Pro trial — 7 days", expires: "May 20" } },
  { id: "kling", name: "Kling AI 2.0", domain: "klingai.com", cat: "video", tags: ["Video"], desc: "High-fidelity video generation from images and text with physics-accurate motion and cinematic quality.", saves: 388, free: false, trending: true, featured: false, trendPct: 197, link: "/tools/kling", verified: false, deal: null },
];

export const TRUSTED_LOGOS = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Notion", domain: "notion.so" },
  { name: "Figma", domain: "figma.com" },
  { name: "Vercel", domain: "vercel.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  { name: "HubSpot", domain: "hubspot.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Harvard", domain: "harvard.edu" },
];

export const FILTER_PILLS = [
  { key: "all", label: "All Tools" },
  { key: "writing", label: "Writing" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "code", label: "Code" },
  { key: "audio", label: "Audio" },
  { key: "productivity", label: "Productivity" },
  { key: "research", label: "Research" },
  { key: "design", label: "Design" },
  { key: "marketing", label: "Marketing" },
  { key: "free", label: "🟢 Free only" },
];

export const CATEGORIES = [
  { name: "Writing & Editing", count: 318 },
  { name: "Image Generation", count: 241 },
  { name: "Video", count: 206 },
  { name: "Code & Developer", count: 222 },
  { name: "Marketing", count: 231 },
  { name: "Productivity", count: 657 },
  { name: "Audio & Music", count: 165 },
  { name: "Research & Data", count: 187 },
  { name: "Design & Creative", count: 194 },
  { name: "Business & Finance", count: 198 },
  { name: "Education", count: 129 },
  { name: "Automation", count: 499 },
];

export const WRITER_TOOLS = [
  { name: "ChatGPT", domain: "chat.openai.com", tag: "Free" },
  { name: "Claude", domain: "claude.ai", tag: "Free tier" },
  { name: "Jasper AI", domain: "jasper.ai", tag: "Paid" },
  { name: "Copy.ai", domain: "copy.ai", tag: "Free tier" },
];

export const DEV_TOOLS = [
  { name: "Cursor", domain: "cursor.sh", tag: "Free tier" },
  { name: "v0 by Vercel", domain: "v0.dev", tag: "Free tier" },
  { name: "Bolt.new", domain: "bolt.new", tag: "Free tier" },
  { name: "GitHub Copilot", domain: "github.com", tag: "Paid" },
];

export const WRITER_USECASES = [
  { name: "Long-form writing", desc: "Articles, reports, and in-depth content at scale", label: "GPT", grad: "linear-gradient(135deg,#1e3a5f,#0052ff)" },
  { name: "SEO content", desc: "Rank-ready blog posts with AI keyword integration", label: "SEO", grad: "linear-gradient(135deg,#1a1a2e,#7c3aed)" },
  { name: "Email copy", desc: "Subject lines, sequences, and cold outreach", label: "📧", grad: "linear-gradient(135deg,#0f2027,#203a43)" },
  { name: "Social media", desc: "Threads, tweets, and LinkedIn posts in seconds", label: "✍️", grad: "linear-gradient(135deg,#1e3c72,#2a5298)" },
];

export const DEV_USECASES = [
  { name: "AI coding IDEs", desc: "Write, debug, and deploy with AI assistance", label: "IDE", grad: "linear-gradient(135deg,#0a0a0a,#1a1a2e)" },
  { name: "API tools", desc: "Integrate AI into your apps in minutes", label: "API", grad: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
  { name: "UI generation", desc: "From prompt to production React in seconds", label: "UI", grad: "linear-gradient(135deg,#1a0533,#4c1d95)" },
  { name: "Code review", desc: "AI-powered bug detection and refactoring", label: "🐛", grad: "linear-gradient(135deg,#022c22,#065f46)" },
];

export type NewsItem = {
  source: string;
  category: string;
  sourceDomain: string;
  title: string;
  excerpt?: string;
  time: string;
  read: string;
  imgLabel: string;
  imgGrad: string;
  breaking?: boolean;
  toolChip?: { name: string; domain: string };
};

export const NEWS_MAIN: NewsItem = {
  source: "OpenAI",
  category: "Product Launch",
  sourceDomain: "openai.com",
  title: "OpenAI launches GPT-5 with 1M token context and real-time reasoning",
  excerpt: "The next generation of OpenAI's flagship model brings a 10x larger context window, improved reasoning, and native real-time web access without plugins.",
  time: "2 hours ago",
  read: "5 min read",
  imgLabel: "GPT-5",
  imgGrad: "linear-gradient(135deg,#0f172a,#1e3a5f)",
  breaking: true,
  toolChip: { name: "ChatGPT", domain: "chat.openai.com" },
};

export const NEWS_SIDE: NewsItem[] = [
  { source: "Google DeepMind", category: "Research", sourceDomain: "deepmind.google", title: "DeepMind releases Gemini 2.5 with new multimodal capabilities", time: "4 hours ago", read: "3 min read", imgLabel: "Gem", imgGrad: "linear-gradient(135deg,#0a3d62,#1a6bb5)" },
  { source: "Anthropic", category: "Product Launch", sourceDomain: "anthropic.com", title: "Claude 4 launches with extended thinking and computer use 2.0", time: "6 hours ago", read: "4 min read", imgLabel: "Cla", imgGrad: "linear-gradient(135deg,#1c1917,#7c3a20)" },
  { source: "OpenAI", category: "Video AI", sourceDomain: "openai.com", title: "Sora 2.0 now supports 4K output and 5-minute video generation", time: "6 hours ago", read: "2 min read", imgLabel: "Sora", imgGrad: "linear-gradient(135deg,#0d1117,#6d28d9)" },
  { source: "Mistral AI", category: "Research", sourceDomain: "mistral.ai", title: "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost", time: "10 hours ago", read: "3 min read", imgLabel: "Mixtral", imgGrad: "linear-gradient(135deg,#1a0a00,#b45309)" },
];

export type BlogPost = {
  tag: string;
  tagColor: string;
  title: string;
  author: string;
  authorInitials: string;
  authorBg: string;
  authorFg: string;
  date: string;
  read: string;
  imgLabel: string;
  imgGrad: string;
  slug: string;
};

export const BLOG_POSTS: BlogPost[] = [
  { tag: "Guide", tagColor: "#0052ff", title: "GPT-5 complete guide: everything you need to know", author: "Alex Johnson", authorInitials: "AJ", authorBg: "#dbeafe", authorFg: "#1d4ed8", date: "May 4", read: "8 min", imgLabel: "GPT-5", imgGrad: "linear-gradient(135deg,#0f172a,#1e3a5f)", slug: "gpt-5-complete-guide" },
  { tag: "Comparison", tagColor: "#7c3aed", title: "ChatGPT vs Claude 4 in 2026: which AI wins?", author: "Sarah Park", authorInitials: "SP", authorBg: "#fce7f3", authorFg: "#db2777", date: "May 1", read: "12 min", imgLabel: "vs", imgGrad: "linear-gradient(135deg,#1a0533,#4c1d95)", slug: "chatgpt-vs-claude-4" },
  { tag: "Roundup", tagColor: "#059669", title: "The 7 best free AI tools for marketers in 2026", author: "Priya Nair", authorInitials: "PN", authorBg: "#d1fae5", authorFg: "#059669", date: "Apr 25", read: "9 min", imgLabel: "Tools", imgGrad: "linear-gradient(135deg,#022c22,#065f46)", slug: "best-free-ai-marketing-tools" },
];

export function favicon(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

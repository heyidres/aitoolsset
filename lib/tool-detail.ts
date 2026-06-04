export type ToolDetail = {
  tagline: string;
  category: string;
  badges: string[];
  features: { title: string; desc: string }[];
  pros: string[];
  cons: string[];
  plans: { name: string; price: string; period: string; popular?: boolean; feats: string[] }[];
  reviews: { name: string; role: string; date: string; rating: number; text: string; helpful: number; notHelpful: number; bg: string; fg: string; initials: string }[];
  alternatives: { name: string; domain: string; cat: string; free: boolean }[];
  tags: string[];
  quickInfo: { label: string; val: string; cls?: "green" | "blue" }[];
  weeklyUsers: string;
  startingPrice: string;
  launched: string;
  madeBy: string;
  socials: { kind: string; url: string }[];
  whatIs: { p: string }[];
};

export const DEFAULT_TOOL_DETAIL: ToolDetail = {
  tagline: "The world's most used AI — write, code, analyze, and create with OpenAI's flagship model.",
  category: "AI Chat",
  badges: ["Free tier available", "AI Chat", "Writing", "Code"],
  features: [
    { title: "Advanced Writing", desc: "From blog posts to screenplays, emails to academic papers — with full tone, style, and length control." },
    { title: "Code Generation & Debugging", desc: "Write, fix, and explain code in 20+ languages. Includes a live code interpreter for running Python." },
    { title: "Real-time Web Browsing", desc: "Search the internet and get up-to-date, cited answers with no knowledge cutoff (Plus only)." },
    { title: "Image Generation", desc: "Create high-quality visuals with DALL·E 3 directly from the chat interface." },
    { title: "Data Analysis", desc: "Upload CSVs, PDFs, and files. ChatGPT reads, analyzes, and creates charts from your data." },
    { title: "Custom GPTs", desc: "Build or use specialized AI agents from the GPT Store for any task or workflow." },
    { title: "Voice Mode", desc: "Real-time voice conversations with natural-sounding speech (mobile & desktop)." },
    { title: "API Access", desc: "Full programmatic access for developers to build apps and integrations on top of GPT models." },
  ],
  pros: [
    "Most capable free AI — GPT-3.5 at zero cost",
    "Extremely versatile across writing, code, analysis",
    "Huge GPT Store ecosystem with thousands of agents",
    "Excellent code generation and debugging",
    "Continuous model updates from OpenAI",
    "Strong API for developers",
  ],
  cons: [
    "Best features locked behind $20/month Plus",
    "Can hallucinate facts confidently",
    "Free tier has usage limits and slower speeds",
    "Knowledge cutoff without browsing enabled",
    "Occasionally overly cautious on sensitive topics",
  ],
  plans: [
    { name: "Free", price: "$0", period: "/month", feats: ["GPT-3.5 access", "Basic chat and writing", "Limited message volume", "Standard speed"] },
    { name: "Plus", price: "$20", period: "/month", popular: true, feats: ["GPT-4o (latest model)", "DALL·E 3 image gen", "Web browse + data analysis", "All GPTs + priority speed"] },
    { name: "Team", price: "$25", period: "/user/mo", feats: ["Everything in Plus", "Higher usage limits", "Admin console", "Data privacy for business"] },
  ],
  reviews: [
    { name: "James Mitchell", role: "Software Engineer", date: "April 12, 2026", rating: 5, text: "ChatGPT Plus has completely changed how I write code. GPT-4o is incredibly capable — I use it daily for debugging, code review, and architecture discussions. The code interpreter is a game changer for data analysis. Worth every penny of the $20/month.", helpful: 42, notHelpful: 3, bg: "#dbeafe", fg: "#1d4ed8", initials: "JM" },
    { name: "Sarah Park", role: "Content Strategist", date: "April 8, 2026", rating: 5, text: "I was skeptical at first, but ChatGPT has become my most-used tool for content creation. The custom instructions feature helps it maintain a consistent brand voice. I use it for everything from ideation to final edits.", helpful: 28, notHelpful: 1, bg: "#fce7f3", fg: "#db2777", initials: "SP" },
    { name: "Alex Rivera", role: "Startup Founder", date: "March 29, 2026", rating: 4, text: "Excellent tool, but the free tier is quite limited now. If you're serious about using it, you'll need Plus. Always double-check important facts. Still the most capable AI for my use cases.", helpful: 19, notHelpful: 2, bg: "#d1fae5", fg: "#059669", initials: "AR" },
  ],
  alternatives: [
    { name: "Claude", domain: "claude.ai", cat: "AI Chat · Anthropic", free: true },
    { name: "Google Gemini", domain: "gemini.google.com", cat: "AI Chat · Google", free: true },
    { name: "Perplexity", domain: "perplexity.ai", cat: "AI Search", free: true },
    { name: "MS Copilot", domain: "copilot.microsoft.com", cat: "AI Chat · Microsoft", free: true },
  ],
  tags: ["AI Chat", "Writing", "Code", "GPT-4o", "OpenAI", "Research", "Image Gen", "Data Analysis", "API", "Free"],
  quickInfo: [
    { label: "Made by", val: "OpenAI" },
    { label: "Pricing", val: "Free + Paid", cls: "green" },
    { label: "Starts at", val: "$0 / month" },
    { label: "API", val: "Available", cls: "green" },
    { label: "Mobile app", val: "iOS & Android", cls: "green" },
    { label: "Browser ext.", val: "Yes", cls: "green" },
    { label: "Last updated", val: "Apr 2026" },
  ],
  weeklyUsers: "200M+",
  startingPrice: "Free",
  launched: "Nov 2022",
  madeBy: "OpenAI",
  socials: [
    { kind: "x", url: "#" },
    { kind: "linkedin", url: "#" },
    { kind: "github", url: "#" },
    { kind: "youtube", url: "#" },
  ],
  whatIs: [
    { p: "**ChatGPT** is OpenAI's flagship conversational AI, launched in November 2022. It quickly became the fastest-growing consumer application in history, reaching 100 million users in just two months. Built on the GPT-4 architecture, it can write, code, analyze data, answer questions, and assist with a vast range of creative and professional tasks." },
    { p: "The free tier gives access to GPT-3.5, while ChatGPT Plus ($20/month) unlocks GPT-4o — OpenAI's most capable model — with faster responses, image analysis, web browsing, code execution, and DALL·E 3 image generation." },
  ],
};

export const REVIEW_BREAKDOWN = [
  { star: 5, pct: 78, count: 1826 },
  { star: 4, pct: 14, count: 328 },
  { star: 3, pct: 5, count: 117 },
  { star: 2, pct: 2, count: 47 },
  { star: 1, pct: 1, count: 23 },
];

export type Deal = {
  tool: string;
  cat: "writing" | "image" | "video" | "code" | "audio" | "productivity";
  domain: string;
  pct: number;
  txt: string;
  headline: string;
  desc: string;
  savings: number;
  code: string | null;
  expires: string;
  uses: string;
  verified: boolean;
  exclusive: boolean;
  bf: boolean;
};

export const DEALS: Deal[] = [
  { tool: "Midjourney", cat: "image", domain: "midjourney.com", pct: 40, txt: "off annual Pro", headline: "Annual Pro · Save $96/year", desc: "Get 40% off the Annual Pro plan from Midjourney. Best-in-class AI image generation at the lowest yearly price of 2026.", savings: 96, code: "AITOOLS40", expires: "Jun 1, 2026", uses: "1,240 used", verified: true, exclusive: false, bf: false },
  { tool: "Cursor", cat: "code", domain: "cursor.sh", pct: 50, txt: "off first 3 months", headline: "3 months Pro at half price", desc: "Cursor Pro at 50% off for your first 3 months. The AI IDE that has replaced Copilot for most pro developers.", savings: 60, code: "CURSORSET50", expires: "Limited", uses: "3,418 used", verified: true, exclusive: true, bf: false },
  { tool: "ElevenLabs", cat: "audio", domain: "elevenlabs.io", pct: 30, txt: "off Starter plan", headline: "30% off any annual plan", desc: "AI voice cloning and text-to-speech in 32 languages. Industry-leading audio realism, now at a 30% annual discount.", savings: 78, code: "VOICE30", expires: "Jun 30, 2026", uses: "612 used", verified: true, exclusive: false, bf: false },
  { tool: "Runway", cat: "video", domain: "runwayml.com", pct: 25, txt: "off Unlimited plan", headline: "AI video generation discount", desc: "Professional AI video generation and editing suite. 25% off the Unlimited plan that gives you unrestricted generation credits.", savings: 225, code: null, expires: "May 31, 2026", uses: "487 used", verified: true, exclusive: false, bf: false },
  { tool: "Notion AI", cat: "productivity", domain: "notion.so", pct: 50, txt: "off Plus + AI", headline: "50% off first year", desc: "Notion + Notion AI bundle at 50% off your first year. The complete workspace with AI writing, summaries, and Q&A built in.", savings: 120, code: "NOTIONAI50", expires: "Black Friday 2026", uses: "2,108 used", verified: true, exclusive: false, bf: true },
  { tool: "Perplexity", cat: "productivity", domain: "perplexity.ai", pct: 100, txt: "free first 3 months", headline: "Free 3 months of Pro", desc: "Perplexity Pro free for 3 months — full access to GPT-5, Claude 4, image gen, and file uploads. Exclusive to AI Tools Set.", savings: 60, code: "PERPLEX3FREE", expires: "Jun 15, 2026", uses: "8,420 used", verified: true, exclusive: true, bf: false },
  { tool: "Ideogram", cat: "image", domain: "ideogram.ai", pct: 35, txt: "off annual Pro", headline: "Typography-first image AI", desc: "Ideogram v3 at 35% off the annual plan. The image AI that nails typography inside images — best for logos and graphic design.", savings: 84, code: "IDEO35", expires: "Jun 10, 2026", uses: "298 used", verified: true, exclusive: false, bf: false },
  { tool: "Suno", cat: "audio", domain: "suno.ai", pct: 60, txt: "off Pro annual", headline: "Black Friday — AI music", desc: "Suno Pro at 60% off the annual plan during Black Friday week only. Create full-length, radio-quality songs from a text prompt.", savings: 144, code: "BFSUNO60", expires: "Nov 30, 2026", uses: "New", verified: true, exclusive: false, bf: true },
  { tool: "Jasper AI", cat: "writing", domain: "jasper.ai", pct: 30, txt: "off Creator plan", headline: "Save on AI marketing copy", desc: "Jasper Creator plan at 30% off — the full AI marketing platform with brand voice, templates, and SEO mode. Best for marketing teams.", savings: 140, code: "AITSJASPER30", expires: "Jun 20, 2026", uses: "341 used", verified: true, exclusive: true, bf: false },
  { tool: "v0 by Vercel", cat: "code", domain: "v0.dev", pct: 50, txt: "off Pro", headline: "AI UI generation, half price", desc: "Generate production-ready React + Tailwind UI components at 50% off. Promo extended through summer for AI Tools Set readers.", savings: 120, code: "V0AITS", expires: "Aug 1, 2026", uses: "672 used", verified: true, exclusive: true, bf: false },
  { tool: "HeyGen", cat: "video", domain: "heygen.com", pct: 45, txt: "off Creator", headline: "AI video avatars", desc: "HeyGen Creator plan at 45% off — AI video avatars and instant translation for marketing, training, and YouTube content.", savings: 156, code: "HGEN45", expires: "May 31, 2026", uses: "112 used", verified: true, exclusive: false, bf: true },
  { tool: "ChatGPT Plus", cat: "productivity", domain: "chat.openai.com", pct: 20, txt: "off student plan", headline: "Student verified discount", desc: "ChatGPT Plus at $16/month (instead of $20) with valid student verification. GPT-5 access, image gen, and code interpreter included.", savings: 48, code: null, expires: "Ongoing", uses: "1,890 used", verified: true, exclusive: false, bf: false },
];

export const DEAL_FILTERS = [
  { key: "bf", label: "Black Friday", bf: true },
  { key: "all", label: "All deals" },
  { key: "exclusive", label: "⭐ Exclusive" },
  { key: "writing", label: "✍️ Writing" },
  { key: "image", label: "🎨 Image" },
  { key: "video", label: "🎬 Video" },
  { key: "code", label: "💻 Code" },
  { key: "audio", label: "🎵 Audio" },
  { key: "productivity", label: "⚡ Productivity" },
];

export type DetailTool = {
  name: string;
  by: string;
  desc: string;
  price: "Free" | "Freemium" | "Paid";
  sub: string;
  rating: number;
  reviews: number;
  verified: boolean;
  tags: string[];
  /** Tool detail slug — cards link to /ai-tool/[slug] when present. */
  slug?: string;
  /** Real save count for the shared ToolCard's ♥ counter. */
  saves?: number;
};

export const MARKETING_TOOLS: DetailTool[] = [
  { name: "Copy.ai", by: "copy.ai", desc: "Free AI copywriting platform — blog intros, ad headlines, product descriptions, and 90+ templates.", price: "Freemium", sub: "Copywriting", rating: 4.6, reviews: 1842, verified: true, tags: ["GPT-4", "Free tier"] },
  { name: "Surfer SEO", by: "surferseo.com", desc: "AI SEO writer that analyses top-ranking pages and helps you outrank them with on-page optimisation.", price: "Paid", sub: "SEO", rating: 4.7, reviews: 1296, verified: true, tags: ["SERP analysis", "Content"] },
  { name: "Writesonic", by: "writesonic.com", desc: "AI writing assistant for blog posts, ads, product descriptions, and full SEO articles in 25+ languages.", price: "Freemium", sub: "Copywriting", rating: 4.5, reviews: 982, verified: true, tags: ["Multi-language"] },
  { name: "Mailchimp AI", by: "mailchimp.com", desc: "AI-powered email subject lines, send-time optimisation, content generation, and audience segmentation.", price: "Freemium", sub: "Email", rating: 4.4, reviews: 3104, verified: true, tags: ["Email", "Automation"] },
  { name: "HubSpot AI", by: "hubspot.com", desc: "Full-funnel marketing AI — content generation, email, CRM enrichment, and predictive lead scoring.", price: "Paid", sub: "Analytics", rating: 4.6, reviews: 2287, verified: true, tags: ["CRM", "B2B"] },
  { name: "Frase.io", by: "frase.io", desc: "Research, outline, and write SEO-optimised content that ranks. Includes content briefs and SERP analysis.", price: "Paid", sub: "SEO", rating: 4.5, reviews: 721, verified: true, tags: ["SEO", "Briefs"] },
  { name: "AdCreative.ai", by: "adcreative.ai", desc: "Generate conversion-focused ad creatives for Facebook, Google, and LinkedIn in seconds.", price: "Paid", sub: "Ads", rating: 4.3, reviews: 614, verified: false, tags: ["Ads", "Creative"] },
  { name: "Hootsuite AI", by: "hootsuite.com", desc: "AI-assisted social media scheduling, content suggestions, hashtag generation, and analytics.", price: "Paid", sub: "Social", rating: 4.2, reviews: 1547, verified: true, tags: ["Social", "Scheduling"] },
  { name: "Buffer AI", by: "buffer.com", desc: "Free social media scheduler with AI content assistant for captions and post variations.", price: "Freemium", sub: "Social", rating: 4.4, reviews: 892, verified: true, tags: ["Free tier", "Captions"] },
  { name: "Lavender", by: "lavender.ai", desc: "AI email coach that helps sales and marketing teams write better cold emails in real-time.", price: "Paid", sub: "Email", rating: 4.6, reviews: 432, verified: true, tags: ["Sales", "Cold email"] },
  { name: "Anyword", by: "anyword.com", desc: "Predictive AI copywriter — generates copy variations and scores their performance before you publish.", price: "Paid", sub: "Copywriting", rating: 4.4, reviews: 387, verified: false, tags: ["Predictive", "A/B test"] },
  { name: "GrowthBar", by: "growthbarseo.com", desc: "AI-powered SEO tool with keyword research, content scoring, and one-click blog outlines.", price: "Paid", sub: "SEO", rating: 4.3, reviews: 264, verified: false, tags: ["Keywords", "SEO"] },
  { name: "Smartwriter", by: "smartwriter.ai", desc: "AI cold email personalisation at scale — researches prospects and writes individualised pitches.", price: "Paid", sub: "Email", rating: 4.2, reviews: 178, verified: false, tags: ["Cold email", "Personalisation"] },
  { name: "Predis.ai", by: "predis.ai", desc: "AI social media post generator — creates carousels, videos, and captions for Instagram and LinkedIn.", price: "Freemium", sub: "Social", rating: 4.3, reviews: 521, verified: true, tags: ["Instagram", "Carousels"] },
  { name: "Canva Magic Write", by: "canva.com", desc: "Built-in AI copywriter inside Canva — generate captions, taglines, and social copy with one click.", price: "Free", sub: "Copywriting", rating: 4.5, reviews: 2104, verified: true, tags: ["Free", "Design"] },
  { name: "Persado", by: "persado.com", desc: "Enterprise AI marketing language generator — proven to lift conversion rates by 41% on average.", price: "Paid", sub: "Copywriting", rating: 4.4, reviews: 142, verified: true, tags: ["Enterprise", "Conversion"] },
  { name: "Smartly.io", by: "smartly.io", desc: "AI-driven ad automation platform for Meta, TikTok, Pinterest, and Snapchat — used by Fortune 500 brands.", price: "Paid", sub: "Ads", rating: 4.5, reviews: 218, verified: true, tags: ["Enterprise", "Multi-channel"] },
  { name: "Mutiny", by: "mutinyhq.com", desc: "AI website personalisation — segment, personalise, and convert B2B traffic without a developer.", price: "Paid", sub: "Analytics", rating: 4.6, reviews: 96, verified: true, tags: ["B2B", "Personalisation"] },
];

export type ComparisonRow = {
  name: string;
  domain: string;
  price: string;
  priceColor: { fg: string; bg: string };
  freeTier: string;
  features: Record<string, boolean>;
  rating: number;
};

export const MARKETING_COMPARE: ComparisonRow[] = [
  { name: "Jasper AI", domain: "jasper.ai", price: "$39/mo", priceColor: { fg: "#a16207", bg: "#fef3c7" }, freeTier: "✓ 7d trial", features: { SEO: true, Copywriting: true, "Brand Voice": true, API: true }, rating: 4.8 },
  { name: "Copy.ai", domain: "copy.ai", price: "Freemium", priceColor: { fg: "#1d4ed8", bg: "#eff6ff" }, freeTier: "✓ Forever", features: { SEO: false, Copywriting: true, "Brand Voice": true, API: true }, rating: 4.6 },
  { name: "Surfer SEO", domain: "surferseo.com", price: "$89/mo", priceColor: { fg: "#a16207", bg: "#fef3c7" }, freeTier: "—", features: { SEO: true, Copywriting: true, "Brand Voice": false, API: true }, rating: 4.7 },
  { name: "Writesonic", domain: "writesonic.com", price: "Freemium", priceColor: { fg: "#1d4ed8", bg: "#eff6ff" }, freeTier: "✓ Forever", features: { SEO: true, Copywriting: true, "Brand Voice": true, API: true }, rating: 4.5 },
  { name: "Mailchimp AI", domain: "mailchimp.com", price: "Freemium", priceColor: { fg: "#1d4ed8", bg: "#eff6ff" }, freeTier: "✓ 500 contacts", features: { SEO: false, Copywriting: true, "Brand Voice": true, API: true }, rating: 4.4 },
  { name: "HubSpot AI", domain: "hubspot.com", price: "$45/mo", priceColor: { fg: "#a16207", bg: "#fef3c7" }, freeTier: "✓ Limited", features: { SEO: true, Copywriting: true, "Brand Voice": true, API: true }, rating: 4.6 },
];

export type FaqItem = { q: string; a: React.ReactNode };

export const MARKETING_FAQ_TEXT: { q: string; a: string }[] = [
  { q: "What is the best AI marketing tool in 2026?", a: "For most marketing teams, **Jasper AI** is our top pick — it combines AI copywriting, brand voice training, SEO mode, and team collaboration in one platform. For solo founders or smaller budgets, **Copy.ai** offers a strong free tier, and **Writesonic** is excellent for SEO-driven content. The \"best\" tool depends on your use case: blog content, ad creative, email automation, or full-funnel marketing." },
  { q: "Are there free AI marketing tools?", a: "Yes — 31 of the 108 tools in this category have a fully free plan, and 52 more offer generous freemium tiers. Filter the list above by \"Free\" or \"Freemium\" to see them all. Popular free options include Copy.ai, ChatGPT (free tier), Canva Magic Write, and HubSpot's free AI tools." },
  { q: "Can AI marketing tools replace a marketing team?", a: "No — AI marketing tools are best thought of as force multipliers, not replacements. They handle repetitive work (drafting copy, generating variations, scheduling, reporting) so marketers can focus on strategy, brand, and high-leverage decisions. Most teams report 2-5x productivity gains, not headcount reductions." },
  { q: "Which AI marketing tool is best for SEO?", a: "**Surfer SEO** and **Frase** are the two best AI-powered SEO content tools — both combine SERP analysis with AI writing to produce articles that rank. For technical SEO, **Semrush** and **Ahrefs** both have strong AI features baked in." },
  { q: "How do you choose the right AI marketing tool?", a: "Start with your biggest bottleneck. If you're struggling to ship content, pick an AI copywriter. If your blog isn't ranking, pick an SEO tool. If your emails are flat, pick an email AI. Don't try to adopt 5 tools at once — pick one, integrate it deeply, then add more." },
];

export const RELATED_CATS = [
  { icon: "✍️", name: "Writing & Editing", count: 312, slug: "writing-and-editing" },
  { icon: "🔎", name: "SEO & Content", count: 58, slug: "seo-and-content" },
  { icon: "📱", name: "Social Media", count: 47, slug: "social-media" },
  { icon: "📧", name: "Email Assistants", count: 32, slug: "email-assistants" },
  { icon: "🎨", name: "Image Generation", count: 218, slug: "image-generation" },
  { icon: "📊", name: "Analytics", count: 22, slug: "analytics" },
  { icon: "🛒", name: "E-commerce", count: 53, slug: "e-commerce" },
  { icon: "🤖", name: "AI Agents", count: 64, slug: "ai-agents" },
];

export const MARKETING_FACTS = [
  { label: "Total tools", val: "108" },
  { label: "Free tools", val: "31" },
  { label: "Freemium", val: "52" },
  { label: "Paid only", val: "25" },
  { label: "Avg starting price", val: "$24/mo" },
  { label: "Top use case", val: "Content & SEO" },
];

export const SUB_CATEGORIES = [
  { key: "SEO", label: "SEO & Content", count: 28 },
  { key: "Copywriting", label: "AI Copywriting", count: 22 },
  { key: "Email", label: "Email Marketing", count: 18 },
  { key: "Social", label: "Social Media", count: 21 },
  { key: "Ads", label: "Ad Creative", count: 14 },
  { key: "Analytics", label: "Analytics", count: 11 },
];

export const FEATURE_FILTERS = [
  { key: "API", label: "Has API", count: 64 },
  { key: "Chrome", label: "Chrome extension", count: 42 },
  { key: "Mobile", label: "Mobile app", count: 31 },
  { key: "Team", label: "Team plans", count: 78 },
  { key: "OpenSource", label: "Open source", count: 7 },
];

export const POPULAR_TAGS = ["ChatGPT-powered", "GPT-4", "Claude", "No-code", "B2B", "SaaS", "E-commerce"];

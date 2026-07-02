export type PopularCategory = {
  name: string;
  color: string;
  emoji: string;
  desc: string;
  count: number;
  trend: string;
  tools: string[];
  slug: string;
};

export type SmallCategory = {
  name: string;
  count: number;
  icon: string;
  bg: string;
  slug: string;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export const POPULAR_CATS: PopularCategory[] = [
  { name: "Writing & Editing", color: "#0052ff", emoji: "✍️", desc: "Generate, edit, and polish text for everything from blog posts to marketing copy to long form fiction.", count: 312, trend: "+24", tools: ["chat.openai.com", "claude.ai", "notion.so", "grammarly.com", "jasper.ai"], slug: slugify("Writing & Editing") },
  { name: "Image Generation", color: "#7c3aed", emoji: "🎨", desc: "Create images, illustrations, and art from text prompts using the latest diffusion models.", count: 218, trend: "+18", tools: ["midjourney.com", "openai.com", "ideogram.ai", "leonardo.ai", "flux.ai"], slug: slugify("Image Generation") },
  { name: "Code & Developer", color: "#059669", emoji: "💻", desc: "AI pair programmers, autocompletion, code reviewers, and full stack generators.", count: 187, trend: "+31", tools: ["cursor.sh", "github.com", "codeium.com", "tabnine.com", "v0.dev"], slug: slugify("Code & Developer") },
  { name: "Video & Animation", color: "#dc2626", emoji: "🎬", desc: "Generate, edit, and animate video, from text to video to background removal to lip sync.", count: 142, trend: "+22", tools: ["runwayml.com", "pika.art", "heygen.com", "synthesia.io", "descript.com"], slug: slugify("Video & Animation") },
  { name: "Audio & Music", color: "#d97706", emoji: "🎵", desc: "Voice cloning, music generation, transcription, podcast production, and sound design.", count: 96, trend: "+15", tools: ["elevenlabs.io", "suno.com", "udio.com", "otter.ai", "descript.com"], slug: slugify("Audio & Music") },
  { name: "Productivity & Automation", color: "#0891b2", emoji: "⚡", desc: "Calendar AI, meeting summarisers, task automation, and personal workflow assistants.", count: 124, trend: "+19", tools: ["notion.so", "reclaim.ai", "zapier.com", "clickup.com", "motion.ai"], slug: slugify("Productivity & Automation") },
];

const RAW_ALL_CATS: Omit<SmallCategory, "slug">[] = [
  { name: "Writing & Editing", count: 312, icon: "✍️", bg: "#dbeafe" },
  { name: "Image Generation", count: 218, icon: "🎨", bg: "#ede9fe" },
  { name: "Code & Developer", count: 187, icon: "💻", bg: "#d1fae5" },
  { name: "Video & Animation", count: 142, icon: "🎬", bg: "#fee2e2" },
  { name: "Audio & Music", count: 96, icon: "🎵", bg: "#fed7aa" },
  { name: "Productivity", count: 124, icon: "⚡", bg: "#cffafe" },
  { name: "Chatbots & Assistants", count: 154, icon: "💬", bg: "#dbeafe" },
  { name: "Marketing & Sales", count: 108, icon: "📈", bg: "#fce7f3" },
  { name: "Research & Data", count: 87, icon: "🔍", bg: "#fef3c7" },
  { name: "Education & Learning", count: 74, icon: "📚", bg: "#fef9c3" },
  { name: "Business & Finance", count: 62, icon: "💼", bg: "#e0e7ff" },
  { name: "Design & Creative", count: 131, icon: "🖌️", bg: "#fae8ff" },
  { name: "Customer Support", count: 48, icon: "🎧", bg: "#ccfbf1" },
  { name: "Translation & Language", count: 39, icon: "🌐", bg: "#e0f2fe" },
  { name: "Resume & Career", count: 28, icon: "📋", bg: "#dcfce7" },
  { name: "Email Assistants", count: 32, icon: "📧", bg: "#fef3c7" },
  { name: "SEO & Content", count: 58, icon: "🔎", bg: "#fff1f2" },
  { name: "Social Media", count: 47, icon: "📱", bg: "#ede9fe" },
  { name: "PDF & Documents", count: 36, icon: "📄", bg: "#ffedd5" },
  { name: "3D & AR / VR", count: 24, icon: "🧊", bg: "#cffafe" },
  { name: "Avatar Generation", count: 31, icon: "🧑", bg: "#fce7f3" },
  { name: "Gaming & Entertainment", count: 42, icon: "🎮", bg: "#fef9c3" },
  { name: "Healthcare & Medical", count: 29, icon: "🏥", bg: "#ccfbf1" },
  { name: "Legal & Compliance", count: 21, icon: "⚖️", bg: "#fef3c7" },
  { name: "HR & Recruiting", count: 23, icon: "👥", bg: "#e0e7ff" },
  { name: "Real Estate", count: 14, icon: "🏠", bg: "#fed7aa" },
  { name: "Travel & Hospitality", count: 17, icon: "✈️", bg: "#dbeafe" },
  { name: "Architecture & Interior", count: 18, icon: "🏛️", bg: "#fae8ff" },
  { name: "Music Production", count: 34, icon: "🎹", bg: "#fce7f3" },
  { name: "Voice Cloning", count: 22, icon: "🗣️", bg: "#fed7aa" },
  { name: "Speech Recognition", count: 26, icon: "🎤", bg: "#e0f2fe" },
  { name: "Text-to-Speech", count: 38, icon: "🔊", bg: "#fef3c7" },
  { name: "Spreadsheet AI", count: 19, icon: "📊", bg: "#dcfce7" },
  { name: "Note-Taking", count: 41, icon: "📝", bg: "#fef9c3" },
  { name: "Mind Mapping", count: 12, icon: "🧠", bg: "#ede9fe" },
  { name: "Recipe & Food AI", count: 8, icon: "🍳", bg: "#fee2e2" },
  { name: "Fitness & Wellness", count: 16, icon: "💪", bg: "#d1fae5" },
  { name: "E-commerce", count: 53, icon: "🛒", bg: "#fce7f3" },
  { name: "Photo Editing", count: 78, icon: "📷", bg: "#cffafe" },
  { name: "Logo Makers", count: 24, icon: "🏷️", bg: "#fef3c7" },
  { name: "UI / UX Design", count: 36, icon: "🖼️", bg: "#fae8ff" },
  { name: "Game Asset Generation", count: 18, icon: "🕹️", bg: "#fed7aa" },
  { name: "Data Visualization", count: 22, icon: "📉", bg: "#e0f2fe" },
  { name: "OCR & Document AI", count: 19, icon: "📑", bg: "#fef3c7" },
  { name: "AI Detectors", count: 11, icon: "🛡️", bg: "#fee2e2" },
  { name: "Plagiarism Checkers", count: 9, icon: "🧪", bg: "#dcfce7" },
  { name: "AI Agents", count: 64, icon: "🤖", bg: "#dbeafe" },
  { name: "No-code AI", count: 42, icon: "🧩", bg: "#ede9fe" },
];

export const ALL_CATS: SmallCategory[] = RAW_ALL_CATS.map((c) => ({ ...c, slug: slugify(c.name) }));

export const USE_CASES = [
  { emoji: "✍️", name: "Write a blog post", desc: "Tools that help you research, outline, and write articles faster.", count: 42 },
  { emoji: "🎨", name: "Create a logo", desc: "AI design tools for logos, brand identity, and visual assets.", count: 28 },
  { emoji: "📊", name: "Analyse data", desc: "Make sense of spreadsheets, CSVs, and databases with AI.", count: 35 },
  { emoji: "🎬", name: "Edit a video", desc: "Cut, caption, and enhance video footage with AI assistance.", count: 31 },
  { emoji: "📧", name: "Reply to emails", desc: "Draft, summarise, and manage your inbox in less time.", count: 19 },
  { emoji: "🎙️", name: "Transcribe audio", desc: "Turn meetings, podcasts, and calls into searchable text.", count: 24 },
  { emoji: "💻", name: "Ship code faster", desc: "AI pair programmers, code generators, and debug helpers.", count: 47 },
  { emoji: "📱", name: "Run social media", desc: "Schedule, write, and analyse content across platforms.", count: 22 },
];

export const PRICING_TIERS = [
  { tag: "Free", tagBg: "#f0fdf4", tagFg: "#16a34a", tagBorder: "#bbf7d0", name: "Completely Free", desc: "Open-source or fully free tools — no paid tier required.", count: 412 },
  { tag: "Freemium", tagBg: "#eff6ff", tagFg: "#1d4ed8", tagBorder: "#dbeafe", name: "Free Tier Available", desc: "Generous free plans with optional paid upgrades for more features.", count: 1184 },
  { tag: "Paid", tagBg: "#fef3c7", tagFg: "#a16207", tagBorder: "#fde68a", name: "Paid Only", desc: "Premium tools with subscription pricing — no free version.", count: 628 },
  { tag: "Enterprise", tagBg: "#fce7f3", tagFg: "#be185d", tagBorder: "#fbcfe8", name: "Custom Pricing", desc: "Enterprise tools with custom contracts and dedicated support.", count: 176 },
];

export const POPULAR_SEARCHES = [
  "ChatGPT alternatives",
  "Free image AI",
  "Video generators",
  "Code assistants",
  "Resume builders",
  "Voice cloning",
  "Logo makers",
  "Transcription",
];

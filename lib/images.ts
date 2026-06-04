export const IMG_MODELS = {
  midjourney: { name: "Midjourney v6", domain: "midjourney.com" },
  dalle: { name: "DALL·E 3", domain: "openai.com" },
  sd: { name: "Stable Diffusion XL", domain: "stability.ai" },
  flux: { name: "Flux Pro", domain: "blackforestlabs.ai" },
  ideogram: { name: "Ideogram v3", domain: "ideogram.ai" },
  leonardo: { name: "Leonardo AI", domain: "leonardo.ai" },
  firefly: { name: "Adobe Firefly", domain: "adobe.com" },
} as const;

export const IMG_GRADIENTS = [
  ["#0f172a", "#7c3aed", "#ec4899"],
  ["#fef3c7", "#fbbf24", "#f97316"],
  ["#06b6d4", "#0ea5e9", "#3b82f6"],
  ["#0f766e", "#10b981", "#84cc16"],
  ["#ec4899", "#f43f5e", "#ef4444"],
  ["#1e293b", "#0f172a", "#020617"],
  ["#a78bfa", "#8b5cf6", "#6366f1"],
  ["#fef9c3", "#facc15", "#eab308"],
  ["#fda4af", "#f9a8d4", "#f0abfc"],
  ["#94a3b8", "#64748b", "#475569"],
  ["#fed7aa", "#fb923c", "#ea580c"],
  ["#bfdbfe", "#60a5fa", "#2563eb"],
];

export type ImagePrompt = {
  prompt: string;
  model: keyof typeof IMG_MODELS;
  cat: string;
  style: string;
  ar: string;
  tags: string[];
  saves: number;
  h: number;
  label: string;
};

export const PROMPTS: ImagePrompt[] = [
  { prompt: "Cyberpunk samurai walking through neon-drenched Tokyo street at night, cinematic lighting, ultra detailed, 8k, anime style", model: "midjourney", cat: "cinematic", style: "Anime", ar: "16:9", tags: ["cyberpunk", "anime", "neon", "tokyo", "samurai"], saves: 1842, h: 380, label: "Samurai" },
  { prompt: "Minimalist tech startup logo, abstract geometric shape, gradient blue to purple, vector art, flat design, white background", model: "ideogram", cat: "logo", style: "Minimal", ar: "1:1", tags: ["logo", "minimal", "tech", "startup", "vector"], saves: 984, h: 280, label: "Logo" },
  { prompt: "Photorealistic portrait of a young woman with red hair, freckles, natural light, soft bokeh background, shot on Sony A7 III, 85mm lens, f/1.8", model: "flux", cat: "photo", style: "Portrait", ar: "2:3", tags: ["portrait", "photorealistic", "natural-light"], saves: 2104, h: 440, label: "Portrait" },
  { prompt: "Modern minimalist product shot of luxury skincare bottle on marble surface, soft shadows, beige tones, scandinavian style, 4k", model: "dalle", cat: "product", style: "Product", ar: "4:5", tags: ["product", "skincare", "minimal", "luxury", "marble"], saves: 721, h: 340, label: "Product" },
  { prompt: "Fantasy dragon perched on misty mountain peak at sunset, epic scale, oil painting style, dramatic lighting, ultra detailed scales", model: "midjourney", cat: "fantasy", style: "Painting", ar: "16:9", tags: ["fantasy", "dragon", "epic", "painting", "mountain"], saves: 3120, h: 320, label: "Dragon" },
  { prompt: "Cozy Instagram aesthetic — autumn leaves, coffee cup on wooden table, warm golden hour light, shallow depth of field", model: "flux", cat: "instagram", style: "Cozy", ar: "1:1", tags: ["instagram", "autumn", "aesthetic", "cozy", "coffee"], saves: 1487, h: 300, label: "Cozy" },
  { prompt: "Futuristic glass skyscraper architecture, biophilic design with hanging gardens, sustainable building, ultra modern, sunset", model: "sd", cat: "architecture", style: "Modern", ar: "2:3", tags: ["architecture", "futuristic", "biophilic", "sustainable"], saves: 892, h: 460, label: "Tower" },
  { prompt: "High fashion editorial photo, model wearing avant-garde structured dress, dramatic studio lighting, Vogue magazine style", model: "midjourney", cat: "fashion", style: "Editorial", ar: "2:3", tags: ["fashion", "editorial", "vogue", "avant-garde"], saves: 1623, h: 420, label: "Vogue" },
  { prompt: "YouTube thumbnail design, surprised expression, bold red text overlay \"MIND BLOWN\", vibrant colors, high contrast, click-worthy", model: "ideogram", cat: "thumbnail", style: "YouTube", ar: "16:9", tags: ["youtube", "thumbnail", "bold", "red"], saves: 584, h: 280, label: "Thumb" },
  { prompt: "Anime girl with pink hair sitting in a flower field, studio ghibli style, warm afternoon light, peaceful atmosphere, detailed", model: "leonardo", cat: "anime", style: "Ghibli", ar: "4:5", tags: ["anime", "ghibli", "girl", "flowers", "peaceful"], saves: 2890, h: 380, label: "Anime" },
  { prompt: "Mobile app UI mockup, fitness tracker dashboard, dark mode, neon accents, glassmorphism, clean minimal design, iPhone 15 mockup", model: "leonardo", cat: "ui", style: "UI/UX", ar: "9:16", tags: ["ui", "ux", "app", "fitness", "dark-mode"], saves: 412, h: 480, label: "UI" },
  { prompt: "Vintage travel poster of Paris in art deco style, Eiffel tower, warm orange and teal palette, retro typography, 1920s aesthetic", model: "dalle", cat: "poster", style: "Vintage", ar: "2:3", tags: ["poster", "vintage", "paris", "art-deco", "travel"], saves: 1102, h: 440, label: "Poster" },
  { prompt: "4K wallpaper of a serene alien landscape, twin moons in purple sky, bioluminescent plants, otherworldly atmosphere, sci-fi", model: "sd", cat: "wallpaper", style: "Sci-Fi", ar: "16:9", tags: ["wallpaper", "scifi", "alien", "bioluminescent"], saves: 1789, h: 300, label: "Alien" },
  { prompt: "Cinematic close-up of vintage typewriter on desk, golden hour window light, film grain, moody atmosphere, 35mm photography", model: "flux", cat: "cinematic", style: "Cinematic", ar: "2:3", tags: ["cinematic", "vintage", "film", "moody"], saves: 642, h: 420, label: "Film" },
  { prompt: "Gaming character concept art — armored warrior with glowing runes, dark fantasy style, dramatic backlighting, ultra detailed armor", model: "midjourney", cat: "gaming", style: "Concept", ar: "3:4", tags: ["gaming", "concept", "warrior", "fantasy", "armor"], saves: 1340, h: 400, label: "Game" },
  { prompt: "LinkedIn banner graphic, abstract gradient mesh in corporate blue, geometric shapes, professional, modern, clean", model: "firefly", cat: "linkedin", style: "Corporate", ar: "16:5", tags: ["linkedin", "corporate", "banner", "abstract", "gradient"], saves: 328, h: 200, label: "LI" },
  { prompt: "Bold social media ad creative, product floating in studio, dynamic lighting, vibrant gradient background, attention-grabbing", model: "firefly", cat: "ad", style: "Bold", ar: "1:1", tags: ["ad", "social", "bold", "vibrant"], saves: 476, h: 300, label: "Ad" },
  { prompt: "Branding moodboard for organic coffee brand, earth tones, hand-drawn elements, vintage stamps, eco-friendly aesthetic", model: "ideogram", cat: "branding", style: "Earthy", ar: "4:3", tags: ["branding", "moodboard", "organic", "coffee", "vintage"], saves: 218, h: 320, label: "Brand" },
  { prompt: "Photorealistic Nike sneaker product shot, suspended in air, dynamic angle, gradient blue background, studio lighting, 8k", model: "flux", cat: "product", style: "Product", ar: "4:5", tags: ["product", "nike", "sneaker", "studio"], saves: 954, h: 380, label: "Shoe" },
  { prompt: "Magical forest scene with glowing mushrooms and fireflies, fairy tale atmosphere, depth of field, soft pastel palette, dreamy", model: "leonardo", cat: "fantasy", style: "Fairytale", ar: "16:9", tags: ["fantasy", "magical", "forest", "fairytale", "dreamy"], saves: 1654, h: 280, label: "Magic" },
  { prompt: "Modern brutalist concrete building, sharp angles, golden hour shadows, architectural photography, minimal sky, urban", model: "sd", cat: "architecture", style: "Brutalist", ar: "4:5", tags: ["architecture", "brutalist", "concrete", "urban"], saves: 512, h: 360, label: "Arch" },
  { prompt: "Anime cyberpunk girl with cyber implants, neon pink and cyan lighting, futuristic city background, detailed face, high quality", model: "midjourney", cat: "anime", style: "Cyber", ar: "2:3", tags: ["anime", "cyberpunk", "girl", "neon", "futuristic"], saves: 2210, h: 440, label: "Cyber" },
];

export const TRENDING_PROMPTS = [
  { prompt: "Cinematic neon-noir street photograph, raining, reflections", model: "Midjourney v6", cat: "Cinematic" },
  { prompt: "Minimalist Instagram product flat-lay, pastel pink, top-down", model: "Flux Pro", cat: "Product" },
  { prompt: "Cyberpunk samurai under neon lights, anime style, 8k", model: "Midjourney v6", cat: "Anime" },
  { prompt: "Photorealistic golden retriever puppy in field of wildflowers", model: "Flux Pro", cat: "Photo" },
  { prompt: "Abstract gradient mesh background, corporate blue and purple", model: "Adobe Firefly", cat: "Branding" },
  { prompt: "Brutalist architectural concept render at sunset", model: "Stable Diffusion", cat: "Architecture" },
  { prompt: "Fantasy castle on floating island, painterly style, epic", model: "Leonardo AI", cat: "Fantasy" },
  { prompt: "Modern minimalist tech logo, gradient blue, vector flat", model: "Ideogram v3", cat: "Logo" },
];

export const MODEL_CARDS = [
  { name: "Midjourney", domain: "midjourney.com", count: "3,142" },
  { name: "DALL·E 3", domain: "openai.com", count: "1,890" },
  { name: "Stable Diffusion", domain: "stability.ai", count: "2,418" },
  { name: "Flux", domain: "blackforestlabs.ai", count: "894" },
  { name: "Ideogram", domain: "ideogram.ai", count: "612" },
  { name: "Leonardo AI", domain: "leonardo.ai", count: "784" },
  { name: "Adobe Firefly", domain: "adobe.com", count: "421" },
  { name: "Krea AI", domain: "krea.ai", count: "259" },
];

export const IMG_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "instagram", label: "📷 Instagram" },
  { key: "linkedin", label: "💼 LinkedIn" },
  { key: "product", label: "📦 Product" },
  { key: "branding", label: "🏷️ Branding" },
  { key: "anime", label: "🌴 Anime" },
  { key: "photo", label: "📸 Photorealistic" },
  { key: "cinematic", label: "🎬 Cinematic" },
  { key: "ui", label: "🖼️ UI/UX" },
  { key: "fashion", label: "👗 Fashion" },
  { key: "architecture", label: "🏛️ Architecture" },
  { key: "gaming", label: "🎮 Gaming" },
  { key: "fantasy", label: "🐉 Fantasy" },
  { key: "thumbnail", label: "📺 Thumbnails" },
  { key: "poster", label: "🖼️ Posters" },
  { key: "logo", label: "🏷️ Logos" },
  { key: "wallpaper", label: "🌌 Wallpapers" },
  { key: "ad", label: "📣 Social Ads" },
];

export const IMG_MODEL_FILTERS: { key: string; label: string; domain?: string }[] = [
  { key: "all", label: "All" },
  { key: "midjourney", label: "Midjourney", domain: "midjourney.com" },
  { key: "dalle", label: "DALL·E 3", domain: "openai.com" },
  { key: "sd", label: "Stable Diffusion", domain: "stability.ai" },
  { key: "flux", label: "Flux", domain: "blackforestlabs.ai" },
  { key: "ideogram", label: "Ideogram", domain: "ideogram.ai" },
  { key: "leonardo", label: "Leonardo", domain: "leonardo.ai" },
  { key: "firefly", label: "Firefly", domain: "adobe.com" },
];

export function gradientFor(i: number): string {
  const g = IMG_GRADIENTS[i % IMG_GRADIENTS.length];
  return `linear-gradient(135deg, ${g[0]} 0%, ${g[1]} 50%, ${g[2]} 100%)`;
}

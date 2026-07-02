/**
 * ─────────────────────────────────────────────────────────────
 *  Site-content slot registry
 * ─────────────────────────────────────────────────────────────
 *
 *  Each named "slot" is a piece of page copy that the editor
 *  can override from /admin/site-content. The defaults below
 *  live in code (version-controlled, type-safe). The override —
 *  if any — lives in the `site_section` Postgres table.
 *
 *  Naming convention: `<page>.<section>.<field>`
 *   • home.hero.headline
 *   • home.featured.title
 *   • submit.hero.title
 *
 *  Adding a new editable slot:
 *   1) Add it here with a default value
 *   2) In the component that renders that copy, call
 *        const text = await getSlot("page.section.field");
 *      (only works inside Server Components)
 *   3) The admin sees it automatically the next time they load
 *      /admin/site-content.
 *
 *  No migration needed — overrides are sparse rows.
 * ─────────────────────────────────────────────────────────────
 */

import { eq } from "drizzle-orm";
import { db } from "./db";
import { siteSections } from "./db/schema";

// ── Registry ──────────────────────────────────────────────────
// IMPORTANT: keep keys stable. Renaming a key loses any override.
export const SLOT_REGISTRY = {
  // ── Home page ──
  "home.hero.eyebrow": {
    label: "Hero eyebrow",
    page: "Home",
    section: "Hero",
    kind: "text",
    default: "The only AI",
  },
  "home.hero.headline_lead": {
    label: "Hero headline — first line",
    page: "Home",
    section: "Hero",
    kind: "text",
    default: "directory you",
  },
  "home.hero.headline_accent": {
    label: "Hero headline — accent word (blue)",
    page: "Home",
    section: "Hero",
    kind: "text",
    default: "ever need.",
  },
  "home.hero.subhead": {
    label: "Hero subheading",
    page: "Home",
    section: "Hero",
    kind: "textarea",
    default:
      "Discover, compare, and save the best AI tools — curated for writers, coders, designers, and teams.",
  },
  "home.hero.search_placeholder": {
    label: "Search box placeholder",
    page: "Home",
    section: "Hero",
    kind: "text",
    default: 'Search — "image generator", "coding assistant", "video AI"…',
  },
  "home.hero.search_button": {
    label: "Search button text",
    page: "Home",
    section: "Hero",
    kind: "text",
    default: "Search",
  },

  // ── Submit page ──
  "submit.hero.title": {
    label: "Submit hero title",
    page: "Submit",
    section: "Hero",
    kind: "text",
    default: "Submit your AI tool",
  },
  "submit.hero.subtitle": {
    label: "Submit hero subtitle",
    page: "Submit",
    section: "Hero",
    kind: "textarea",
    default:
      "Get your tool in front of 50,000+ AI practitioners. Free basic listings, featured placement, and enterprise plans.",
  },

  // ── Deals page ──
  "deals.hero.title": {
    label: "Deals hero title",
    page: "Deals",
    section: "Hero",
    kind: "text",
    default: "AI Deals & Discounts",
  },
  "deals.hero.subtitle": {
    label: "Deals hero subtitle",
    page: "Deals",
    section: "Hero",
    kind: "textarea",
    default:
      "Verified live deals, coupon codes, and Black Friday discounts on top AI tools — hand-checked daily.",
  },

  // ── Blog index page ──
  "blog.hero.eyebrow": {
    label: "Blog hero eyebrow",
    page: "Blog",
    section: "Hero",
    kind: "text",
    default: "The AI Tools Set Blog",
  },
  "blog.hero.headline": {
    label: "Blog hero headline",
    page: "Blog",
    section: "Hero",
    kind: "text",
    default: "Hands-on AI tool reviews, comparisons, and guides.",
  },
  "blog.hero.subhead": {
    label: "Blog hero subhead",
    page: "Blog",
    section: "Hero",
    kind: "textarea",
    default:
      "Every post is written after using the tool for at least a week. No syndicated press releases, no AI-generated filler.",
  },

  // ── Categories landing (/ai-tools) — the 6 popular group cards ──
  "categories.cards.writing-and-editing.desc": {
    label: "Card description — Writing & Editing",
    page: "Categories",
    section: "Popular category cards",
    kind: "textarea",
    default: "Generate, edit, and polish text for everything from blog posts to marketing copy to long form fiction.",
  },
  "categories.cards.image-generation.desc": {
    label: "Card description — Image Generation",
    page: "Categories",
    section: "Popular category cards",
    kind: "textarea",
    default: "Create images, illustrations, and art from text prompts using the latest diffusion models.",
  },
  "categories.cards.code-and-developer.desc": {
    label: "Card description — Code & Developer",
    page: "Categories",
    section: "Popular category cards",
    kind: "textarea",
    default: "AI pair programmers, autocompletion, code reviewers, and full stack generators.",
  },
  "categories.cards.video-and-animation.desc": {
    label: "Card description — Video & Animation",
    page: "Categories",
    section: "Popular category cards",
    kind: "textarea",
    default: "Generate, edit, and animate video, from text to video to background removal to lip sync.",
  },
  "categories.cards.audio-and-music.desc": {
    label: "Card description — Audio & Music",
    page: "Categories",
    section: "Popular category cards",
    kind: "textarea",
    default: "Voice cloning, music generation, transcription, podcast production, and sound design.",
  },
  "categories.cards.productivity-and-automation.desc": {
    label: "Card description — Productivity & Automation",
    page: "Categories",
    section: "Popular category cards",
    kind: "textarea",
    default: "Calendar AI, meeting summarisers, task automation, and personal workflow assistants.",
  },

  // ── Footer ──
  "footer.tagline": {
    label: "Footer tagline",
    page: "Footer",
    section: "Brand",
    kind: "textarea",
    default: "The cleanest AI tools directory. Curated, categorized, and updated every day.",
  },
  "footer.newsletter_title": {
    label: "Footer newsletter title",
    page: "Footer",
    section: "Newsletter",
    kind: "text",
    default: "The weekly digest",
  },
  "footer.newsletter_sub": {
    label: "Footer newsletter subtitle",
    page: "Footer",
    section: "Newsletter",
    kind: "textarea",
    default: "The best new AI tools, deals, and articles — every Friday. No spam, no ads.",
  },
  "footer.copyright": {
    label: "Footer copyright line",
    page: "Footer",
    section: "Legal",
    kind: "text",
    default: "© 2026 AI Tools Set. All rights reserved.",
  },
} as const;

export type SlotKey = keyof typeof SLOT_REGISTRY;
export type SlotMeta = {
  label: string;
  page: string;
  section: string;
  kind: "text" | "textarea";
  default: string;
};

/** Single-request in-memory cache so a page render with 10 slot lookups
 *  only hits the DB once. */
let cache: Map<string, string> | null = null;

async function loadCache(): Promise<Map<string, string>> {
  if (cache) return cache;
  const next = new Map<string, string>();
  try {
    const rows = await db.select({ key: siteSections.slotKey, value: siteSections.value }).from(siteSections);
    for (const r of rows) next.set(r.key, r.value);
  } catch {
    // DB unreachable — fall back to defaults
  }
  cache = next;
  return next;
}

/**
 * Resolve a slot's current value. Returns the editor override if
 * one exists, otherwise the code-side default.
 *
 * Call from Server Components only.
 */
export async function getSlot<K extends SlotKey>(key: K): Promise<string> {
  const meta = SLOT_REGISTRY[key] as SlotMeta;
  const overrides = await loadCache();
  return overrides.get(key) ?? meta.default;
}

/** Batch lookup — useful when a single component reads many slots. */
export async function getSlots<K extends SlotKey>(keys: K[]): Promise<Record<K, string>> {
  const overrides = await loadCache();
  const out = {} as Record<K, string>;
  for (const k of keys) {
    const meta = SLOT_REGISTRY[k] as SlotMeta;
    out[k] = overrides.get(k) ?? meta.default;
  }
  return out;
}

/**
 * Return ONLY the explicit editor overrides for the given keys (no code
 * defaults). Use this when a component already has a localized default of
 * its own and only wants to swap in an admin override when one exists —
 * e.g. the popular-category cards, whose defaults are localized per locale.
 */
export async function getSlotOverrides<K extends SlotKey>(keys: K[]): Promise<Partial<Record<K, string>>> {
  const overrides = await loadCache();
  const out: Partial<Record<K, string>> = {};
  for (const k of keys) {
    const v = overrides.get(k);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Admin-side: list every slot with current value + meta. */
export async function getAllSlotsForAdmin(): Promise<
  Array<{ key: SlotKey; current: string; isOverride: boolean; meta: SlotMeta }>
> {
  const overrides = await loadCache();
  return (Object.keys(SLOT_REGISTRY) as SlotKey[]).map((key) => {
    const meta = SLOT_REGISTRY[key] as SlotMeta;
    const override = overrides.get(key);
    return {
      key,
      current: override ?? meta.default,
      isOverride: override !== undefined,
      meta,
    };
  });
}

/** Server actions write here; clears the in-memory cache so the next
 *  Server Component render sees fresh data. */
export function invalidateSlotCache() {
  cache = null;
}

/** Direct DB upsert (used by the server action). */
export async function upsertSlot(slotKey: SlotKey, value: string, userId: string | null): Promise<void> {
  // Drizzle-on-Postgres upsert
  await db
    .insert(siteSections)
    .values({ slotKey, value, updatedBy: userId, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSections.slotKey,
      set: { value, updatedBy: userId, updatedAt: new Date() },
    });
  invalidateSlotCache();
}

/** Delete an override → slot reverts to its code-side default. */
export async function resetSlot(slotKey: SlotKey): Promise<void> {
  await db.delete(siteSections).where(eq(siteSections.slotKey, slotKey));
  invalidateSlotCache();
}

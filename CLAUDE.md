# CLAUDE.md — AI Tools Set

Project memory for Claude Code. Read this **first** on every task. Keep it short. Update it when conventions change.

---

## What this project is

**AI Tools Set** (aitoolsset.com) — an AI tools directory + editorial site. Currently a high-fidelity static HTML prototype of every key page, ready to migrate to **Next.js 14 (App Router) + TypeScript + Tailwind**.

Target stack:
- Next.js 14 App Router
- TypeScript (strict)
- Tailwind CSS (use the design tokens below, NOT default Tailwind colors)
- Headless CMS for tools/articles (Sanity or Payload — TBD with user)
- Vercel hosting
- Postgres (Neon) for users, saves, reviews, votes
- Algolia or Meilisearch for search
- Stripe for paid listings

The current `.html` files are the **design source of truth**. When porting, match them pixel for pixel before adding new behavior.

---

## Pages built (in this repo, as static HTML)

| File | Route in Next.js | Purpose |
|---|---|---|
| `index.html` | `/` | Homepage — hero, featured tools, news, blog, popular table |
| `categories.html` | `/categories` | All 48 categories, intent filters, A-Z list |
| `marketing.html` | `/ai-tools/marketing` | Category detail template (clone per category) |
| `tool.html` | `/tools/[slug]` | Single tool — header, screenshot, features, pricing, reviews, embed badge, related slider |
| `news.html` | `/news` | Twitter-style live news feed from official AI sources |
| `blog.html` | `/blog` | Editorial blog index |
| `blog-post.html` | `/blog/[slug]` | Single article — TOC, drop cap, sidebar, comments |
| `blog-perplexity-vs-chatgpt.html` | `/blog/[slug]` (vs template) | Comparison post template w/ verdict cards, scatter rounds, PAA FAQ |
| `images.html` | `/images` | Pinterest-style AI image + prompt gallery |
| `submit.html` | `/submit` | Tool submission + pricing plans |
| `leaderboard.html` | `/leaderboard` & `/leaderboard/methodology` | AI model leaderboard + methodology |

When a page is missing, ask the user before inventing one. Don't add filler pages.

---

## Design system — USE THESE TOKENS

Defined identically at the top of every page's `<style>` or in `:root`. **Do not introduce new colors.** Surface a few accent extras (gold/yellow/rose) only when a page genuinely needs them and the user has approved.

### Colors

```css
--blue:#0052ff;          /* primary accent */
--blue-h:#578bfa;        /* hover/light */
--blue-soft:rgba(0,82,255,.08);

--white:#fff;
--bg:#f8f9fa;
--surface:#eef0f3;

/* Section tints — for alternating-section rhythm */
--cream:#FBF8F1;
--mint:#F1F7F3;
--lavender:#F4F2FA;
--sand:#F6F2EC;

/* Dark surfaces (hero, footer, dark CTAs) */
--near-black:#0F172A;
--dark-card:#1E293B;
--dark-border:rgba(255,255,255,.07);

/* Text */
--text:#0a0b0d;
--text-2:#5b616e;
--text-3:#9aa0ae;

/* Lines */
--border:rgba(91,97,110,.18);
--border-2:rgba(91,97,110,.28);

/* Status */
--green:#16a34a;
--green-bg:#f0fdf4;
--green-border:#bbf7d0;
```

> The **leaderboard** is the one exception: it uses Inter + `#2563EB` blue + `#0F172A` navy to match `artificialanalysis.ai` editorial style. Keep it self-contained.

### Radii
```css
--r-sm:6px; --r:12px; --r-lg:20px; --r-pill:100px;
```

### Type
- **Display / UI:** `Manrope` (400–900) — headings, nav, buttons, stats
- **Body:** `DM Sans` (300–600) — paragraphs, descriptions
- **Editorial body (blog only):** `Lora` (italic + regular) — long-form article prose
- **Leaderboard:** `Inter` + `JetBrains Mono` (formulas)

### Shadows
```css
--shadow-sm:0 1px 3px rgba(0,0,0,.06);
--shadow:0 4px 16px rgba(0,0,0,.08);
--shadow-lg:0 12px 40px rgba(0,0,0,.12);
```

### Section rhythm
Alternate page backgrounds: `white → cream → white → mint → near-black → sand → white`. Don't repeat the same color twice in a row.

---

## Components shared across pages

Port these as React components **first** in `components/`:

| Component | Used in |
|---|---|
| `<Nav>` | every page |
| `<Footer>` (dark) | every page |
| `<ToolCard>` | homepage, category, related sliders |
| `<NewsCard>` (Twitter-style) | news, news widgets |
| `<BlogCard>` | blog, blog widgets |
| `<VerifiedBadge>` (X/Twitter blue tick) | tool page, cards |
| `<DealRibbon>` | tool cards with active deal |
| `<Breadcrumb>` | every detail page |
| `<HeroSearch>` (dark hero variant) | home, categories, news |
| `<FilterPills>` (sticky white bar) | category, news, images |
| `<Tabs>` (pill style) | tool detail, leaderboard, methodology |
| `<TOC>` (sticky, scroll-spy) | blog-post, leaderboard methodology |
| `<NewsletterCard>` (dark) | every sidebar |
| `<SubmitCTA>` (blue gradient) | sidebars, page bottoms |

Match the prototype HTML exactly — same padding, border-radius, weights.

---

## Conventions

- **Real favicons** for tool/source logos via `https://www.google.com/s2/favicons?domain={domain}&sz=64`. Always include `onerror` fallback.
- **`localStorage`** for saved-tool / liked-news / bookmarks state. Key prefix: `ats-` (e.g. `ats-saved`, `ats-img-saved`).
- **Tabular numbers** (`font-variant-numeric:tabular-nums`) on all stats, prices, scores.
- **No emoji-only icons in production UI** beyond what's already in the prototypes. Use Lucide React when migrating.
- **Accessibility:** every interactive element gets a focus ring, `aria-label` on icon-only buttons, semantic HTML (`<article>`, `<aside>`, `<nav>`, `<main>`).
- **SEO:** every page needs `<title>`, meta description, OG tags, JSON-LD where appropriate (Article on blog posts, Product on tools, FAQ on category pages).
- **Don't reformat untouched files.** Edit narrowly.

---

## Patterns to preserve verbatim

These exact details are why the design works — don't "improve" them:

1. **Verified badge** = X/Twitter starburst (`#1D9BF0` fill) with white check. Inline next to name.
2. **Sticky `top:58px`** for the filter bar everywhere, sitting under the 58px nav.
3. **Hero search** in dark heroes uses `rgba(255,255,255,.06)` background, `rgba(255,255,255,.15)` border, `var(--blue)` focus.
4. **Tool card hover** = `border-color:var(--blue) + box-shadow:0 0 0 3px var(--blue-soft)` halo + `translateY(-2px)`.
5. **Section eyebrows** = `font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--blue)`.
6. **Display headings** use `font-weight:800-900` with `letter-spacing` between `-0.5px` and `-2.5px` depending on size.

---

## How to work in Claude Code

1. **Read the prototype HTML** for the page you're working on before writing any TSX. The design is already finalised there.
2. **Port → don't redesign.** When migrating to Next.js, the deliverable is the same visual output in React + Tailwind.
3. **Use Tailwind arbitrary values** to match exact spacing (e.g. `px-9 py-14`) — don't approximate.
4. **Ask before adding pages, sections, or content.** This project has had multiple rounds of cleanup; don't add filler.
5. **Mobile responsiveness** is a known gap on most prototypes (only `leaderboard.html` has it). When porting each page, add mobile breakpoints at `980px` and `640px`.
6. **Run `pnpm dev`** (assume pnpm) before claiming a page is done.

---

## Open todos (in priority order)

1. Mobile responsiveness pass on every page
2. Single news article page (`news-article.html`)
3. Single image detail page (currently a modal — make it a real route for SEO)
4. User profile / saved-tools page
5. Search results page
6. Wire navigation: cross-page links are stubbed with `#` in some footers

---

## Things explicitly NOT to do

- Don't change the color palette. It's tested and approved.
- Don't add gradient backgrounds to text headings except where they already exist (hero accent words, leaderboard headline).
- Don't use Lucide icons until porting to Next.js — the prototypes use inline SVG on purpose.
- Don't introduce a UI library (shadcn/Radix) until the Tailwind-from-scratch port is done — the visual identity needs to be locked in first.
- Don't generate filler blog posts or fake reviews with AI. Real content only.

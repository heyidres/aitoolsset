/**
 * ─────────────────────────────────────────────────────────────
 *  Database schema — Drizzle ORM, Postgres dialect (Neon)
 * ─────────────────────────────────────────────────────────────
 *
 *  This file is the single source of truth for every table.
 *  Generate migrations with:
 *
 *    npm run db:generate    # creates SQL in /drizzle/migrations
 *    npm run db:push        # pushes schema directly (dev only)
 *    npm run db:migrate     # applies generated migrations
 *
 *  Auth tables (users / accounts / sessions / verificationTokens)
 *  follow the @auth/drizzle-adapter expected shape — do not
 *  rename them or NextAuth will break.
 *
 *  Conventions:
 *   - All ids are UUIDs (crypto.randomUUID() via defaultRandom)
 *   - All timestamps default to now() and store with timezone
 *   - Soft-delete via deletedAt is avoided; we hard-delete and
 *     rely on row-level audit logs if we need history
 * ─────────────────────────────────────────────────────────────
 */

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  uniqueIndex,
  index,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// ── Enums ────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "editor", "admin"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "approved", "rejected"]);
export const editorialStatusEnum = pgEnum("editorial_status", ["draft", "review", "approved", "published"]);
export const newsTopicEnum = pgEnum("news_topic", [
  "llm",
  "image",
  "video",
  "code",
  "audio",
  "policy",
  "research",
  "cybersecurity",
  "startup",
]);

// ── NextAuth tables (required shape — don't rename) ─────────
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  })
);

// ── Tools directory ─────────────────────────────────────────
export const tools = pgTable(
  "tool",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    domain: text("domain").notNull(),
    websiteUrl: text("website_url").notNull().default(""),
    /**
     * rel attribute applied to the public website link.
     * 'dofollow' = no extra rel (search engines follow normally);
     * 'nofollow' = no PageRank passed (default for unverified listings);
     * 'sponsored' = paid placement / affiliate link;
     * 'ugc' = user-generated submission.
     */
    linkRel: text("link_rel").notNull().default("nofollow"),
    category: text("category").notNull(), // primary category — used for breadcrumb + sorting
    /**
     * Additional categories the tool also belongs to. The tool surfaces
     * on every /ai-tools/<slug> page whose slug appears here OR matches
     * the primary `category` column above.
     */
    categories: jsonb("categories").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    description: text("description").notNull(),
    /** "free" | "freemium" | "paid" | "credit" | "trial" | "enterprise" */
    pricing: text("pricing").notNull(),
    logoUrl: text("logo_url"),
    screenshotUrl: text("screenshot_url"),
    verified: boolean("verified").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    status: text("status").notNull().default("draft"), // "draft" | "published"

    // Editorial detail — populated by hand or by the AI auto-fill action
    madeBy: text("made_by"),
    launched: text("launched"), // free-text e.g. "Nov 2022"
    weeklyUsers: text("weekly_users"), // e.g. "200M+"
    startingPrice: text("starting_price"), // e.g. "Free", "$10/mo"
    hasApi: boolean("has_api"),
    mobileApp: text("mobile_app"), // e.g. "iOS & Android"
    browserExtension: boolean("browser_extension"),
    socials: jsonb("socials").$type<{
      x?: string | null;
      linkedin?: string | null;
      github?: string | null;
      youtube?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      discord?: string | null;
    } | null>(),
    features: jsonb("features").$type<Array<{ title: string; desc: string }> | null>(),
    /** Concrete jobs the tool helps users complete. e.g. "Generate ad creatives" */
    useCases: jsonb("use_cases").$type<string[] | null>(),
    /** OS + surface availability. e.g. "Web", "macOS", "iOS", "API". */
    platforms: jsonb("platforms").$type<string[] | null>(),
    /** Third-party integrations. e.g. "Zapier", "Slack", "Notion", "Figma". */
    integrations: jsonb("integrations").$type<string[] | null>(),
    pros: jsonb("pros").$type<string[] | null>(),
    cons: jsonb("cons").$type<string[] | null>(),
    plans: jsonb("plans").$type<Array<{
      name: string;
      price: string;
      period: string;
      popular?: boolean;
      feats: string[];
    }> | null>(),
    saveCount: integer("save_count").notNull().default(0),
    voteCount: integer("vote_count").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    avgRating: integer("avg_rating").notNull().default(0), // stored as rating*10 (47 = 4.7)
    deal: jsonb("deal").$type<{ label: string; expires: string } | null>(),

    /**
     * Manual pin for the homepage Trending + Popular rails.
     * Lower numbers float to the top. NULL = use organic sort
     * (by saveCount desc). Set this when editors want to
     * spotlight a tool regardless of save activity.
     */
    homepageOrder: integer("homepage_order"),

    // SEO — overrides for the public tool detail page <title> / description.
    // Fall back to generated defaults (name + tagline) when blank.
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),

    /**
     * Per-locale overrides for editor-managed fields.
     * Shape: { ko: { tagline?: string, description?: string, features?: [...], pros?: [...], cons?: [...], plans?: [...], seoTitle?, seoDescription? }, ja: {...}, ... }
     * The render path reads translations[locale]?.field first, then falls
     * back to the canonical English column. So if Korean is missing
     * `features`, the English `features` shows; the rest of the page
     * still renders Korean for fields that ARE translated.
     */
    translations: jsonb("translations").$type<Record<string, {
      tagline?: string;
      description?: string;
      features?: Array<{ title: string; desc: string }>;
      useCases?: string[];
      pros?: string[];
      cons?: string[];
      plans?: Array<{ name: string; price: string; period: string; popular?: boolean; feats: string[] }>;
      seoTitle?: string;
      seoDescription?: string;
    }>>().notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    categoryIdx: index("tool_category_idx").on(t.category),
    featuredIdx: index("tool_featured_idx").on(t.featured),
    statusIdx: index("tool_status_idx").on(t.status),
  })
);

// ── Tool submissions (from /submit) ─────────────────────────
export const toolSubmissions = pgTable(
  "tool_submission",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    websiteUrl: text("website_url").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    pricingModel: text("pricing_model").notNull(),
    plan: text("plan").notNull(), // "free" | "featured" | "enterprise"
    submitterName: text("submitter_name").notNull(),
    submitterEmail: text("submitter_email").notNull(),
    twitterHandle: text("twitter_handle"),
    launchDate: text("launch_date"),
    logoUrl: text("logo_url"),
    screenshotUrl: text("screenshot_url"),
    dealCopy: text("deal_copy"),
    status: submissionStatusEnum("status").notNull().default("pending"),
    reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    approvedToolId: text("approved_tool_id").references(() => tools.id, { onDelete: "set null" }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("submission_status_idx").on(t.status),
    emailIdx: index("submission_email_idx").on(t.submitterEmail),
  })
);

// ── Saves / votes (user ↔ tool) ─────────────────────────────
export const savedTools = pgTable(
  "saved_tool",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.toolId] }),
    userIdx: index("saved_user_idx").on(t.userId),
  })
);

export const votes = pgTable(
  "vote",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // 1 = upvote, -1 = downvote (we only use 1 today)
    votedAt: timestamp("voted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.toolId] }),
  })
);

// ── Reviews ─────────────────────────────────────────────────
export const reviews = pgTable(
  "review",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1–5
    role: text("role"), // optional reviewer role string ("Software Engineer")
    body: text("body").notNull(),
    helpfulCount: integer("helpful_count").notNull().default(0),
    notHelpfulCount: integer("not_helpful_count").notNull().default(0),
    status: text("status").notNull().default("approved"), // approved | pending | rejected | flagged
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    toolIdx: index("review_tool_idx").on(t.toolId),
    statusIdx: index("review_status_idx").on(t.status),
    uniqueAuthorPerTool: uniqueIndex("review_one_per_user_per_tool").on(t.toolId, t.authorId),
  })
);

export const reviewHelpful = pgTable(
  "review_helpful",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewId: text("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    helpful: boolean("helpful").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.reviewId] }),
  })
);

// ── Comments (blog + news) ──────────────────────────────────
export const comments = pgTable(
  "comment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    /** "blog:gpt-5-complete-guide" or "news:openai-gpt-5-..." */
    resource: text("resource").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    body: text("body").notNull(),
    likeCount: integer("like_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    resourceIdx: index("comment_resource_idx").on(t.resource),
    parentIdx: index("comment_parent_idx").on(t.parentId),
  })
);

// ── Newsletter ──────────────────────────────────────────────
export const newsletterSubscribers = pgTable("newsletter_subscriber", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 320 }).notNull().unique(),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmToken: text("confirm_token"),
  unsubToken: text("unsub_token").notNull().$defaultFn(() => crypto.randomUUID()),
  source: text("source"), // "footer" | "blog-sidebar" | "news-sidebar" | etc.
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── News posts (from RSS + AI drafts + editorial workflow) ──
export const newsPosts = pgTable(
  "news_post",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    /** Stable hash from source link — used for dedup before AI calls. */
    sourceHash: text("source_hash").notNull().unique(),
    source: text("source").notNull(),
    sourceDomain: text("source_domain").notNull(),
    sourceUrl: text("source_url").notNull(),
    tag: text("tag").notNull(),
    topic: newsTopicEnum("topic").notNull(),
    categories: jsonb("categories").$type<string[]>().notNull().default([]),
    /** RSS-provided fields */
    headline: text("headline").notNull(),
    description: text("description").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    breaking: boolean("breaking").notNull().default(false),
    /** AI-generated content (null until cron drafts it) */
    draft: jsonb("draft").$type<{
      seoTitle?: string;
      metaDescription?: string;
      introduction?: string;
      keyHighlights?: string[];
      body?: string;
      expertCommentary?: string;
      faqs?: { q: string; a: string }[];
      internalLinks?: { label: string; href: string }[];
      citations?: { label: string; url: string }[];
    }>(),
    /** Editorial workflow state */
    status: editorialStatusEnum("status").notNull().default("draft"),
    draftedAt: timestamp("drafted_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    publishedLiveAt: timestamp("published_live_at", { withTimezone: true }),
    /** Cached engagement (incremented async) */
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("news_status_idx").on(t.status),
    topicIdx: index("news_topic_idx").on(t.topic),
    publishedAtIdx: index("news_published_at_idx").on(t.publishedAt),
  })
);

// ── Categories ──────────────────────────────────────────────
export const categories = pgTable(
  "category",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    icon: text("icon"), // emoji or short string
    color: text("color"), // hex like #FF8800
    description: text("description"),
    popular: boolean("popular").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    parentSlug: text("parent_slug"),

    // Editorial fields used by the public category page
    bannerImageUrl: text("banner_image_url"),
    heroEyebrow: text("hero_eyebrow"), // e.g. "CATEGORY · IMAGE GENERATION"
    heroTitle: text("hero_title"), // big headline
    heroSubtitle: text("hero_subtitle"),
    introHtml: text("intro_html"), // long-form intro prose (rich text)
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    /**
     * Slugs of tools the editor has hand-picked as featured for this
     * category. Rendered above the regular tools list on the public
     * /ai-tools/<slug> page.
     */
    featuredToolSlugs: jsonb("featured_tool_slugs").$type<string[]>().notNull().default([]),

    // ── Editorial / SEO-AEO fields (Futurepedia-style: two free rich-text
    //    content zones wrapped around the tool grid, plus FAQ + relevance) ──

    /**
     * "Bottom content" — the long-form editorial article rendered BELOW the
     * tools grid (like Futurepedia's category prose). Rich-text HTML.
     * introHtml is the "top content" rendered ABOVE the grid.
     */
    bottomHtml: text("bottom_html"),
    /** Category-specific FAQ pairs → rendered + FAQPage JSON-LD. */
    faqs: jsonb("faqs").$type<Array<{ q: string; a: string }>>().notNull().default([]),
    /** Per-tool relevance score (0–100). Tools below relevanceThreshold are hidden. */
    toolRelevance: jsonb("tool_relevance").$type<Record<string, number>>().notNull().default({}),
    /** Minimum relevance score a tool needs to appear here. 0 = show all. */
    relevanceThreshold: integer("relevance_threshold").notNull().default(0),
    /** Editorial "last reviewed" date — distinct from updatedAt. Freshness signal. */
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    /** Target query for this category. Internal tracking only — not rendered. */
    focusKeyword: text("focus_keyword"),

    /**
     * Per-locale translations for editor-managed fields. Same shape as
     * tool.translations — keyed by locale code, partial fallback to the
     * English columns when a field is missing.
     */
    translations: jsonb("translations").$type<Record<string, {
      name?: string;
      description?: string;
      heroEyebrow?: string;
      heroTitle?: string;
      heroSubtitle?: string;
      introHtml?: string;
      bottomHtml?: string;
      seoTitle?: string;
      seoDescription?: string;
      faqs?: Array<{ q: string; a: string }>;
    }>>().notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    popularIdx: index("category_popular_idx").on(t.popular),
  })
);

// ── Blog posts ──────────────────────────────────────────────
export const blogPosts = pgTable(
  "blog_post",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull(), // Guide | Comparison | Roundup | Tutorial | News | Review
    deck: text("deck"),
    coverImageUrl: text("cover_image_url"),
    author: text("author"), // legacy single-author free-text (kept for back-compat)
    /**
     * E-E-A-T author attribution. Each slug references authors.slug.
     * The FIRST entry is the lead byline; subsequent slugs render as
     * co-authors. Falls back to `author` text when empty.
     */
    authorSlugs: jsonb("author_slugs").$type<string[]>().notNull().default([]),
    /** Optional "Reviewed by" attribution — separate person who fact-checked. */
    reviewedBySlug: text("reviewed_by_slug"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    body: text("body").notNull().default(""), // HTML from rich text editor
    /** Q&A pairs rendered below the body as accordion + emitted as FAQ JSON-LD. */
    faqs: jsonb("faqs").$type<Array<{ q: string; a: string }>>().notNull().default([]),
    readMinutes: integer("read_minutes"),
    status: text("status").notNull().default("draft"), // draft | scheduled | published
    publishedAt: timestamp("published_at", { withTimezone: true }),
    views: integer("views").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("blog_post_status_idx").on(t.status),
    publishedAtIdx: index("blog_post_published_at_idx").on(t.publishedAt),
  })
);

// ── Authors (E-E-A-T) ───────────────────────────────────────
// Author profiles feed Google's E-E-A-T signals: every byline links
// to a Person entity with role, credentials, photo, and verifiable
// external profiles (LinkedIn, X, personal site).
export const authors = pgTable(
  "author",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    /** Headline role e.g. "Senior AI Researcher", "Editor-in-Chief". */
    role: text("role"),
    /** Short bio HTML — rich text from the admin editor. */
    bioHtml: text("bio_html"),
    photoUrl: text("photo_url"),
    /** Free-text credentials list. e.g. "PhD Stanford", "Ex-OpenAI", "ML Eng @ Google". */
    credentials: jsonb("credentials").$type<string[]>().notNull().default([]),
    /** Verifiable external profiles. Surface as rel="me" links for E-E-A-T. */
    websiteUrl: text("website_url"),
    linkedinUrl: text("linkedin_url"),
    xUrl: text("x_url"),
    githubUrl: text("github_url"),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  }
);

// ── Deals ───────────────────────────────────────────────────
export const deals = pgTable(
  "deal",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("percent"), // percent | flat | trial
    amount: integer("amount").notNull().default(0),
    label: text("label"),
    headline: text("headline").notNull(),
    description: text("description").notNull(),
    code: text("code"),
    savingsUsd: integer("savings_usd"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    exclusive: boolean("exclusive").notNull().default(false),
    blackFriday: boolean("black_friday").notNull().default(false),
    verified: boolean("verified").notNull().default(true),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    activeIdx: index("deal_active_idx").on(t.active),
    toolIdx: index("deal_tool_idx").on(t.toolId),
  })
);

// ── Glossary terms ──────────────────────────────────────────
export const glossaryTerms = pgTable(
  "glossary_term",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    term: text("term").notNull(),
    acronym: text("acronym"),
    cat: text("cat").notNull(), // core | models | training | agents
    definition: text("definition").notNull().default(""), // HTML
    example: text("example"),
    related: jsonb("related").$type<string[]>().notNull().default([]),
    linkedToolId: text("linked_tool_id").references(() => tools.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    catIdx: index("glossary_cat_idx").on(t.cat),
  })
);

// ── Site pages (About / Privacy / Terms / Contact / custom) ─
export const sitePages = pgTable(
  "site_page",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    deck: text("deck"), // optional subtitle shown under the title
    coverImageUrl: text("cover_image_url"),
    body: text("body").notNull().default(""), // HTML from rich text editor
    status: text("status").notNull().default("draft"), // draft | published
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("site_page_status_idx").on(t.status),
  })
);

// ── Site content slots (editable per-page copy) ─────────────
// Each row is a single named slot — e.g. ("home", "hero_headline")
// — whose `value` overrides the code-side default registered in
// lib/site-content.ts. Sparse table: only rows where the editor
// actually changed something exist.
export const siteSections = pgTable(
  "site_section",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slotKey: text("slot_key").notNull().unique(), // e.g. "home.hero.headline"
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => ({
    keyIdx: index("site_section_key_idx").on(t.slotKey),
  })
);

// ── Audit log (basic) ───────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // "approve_submission" | "publish_news" | "reject_review" | etc.
  target: text("target").notNull(), // free-form "submission:<id>" | "news:<id>"
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Newsroom pipeline ───────────────────────────────────────
/**
 * Every announcement detected by the news-detect cron lands here.
 * Dedup key = url_hash (sha1 of source_url). Provenance trail —
 * never deleted, used for the pipeline observability dashboard.
 */
export const newsDetectionEvents = pgTable(
  "news_detection_event",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    /** Source slug from sources.config.json (e.g. "openai-blog"). */
    sourceSlug: text("source_slug").notNull(),
    sourceName: text("source_name").notNull(),
    sourceDomain: text("source_domain").notNull(),
    sourceCategory: text("source_category").notNull(), // 'ai' | 'security' | 'policy' | 'research' | 'media'
    sourcePriority: integer("source_priority").notNull().default(5),
    /** The actual URL of the announcement. */
    url: text("url").notNull(),
    /** sha1(url) — dedup index. Matches news_posts.source_hash for traceability. */
    urlHash: text("url_hash").notNull().unique(),
    /** Feed-provided id if any (RSS guid, atom id). */
    externalId: text("external_id"),
    title: text("title").notNull(),
    summary: text("summary"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** First 12k chars of fetched body, for the outliner. */
    rawContent: text("raw_content"),
    /**
     * 'new'         — just detected, awaiting drafting
     * 'queued'      — claimed by a draft job (in flight)
     * 'drafted'     — draft created (news_post_id populated)
     * 'rejected'    — editor rejected the draft
     * 'failed'      — drafting failed; see latest news_draft_job.error
     * 'ignored'     — skipped (e.g. paywalled, off-topic per LLM gate)
     */
    status: text("status").notNull().default("new"),
    rejectionReason: text("rejection_reason"),
    /** FK to news_posts once a draft is created. */
    newsPostId: text("news_post_id"),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("news_detection_status_idx").on(t.status),
    detectedAtIdx: index("news_detection_detected_at_idx").on(t.detectedAt),
    sourceIdx: index("news_detection_source_idx").on(t.sourceSlug),
  })
);

/**
 * Every draft attempt — successful or failed. Lets editors regenerate,
 * see which model / prompt was used, and audit cost.
 */
export const newsDraftJobs = pgTable(
  "news_draft_job",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => newsDetectionEvents.id, { onDelete: "cascade" }),
    newsPostId: text("news_post_id"),
    /**
     * 'pending'    — created, waiting for worker
     * 'outlining'  — Haiku is generating outline
     * 'researching'— fetching grounding URLs
     * 'drafting'   — Opus is writing the article
     * 'done'       — news_post_id populated
     * 'failed'     — error logged
     */
    status: text("status").notNull().default("pending"),
    provider: text("provider"), // 'claude-opus-4-7' | 'claude-haiku-4-5' | 'gemini' | 'groq'
    outline: jsonb("outline").$type<{
      workingTitle: string;
      angle: string;
      keyFacts: string[];
      whyMatters: string;
      whoAffected: string[];
      citationsToFetch: string[];
      proposedTopic: string;
      proposedCategories: string[];
    } | null>(),
    /** URLs we actually fetched for grounding + their extracted text length. */
    researchSources: jsonb("research_sources")
      .$type<Array<{ url: string; chars: number; ok: boolean }>>()
      .notNull()
      .default([]),
    /** Concatenated user prompt sent to the drafting model, truncated for logs. */
    promptPreview: text("prompt_preview"),
    /** Raw model JSON response, kept for diffing on regenerate. */
    rawResponse: text("raw_response"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    eventIdx: index("news_draft_event_idx").on(t.eventId),
    statusIdx: index("news_draft_status_idx").on(t.status),
  })
);

// ── Home page editorial sections ────────────────────────────
/**
 * The "For Writers / For Developers / …" blocks on the homepage.
 * Each row drives one UseCaseBlock instance. Editors add/edit/reorder
 * sections via /admin/home; the public homepage maps these in order.
 *
 * When the table is empty, app/page.tsx falls back to the original
 * hardcoded Writers + Developers blocks so the site never goes blank.
 */
export const homeSections = pgTable(
  "home_section",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    badge: text("badge").notNull(), // "✦ For Writers"
    title: text("title").notNull(), // "Write better, publish faster."
    deck: text("deck").notNull().default(""),
    /** CSS color value piped into the section background. e.g. "var(--mint)" */
    bgColor: text("bg_color").notNull().default("var(--mint)"),
    /** Whether the use-case grid renders on the left or right of the copy. */
    imageSide: text("image_side").notNull().default("right"), // 'left' | 'right'
    /** Lower numbers render first. */
    position: integer("position").notNull().default(0),
    enabled: boolean("enabled").notNull().default(true),
    /** Slugs of CMS tools to feature. Resolved to real tool rows server-side. */
    toolSlugs: jsonb("tool_slugs").$type<string[]>().notNull().default([]),
    /** Up to 4 use-case tiles rendered next to the copy. */
    useCases: jsonb("use_cases")
      .$type<Array<{ name: string; desc: string; label: string; grad: string }>>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    positionIdx: index("home_section_position_idx").on(t.position),
  })
);

// ── Type exports for use in route handlers ──────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type ToolSubmission = typeof toolSubmissions.$inferSelect;
export type NewsPostRow = typeof newsPosts.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Comment = typeof comments.$inferSelect;

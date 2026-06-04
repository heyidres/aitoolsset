"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { slugify, RESERVED_PAGE_SLUGS } from "@/lib/cms";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
}

const Input = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(120),
  deck: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  body: z.string().min(1),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().optional().default(""),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

function parse(fd: FormData) {
  return Input.parse({
    title: (fd.get("title") as string) ?? "",
    slug: ((fd.get("slug") as string) ?? "").trim() || slugify((fd.get("title") as string) ?? ""),
    deck: (fd.get("deck") as string) ?? "",
    coverImageUrl: (fd.get("coverImageUrl") as string) ?? "",
    body: (fd.get("body") as string) ?? "",
    status: ((fd.get("status") as string) ?? "draft") as "draft" | "published",
    publishedAt: (fd.get("publishedAt") as string) ?? "",
    seoTitle: (fd.get("seoTitle") as string) ?? "",
    seoDescription: (fd.get("seoDescription") as string) ?? "",
  });
}

function values(i: z.infer<typeof Input>) {
  return {
    slug: i.slug,
    title: i.title,
    deck: i.deck || null,
    coverImageUrl: i.coverImageUrl || null,
    body: i.body,
    status: i.status,
    publishedAt: i.publishedAt
      ? new Date(i.publishedAt)
      : i.status === "published" ? new Date() : null,
    seoTitle: i.seoTitle || null,
    seoDescription: i.seoDescription || null,
  };
}

function assertSlugAllowed(slug: string) {
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    throw new Error(`Slug "${slug}" is reserved by a core route. Pick a different slug (e.g. /our-${slug}).`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("Slug must be lowercase letters, numbers, and dashes only.");
  }
}

export async function createSitePage(fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  assertSlugAllowed(input.slug);
  const [existing] = await db.select({ id: sitePages.id }).from(sitePages).where(eq(sitePages.slug, input.slug)).limit(1);
  if (existing) throw new Error(`A page with slug "${input.slug}" already exists`);
  await db.insert(sitePages).values(values(input));
  revalidatePath("/admin/pages");
  revalidatePath(`/${input.slug}`);
  redirect("/admin/pages");
}

export async function updateSitePage(id: string, fd: FormData) {
  await requireEditor();
  const input = parse(fd);
  assertSlugAllowed(input.slug);
  const [conflict] = await db.select({ id: sitePages.id }).from(sitePages).where(eq(sitePages.slug, input.slug)).limit(1);
  if (conflict && conflict.id !== id) throw new Error(`A different page already has slug "${input.slug}"`);
  await db.update(sitePages).set({ ...values(input), updatedAt: new Date() }).where(eq(sitePages.id, id));
  revalidatePath("/admin/pages");
  revalidatePath(`/${input.slug}`);
  redirect("/admin/pages");
}

export async function deleteSitePage(id: string) {
  await requireEditor();
  const [row] = await db.select({ slug: sitePages.slug }).from(sitePages).where(eq(sitePages.id, id)).limit(1);
  await db.delete(sitePages).where(eq(sitePages.id, id));
  if (row) revalidatePath(`/${row.slug}`);
  revalidatePath("/admin/pages");
}

// ─────────────────────────────────────────────────────────────
//  One-shot seed for the standard 5 pages every site needs
// ─────────────────────────────────────────────────────────────
const DEFAULT_PAGES = [
  {
    slug: "about",
    title: "About AI Tools Set",
    deck: "Built by a small team that uses AI tools every day. We test every listing ourselves before publishing.",
    body: `
<h2>Who we are</h2>
<p><strong>AI Tools Set</strong> is a hand-curated directory of the best AI tools across every category — from writing and image generation to code, video, and audio. We started in 2024 because every other AI directory we tried was a list of links someone scraped, with no judgement applied.</p>
<p>Our job is to do the judging. Every tool you see here has been used by a real person on our team, for at least a few hours, before it gets a listing.</p>

<h2>Our mission</h2>
<p>Help anyone — engineers, marketers, designers, students, founders — find the right AI tool for the job in under 30 seconds. No SEO spam. No paid placement disguised as editorial. No fake review counts.</p>

<h2>How we curate</h2>
<p>For every tool, our editorial team verifies three things:</p>
<ul>
  <li><strong>It works</strong> — we sign up, run the core workflow, and confirm the product matches the marketing.</li>
  <li><strong>It's safe</strong> — we check for sensible data handling, real-company ownership, and active maintenance.</li>
  <li><strong>It's worth listing</strong> — if a tool is a thin wrapper around someone else's API with no real value-add, we pass.</li>
</ul>

<h2>Editorial independence</h2>
<p>Some tools on the site offer affiliate codes that pay us a small commission when you sign up — these are clearly tagged as <strong>⭐ Exclusive</strong> deals. The commission never changes a tool's ranking or whether it gets listed. We've turned down many partnerships from tools that didn't pass our editorial bar.</p>

<h2>How to reach us</h2>
<p>Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>. We respond within 48 hours, usually faster.</p>
<p>To submit your own tool for review, head to <a href="/submit">/submit</a>.</p>
    `.trim(),
    seoTitle: "About AI Tools Set — hand-curated AI directory",
    seoDescription: "We hand-test every tool before listing. Independent editorial. No paid placement disguised as ranking.",
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    deck: "Plain-English summary of what we collect, why, and how to delete it.",
    body: `
<h2>The short version</h2>
<p>We collect the bare minimum needed to operate the site. We don't sell your data. We don't share it with advertisers. You can request deletion at any time.</p>

<h2>1. Information we collect</h2>
<h3>When you sign in</h3>
<ul>
  <li>Your name, email, and profile photo from your Google account (only what Google sends us when you sign in)</li>
  <li>A unique user id we generate</li>
</ul>

<h3>When you use the site</h3>
<ul>
  <li>Tools you save to your library (stored against your user id)</li>
  <li>Reviews you write (publicly attributed to your display name)</li>
  <li>Server logs containing your IP address and browser user-agent, retained for 30 days for security and abuse prevention</li>
</ul>

<h3>If you subscribe to the newsletter</h3>
<ul>
  <li>Your email address and the page that referred you (e.g. "footer", "blog-sidebar"), so we can attribute signups</li>
</ul>

<h2>2. How we use your information</h2>
<p>Strictly to operate the service — sync your saved tools across devices, attribute your reviews, send the newsletter you asked for, and protect against abuse. We don't profile you for advertising. We don't sell, rent, or share your data with third parties for marketing.</p>

<h2>3. Cookies</h2>
<p>See our <a href="/cookies">Cookie Policy</a> for the specifics. Short version: we use one cookie for sign-in sessions and one for save/like state. Both are essential to the service.</p>

<h2>4. Third parties we share data with</h2>
<p>We rely on a handful of vendors to run the site. Each only sees what's strictly necessary:</p>
<ul>
  <li><strong>Google OAuth</strong> — to verify your sign-in</li>
  <li><strong>Neon / Postgres</strong> — to store your account and saves</li>
  <li><strong>Vercel</strong> — to host the site</li>
  <li><strong>Resend</strong> — to send newsletter emails (only if you subscribed)</li>
</ul>

<h2>5. Your rights</h2>
<p>You can <strong>access</strong>, <strong>correct</strong>, or <strong>delete</strong> any data we hold about you. Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a> with the subject "Data request" and we'll respond within 14 days.</p>

<h2>6. Children</h2>
<p>The service is intended for users 16 and older. If you're under 16, please don't sign in or subscribe to the newsletter.</p>

<h2>7. Changes to this policy</h2>
<p>If we materially change how we handle data, we'll post the new version here and email registered users at least 14 days before the change takes effect.</p>

<h2>Questions?</h2>
<p>Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>.</p>
    `.trim(),
    seoTitle: "Privacy Policy — AI Tools Set",
    seoDescription: "We collect the minimum needed to operate the site. We don't sell data. Full plain-English breakdown.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    deck: "The rules of the road for using AI Tools Set. By using the site you agree to these terms.",
    body: `
<h2>1. The service</h2>
<p>AI Tools Set is a directory and editorial site about AI tools. We provide curated listings, reviews, and recommendations. We don't operate the tools themselves — those are run by third parties.</p>

<h2>2. Acceptable use</h2>
<p>By using AI Tools Set you agree to:</p>
<ul>
  <li>Use the service lawfully</li>
  <li>Respect other users in reviews and submissions</li>
  <li>Not scrape, mirror, or republish our editorial content without permission</li>
  <li>Not submit fraudulent tool listings or fake reviews</li>
  <li>Not abuse the submission form to spam our editorial team</li>
</ul>
<p>We reserve the right to delete content or ban accounts that violate these rules.</p>

<h2>3. Editorial disclaimers</h2>
<p>Every tool listing is an <strong>editorial opinion</strong>. We do our best to verify accuracy, but the AI space moves fast and listings can drift from reality. We don't guarantee a tool will continue to work as described after publication.</p>
<p>We are not liable for any losses or damages arising from your use of a tool you discovered on AI Tools Set. Read the tool's own terms before you sign up.</p>

<h2>4. User-submitted content</h2>
<p>When you submit a review, tool, or comment, you grant us a non-exclusive licence to display, reformat, and distribute it on the site. You keep ownership of the content. You can request removal at any time.</p>
<p>Don't submit content you don't have the rights to. We respond to good-faith copyright takedown notices within 14 days.</p>

<h2>5. Affiliate links and deals</h2>
<p>Some links — clearly marked with the <strong>⭐ Exclusive</strong> badge — are affiliate links that earn us a small commission when you sign up. This never affects a tool's ranking. In most cases the affiliate code gives you a deeper discount than the tool's public price.</p>

<h2>6. Pricing and submissions</h2>
<p>Free tool submissions are reviewed within 48 hours but inclusion is not guaranteed — we apply editorial judgement.</p>
<p>Featured listings are paid placements that get homepage rail placement and a verified badge. They're clearly marked. Payment doesn't guarantee a tool will pass editorial review.</p>

<h2>7. Termination</h2>
<p>You can delete your account at any time by emailing <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>. We can suspend or terminate accounts that violate these terms.</p>

<h2>8. Changes</h2>
<p>We can update these terms at any time. Material changes get a 14-day notice at the top of the page and an email to registered users.</p>

<h2>9. Governing law</h2>
<p>These terms are governed by the laws of the jurisdiction where AI Tools Set is operated. Any disputes will be resolved in those courts.</p>

<h2>Questions?</h2>
<p>Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>.</p>
    `.trim(),
    seoTitle: "Terms of Service — AI Tools Set",
    seoDescription: "The rules of the road. Editorial disclaimers, acceptable use, affiliate disclosure, and the rest.",
  },
  {
    slug: "contact",
    title: "Contact",
    deck: "We read every email. Pick the channel that fits — we usually respond within 48 hours.",
    body: `
<h2>General enquiries</h2>
<p>Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>. We answer questions about the site, the editorial process, and partnership opportunities.</p>

<h2>Submit a tool</h2>
<p>Don't email us — use the <a href="/submit">submission form</a>. It feeds straight into our editorial queue and gets reviewed within 48 hours. Email submissions slow us down.</p>

<h2>Press</h2>
<p>For press enquiries, podcast appearances, or quotes for articles, email <a href="mailto:press@aitoolsset.com">press@aitoolsset.com</a> with your deadline in the subject line.</p>

<h2>Report an issue</h2>
<p>Found a broken link, an out-of-date listing, an expired deal, or a security issue? Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a> with the URL and a short description. We fix verified reports within 24 hours.</p>

<h2>Affiliate / partnership</h2>
<p>If you're a tool maker wanting to discuss a featured listing, exclusive deal, or content partnership, email <a href="mailto:partners@aitoolsset.com">partners@aitoolsset.com</a>. We respond to every legitimate enquiry.</p>

<h2>Newsletter</h2>
<p>To subscribe, use the form in the footer of any page. To unsubscribe, click the unsubscribe link at the bottom of any newsletter email.</p>

<h2>Data requests</h2>
<p>For account, GDPR, or data-deletion requests, email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a> with the subject "Data request". We respond within 14 days.</p>
    `.trim(),
    seoTitle: "Contact AI Tools Set",
    seoDescription: "Email us, submit a tool, report an issue, or pitch a partnership. We respond within 48 hours.",
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    deck: "What cookies we use, why, and how to turn them off.",
    body: `
<h2>The short version</h2>
<p>We use the minimum number of cookies needed to keep you signed in and remember which tools you've saved. We do not use third-party advertising cookies, tracking pixels, or behavioural retargeting.</p>

<h2>1. What is a cookie?</h2>
<p>A cookie is a small text file your browser stores when you visit a website. Cookies let a site recognise you across page loads — that's how we know you're signed in or which tools you've already saved.</p>

<h2>2. Cookies we use</h2>
<h3>Essential cookies</h3>
<ul>
  <li><strong>Session cookie</strong> — set when you sign in with Google. Used to keep you signed in. Expires 30 days after your last visit. Set by NextAuth.</li>
  <li><strong>CSRF token</strong> — protects sign-in forms from cross-site request forgery. Set by NextAuth.</li>
</ul>

<h3>Functional storage (not technically a cookie, but worth mentioning)</h3>
<ul>
  <li><strong>localStorage <code>ats-saved</code></strong> — remembers tools you've saved so they persist across page loads, even when signed out</li>
  <li><strong>localStorage <code>ats-votes</code></strong> — same idea for likes</li>
  <li><strong>localStorage <code>ats-img-saved</code></strong> — saved image prompts</li>
</ul>
<p>localStorage stays on your device and is never sent to our servers.</p>

<h2>3. What we don't use</h2>
<ul>
  <li>No Google Analytics, Mixpanel, Amplitude, or similar third-party analytics</li>
  <li>No Facebook Pixel, X (Twitter) Pixel, LinkedIn Insight Tag, or retargeting cookies</li>
  <li>No fingerprinting</li>
  <li>No selling of any cookie data</li>
</ul>
<p>We use Vercel's privacy-friendly Web Analytics for aggregate page-view counts. It uses no cookies and no personal identifiers.</p>

<h2>4. How to control cookies</h2>
<p>You can block or delete cookies in your browser settings:</p>
<ul>
  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
  <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Firefox</a></li>
  <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
</ul>
<p>If you block the session cookie, you won't be able to sign in.</p>

<h2>5. Changes to this policy</h2>
<p>If we add a new cookie, we'll list it here and update the date below. If the change is material (e.g. we add a third-party cookie), we'll notify registered users by email.</p>

<h2>Questions?</h2>
<p>Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>.</p>
    `.trim(),
    seoTitle: "Cookie Policy — AI Tools Set",
    seoDescription: "Two essential cookies, zero tracking. Plain-English breakdown of every cookie we use.",
  },
];

/**
 * Bulk-publish every page currently in draft. Sets publishedAt
 * to now if it wasn't already set. Returns the slugs published.
 */
export async function publishAllDraftPages(): Promise<{ published: string[] }> {
  await requireEditor();
  const drafts = await db
    .select({ id: sitePages.id, slug: sitePages.slug, publishedAt: sitePages.publishedAt })
    .from(sitePages)
    .where(eq(sitePages.status, "draft"));

  const now = new Date();
  for (const d of drafts) {
    await db
      .update(sitePages)
      .set({
        status: "published",
        publishedAt: d.publishedAt ?? now,
        updatedAt: now,
      })
      .where(eq(sitePages.id, d.id));
    revalidatePath(`/${d.slug}`);
  }
  revalidatePath("/admin/pages");
  return { published: drafts.map((d) => d.slug) };
}

export type SeedResult = { created: string[]; skipped: string[] };

/**
 * Create the standard 5 site pages in draft mode. Skips any
 * slug that already exists, so this is safe to re-run.
 */
export async function seedDefaultPages(): Promise<SeedResult> {
  await requireEditor();

  // Fetch existing slugs in one shot
  const existing = await db.select({ slug: sitePages.slug }).from(sitePages);
  const existingSet = new Set(existing.map((r) => r.slug));

  const created: string[] = [];
  const skipped: string[] = [];

  for (const page of DEFAULT_PAGES) {
    if (existingSet.has(page.slug)) {
      skipped.push(page.slug);
      continue;
    }
    await db.insert(sitePages).values({
      slug: page.slug,
      title: page.title,
      deck: page.deck,
      body: page.body,
      status: "draft",
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
    });
    created.push(page.slug);
  }

  revalidatePath("/admin/pages");
  return { created, skipped };
}

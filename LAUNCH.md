# Launch runbook — aitoolsset.com cutover

Goal: replace the WordPress site on **aitoolsset.com** (Hostinger) with this
Next.js app (currently on aitoolsset.vercel.app), without losing the domain's
existing search equity. Target: **Monday**.

---

## Phase 0 — Weekend prep (before touching DNS)

- [ ] **Merge `secure-cms-2fa` → `main`** (contains 2FA/login security + all SEO fixes) and let Vercel deploy.
- [ ] **Export the WordPress URL list** while the WP site is still up:
      open `https://aitoolsset.com/sitemap.xml` (or `/wp-sitemap.xml`) and save every URL.
      These are the URLs that need 301 mappings.
- [ ] **Map old → new URLs**: for each WP URL pick the closest equivalent
      (`/category/x` → `/ai-tools/x`, posts → `/blog/…`, everything unmappable → `/`).
      Add them to `redirects()` in `next.config.mjs`.
- [ ] **Backup WordPress** (Hostinger → Files → download a full backup). If the old
      site has content worth keeping, export it now — after cutover it's unreachable.
- [ ] **Vercel env vars** (Production):
      - [ ] `ADMIN_EMAILS` — your email (only allowlisted emails can sign in at all)
      - [ ] `AUTH_SECRET` — strong random (signs sessions AND the 2FA cookie)
      - [ ] `AUTH_URL` = `https://aitoolsset.com`
      - [ ] `SITE_URL` = `https://aitoolsset.com`
      - [ ] `RESEND_API_KEY` + `EMAIL_FROM` (magic-link sign-in)
      - [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`
      - [ ] `ORG_SAMEAS` — comma-separated social profile URLs (X, LinkedIn, …) once created
      - [ ] Leave `REDIRECT_TO_APEX` **unset** until Phase 2 is done
- [ ] **Test the admin flow on the current deployment**: `/portal-admin` → login → magic link
      → 2FA QR enrollment → save backup codes → dashboard loads.

## Phase 1 — Domain cutover (Monday)

- [ ] **Vercel → Project → Settings → Domains** → add `aitoolsset.com` and `www.aitoolsset.com`
      (set www → apex redirect in the same screen).
- [ ] **Hostinger → DNS**: follow the records Vercel shows —
      apex `A` → `76.76.21.21`, `www` `CNAME` → `cname.vercel-dns.com`.
      Delete the old A records pointing at Hostinger hosting.
- [ ] Wait for Vercel to show the domain as valid (minutes → a few hours for DNS TTL).
- [ ] **Smoke test on the real domain**:
      - [ ] `https://aitoolsset.com` loads the new homepage (not WordPress)
      - [ ] `https://aitoolsset.com/ai-tool/zapier` renders with pricing table
      - [ ] `https://aitoolsset.com/robots.txt` shows the new rules (GPTBot etc.)
      - [ ] `https://aitoolsset.com/llms.txt` returns the content map
      - [ ] `https://aitoolsset.com/portal-admin` → login → 2FA works on the real domain
      - [ ] A couple of old WP URLs 301 to their mapped targets

## Phase 2 — Immediately after cutover

- [ ] Set `REDIRECT_TO_APEX=1` in Vercel env (Production) + redeploy →
      `aitoolsset.vercel.app` now 308s to `aitoolsset.com` (kills the duplicate mirror).
- [ ] **Google Search Console**: add property `aitoolsset.com` (domain property via DNS
      TXT is best) → submit `https://aitoolsset.com/sitemap.xml`.
- [ ] **Bing Webmaster Tools**: add the site (can import from GSC) → submit sitemap.
- [ ] Request indexing in GSC for: `/`, `/ai-tools`, 2–3 top category pages, 2–3 top tools.

## Phase 3 — First week watch

- [ ] GSC → Coverage: watch for 404 spikes from unmapped WP URLs → add redirects as found.
- [ ] GSC → Sitemaps: confirm URLs discovered ≈ URL count in sitemap.
- [ ] Check `site:aitoolsset.com` on Google — WP pages should progressively swap to new ones.
- [ ] Watch Vercel logs for traffic to weird legacy paths (`/wp-content/…`) — safe to ignore,
      or 410 them later.
- [ ] Uptime check on `/` and `/portal-admin/login` (e.g. UptimeRobot free).

## Rollback

DNS is the only switch. If something is badly broken: restore Hostinger's original
A record and the WP site is back while you fix things. Keep the WP hosting plan
active for at least 30 days after cutover.

---

## SEO facts baked into this build (don't regress)

- Every public page emits a **canonical + hreflang (en/ko/x-default)** via
  `alternatesFor()` — new pages must do the same.
- **No synthetic ratings**: `aggregateRating` only renders from real rows in the
  reviews table. Never reintroduce placeholder ratings/counts.
- **Honest counts** ("590+ tools / 80+ categories") — update visible claims as the
  DB grows; never inflate.
- `/search` is noindexed, robots-disallowed, and absent from the sitemap.
- `/llms.txt` is generated from the DB (6h cache) — keep it accurate.
- robots.txt explicitly allows GPTBot / ClaudeBot / PerplexityBot / Google-Extended
  etc. Blocking them kills AI-citation visibility; discuss before changing.

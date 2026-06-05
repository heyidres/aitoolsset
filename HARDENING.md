# Production hardening checklist

Status of every production-readiness item, what to do next.

---

## ✅ Built — already live in code

### Security headers — `next.config.mjs`
Applied to every route:
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — stops MIME sniffing attacks
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera/mic/geolocation denied; FLoC opted out
- `Strict-Transport-Security` — 2-year HSTS with preload + subdomains
- `Content-Security-Policy` — script/style/img/connect sources whitelisted
- `X-DNS-Prefetch-Control: on`

If a legitimate third-party script breaks, edit the CSP `script-src` / `connect-src` directive — don't disable headers wholesale.

### Rate limiting — `lib/rate-limit.ts`
In-memory token bucket, per IP, applied to:
- `/api/submit-tool` and `submitTool` server action — 3 / hour / IP
- `/api/newsletter` and `subscribeNewsletter` server action — 5 per 10 minutes / IP

**Limitation:** in-memory means each Vercel worker has its own bucket. Good enough as a deterrent. For proper distributed limiting, swap to [@upstash/ratelimit](https://github.com/upstash/ratelimit) — same API shape, drop-in replacement.

### HTML sanitization — `lib/sanitize.ts`
Uses `isomorphic-dompurify` to strip `<script>`, `<style>`, `<iframe>`, event handlers, and `javascript:` URLs from any DB-supplied HTML before rendering. Applied to:
- Blog post body
- Page (CMS) body
- Glossary definitions
- Tool description
- News article body

### Cloudflare Turnstile — `lib/turnstile.ts` + `<TurnstileWidget>`
Invisible bot challenge on `/submit` and the footer newsletter form.

**To activate:** set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel env vars. Until set, the widget is a no-op and server verification returns true.

### Sentry — `sentry.{client,server,edge}.config.ts` + `instrumentation.ts`
DSN-conditional — completely silent without `NEXT_PUBLIC_SENTRY_DSN` set.

**To activate:**
1. Sign up at [sentry.io](https://sentry.io) (free 5k errors/mo)
2. Create a Next.js project, copy the DSN
3. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel
4. Redeploy

After activation, all uncaught errors (client + server + edge runtime) flow to Sentry with stack traces.

### Audit log — `lib/audit.ts` + DB `audit_log` table
Writes admin actions to Postgres. Every tool publish, page delete, role change, etc. has an indelible record of who did what and when. View at `/admin` once the dashboard surfaces it.

---

## ⚠ Action needed from you

### 1. Verify Neon database backups (5 min)

Neon's backup behavior depends on your plan:

- **Free tier** — Point-in-time recovery (PITR) is limited to **24 hours of history**
- **Launch ($19/mo)** — 7 days of PITR
- **Scale ($69/mo)** — 30 days of PITR

To verify your retention window:

1. Open https://console.neon.tech → your project
2. Top nav: **Backups** (or **PITR History**)
3. Check the "Restore window" — that's your max look-back

If you're on the free tier and the site matters, consider upgrading or setting up an **automated daily dump to S3 / R2** via a small cron job.

### 2. Activate Cloudflare Turnstile (10 min)

1. Sign up at https://www.cloudflare.com (free)
2. Dashboard → **Turnstile** → Add site
   - Domain: `aitoolsset.vercel.app` (and your custom domain once configured)
   - Widget mode: **Managed**
3. Copy **Site Key** → set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel
4. Copy **Secret Key** → set `TURNSTILE_SECRET_KEY` in Vercel
5. Redeploy

After activation: bots can't spam `/submit` or `/newsletter` — invisible to real users.

### 3. Activate Sentry (10 min)

1. Sign up at https://sentry.io (free 5k events/mo)
2. Create a **Next.js** project
3. Copy the DSN (starts with `https://...@o....ingest.sentry.io/...`)
4. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel
5. Redeploy

After this you find out about production errors within seconds, not when users complain.

### 4. Optional: Upgrade rate limiting (when traffic warrants)

Once you're getting > 100 visitors/min, swap the in-memory rate limiter for [Upstash](https://upstash.com):

1. Sign up at upstash.com (free tier: 10k commands/day)
2. Create a Redis database
3. Copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` into Vercel env
4. `npm install @upstash/ratelimit @upstash/redis`
5. Replace `lib/rate-limit.ts` with the [Upstash example](https://github.com/upstash/ratelimit#nextjs)

The function signature stays identical — every caller works unchanged.

---

## Threat model — what's covered

| Threat | Coverage |
|---|---|
| SQL injection | Drizzle parameterized queries |
| XSS via stored content | DOMPurify on all DB-sourced HTML |
| Clickjacking | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Insecure transport | HSTS with 2y max-age + preload |
| CSRF on session cookies | NextAuth SameSite=Lax cookies |
| Brute-force bot submissions | Rate limiting + Turnstile (when activated) |
| Auth bypass on admin routes | `middleware.ts` + `requireEditor()` in every action |
| File upload abuse | MIME whitelist + 5 MB cap + admin-only access |
| Insecure direct object reference (IDOR) | Every write checks `authorId === session.user.id` |
| Open redirect | No user-controlled redirect destinations |
| Secrets leaked to client | Audited: no `NEXT_PUBLIC_` env contains a secret |

## Threats NOT mitigated (acknowledged risks)

| Threat | Why it's accepted |
|---|---|
| Compromised editor account | The dataset is editorial content, not PII. An attacker would have to compromise a Google account, then add CSS-bypassing HTML (DOMPurify blocks scripts). Worst case: visual defacement, easily reverted via git history of the DB |
| DDoS at the edge | Vercel's free tier has unlimited but throttled bandwidth. For real DDoS protection, put Cloudflare in front of the domain (free) |
| 0-day in a dependency | Mitigated by `npm audit` + Dependabot (enable in GitHub Settings → Code security) |
| Email enumeration via newsletter | Idempotent endpoint returns 200 whether the email exists or not — no oracle |
| Stripe payment fraud | N/A — Stripe isn't wired yet |

---

## Lighthouse / security scanner expectations

After deploy:

- [securityheaders.com](https://securityheaders.com) — **A** rating
- [observatory.mozilla.org](https://observatory.mozilla.org) — **B+** to **A** (CSP `unsafe-inline` keeps it below A+)
- Lighthouse Best Practices — **100**
- Lighthouse SEO — **100**

The remaining `unsafe-inline` and `unsafe-eval` in the CSP are required by Next.js / Tailwind / Vercel Analytics. Removing them requires Next.js to be configured for strict CSP with nonces — Next 15 doesn't yet ship a stable solution.

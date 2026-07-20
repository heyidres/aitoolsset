/**
 * Composed middleware: i18n locale handling for public routes,
 * NextAuth role gating for `/portal-admin/*`.
 *
 * Order matters:
 *   1. Skip middleware entirely for static files, API routes,
 *      OG/icon endpoints, and crawlers (Google crawls each locale
 *      URL on its own — we must NOT auto-redirect bots).
 *   2. If path is /portal-admin/* → run NextAuth gate, then pass through
 *      (admin pages are English-only — no i18n routing).
 *   3. Otherwise → run next-intl locale negotiation (detects best
 *      locale from URL, cookie, accept-language, or GeoIP, then
 *      either passes through or 302-redirects with cookie set).
 */

import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { i18n, isLocale } from "@/lib/i18n/config";

// next-intl returns a middleware-fn. We wrap it so we can also
// honor GeoIP (Vercel sets x-vercel-ip-country) on first visit.
const intlMiddleware = createIntlMiddleware({
  ...routing,
  // localeDetection OFF: with it on, next-intl inspects Accept-Language
  // (adding a Vary header) and writes a locale cookie, both of which make
  // page responses uncacheable at the CDN — forcing a cold render on every
  // visit. Locale now comes from the URL prefix plus our GeoIP first-visit
  // redirect (`geoFirstLocaleRedirect`), and responses stay cacheable so
  // ISR/static pages serve instantly from the edge.
  localeDetection: false,
});

const BOT_UA_RE = /bot|crawl|slurp|spider|facebookexternalhit|whatsapp|telegram|skypeuripreview|linkedinbot/i;

function isBot(req: NextRequest): boolean {
  return BOT_UA_RE.test(req.headers.get("user-agent") ?? "");
}

/**
 * If the visitor has no locale cookie, no locale prefix in the URL,
 * and their Vercel-edge country maps to a non-default locale, send
 * them there. This is the GeoIP layer that fires BEFORE next-intl's
 * accept-language detection.
 */
function geoFirstLocaleRedirect(req: NextRequest): NextResponse | null {
  // Already on a locale prefix? — let next-intl handle.
  const firstSegment = req.nextUrl.pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return null;

  // Bots are NEVER auto-redirected — Google crawls each URL on its own.
  if (isBot(req)) return null;

  // Cookie set? — respect the user's prior choice; let next-intl handle.
  if (req.cookies.has(i18n.cookieName)) return null;

  const country = req.headers.get("x-vercel-ip-country");
  if (!country) return null;

  const mappedLocale = i18n.countryToLocale[country];
  if (!mappedLocale || mappedLocale === i18n.defaultLocale) return null;

  // Soft 302 redirect — user can still switch back manually.
  const url = req.nextUrl.clone();
  url.pathname = `/${mappedLocale}${req.nextUrl.pathname}`;
  const res = NextResponse.redirect(url, 302);
  // Persist the choice so we don't redirect again on the next visit.
  res.cookies.set(i18n.cookieName, mappedLocale, {
    maxAge: i18n.cookieMaxAge,
    path: "/",
    sameSite: "lax",
  });
  return res;
}

// Pass through, forwarding the pathname to server components so the
// admin layout can render /portal-admin/login and /portal-admin/2fa "bare" (no CMS
// shell / no session redirect) while gating everything else.
function pass(req: NextRequest): NextResponse {
  const h = new Headers(req.headers);
  h.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: h } });
}

// IMPORTANT: this is a plain middleware function, NOT wrapped in the
// `auth()` HOC. Middleware runs on the Edge runtime, which can't open the
// raw TCP sockets the postgres-js driver needs (the old Neon HTTP driver
// could, since it was fetch-based — that's what let `auth()` wrap
// everything before). `auth()` now only gets called below for
// /portal-admin paths, which actually need the session; every public
// page skips it entirely and never touches the DB from middleware.
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 0. Canonical-host redirect (post-cutover only) ─────────
  // Once aitoolsset.com points at Vercel, set REDIRECT_TO_APEX=1 so the
  // *.vercel.app mirror 308s to the canonical domain instead of serving
  // duplicate content. Env-gated because BEFORE cutover vercel.app IS
  // the site — redirecting it early would take the whole site down.
  if (process.env.REDIRECT_TO_APEX === "1") {
    const host = req.headers.get("host") ?? "";
    const canonical = (process.env.SITE_URL ?? "https://aitoolsset.com").replace(/\/$/, "");
    if (host.endsWith(".vercel.app")) {
      return NextResponse.redirect(
        new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, canonical),
        308
      );
    }
  }

  // ── 1. Admin paths ────────────────────────────────────────
  // NO database work happens here. Middleware runs on the Edge runtime,
  // which can't open the TCP sockets the postgres-js driver needs — so
  // calling auth() (a DB session lookup) here hangs the request until the
  // platform kills it (MIDDLEWARE_INVOCATION_TIMEOUT). That's why the old
  // Neon HTTP driver worked here and postgres-js does not.
  //
  // Auth + role + MFA are enforced instead in the Node-runtime admin
  // layout (app/portal-admin/layout.tsx), where the DB driver works. Here
  // we only forward the pathname so the layout knows which page it's on.
  if (pathname.startsWith("/portal-admin")) {
    return pass(req);
  }

  // ── 2. Public routes — i18n negotiation ───────────────────
  // GeoIP first (only for first-time visitors).
  const geo = geoFirstLocaleRedirect(req);
  if (geo) return geo;

  // next-intl handles everything else (locale prefix detection,
  // accept-language fallback, cookie write).
  return intlMiddleware(req);
}

export const config = {
  // Match everything EXCEPT:
  //   - static assets (/_next, /favicon, /assets, files with extensions)
  //   - API routes (/api/*)
  //   - SEO endpoints (/robots.txt, /sitemap.xml)
  //   - Image / OG endpoints
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)",
  ],
};

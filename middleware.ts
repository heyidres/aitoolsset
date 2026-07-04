/**
 * Composed middleware: i18n locale handling for public routes,
 * NextAuth role gating for `/admin/*`.
 *
 * Order matters:
 *   1. Skip middleware entirely for static files, API routes,
 *      OG/icon endpoints, and crawlers (Google crawls each locale
 *      URL on its own — we must NOT auto-redirect bots).
 *   2. If path is /admin/* → run NextAuth gate, then pass through
 *      (admin pages are English-only — no i18n routing).
 *   3. Otherwise → run next-intl locale negotiation (detects best
 *      locale from URL, cookie, accept-language, or GeoIP, then
 *      either passes through or 302-redirects with cookie set).
 */

import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { verifyMfaToken, MFA_COOKIE } from "@/lib/admin-mfa";
import { routing } from "@/lib/i18n/routing";
import { i18n, isLocale } from "@/lib/i18n/config";

// next-intl returns a middleware-fn. We wrap it so we can also
// honor GeoIP (Vercel sets x-vercel-ip-country) on first visit.
const intlMiddleware = createIntlMiddleware({
  ...routing,
  // We do our own negotiation in `geoFirstLocaleRedirect` below
  // so we can layer GeoIP on top of next-intl's accept-language
  // detection. localeDetection still runs as a fallback.
  localeDetection: true,
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
// admin layout can render /admin/login and /admin/2fa "bare" (no CMS
// shell / no session redirect) while gating everything else.
function pass(req: NextRequest): NextResponse {
  const h = new Headers(req.headers);
  h.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: h } });
}

export default auth(async (req) => {
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

  // ── 1. Admin gate ─────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // The login page is the ONE admin path reachable without a session.
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return pass(req as unknown as NextRequest);
    }

    const session = req.auth;
    if (!session?.user) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Signed in with a CMS role. The /admin/2fa flow is where you OBTAIN
    // the MFA proof, so it must be reachable without it.
    if (pathname === "/admin/2fa" || pathname.startsWith("/admin/2fa/")) {
      return pass(req as unknown as NextRequest);
    }

    // Enforce the short-lived TOTP proof (8h). Missing/expired → re-verify.
    const mfaOk = await verifyMfaToken(req.cookies.get(MFA_COOKIE)?.value, session.user.id);
    if (!mfaOk) {
      const url = new URL("/admin/2fa", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return pass(req as unknown as NextRequest);
  }

  // ── 2. Public routes — i18n negotiation ───────────────────
  // GeoIP first (only for first-time visitors).
  const geo = geoFirstLocaleRedirect(req as unknown as NextRequest);
  if (geo) return geo;

  // next-intl handles everything else (locale prefix detection,
  // accept-language fallback, cookie write).
  return intlMiddleware(req as unknown as NextRequest);
});

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

/**
 * Admin shell layout — wraps every /admin/* page with a fixed
 * dark sidebar and sticky topbar.
 *
 * Server component: fetches the session (to populate the user
 * card) plus three live counts shown as sidebar badges. Counts
 * are intentionally cheap — single SQL COUNT(*) or GROQ count().
 * If Sanity isn't configured yet, the tools badge falls back to 0.
 *
 * Middleware already gates /portal-admin to signed-in users, but we
 * double-check here so unauthenticated direct hits get a
 * graceful sign-in nudge instead of a stack trace.
 */

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { authWithRetry } from "@/lib/auth";
import { db } from "@/lib/db";
import { toolSubmissions, reviews } from "@/lib/db/schema";
import { getToolsCount } from "@/lib/cms";
import { verifyMfaToken, MFA_COOKIE } from "@/lib/admin-mfa";
import { Sidebar, type SidebarCounts } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";
import "./admin.css";

function isBarePath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · AI Tools Set",
  robots: { index: false, follow: false },
};

async function loadCounts(): Promise<SidebarCounts> {
  const [pendingSubs, recentReviews, toolCount] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(toolSubmissions)
      .where(sql`${toolSubmissions.status} = 'pending'`)
      .then((r) => r[0]?.n ?? 0)
      .catch(() => 0),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviews)
      .where(sql`${reviews.createdAt} > now() - interval '24 hours'`)
      .then((r) => r[0]?.n ?? 0)
      .catch(() => 0),
    getToolsCount().catch(() => 0),
  ]);

  return { submissions: pendingSubs, reviews: recentReviews, tools: toolCount };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  // The full admin gate (auth → role → MFA) lives HERE, on the Node
  // runtime, NOT in the Edge middleware: the postgres-js driver that
  // auth() needs can't run on Edge (it hangs → MIDDLEWARE_INVOCATION_TIMEOUT).

  // 1. Login is fully pre-auth — render bare, it owns its own flow.
  if (isBarePath(pathname, "/portal-admin/login")) {
    return <div className="admin-root">{children}</div>;
  }

  // 2. Everything else requires a signed-in CMS user with a CMS role.
  const session = await authWithRetry();
  if (!session?.user) {
    redirect("/portal-admin/login");
  }
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    redirect("/");
  }

  // 3. The 2fa page is where a signed-in user OBTAINS the MFA proof, so it
  //    must be reachable without one — but only by an authenticated CMS user.
  if (isBarePath(pathname, "/portal-admin/2fa")) {
    return <div className="admin-root">{children}</div>;
  }

  // 4. Enforce the short-lived (8h) TOTP proof on every other admin page.
  const mfaToken = (await cookies()).get(MFA_COOKIE)?.value;
  const mfaOk = await verifyMfaToken(mfaToken, session.user.id);
  if (!mfaOk) {
    redirect("/portal-admin/2fa");
  }

  const counts = await loadCounts();

  const sidebarUser = {
    name: session.user.name ?? session.user.email ?? "Editor",
    email: session.user.email ?? "",
    role:
      session.user.role === "admin"
        ? "Administrator"
        : session.user.role === "editor"
          ? "Editor"
          : "User",
    image: session.user.image ?? null,
  };

  return (
    <div className="admin-root">
      <div className="adm-app">
        <Sidebar counts={counts} user={sidebarUser} />
        <main className="adm-main">
          <Topbar />
          <div className="adm-content">{children}</div>
        </main>
      </div>
    </div>
  );
}

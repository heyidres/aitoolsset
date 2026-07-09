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
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toolSubmissions, reviews } from "@/lib/db/schema";
import { getToolsCount } from "@/lib/cms";
import { Sidebar, type SidebarCounts } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";
import "./admin.css";

// These render standalone (no CMS shell, no session redirect): the
// login page is pre-auth, and the 2fa page runs after sign-in but
// before the MFA proof exists. Middleware sets x-pathname so we can
// tell without a client-side pathname hook.
const BARE_PATHS = new Set(["/portal-admin/login", "/portal-admin/2fa"]);

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
  // Login / 2fa render bare — no shell, no gate. They own their own auth.
  if (BARE_PATHS.has(pathname)) {
    return <div className="admin-root">{children}</div>;
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/portal-admin/login");
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

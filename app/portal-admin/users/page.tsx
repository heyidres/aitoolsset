import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, adminInvites } from "@/lib/db/schema";
import { UsersList } from "./UsersList";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bootstrapAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function UsersPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  if (!isAdmin) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            Admins only
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
            Managing who has CMS access is restricted to admin accounts. Ask an admin to make
            changes on your behalf.
          </p>
        </div>
      </div>
    );
  }

  const bootstrap = bootstrapAdmins();
  const [staffRows, invites] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        totpEnabled: users.totpEnabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.role, ["admin", "editor"])),
    db.select().from(adminInvites),
  ]);

  const activeEmails = new Set(staffRows.map((u) => u.email.toLowerCase()));
  // Pending = invited but hasn't signed in yet (no user row with staff role).
  const pendingInvites = invites.filter((inv) => !activeEmails.has(inv.email.toLowerCase()));

  const staff = staffRows
    .map((u) => ({ ...u, isBootstrap: bootstrap.includes(u.email.toLowerCase()) }))
    .sort((a, b) => {
      if (a.isBootstrap !== b.isBootstrap) return a.isBootstrap ? -1 : 1;
      if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
      return a.email.localeCompare(b.email);
    });

  return (
    <div className="adm-panel">
      <div className="adm-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="adm-panel-title">Users</div>
          <div className="adm-panel-sub">
            {staff.length} staff account{staff.length === 1 ? "" : "s"}
            {pendingInvites.length > 0 ? ` · ${pendingInvites.length} pending invite${pendingInvites.length === 1 ? "" : "s"}` : ""}
          </div>
        </div>
      </div>
      <div className="adm-panel-body" style={{ padding: 24 }}>
        <UsersList
          currentUserId={session?.user.id ?? ""}
          staff={staff}
          pendingInvites={pendingInvites.map((i) => ({ email: i.email, role: i.role, createdAt: i.createdAt }))}
          hasBootstrapEmails={bootstrap.length > 0}
        />
      </div>
    </div>
  );
}

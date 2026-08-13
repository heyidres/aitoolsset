"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "../_components/admin-ui";
import { inviteUser, cancelInvite, updateUserRole, revokeAccess, resetUserMfa } from "./_actions";

type StaffRow = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "editor" | "admin";
  totpEnabled: boolean;
  createdAt: Date;
  isBootstrap: boolean;
};

type PendingInvite = {
  email: string;
  role: "user" | "editor" | "admin";
  createdAt: Date;
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function UsersList({
  currentUserId,
  staff,
  pendingInvites,
  hasBootstrapEmails,
}: {
  currentUserId: string;
  staff: StaffRow[];
  pendingInvites: PendingInvite[];
  hasBootstrapEmails: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>, successMsg: string) {
    setError(null);
    setMsg(null);
    start(async () => {
      try {
        const res = await action();
        if (res.ok) {
          setMsg(successMsg);
          router.refresh();
        } else {
          setError(res.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  function onInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    run(() => inviteUser(fd), `Invited ${email}.`);
    e.currentTarget.reset();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Invite form */}
      <form
        onSubmit={onInvite}
        style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", background: "var(--surface)", padding: 16, borderRadius: 10 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 240px" }}>
          <label htmlFor="invite-email" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>
            Email
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="teammate@company.com"
            style={{ height: 38, borderRadius: 8, border: "1px solid var(--border)", padding: "0 12px", fontSize: 14 }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label htmlFor="invite-role" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>
            Role
          </label>
          <select
            id="invite-role"
            name="role"
            defaultValue="editor"
            style={{ height: 38, borderRadius: 8, border: "1px solid var(--border)", padding: "0 10px", fontSize: 14 }}
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ height: 38 }}>
          + Invite
        </button>
      </form>

      {error && (
        <div style={{ background: "var(--red-bg, #fef2f2)", border: "1px solid #fecaca", color: "var(--red, #dc2626)", padding: "10px 14px", borderRadius: 8, fontSize: 13.5 }}>
          {error}
        </div>
      )}
      {msg && (
        <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", padding: "10px 14px", borderRadius: 8, fontSize: 13.5 }}>
          {msg}
        </div>
      )}

      {/* Active staff */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", marginBottom: 10 }}>
          Staff accounts
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>2FA</th>
              <th>Since</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => {
              const isSelf = u.id === currentUserId;
              const disabled = u.isBootstrap || isSelf || pending;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.email}</div>
                    {u.name && <div style={{ fontSize: 12, color: "var(--text-3)" }}>{u.name}</div>}
                  </td>
                  <td>
                    <Pill tone={u.role === "admin" ? "purple" : "blue"}>{u.role}</Pill>
                    {u.isBootstrap && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-3)" }}>
                        via ADMIN_EMAILS
                      </span>
                    )}
                  </td>
                  <td>
                    <Pill tone={u.totpEnabled ? "green" : "amber"}>
                      {u.totpEnabled ? "Enabled" : "Not set up"}
                    </Pill>
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--text-2)" }}>{fmtDate(u.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {!disabled && (
                        <button
                          type="button"
                          className="adm-btn-sm ghost"
                          disabled={pending}
                          onClick={() =>
                            run(
                              () => updateUserRole(u.id, u.role === "admin" ? "editor" : "admin"),
                              `${u.email} is now ${u.role === "admin" ? "an editor" : "an admin"}.`
                            )
                          }
                        >
                          Make {u.role === "admin" ? "editor" : "admin"}
                        </button>
                      )}
                      {u.totpEnabled && (
                        <button
                          type="button"
                          className="adm-btn-sm ghost"
                          disabled={pending}
                          onClick={() => {
                            if (confirm(`Reset 2FA for ${u.email}? They'll need to set it up again on next sign-in.`)) {
                              run(() => resetUserMfa(u.id), `2FA reset for ${u.email}.`);
                            }
                          }}
                        >
                          Reset 2FA
                        </button>
                      )}
                      {!disabled && (
                        <button
                          type="button"
                          className="adm-btn-sm danger"
                          disabled={pending}
                          onClick={() => {
                            if (confirm(`Revoke CMS access for ${u.email}? This takes effect immediately.`)) {
                              run(() => revokeAccess(u.id), `Revoked access for ${u.email}.`);
                            }
                          }}
                        >
                          Revoke
                        </button>
                      )}
                      {isSelf && <span style={{ fontSize: 12, color: "var(--text-3)" }}>(you)</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", marginBottom: 10 }}>
            Pending invites — not signed in yet
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Invited</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingInvites.map((inv) => (
                <tr key={inv.email}>
                  <td style={{ fontWeight: 600 }}>{inv.email}</td>
                  <td>
                    <Pill tone={inv.role === "admin" ? "purple" : "blue"}>{inv.role}</Pill>
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--text-2)" }}>{fmtDate(inv.createdAt)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="adm-btn-sm danger"
                      disabled={pending}
                      onClick={() => run(() => cancelInvite(inv.email), `Cancelled invite for ${inv.email}.`)}
                    >
                      Cancel invite
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hasBootstrapEmails && (
        <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>
          No ADMIN_EMAILS env var is set — every admin account currently exists only via invites
          above. Keep at least one working sign-in method in mind; there's no super-admin bootstrap
          fallback if the database allowlist is ever emptied by mistake.
        </div>
      )}
    </div>
  );
}

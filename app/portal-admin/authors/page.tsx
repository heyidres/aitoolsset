import Link from "next/link";
import { getAllAuthors } from "@/lib/cms";
import { deleteAuthor } from "./_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AuthorsAdminPage() {
  const rows = await getAllAuthors();

  if (rows.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            No authors yet
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 540, margin: "0 auto 22px" }}>
            Authors power your blog&apos;s E-E-A-T signal. Every post can be attributed to one or more authors, each with a bio, credentials, and verified external profiles. Google reads these as <code style={{ fontFamily: "var(--mono)", background: "var(--surface)", padding: "1px 6px", borderRadius: 4 }}>Person</code> entities for ranking.
          </p>
          <Link href="/portal-admin/authors/new" className="adm-btn-sm primary" style={{ padding: "10px 22px" }}>
            + Add your first author
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="adm-panel-title">Authors</div>
          <div className="adm-panel-sub">{rows.length} author{rows.length === 1 ? "" : "s"} — powers blog post bylines</div>
        </div>
        <Link href="/portal-admin/authors/new" className="adm-btn-sm primary">+ New author</Link>
      </div>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Slug</th>
            <th>Profiles</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {a.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photoUrl} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0052ff, #578bfa)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                      {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  )}
                  <strong>{a.name}</strong>
                </div>
              </td>
              <td style={{ color: "var(--text-2)", fontSize: 13 }}>{a.role ?? "—"}</td>
              <td><code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{a.slug}</code></td>
              <td style={{ fontSize: 12, color: "var(--text-3)" }}>
                {[a.linkedinUrl && "LinkedIn", a.xUrl && "X", a.githubUrl && "GitHub", a.websiteUrl && "Website"].filter(Boolean).join(" · ") || "—"}
              </td>
              <td style={{ textAlign: "right" }}>
                <Link href={`/portal-admin/authors/${a.id}/edit`} className="adm-btn-sm ghost" style={{ marginRight: 6 }}>Edit</Link>
                <form action={async () => { "use server"; await deleteAuthor(a.id); }} style={{ display: "inline" }}>
                  <button type="submit" className="adm-btn-sm ghost" style={{ color: "var(--red)" }}>Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

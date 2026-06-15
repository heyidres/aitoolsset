import Link from "next/link";
import type { CmsAuthor } from "@/lib/cms";
import { AuthorAvatar } from "./AuthorByline";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Rich author bios rendered below the article. Each card shows
 * photo, role, full bio, credential chips, and verifiable external
 * profile links. Together they feed Google's E-E-A-T signal: real
 * humans, real credentials, real off-site identity.
 */
export function AuthorCards({
  authors,
  reviewedBy,
}: {
  authors: CmsAuthor[];
  reviewedBy: CmsAuthor | null;
}) {
  if (authors.length === 0 && !reviewedBy) return null;

  return (
    <section
      style={{
        marginTop: 40,
        padding: "28px 0 12px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 11.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "var(--blue)",
          marginBottom: 12,
        }}
      >
        About the {authors.length === 1 ? "author" : "authors"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {authors.map((a) => (
          <AuthorCard key={a.slug} author={a} role="Author" />
        ))}
        {reviewedBy && <AuthorCard author={reviewedBy} role="Reviewer / Fact-checker" />}
      </div>
    </section>
  );
}

function AuthorCard({ author, role }: { author: CmsAuthor; role: string }) {
  const profiles = [
    author.websiteUrl && { label: "Website", url: author.websiteUrl },
    author.linkedinUrl && { label: "LinkedIn", url: author.linkedinUrl },
    author.xUrl && { label: "X", url: author.xUrl },
    author.githubUrl && { label: "GitHub", url: author.githubUrl },
  ].filter(Boolean) as Array<{ label: string; url: string }>;

  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: 20,
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <Link href={`/blog/author/${author.slug}`}>
        <AuthorAvatar author={author} size={64} />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
          <Link
            href={`/blog/author/${author.slug}`}
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 800,
              fontSize: 17,
              color: "var(--text)",
              textDecoration: "none",
              letterSpacing: "-.2px",
            }}
          >
            {author.name}
          </Link>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              padding: "2px 8px",
              borderRadius: 100,
              background: "var(--blue-soft)",
              color: "var(--blue)",
            }}
          >
            {role}
          </span>
        </div>
        {author.role && (
          <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 10, fontWeight: 500 }}>
            {author.role}
          </div>
        )}
        {author.bioHtml && (
          <div
            className="author-bio"
            style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 12 }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(author.bioHtml) }}
          />
        )}
        {author.credentials.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {author.credentials.map((c) => (
              <span
                key={c}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: 100,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                }}
              >
                ✓ {c}
              </span>
            ))}
          </div>
        )}
        {profiles.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12.5 }}>
            {profiles.map((p) => (
              <a
                key={p.label}
                href={p.url}
                target="_blank"
                rel="me noopener noreferrer"
                style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}
              >
                {p.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

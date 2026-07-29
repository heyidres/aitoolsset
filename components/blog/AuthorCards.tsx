import Link from "next/link";
import type { CmsAuthor } from "@/lib/cms";
import { AuthorAvatar } from "./AuthorByline";
import { LinkedInIcon, XIcon, GitHubIcon, WebsiteIcon } from "./SocialIcons";

/**
 * Author attribution rendered below the article: photo, name, role
 * tagline, credential chips, and verifiable external profile links.
 * Feeds Google's E-E-A-T signal — real humans, real credentials, real
 * off-site identity.
 *
 * Deliberately does NOT render the long-form bio (`bioHtml`). The full
 * bio lives on the author's own profile page; repeating it under every
 * article buried the links and pushed the footer down. The one-line role
 * is the tagline shown here instead.
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
    author.websiteUrl && { label: "Website", url: author.websiteUrl, Icon: WebsiteIcon },
    author.linkedinUrl && { label: "LinkedIn", url: author.linkedinUrl, Icon: LinkedInIcon },
    author.xUrl && { label: "X", url: author.xUrl, Icon: XIcon },
    author.githubUrl && { label: "GitHub", url: author.githubUrl, Icon: GitHubIcon },
  ].filter(Boolean) as Array<{ label: string; url: string; Icon: (p: { size?: number }) => React.ReactElement }>;

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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profiles.map(({ label, url, Icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                // rel="me" is what makes these count as identity verification
                // rather than ordinary outbound links.
                rel="me noopener noreferrer"
                aria-label={`${author.name} on ${label}`}
                title={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--white)",
                  color: "var(--text-2)",
                  textDecoration: "none",
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getAuthorBySlug, getPostsByAuthor } from "@/lib/cms";
import { sanitizeHtml } from "@/lib/sanitize";
import { JsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import { AuthorAvatar } from "@/components/blog/AuthorByline";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const a = await getAuthorBySlug(slug).catch(() => null);
    if (!a) return { title: "Author not found" };
    const desc = a.role
      ? `${a.role}. Read articles by ${a.name} on AI Tools Set.`
      : `Articles by ${a.name} on AI Tools Set.`;
    return {
      title: { absolute: `${a.name} — ${a.role ?? "Author"} | AI Tools Set` },
      description: desc,
      openGraph: {
        title: a.name,
        description: desc,
        type: "profile",
        url: `https://aitoolsset.com/blog/author/${a.slug}`,
        images: a.photoUrl ? [{ url: a.photoUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Author" };
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug).catch(() => null);
  if (!author) notFound();

  const posts = await getPostsByAuthor(slug).catch(() => []);

  // Person JSON-LD with sameAs for E-E-A-T identity consolidation.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://aitoolsset.com/blog/author/${author.slug}`,
    ...(author.photoUrl ? { image: author.photoUrl } : {}),
    ...(author.role ? { jobTitle: author.role } : {}),
    sameAs: [author.websiteUrl, author.linkedinUrl, author.xUrl, author.githubUrl].filter(Boolean),
  };

  return (
    <main>
      <JsonLd
        data={[
          personJsonLd,
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: author.name, url: `/blog/author/${author.slug}` },
          ]),
        ]}
      />
      <Nav />

      {/* Hero */}
      <section
        className="px-9 py-14 section-pad-x"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-[920px] mx-auto" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
          <AuthorAvatar author={author} size={120} />
          <div style={{ flex: 1, minWidth: 280 }}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-3 flex-wrap" style={{ color: "var(--text-3)" }}>
              <Link href="/" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>Home</Link>
              <span style={{ color: "var(--border-2)" }}>/</span>
              <Link href="/blog" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>Blog</Link>
              <span style={{ color: "var(--border-2)" }}>/</span>
              <span style={{ color: "var(--text-2)" }}>{author.name}</span>
            </nav>
            <h1
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                color: "var(--text)",
                marginBottom: 8,
              }}
            >
              {author.name}
            </h1>
            {author.role && (
              <div style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 14, fontWeight: 500 }}>
                {author.role}
              </div>
            )}
            {author.bioHtml && (
              <div
                className="author-bio"
                style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 14, maxWidth: 640 }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(author.bioHtml) }}
              />
            )}
            {author.credentials.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {author.credentials.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 100,
                      background: "#fff",
                      border: "1px solid var(--border)",
                      color: "var(--text-2)",
                    }}
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
              {author.websiteUrl && (
                <a href={author.websiteUrl} target="_blank" rel="me noopener noreferrer" style={{ color: "var(--blue)", fontWeight: 700 }}>
                  Personal site ↗
                </a>
              )}
              {author.linkedinUrl && (
                <a href={author.linkedinUrl} target="_blank" rel="me noopener noreferrer" style={{ color: "var(--blue)", fontWeight: 700 }}>
                  LinkedIn ↗
                </a>
              )}
              {author.xUrl && (
                <a href={author.xUrl} target="_blank" rel="me noopener noreferrer" style={{ color: "var(--blue)", fontWeight: 700 }}>
                  X ↗
                </a>
              )}
              {author.githubUrl && (
                <a href={author.githubUrl} target="_blank" rel="me noopener noreferrer" style={{ color: "var(--blue)", fontWeight: 700 }}>
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Posts by this author */}
      <section className="px-9 py-14 section-pad-x bg-white">
        <div className="max-w-[920px] mx-auto">
          <h2
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-.4px",
              marginBottom: 22,
              color: "var(--text)",
            }}
          >
            Articles by {author.name} <span style={{ color: "var(--text-3)", fontWeight: 600 }}>({posts.length})</span>
          </h2>
          {posts.length === 0 ? (
            <p style={{ color: "var(--text-3)", fontSize: 14 }}>No published articles yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  style={{
                    padding: "16px 18px",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    textDecoration: "none",
                    transition: "border-color .15s",
                    display: "block",
                  }}
                  className="hover:border-blue"
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      color: "var(--blue)",
                      marginBottom: 4,
                    }}
                  >
                    {p.category}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: "-.3px",
                      color: "var(--text)",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </div>
                  {p.deck && (
                    <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
                      {p.deck}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

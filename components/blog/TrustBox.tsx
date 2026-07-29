import { Link } from "@/lib/i18n/navigation";
import { getSlots } from "@/lib/site-content";

/**
 * Trust / editorial-standards components for article pages.
 *
 * Both read their copy from the site-content slot registry
 * (`blog.disclosure.*`, `blog.trust.*`) rather than hardcoding it, so the
 * wording can be corrected from /portal-admin/site-content without a
 * deploy. That matters here specifically because this copy makes factual
 * claims about how reviews are produced — if the process changes, the
 * claim has to be able to change with it.
 *
 * Server Components: getSlots() reads the DB.
 */

/**
 * Small print shown beside the byline at the top of an article —
 * the affiliate/independence disclosure, plus links out to the
 * methodology page.
 */
export async function BylineDisclosure() {
  const copy = await getSlots(["blog.disclosure.byline", "blog.trust.cta_label"]);

  return (
    <aside
      style={{
        fontSize: 12.5,
        lineHeight: 1.6,
        color: "var(--text-3)",
        borderLeft: "2px solid var(--border)",
        paddingLeft: 14,
        maxWidth: 340,
      }}
    >
      {copy["blog.disclosure.byline"]}{" "}
      <Link
        href="/methodology"
        style={{ color: "var(--text-2)", fontWeight: 600, textDecoration: "underline" }}
      >
        {copy["blog.trust.cta_label"]}
      </Link>
      .
    </aside>
  );
}

/**
 * The bordered "Why Trust Our Software Reviews" panel rendered inside the
 * article body, above the tool rundown. Only shown on posts that actually
 * list tools — see the caller — because the claims it makes are about
 * software reviewing specifically.
 */
export async function WhyTrustBox() {
  const copy = await getSlots([
    "blog.trust.title",
    "blog.trust.body",
    "blog.trust.cta_label",
  ]);

  return (
    <section
      aria-labelledby="why-trust-heading"
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r)",
        padding: "22px 24px",
        background: "var(--white)",
        margin: "32px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--green-bg)",
            border: `1px solid var(--green-border)`,
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <h2
          id="why-trust-heading"
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "-.3px",
            color: "var(--text)",
            margin: 0,
          }}
        >
          {copy["blog.trust.title"]}
        </h2>
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--text-2)", margin: 0 }}>
        {copy["blog.trust.body"]}
      </p>
      <Link
        href="/methodology"
        style={{
          display: "inline-block",
          marginTop: 12,
          fontSize: 13.5,
          fontWeight: 700,
          color: "var(--blue)",
          textDecoration: "none",
        }}
      >
        {copy["blog.trust.cta_label"]} →
      </Link>
    </section>
  );
}

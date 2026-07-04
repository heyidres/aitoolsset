import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About AI Tools Set",
  description:
    "AI Tools Set is the cleanest, most curated AI tools directory on the internet. Learn about our mission, our team, and how we review every tool.",
  alternates: { canonical: "https://aitoolsset.com/about" },
};

const VALUES = [
  { emoji: "🎯", title: "Curation over volume", desc: "A great shortlist beats an endless list. We'd rather feature 590 tools we trust than 50,000 we've never tested." },
  { emoji: "🤝", title: "Trust above all", desc: "No fake reviews, no pay-to-win rankings. Our recommendations are independent and honestly earned." },
  { emoji: "⚡", title: "Useful, not flashy", desc: "Clean design and fast pages. We respect your time and get you to the right tool with minimal friction." },
  { emoji: "🆓", title: "Free for everyone", desc: "Browsing the directory is — and always will be — completely free. We charge tool makers, not users." },
  { emoji: "🔍", title: "Radical transparency", desc: "We publish our review methodology and clearly label sponsored content. You always know what you're looking at." },
  { emoji: "🚀", title: "Always current", desc: "The AI world changes daily. So do we — updating tools, pricing, and rankings continuously." },
];

const TEAM = [
  { initials: "AK", grad: "linear-gradient(135deg,#578bfa,#0052ff)", name: "Awais Khan", role: "Founder & Editor", bio: "Started AI Tools Set after wasting too many hours sifting through AI tool spam. Reviews tools daily." },
  { initials: "SP", grad: "linear-gradient(135deg,#f472b6,#db2777)", name: "Sarah Park", role: "Lead Content Strategist", bio: "Writes the deep-dive guides and comparisons. Former tech journalist with a love for clear writing." },
  { initials: "DM", grad: "linear-gradient(135deg,#34d399,#059669)", name: "Dev Mehta", role: "Engineering Lead", bio: "Builds the platform and keeps it fast. Obsessed with clean code and sub-second page loads." },
  { initials: "PN", grad: "linear-gradient(135deg,#fbbf24,#d97706)", name: "Priya Nair", role: "Reviews Editor", bio: "Tests every submitted tool and moderates community reviews to keep quality high." },
];

export default function AboutPage() {
  return (
    <main>
      <Nav />

      <section className="page-hero">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,.55)" }}>About</span>
          </div>
          <div className="ph-eyebrow"><span className="dot" />Our Story</div>
          <h1>We help people find the<br />
            <span>right AI tool</span> — fast.
          </h1>
          <p>
            AI Tools Set is a human-curated directory of the best AI tools on the internet. No noise, no fake reviews, no pay-to-win rankings — just the tools that genuinely help you work better.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="section-light">
        <div className="sec-inner" style={{ padding: "48px 36px" }}>
          <div className="stat-row">
            <div className="stat-box"><div className="stat-num">590+</div><div className="stat-label">Tools curated</div></div>
            <div className="stat-box"><div className="stat-num">51k</div><div className="stat-label">Monthly visitors</div></div>
            <div className="stat-box"><div className="stat-num">48</div><div className="stat-label">Categories</div></div>
            <div className="stat-box"><div className="stat-num">12k+</div><div className="stat-label">User reviews</div></div>
          </div>
        </div>
      </div>

      {/* Mission prose */}
      <div className="content-wrap">
        <div className="prose">
          <h2>Our mission</h2>
          <p>The AI landscape moves fast — dozens of new tools launch every single day. For most people, finding the right one is overwhelming. Search results are cluttered with affiliate spam, fake &ldquo;top 10&rdquo; lists, and tools that stopped working months ago.</p>
          <p><strong>We started AI Tools Set to fix that.</strong> Our mission is simple: to be the single most trustworthy place to discover, compare, and choose AI tools — whether you&rsquo;re a writer looking for your next drafting assistant, a developer evaluating coding copilots, or a founder building an AI-powered stack.</p>
          <p>Every tool in our directory is reviewed by a real person. We test it, we verify it works, and we only feature it if it genuinely earns its place. We make money from featured listings and advertising — never from selling fake reviews or manipulating rankings. Our credibility depends on you trusting our recommendations, and we take that seriously.</p>
          <blockquote>If a tool isn&rsquo;t good enough that we&rsquo;d recommend it to a friend, it doesn&rsquo;t belong in our directory.</blockquote>
          <h2>What makes us different</h2>
          <h3>Human curation, not automation</h3>
          <p>Anyone can scrape the web and dump 50,000 &ldquo;AI tools&rdquo; into a database. We do the opposite — we hand-pick, test, and write about every tool, so you get a curated shortlist instead of an endless, useless list.</p>
          <h3>Honest, independent reviews</h3>
          <p>Our editorial team writes every review and guide. We don&rsquo;t accept payment to rank tools higher, and we clearly label any sponsored content. When we say a tool is the best, we mean it.</p>
          <h3>Always up to date</h3>
          <p>AI tools change constantly. We re-check pricing, features, and availability regularly, and we remove tools that are abandoned or no longer work — so you never waste time on a dead link.</p>
        </div>
      </div>

      {/* Values */}
      <div className="section-cream">
        <div className="sec-inner">
          <div className="sec-head">
            <div className="sec-eyebrow">What we believe</div>
            <div className="sec-title">Our values</div>
            <div className="sec-sub">The principles that guide every decision we make.</div>
          </div>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="value-card">
                <div className="vc-icon">{v.emoji}</div>
                <div className="vc-title">{v.title}</div>
                <div className="vc-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="section-light">
        <div className="sec-inner">
          <div className="sec-head">
            <div className="sec-eyebrow">The people behind it</div>
            <div className="sec-title">Meet the team</div>
            <div className="sec-sub">A small, focused team of AI enthusiasts, writers, and engineers.</div>
          </div>
          <div className="team-grid">
            {TEAM.map((t) => (
              <div key={t.name} className="team-card">
                <div className="team-av" style={{ background: t.grad }}>{t.initials}</div>
                <div className="team-name">{t.name}</div>
                <div className="team-role">{t.role}</div>
                <div className="team-bio">{t.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="content-wrap wide" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="cta-banner">
          <h2>Built an AI tool?</h2>
          <p>Get it in front of 50,000+ AI practitioners, developers, and early adopters.</p>
          <Link href="/submit" className="cta-btn">Submit your tool →</Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}

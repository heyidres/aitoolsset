import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TocSidebar } from "@/components/legal/TocSidebar";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How AI Tools Set uses cookies and how you can control them.",
  alternates: { canonical: "https://aitoolsset.com/cookies" },
};

const TOC = [
  { id: "what", label: "What are cookies" },
  { id: "types", label: "Types we use" },
  { id: "list", label: "Cookie list" },
  { id: "thirdparty", label: "Third-party cookies" },
  { id: "manage", label: "Managing cookies" },
  { id: "contact", label: "Contact" },
];

const COOKIES: Array<{ name: string; type: "ess" | "ana" | "mkt"; label: string; purpose: string; duration: string }> = [
  { name: "ats-saved", type: "ess", label: "Essential", purpose: "Remembers the tools you've saved", duration: "Persistent" },
  { name: "ats-session", type: "ess", label: "Essential", purpose: "Keeps you signed in during your visit", duration: "Session" },
  { name: "ats-prefs", type: "ess", label: "Essential", purpose: "Stores theme and display preferences", duration: "1 year" },
  { name: "_ga", type: "ana", label: "Analytics", purpose: "Google Analytics — distinguishes users", duration: "2 years" },
  { name: "_ga_*", type: "ana", label: "Analytics", purpose: "Google Analytics — session state", duration: "2 years" },
  { name: "ats-campaign", type: "mkt", label: "Marketing", purpose: "Tracks which campaign referred you", duration: "30 days" },
];

export default function CookiesPage() {
  return (
    <main>
      <Nav />

      <section className="page-hero">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,.55)" }}>Cookie Policy</span>
          </div>
          <div className="ph-eyebrow"><span className="dot" />Legal</div>
          <h1>Cookie <span>Policy</span></h1>
          <p>What cookies are, how we use them, and how you can stay in control of your data.</p>
        </div>
      </section>

      <div className="legal-layout">
        <TocSidebar items={TOC} />

        <div className="prose">
          <div className="updated-badge">🍪 Last updated: June 1, 2026</div>

          <h2 id="what">What are cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your actions and preferences — like staying signed in or keeping your saved tools — so you don&rsquo;t have to set them up every time. We also use similar technologies like local storage and pixels, which we refer to collectively as &ldquo;cookies&rdquo; in this policy.</p>

          <h2 id="types">Types of cookies we use</h2>
          <p>We group cookies into three categories:</p>
          <ul>
            <li><strong>Essential</strong> — required for the site to function (e.g. keeping you logged in, remembering saved tools). These can&rsquo;t be turned off.</li>
            <li><strong>Analytics</strong> — help us understand how visitors use the site so we can improve it. All data is aggregated.</li>
            <li><strong>Marketing</strong> — used to measure campaign performance and show relevant content. Optional.</li>
          </ul>

          <h2 id="list">Cookies we set</h2>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name}>
                  <td><strong>{c.name}</strong></td>
                  <td><span className={`ck-type ${c.type}`}>{c.label}</span></td>
                  <td>{c.purpose}</td>
                  <td>{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 id="thirdparty">Third-party cookies</h2>
          <p>Some cookies are set by third-party services we use, such as Google Analytics (traffic measurement) and Stripe (secure payments for listings). These providers have their own privacy and cookie policies, which we encourage you to review.</p>

          <h2 id="manage">Managing your cookies</h2>
          <p>You can control and delete cookies through your browser settings. Most browsers let you block all cookies, delete existing ones, or alert you when a cookie is set. Note that blocking essential cookies may break parts of the site — for example, your saved tools won&rsquo;t persist.</p>
          <p>Helpful links for popular browsers:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/kb/cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
          </ul>

          <h2 id="contact">Contact us</h2>
          <p>Questions about our use of cookies? Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a> or read our full <Link href="/privacy">Privacy Policy</Link>.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

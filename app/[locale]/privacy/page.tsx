import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TocSidebar } from "@/components/legal/TocSidebar";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AI Tools Set collects, uses, and protects your personal data.",
  alternates: { canonical: "https://aitoolsset.com/privacy" },
};

const TOC = [
  { id: "intro", label: "Introduction" },
  { id: "collect", label: "What we collect" },
  { id: "use", label: "How we use it" },
  { id: "cookies", label: "Cookies" },
  { id: "sharing", label: "Sharing & third parties" },
  { id: "rights", label: "Your rights" },
  { id: "security", label: "Data security" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <main>
      <Nav />

      <section className="page-hero">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,.55)" }}>Privacy Policy</span>
          </div>
          <div className="ph-eyebrow"><span className="dot" />Legal</div>
          <h1>Privacy <span>Policy</span></h1>
          <p>Your privacy matters. This policy explains what data we collect, why, and the choices you have.</p>
        </div>
      </section>

      <div className="legal-layout">
        <TocSidebar items={TOC} />

        <div className="prose">
          <div className="updated-badge">📅 Last updated: June 1, 2026</div>

          <h2 id="intro">Introduction</h2>
          <p>AI Tools Set (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website aitoolsset.com. This Privacy Policy explains how we collect, use, and safeguard your information when you use our directory, read our content, submit a tool, or create an account. By using the site, you agree to the practices described here.</p>

          <h2 id="collect">What information we collect</h2>
          <h3>Information you give us</h3>
          <ul>
            <li><strong>Account data</strong> — name and email when you register or save tools.</li>
            <li><strong>Submissions</strong> — tool details, website URL, contact email, and any content you submit for listing.</li>
            <li><strong>Reviews &amp; comments</strong> — content you post about tools.</li>
            <li><strong>Contact forms</strong> — the name, email, and message you send us.</li>
          </ul>
          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data</strong> — pages visited, tools clicked, time on site, and referring source.</li>
            <li><strong>Device data</strong> — browser type, operating system, and approximate location (from IP).</li>
            <li><strong>Cookies</strong> — small files that remember your preferences and saved tools (see our <Link href="/cookies">Cookie Policy</Link>).</li>
          </ul>

          <h2 id="use">How we use your information</h2>
          <p>We use the data we collect to:</p>
          <ul>
            <li>Provide and improve the directory and your saved-tools experience.</li>
            <li>Process tool submissions and respond to your enquiries.</li>
            <li>Send our newsletter and product updates (only if you opt in).</li>
            <li>Understand how the site is used so we can make it better.</li>
            <li>Prevent fraud, spam, and abuse.</li>
          </ul>
          <blockquote>We never sell your personal data to third parties. Full stop.</blockquote>

          <h2 id="cookies">Cookies &amp; tracking</h2>
          <p>We use cookies and similar technologies to keep you signed in, remember your saved tools, and measure traffic. You can control cookies through your browser settings. For full details, see our <Link href="/cookies">Cookie Policy</Link>.</p>

          <h2 id="sharing">Sharing &amp; third parties</h2>
          <p>We share limited data with trusted service providers who help us operate the site — for example analytics providers, email delivery services, and payment processors (Stripe). These partners are contractually bound to protect your data and may only use it to provide services to us. We may also disclose data where required by law.</p>

          <h2 id="rights">Your rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Withdraw consent for marketing at any time.</li>
            <li>Request a portable copy of your data.</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a>.</p>

          <h2 id="security">Data security</h2>
          <p>We use industry-standard measures — encryption in transit, access controls, and regular reviews — to protect your data. No method of transmission is 100% secure, but we work hard to keep your information safe.</p>

          <h2 id="changes">Changes to this policy</h2>
          <p>We may update this policy from time to time. When we make material changes, we&rsquo;ll update the &ldquo;last updated&rdquo; date above and, where appropriate, notify you by email.</p>

          <h2 id="contact">Contact us</h2>
          <p>Questions about this policy? Email <a href="mailto:hello@aitoolsset.com">hello@aitoolsset.com</a> or use our <Link href="/contact">contact form</Link>.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

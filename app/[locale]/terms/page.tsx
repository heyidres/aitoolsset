import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TocSidebar } from "@/components/legal/TocSidebar";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of AI Tools Set.",
  alternates: { canonical: "https://aitoolsset.com/terms" },
};

const TOC = [
  { id: "accept", label: "Acceptance" },
  { id: "use", label: "Use of the site" },
  { id: "accounts", label: "Accounts" },
  { id: "submissions", label: "Tool submissions" },
  { id: "reviews", label: "Reviews & content" },
  { id: "ip", label: "Intellectual property" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "liability", label: "Liability" },
  { id: "termination", label: "Termination" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <main>
      <Nav />

      <section className="page-hero">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,.55)" }}>Terms of Service</span>
          </div>
          <div className="ph-eyebrow"><span className="dot" />Legal</div>
          <h1>Terms of <span>Service</span></h1>
          <p>The rules of the road for using AI Tools Set. Please read them carefully.</p>
        </div>
      </section>

      <div className="legal-layout">
        <TocSidebar items={TOC} />

        <div className="prose">
          <div className="updated-badge">📅 Last updated: June 1, 2026</div>

          <h2 id="accept">Acceptance of terms</h2>
          <p>By accessing or using aitoolsset.com (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you don&rsquo;t agree, please don&rsquo;t use the Service. We may update these terms from time to time; continued use after changes constitutes acceptance.</p>

          <h2 id="use">Use of the site</h2>
          <p>You agree to use AI Tools Set only for lawful purposes. You must not:</p>
          <ul>
            <li>Scrape, copy, or republish our content without permission.</li>
            <li>Attempt to disrupt, overload, or compromise the Service.</li>
            <li>Submit false, misleading, or spammy content.</li>
            <li>Impersonate others or misrepresent your affiliation with any tool.</li>
            <li>Use the Service to distribute malware or unlawful material.</li>
          </ul>

          <h2 id="accounts">Accounts</h2>
          <p>You&rsquo;re responsible for keeping your account credentials secure and for all activity under your account. Notify us immediately of any unauthorized use. We may suspend or terminate accounts that violate these terms.</p>

          <h2 id="submissions">Tool submissions</h2>
          <p>When you submit a tool, you confirm that you own it or have permission to submit it, and that the information is accurate. We reserve the right to review, edit, reject, or remove any submission at our discretion. Paid listings are governed by the plan terms shown at checkout; you are not charged until your listing is approved. Refunds follow the policy stated on our <Link href="/submit">submission page</Link>.</p>

          <h2 id="reviews">Reviews &amp; user content</h2>
          <p>You retain ownership of content you post (reviews, comments), but you grant us a worldwide, royalty-free license to display and distribute it on the Service. You agree not to post content that is false, defamatory, infringing, or abusive. We may moderate, edit, or remove user content that violates these terms.</p>

          <h2 id="ip">Intellectual property</h2>
          <p>All content we create — text, design, logos, and software — is owned by AI Tools Set and protected by intellectual property laws. Tool names, logos, and trademarks belong to their respective owners and are used for identification only.</p>

          <h2 id="disclaimer">Disclaimer</h2>
          <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We curate and review tools carefully, but we don&rsquo;t guarantee the accuracy, availability, or performance of any third-party tool listed. Your use of any tool is at your own risk and subject to that tool&rsquo;s own terms.</p>

          <h2 id="liability">Limitation of liability</h2>
          <p>To the fullest extent permitted by law, AI Tools Set is not liable for any indirect, incidental, or consequential damages arising from your use of the Service or any tool discovered through it.</p>

          <h2 id="termination">Termination</h2>
          <p>We may suspend or terminate your access to the Service at any time, with or without notice, for conduct that violates these terms or is otherwise harmful to other users or to us.</p>

          <h2 id="contact">Contact us</h2>
          <p>Questions about these terms? Email <a href="mailto:sales@aitoolsset.com">sales@aitoolsset.com</a> or use our <Link href="/contact">contact form</Link>.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

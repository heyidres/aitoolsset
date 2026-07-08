import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AI Tools Set team — submit a tool, report an issue, advertise, or ask us anything.",
  alternates: { canonical: "https://aitoolsset.com/contact" },
};

const METHODS = [
  {
    title: "General enquiries",
    desc: "Questions, feedback, or partnership ideas.",
    href: "mailto:sales@aitoolsset.com",
    linkLabel: "sales@aitoolsset.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: "Submit a tool",
    desc: "Want your AI tool listed in our directory?",
    href: "/submit",
    linkLabel: "Go to submission form →",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Advertising & partnerships",
    desc: "Reach 50,000+ AI practitioners monthly.",
    href: "mailto:sales@aitoolsset.com",
    linkLabel: "sales@aitoolsset.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Report an issue",
    desc: "Broken link, wrong info, or a bug on the site.",
    href: "mailto:sales@aitoolsset.com",
    linkLabel: "sales@aitoolsset.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <main>
      <Nav />

      <section className="page-hero">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,.55)" }}>Contact</span>
          </div>
          <div className="ph-eyebrow"><span className="dot" />Get in touch</div>
          <h1>We&rsquo;d love to <span>hear from you</span></h1>
          <p>Whether you&rsquo;re submitting a tool, reporting an issue, or just saying hello — drop us a message and we&rsquo;ll get back to you within one business day.</p>
        </div>
      </section>

      <div className="content-wrap wide">
        <div className="contact-grid">
          <div>
            <div className="contact-methods">
              {METHODS.map((m) => (
                <div key={m.title} className="contact-method">
                  <div className="cm-icon">{m.icon}</div>
                  <div>
                    <div className="cm-title">{m.title}</div>
                    <div className="cm-desc">{m.desc}</div>
                    {m.href.startsWith("mailto:") ? (
                      <a href={m.href} className="cm-link">{m.linkLabel}</a>
                    ) : (
                      <Link href={m.href} className="cm-link">{m.linkLabel}</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form">
            <ContactForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

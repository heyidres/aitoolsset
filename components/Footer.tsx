import Link from "next/link";
import { LogoMark } from "./Logo";
import { NewsletterSignup } from "./NewsletterSignup";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/ai-tools", label: "All Tools" },
      { href: "/ai-tools", label: "Categories" },
      { href: "/trending", label: "Trending" },
      { href: "/new", label: "New Arrivals" },
      { href: "/top-rated", label: "Top Rated" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/submit", label: "Submit Tool" },
      { href: "/advertise", label: "Advertise" },
      { href: "/newsletter", label: "Newsletter" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookies" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="px-9 pt-[60px] pb-9 section-pad-x"
      style={{ background: "var(--near-black)", borderTop: "1px solid var(--dark-border)" }}
    >
      <div className="max-w-page mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 footer-top-4">
          <div>
            <div className="font-display font-extrabold text-[15px] text-white flex items-center gap-2 mb-3">
              <LogoMark />
              AI Tools Set
            </div>
            <div className="text-[13.5px] leading-[1.65] max-w-[260px] mb-5" style={{ color: "rgba(255,255,255,.3)" }}>
              The cleanest AI tools directory. Curated, categorized, and updated every day.
            </div>
            <div style={{ maxWidth: 320 }}>
              <NewsletterSignup
                source="footer"
                variant="dark"
                headline="The weekly digest"
                sub="The best new AI tools, deals, and articles — every Friday. No spam, no ads."
              />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-bold uppercase tracking-[.08em] mb-[14px]" style={{ color: "rgba(255,255,255,.25)" }}>
                {col.title}
              </div>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="block text-[13.5px] mb-[9px] transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,.45)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div
          className="pt-[22px] flex justify-between items-center flex-wrap gap-3"
          style={{ borderTop: "1px solid var(--dark-border)" }}
        >
          <div className="text-[12.5px]" style={{ color: "rgba(255,255,255,.2)" }}>
            © 2026 AI Tools Set. All rights reserved.
          </div>
          <div className="flex gap-[14px]">
            {["Twitter / X", "LinkedIn", "YouTube"].map((s) => (
              <a key={s} href="#" className="text-[12.5px] transition-colors hover:text-white/70" style={{ color: "rgba(255,255,255,.25)" }}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

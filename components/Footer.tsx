import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LogoMark } from "./Logo";
import { NewsletterSignup } from "./NewsletterSignup";
import { getSlots } from "@/lib/site-content";

export async function Footer() {
  const t = await getTranslations();
  const s = await getSlots([
    "footer.tagline",
    "footer.newsletter_title",
    "footer.newsletter_sub",
    "footer.copyright",
  ]);

  const COLUMNS = [
    {
      title: t("footer.discover"),
      links: [
        { href: "/ai-tools", label: t("nav.tools") },
        { href: "/ai-tools", label: t("nav.categories") },
        { href: "/news",     label: t("nav.news") },
        { href: "/blog",     label: t("nav.blog") },
        { href: "/deals",    label: t("nav.deals") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about",      label: t("footer.about") },
        { href: "/blog",       label: t("nav.blog") },
        { href: "/submit",     label: t("footer.submit_a_tool") },
        { href: "/contact",    label: t("footer.contact") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/terms",   label: t("footer.terms") },
        { href: "/cookies", label: t("footer.cookies") },
      ],
    },
  ];
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
              {s["footer.tagline"]}
            </div>
            <div style={{ maxWidth: 320 }}>
              <NewsletterSignup
                source="footer"
                variant="dark"
                headline={s["footer.newsletter_title"]}
                sub={s["footer.newsletter_sub"]}
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
            {s["footer.copyright"]}
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

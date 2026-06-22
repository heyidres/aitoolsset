import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function CtaSection() {
  const t = await getTranslations("home");
  return (
    <section className="py-[100px] px-9 text-center section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-[600px] mx-auto">
        <div
          className="font-display text-xs font-bold uppercase tracking-[.1em] mb-5"
          style={{ color: "var(--blue-h)" }}
        >
          {t("cta_eyebrow")}
        </div>
        <h2
          className="font-display font-black text-white mb-4"
          style={{ fontSize: "clamp(40px, 4vw, 60px)", letterSpacing: "-2px", lineHeight: 1 }}
        >
          {t("cta_heading_line1")}
          <br />
          {t("cta_heading_line2")}
        </h2>
        <p className="text-[17px] leading-[1.65] mb-10" style={{ color: "rgba(255,255,255,.45)" }}>
          {t("cta_body")}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/submit"
            className="btn-white-cta font-display text-[15px] font-bold px-8 py-[14px] rounded-pill"
          >
            {t("cta_submit")} →
          </Link>
          <Link
            href="/submit#featuring"
            className="btn-outline-cta font-display text-[15px] font-semibold px-8 py-[14px] rounded-pill"
          >
            {t("cta_learn")}
          </Link>
        </div>
      </div>
    </section>
  );
}

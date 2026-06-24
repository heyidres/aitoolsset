"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

function renderMd(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

export function PricingPlans() {
  const t = useTranslations("submit");
  const [annual, setAnnual] = useState(false);

  const FREE_FEATS = [
    { txt: t("free_feat_basic"),       inc: true },
    { txt: t("free_feat_searchable"),  inc: true },
    { txt: t("free_feat_category"),    inc: true },
    { txt: t("free_feat_reviews"),     inc: true },
    { txt: t("free_feat_mobile"),      inc: true },
    { txt: t("free_feat_no_featured"), inc: false },
    { txt: t("free_feat_no_analytics"), inc: false },
  ];
  const FEATURED_FEATS = Array.from({ length: 8 }, (_, i) => t(`featured_feat_${i + 1}`));
  const ENTERPRISE_FEATS = Array.from({ length: 8 }, (_, i) => t(`ent_feat_${i + 1}`));

  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: "var(--bg)" }}>
      <div className="max-w-page mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            {t("plans_eyebrow")}
          </div>
          <h2
            className="font-display font-black mb-3"
            style={{ fontSize: "clamp(28px, 3vw, 42px)", letterSpacing: "-1.5px", lineHeight: 1.1 }}
          >
            {t("plans_heading")}
          </h2>
          <p className="text-base leading-[1.7]" style={{ color: "var(--text-2)" }}>
            {t("plans_sub")}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            className="font-display text-sm"
            style={{ color: annual ? "var(--text-2)" : "var(--text)", fontWeight: annual ? 600 : 800 }}
          >
            {t("plans_billing_monthly")}
          </span>
          <button
            onClick={() => setAnnual((v) => !v)}
            className="w-12 h-[26px] rounded-full cursor-pointer relative transition-colors"
            style={{ background: "var(--blue)" }}
            aria-label="Toggle billing period"
          >
            <span
              className="absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: annual ? "translateX(22px)" : "translateX(0)" }}
            />
          </button>
          <span
            className="font-display text-sm"
            style={{ color: annual ? "var(--text)" : "var(--text-2)", fontWeight: annual ? 800 : 600 }}
          >
            {t("plans_billing_annual")}
          </span>
          <span
            className="font-display text-[11px] font-extrabold px-[9px] py-[3px] rounded-pill"
            style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}
          >
            {t("plans_save_30")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-5 max-w-[1100px] mx-auto plans-grid-3">
          {/* Free */}
          <PlanCard kind="free">
            <PlanName>{t("plans_free_name")}</PlanName>
            <PlanPrice value="$0" period={t("plans_per_forever")} />
            <PlanDesc>{t("plans_free_desc")}</PlanDesc>
            <PlanButton kind="surface" href="#submit-form">
              {t("plans_free_cta")}
            </PlanButton>
            <PlanDivider />
            <PlanFeaturesTitle>{t("plans_whats_included")}</PlanFeaturesTitle>
            <div className="flex flex-col gap-[10px]">
              {FREE_FEATS.map((f) => (
                <FeatRow key={f.txt} included={f.inc}>
                  {f.txt}
                </FeatRow>
              ))}
            </div>
          </PlanCard>

          {/* Featured */}
          <PlanCard kind="featured">
            <div
              className="absolute -top-[13px] left-1/2 -translate-x-1/2 font-display text-[11px] font-extrabold text-white px-[14px] py-1 rounded-pill whitespace-nowrap uppercase tracking-[.04em]"
              style={{ background: "var(--blue)" }}
            >
              {t("plans_most_popular")}
            </div>
            <PlanName>{t("plans_featured_name")}</PlanName>
            <PlanPrice value={annual ? "$34" : "$49"} period={annual ? t("plans_billed_annually") : `/${t("plans_featured_price_monthly")}`} />
            <PlanDesc>{t("plans_featured_desc")}</PlanDesc>
            <PlanButton kind="primary" href="#submit-form">
              {t("plans_featured_cta")}
            </PlanButton>
            <PlanDivider />
            <PlanFeaturesTitle>{t("plans_everything_free_plus")}</PlanFeaturesTitle>
            <div className="flex flex-col gap-[10px]">
              {FEATURED_FEATS.map((f) => (
                <FeatRow key={f} kind="featured" included>
                  {renderMd(f)}
                </FeatRow>
              ))}
            </div>
          </PlanCard>

          {/* Enterprise */}
          <PlanCard kind="enterprise">
            <PlanName dark>{t("plans_enterprise_name")}</PlanName>
            <PlanPrice value={t("plans_enterprise_price")} dark />
            <div className="text-sm font-medium mb-[6px]" style={{ color: "rgba(255,255,255,.3)" }}>
              {t("plans_tailored")}
            </div>
            <PlanDesc dark>
              {t("plans_enterprise_desc")}
            </PlanDesc>
            <PlanButton kind="dark" href="#submit-form">
              {t("plans_enterprise_cta")}
            </PlanButton>
            <PlanDivider dark />
            <PlanFeaturesTitle dark>{t("plans_everything_featured_plus")}</PlanFeaturesTitle>
            <div className="flex flex-col gap-[10px]">
              {ENTERPRISE_FEATS.map((f) => (
                <FeatRow key={f} kind="enterprise" included>
                  {f}
                </FeatRow>
              ))}
            </div>
          </PlanCard>
        </div>
      </div>
    </section>
  );
}

function PlanCard({ children, kind }: { children: React.ReactNode; kind: "free" | "featured" | "enterprise" }) {
  const styles =
    kind === "enterprise"
      ? { background: "var(--near-black)", border: "1.5px solid var(--near-black)" }
      : kind === "featured"
      ? {
          background: "var(--white)",
          border: "1.5px solid var(--blue)",
          boxShadow: "0 0 0 3px var(--blue-soft), var(--shadow-lg)",
        }
      : { background: "var(--white)", border: "1.5px solid var(--border)" };

  return (
    <div className="rounded-lg p-8 relative transition-all" style={styles}>
      {children}
    </div>
  );
}

function PlanName({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className="font-display text-sm font-extrabold uppercase tracking-[.07em] mb-2"
      style={{ color: dark ? "rgba(255,255,255,.5)" : "var(--text-2)" }}
    >
      {children}
    </div>
  );
}

function PlanPrice({ value, period, dark }: { value: string; period?: string; dark?: boolean }) {
  return (
    <div className="flex items-end gap-1 mb-[6px]">
      <div
        className="font-display font-black tnum"
        style={{ fontSize: 48, letterSpacing: "-2px", lineHeight: 1, color: dark ? "#fff" : "var(--text)" }}
      >
        {value}
      </div>
      {period && (
        <div className="text-sm font-medium pb-2" style={{ color: dark ? "rgba(255,255,255,.4)" : "var(--text-2)" }}>
          {period}
        </div>
      )}
    </div>
  );
}

function PlanDesc({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="text-[13.5px] leading-[1.55] mb-6" style={{ color: dark ? "rgba(255,255,255,.45)" : "var(--text-2)", minHeight: 44 }}>
      {children}
    </div>
  );
}

function PlanButton({ children, kind, href }: { children: React.ReactNode; kind: "primary" | "surface" | "dark"; href: string }) {
  const styles =
    kind === "primary"
      ? { background: "var(--blue)", color: "#fff" }
      : kind === "dark"
      ? { background: "rgba(255,255,255,.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,.15)" }
      : { background: "var(--surface)", color: "var(--text)", border: "1.5px solid var(--border)" };

  return (
    <a
      href={href}
      className="block w-full text-center font-display text-sm font-bold py-[13px] rounded-pill mb-7 cursor-pointer transition-all"
      style={styles}
    >
      {children}
    </a>
  );
}

function PlanDivider({ dark }: { dark?: boolean }) {
  return <div className="h-px mb-6" style={{ background: dark ? "rgba(255,255,255,.08)" : "var(--border)" }} />;
}

function PlanFeaturesTitle({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className="font-display text-[11.5px] font-bold uppercase tracking-[.07em] mb-[14px]"
      style={{ color: dark ? "rgba(255,255,255,.3)" : "var(--text-3)" }}
    >
      {children}
    </div>
  );
}

function FeatRow({
  children,
  included,
  kind,
}: {
  children: React.ReactNode;
  included: boolean;
  kind?: "free" | "featured" | "enterprise";
}) {
  const checkStyle =
    !included
      ? { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-3)" }
      : kind === "featured"
      ? { background: "var(--blue-soft)", borderColor: "rgba(0,82,255,.2)", color: "var(--blue)" }
      : kind === "enterprise"
      ? { background: "rgba(255,255,255,.1)", borderColor: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)" }
      : { background: "var(--green-bg)", borderColor: "var(--green-border)", color: "var(--green)" };

  const textColor =
    kind === "enterprise" ? "rgba(255,255,255,.55)" : "var(--text-2)";

  return (
    <div
      className="flex items-start gap-2 text-[13.5px] leading-[1.45]"
      style={{ color: textColor, opacity: included ? 1 : 0.4 }}
    >
      <div
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-[1px]"
        style={{ background: checkStyle.background, border: `1px solid ${checkStyle.borderColor}`, color: checkStyle.color }}
      >
        {included ? "✓" : "—"}
      </div>
      <div>{children}</div>
    </div>
  );
}

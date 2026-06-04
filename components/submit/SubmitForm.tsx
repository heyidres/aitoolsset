"use client";
import { useState, useTransition } from "react";
import { submitTool } from "@/app/submit/actions";

const PLAN_OPTIONS = [
  { key: "free", name: "Free", price: "$0", desc: "Basic listing" },
  { key: "featured", name: "Featured", price: "$49", priceSub: "/mo", desc: "Homepage placement + verified badge", popular: true },
  { key: "enterprise", name: "Enterprise", price: "Custom", desc: "Contact us for custom package" },
];

const CATEGORIES = [
  "Writing & Editing", "Image Generation", "Video", "Code & Developer", "Audio & Music",
  "Productivity", "Marketing", "Research & Data", "Design & Creative", "Business & Finance",
  "Education", "Automation", "Other",
];

const PRICING_MODELS = ["Free", "Free tier available", "Freemium", "Paid only", "Contact for pricing"];

export function SubmitForm() {
  const [plan, setPlan] = useState("featured");
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLogoFile(e.target.files[0].name);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("plan", plan);
    start(async () => {
      const result = await submitTool(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        document.getElementById("success-msg")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    });
  };

  return (
    <section
      id="submit-form"
      className="bg-white px-9 section-pad-x"
      style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-[800px] mx-auto py-[72px]">
        <div className="text-center mb-12">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
            Submit Your Tool
          </div>
          <h2
            className="font-display font-black mb-2"
            style={{ fontSize: 36, letterSpacing: "-1.5px", lineHeight: 1.1 }}
          >
            Tell us about your tool
          </h2>
          <p className="text-[15px] leading-[1.7] mt-2" style={{ color: "var(--text-2)" }}>
            Fill in the details below. Our editorial team reviews every submission within 48 hours.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-5 submit-form-grid">
              <FormGroup full>
                <FormLabel required>Select Plan</FormLabel>
                <div className="grid grid-cols-3 gap-[10px] plans-mini-3">
                  {PLAN_OPTIONS.map((opt) => {
                    const selected = plan === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setPlan(opt.key)}
                        className="text-left rounded p-[14px] cursor-pointer transition-all relative"
                        style={{
                          background: selected ? "var(--blue-soft)" : "var(--white)",
                          border: `1.5px solid ${selected ? "var(--blue)" : "var(--border)"}`,
                        }}
                      >
                        {opt.popular && (
                          <span
                            className="absolute -top-[9px] right-3 font-display text-[10px] font-extrabold text-white px-[9px] py-[2px] rounded-pill"
                            style={{ background: "var(--blue)" }}
                          >
                            Popular
                          </span>
                        )}
                        <div
                          className="font-display text-sm font-extrabold mb-[3px]"
                          style={{ color: selected ? "var(--blue)" : "var(--text)" }}
                        >
                          {opt.name}
                        </div>
                        <div className="font-display font-black tnum" style={{ fontSize: opt.price === "Custom" ? 18 : 20, letterSpacing: "-.5px", color: "var(--text)" }}>
                          {opt.price}
                          {opt.priceSub && (
                            <span className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>
                              {opt.priceSub}
                            </span>
                          )}
                        </div>
                        <div className="text-xs mt-1" style={{ color: "var(--text-2)" }}>
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel required>Tool Name</FormLabel>
                <Input name="name" placeholder="e.g. My AI Tool" required />
              </FormGroup>
              <FormGroup>
                <FormLabel required>Website URL</FormLabel>
                <Input name="websiteUrl" type="url" placeholder="https://mytool.com" required />
              </FormGroup>
              <FormGroup>
                <FormLabel required>Category</FormLabel>
                <Select name="category" required defaultValue="">
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <FormLabel required>Pricing Model</FormLabel>
                <Select name="pricingModel" required defaultValue="">
                  <option value="" disabled>
                    Select pricing model
                  </option>
                  {PRICING_MODELS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup full>
                <FormLabel required>Short Tagline</FormLabel>
                <Input name="tagline" placeholder="One sentence describing what your tool does (max 120 characters)" maxLength={120} required />
                <FormHint>This appears under your tool name in directory listings.</FormHint>
              </FormGroup>

              <FormGroup full>
                <FormLabel required>Full Description</FormLabel>
                <Textarea name="description" placeholder="Describe your tool in detail — what it does, who it's for, what makes it unique. Minimum 100 words." required />
                <FormHint>This is used for your tool's detail page and SEO.</FormHint>
              </FormGroup>

              <FormGroup>
                <FormLabel required>Your Name</FormLabel>
                <Input name="submitterName" placeholder="John Smith" required />
              </FormGroup>
              <FormGroup>
                <FormLabel required>Business Email</FormLabel>
                <Input name="submitterEmail" type="email" placeholder="john@mytool.com" required />
              </FormGroup>
              <FormGroup>
                <FormLabel>Twitter / X Handle</FormLabel>
                <Input name="twitterHandle" placeholder="@mytool" />
              </FormGroup>
              <FormGroup>
                <FormLabel>Launch Date</FormLabel>
                <Input name="launchDate" type="date" />
              </FormGroup>

              <FormGroup full>
                <FormLabel>Tool Logo</FormLabel>
                <label
                  className="block rounded p-8 text-center cursor-pointer transition-all hover:bg-[var(--blue-soft)] hover:border-[var(--blue)]"
                  style={{ border: "2px dashed var(--border)" }}
                >
                  <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
                  <div className="text-3xl mb-2">{logoFile ? "✅" : "🖼️"}</div>
                  <div className="font-display text-sm font-bold mb-1">
                    {logoFile ?? "Drop your logo here or click to upload"}
                  </div>
                  <div className="text-[12.5px]" style={{ color: "var(--text-3)" }}>
                    {logoFile ? "Click to replace" : "PNG, SVG or JPG · Min 256×256px · Max 2MB"}
                  </div>
                </label>
              </FormGroup>

              <FormGroup full>
                <FormLabel>
                  Product Screenshot{" "}
                  <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
                    (recommended)
                  </span>
                </FormLabel>
                <label
                  className="block rounded p-8 text-center cursor-pointer transition-all hover:bg-[var(--blue-soft)] hover:border-[var(--blue)]"
                  style={{ border: "2px dashed var(--border)" }}
                >
                  <input type="file" accept="image/*" className="hidden" />
                  <div className="text-3xl mb-2">📸</div>
                  <div className="font-display text-sm font-bold mb-1">Upload a product screenshot</div>
                  <div className="text-[12.5px]" style={{ color: "var(--text-3)" }}>
                    PNG or JPG · 1280×800px recommended · Max 5MB
                  </div>
                </label>
              </FormGroup>

              <FormGroup
                full
                style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 18 }}
              >
                <FormLabel style={{ color: "#d97706" }}>🏷️ Active Deal or Discount?</FormLabel>
                <div className="text-[13px] mb-[10px]" style={{ color: "var(--text-2)" }}>
                  If you have an active promo, we'll show it as a deal badge on your listing — driving more clicks.
                </div>
                <Input name="dealCopy" placeholder="e.g. 30% off first 3 months — use code LAUNCH30 · Expires June 1" />
              </FormGroup>

              <FormGroup full style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <CheckLabel required>
                  I confirm this is my tool or I have permission to submit it, and the information provided is accurate.
                </CheckLabel>
                <CheckLabel>
                  I agree to receive email updates about my listing and relevant AI Tools Set news. Unsubscribe anytime.
                </CheckLabel>
                <CheckLabel required>
                  I have read and agree to the{" "}
                  <a href="#" className="underline" style={{ color: "var(--blue)" }}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline" style={{ color: "var(--blue)" }}>
                    Listing Policy
                  </a>
                  .
                </CheckLabel>
              </FormGroup>
            </div>

            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={pending}
                className="font-display text-base font-bold text-white px-12 py-[15px] rounded-pill inline-flex items-center gap-2 transition-all hover:-translate-y-[1px] disabled:opacity-60"
                style={{ background: "var(--blue)" }}
                onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,82,255,.35)")}
                onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {pending ? "Submitting…" : "Submit for Review"}
              </button>
              <div className="text-[12.5px] mt-3" style={{ color: "var(--text-3)" }}>
                🔒 Secure payment processed via Stripe · No charge until approved
              </div>
              {error && (
                <div
                  className="mx-auto mt-4 text-sm font-semibold rounded-lg px-4 py-3 max-w-md"
                  style={{ background: "var(--red-bg)", border: "1px solid #fecaca", color: "var(--red)" }}
                >
                  {error}
                </div>
              )}
            </div>
          </form>
        ) : (
          <div id="success-msg" className="text-center py-12 px-6">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
              style={{ background: "var(--green-bg)", border: "2px solid var(--green-border)" }}
            >
              🎉
            </div>
            <div className="font-display font-black mb-[10px]" style={{ fontSize: 28, letterSpacing: "-.8px" }}>
              Submission received!
            </div>
            <p className="text-[15px] max-w-[420px] mx-auto" style={{ color: "var(--text-2)" }}>
              Thank you! Our editorial team will review your tool within 48 hours. You'll receive a confirmation email at the address you provided.
            </p>
            <div className="mt-7 flex gap-3 justify-center flex-wrap">
              <a
                href="/"
                className="font-display text-sm font-bold text-white px-6 py-[11px] rounded-pill"
                style={{ background: "var(--blue)" }}
              >
                Browse Tools
              </a>
              <a
                href="/news"
                className="font-display text-sm font-bold px-6 py-[11px] rounded-pill"
                style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                Read AI News
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FormGroup({ children, full, style }: { children: React.ReactNode; full?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      className="flex flex-col gap-[6px]"
      style={{ gridColumn: full ? "1 / -1" : "auto", ...style }}
    >
      {children}
    </div>
  );
}

function FormLabel({ children, required, style }: { children: React.ReactNode; required?: boolean; style?: React.CSSProperties }) {
  return (
    <div className="font-display text-[13px] font-bold flex items-center gap-[5px]" style={{ color: "var(--text)", ...style }}>
      {children}
      {required && <span className="text-xs" style={{ color: "#ef4444" }}>*</span>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-[46px] rounded text-sm outline-none px-[14px] bg-white transition-all focus:border-[var(--blue)] placeholder:text-[var(--text-3)]"
      style={{ border: "1.5px solid var(--border)", color: "var(--text)" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--blue)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--blue-soft)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-[46px] rounded text-sm outline-none px-[14px] bg-white cursor-pointer transition-colors focus:border-[var(--blue)] appearance-none"
      style={{
        border: "1.5px solid var(--border)",
        color: "var(--text)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239aa0ae' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="rounded text-sm outline-none px-[14px] py-3 bg-white resize-y transition-colors focus:border-[var(--blue)] placeholder:text-[var(--text-3)]"
      style={{ border: "1.5px solid var(--border)", color: "var(--text)", minHeight: 110, lineHeight: 1.6 }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--blue)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--blue-soft)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function FormHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs mt-[2px]" style={{ color: "var(--text-3)" }}>
      {children}
    </div>
  );
}

function CheckLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex items-start gap-[10px] text-[13.5px] leading-[1.5] cursor-pointer" style={{ color: "var(--text-2)" }}>
      <input
        type="checkbox"
        required={required}
        className="w-4 h-4 flex-shrink-0 mt-[2px] cursor-pointer"
        style={{ accentColor: "var(--blue)" }}
      />
      <span>{children}</span>
    </label>
  );
}

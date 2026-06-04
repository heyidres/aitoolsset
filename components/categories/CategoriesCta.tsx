import Link from "next/link";

export function CategoriesCta() {
  return (
    <section
      className="relative overflow-hidden py-20 px-9 text-center section-pad-x"
      style={{ background: "var(--near-black)" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800,
          height: 800,
          background: "radial-gradient(circle, rgba(0,82,255,.15) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-[680px] mx-auto relative">
        <div
          className="font-display text-[11.5px] font-bold uppercase tracking-[.09em] mb-[14px]"
          style={{ color: "var(--blue-h)" }}
        >
          Missing a category?
        </div>
        <h2
          className="font-display font-black text-white mb-[14px]"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-1.8px", lineHeight: 1.05 }}
        >
          Build something new?
          <br />
          Get it listed today.
        </h2>
        <p className="text-base leading-[1.65] mb-[30px]" style={{ color: "rgba(255,255,255,.5)" }}>
          If your AI tool doesn't fit any existing category — tell us, and we'll create one. Featured listings get prime placement and a verified badge.
        </p>
        <div className="flex gap-[10px] justify-center flex-wrap">
          <Link
            href="/submit"
            className="cta-btn-primary-h font-display text-sm font-bold px-[26px] py-[13px] rounded-pill"
          >
            Submit your tool →
          </Link>
          <button className="cta-btn-ghost-h font-display text-sm font-bold px-[26px] py-[13px] rounded-pill">
            Request a category
          </button>
        </div>
      </div>
    </section>
  );
}

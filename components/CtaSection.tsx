import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-[100px] px-9 text-center section-pad-x" style={{ background: "var(--near-black)" }}>
      <div className="max-w-[600px] mx-auto">
        <div
          className="font-display text-xs font-bold uppercase tracking-[.1em] mb-5"
          style={{ color: "var(--blue-h)" }}
        >
          For Builders
        </div>
        <h2
          className="font-display font-black text-white mb-4"
          style={{ fontSize: "clamp(40px, 4vw, 60px)", letterSpacing: "-2px", lineHeight: 1 }}
        >
          Built an AI tool?
          <br />
          Get discovered.
        </h2>
        <p className="text-[17px] leading-[1.65] mb-10" style={{ color: "rgba(255,255,255,.45)" }}>
          Reach 50,000+ AI practitioners, developers, and early adopters. Submit your tool and get in front of the right audience.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/submit"
            className="btn-white-cta font-display text-[15px] font-bold px-8 py-[14px] rounded-pill"
          >
            Submit a Tool →
          </Link>
          <Link
            href="/submit#featuring"
            className="btn-outline-cta font-display text-[15px] font-semibold px-8 py-[14px] rounded-pill"
          >
            Learn about featuring
          </Link>
        </div>
      </div>
    </section>
  );
}

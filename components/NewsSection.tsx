import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NEWS_MAIN, NEWS_SIDE, favicon } from "@/lib/tools";

export async function NewsSection() {
  const t = await getTranslations("home");
  return (
    <section className="py-16 px-9 section-pad-x" style={{ background: "var(--cream)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-page mx-auto">
        <div
          className="flex items-end justify-between mb-7 pb-4 flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="font-display font-black tracking-[-.8px]" style={{ fontSize: 26 }}>
              {t("news_heading")}
            </h2>
            <div className="text-[13.5px] mt-1" style={{ color: "var(--text-2)" }}>
              {t("news_sub")}
            </div>
          </div>
          <Link
            href="/news"
            className="font-display text-[13.5px] font-bold flex items-center gap-1 flex-shrink-0"
            style={{ color: "var(--blue)" }}
          >
            {t("news_view_all")} →
          </Link>
        </div>

        <div
          className="grid grid-cols-2 gap-0 bg-white rounded-lg overflow-hidden news-row-2"
          style={{ border: "1px solid var(--border)" }}
        >
          <Link
            href="/news"
            className="nf-main nf-main-hover cursor-pointer"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 200, background: NEWS_MAIN.imgGrad }}>
              <div className="font-display font-black text-white" style={{ fontSize: 44, letterSpacing: "-2px", opacity: 0.13 }}>
                {NEWS_MAIN.imgLabel}
              </div>
              {NEWS_MAIN.breaking && (
                <div
                  className="absolute top-3 left-3 text-white font-display text-[10px] font-extrabold px-[9px] py-[3px] rounded-pill uppercase tracking-[.05em]"
                  style={{ background: "#ef4444" }}
                >
                  {t("news_breaking")}
                </div>
              )}
            </div>
            <div className="px-[22px] py-5">
              <div
                className="font-display text-[11px] font-extrabold uppercase tracking-[.07em] mb-[6px] flex items-center gap-[5px]"
                style={{ color: "var(--blue)" }}
              >
                <img
                  src={favicon(NEWS_MAIN.sourceDomain, 32)}
                  alt={NEWS_MAIN.source}
                  className="w-[13px] h-[13px] rounded-[3px]"
                />
                {NEWS_MAIN.source} · {NEWS_MAIN.category}
              </div>
              <h3 className="nf-title-h font-display font-extrabold text-[17px] tracking-[-.4px] leading-[1.25] mb-2">
                {NEWS_MAIN.title}
              </h3>
              <p
                className="text-[13px] leading-[1.55] mb-3 overflow-hidden"
                style={{
                  color: "var(--text-2)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {NEWS_MAIN.excerpt}
              </p>
              <div className="text-xs flex items-center gap-[6px] flex-wrap" style={{ color: "var(--text-3)" }}>
                <span>{NEWS_MAIN.time}</span>
                <span>·</span>
                <span>{NEWS_MAIN.read}</span>
              </div>
              {NEWS_MAIN.toolChip && (
                <div className="flex gap-[5px] flex-wrap mt-2">
                  <div
                    className="flex items-center gap-1 rounded-pill px-[9px] py-[3px] text-[11.5px] font-semibold"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-2)",
                    }}
                  >
                    <img
                      src={favicon(NEWS_MAIN.toolChip.domain, 32)}
                      alt={NEWS_MAIN.toolChip.name}
                      className="w-[13px] h-[13px] rounded-[3px]"
                    />
                    {NEWS_MAIN.toolChip.name}
                  </div>
                </div>
              )}
            </div>
          </Link>

          <div className="flex flex-col">
            {NEWS_SIDE.map((n, i) => (
              <Link
                key={n.title}
                href="/news"
                className="nf-side-item-hover flex gap-3 px-[18px] py-4 cursor-pointer items-start"
                style={{ borderBottom: i < NEWS_SIDE.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <div
                  className="w-[68px] h-[52px] rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: n.imgGrad }}
                >
                  <div className="font-display font-black text-white" style={{ fontSize: 14, opacity: 0.2 }}>
                    {n.imgLabel}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10.5px] font-extrabold uppercase tracking-[.06em] mb-1"
                    style={{ color: "var(--blue)" }}
                  >
                    {n.source} · {n.category}
                  </div>
                  <div className="nfs-title-h font-display text-[13px] font-bold tracking-[-.1px] leading-[1.35] mb-1">
                    {n.title}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-3)" }}>
                    {n.time} · {n.read}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

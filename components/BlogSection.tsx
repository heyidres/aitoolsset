import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BLOG_POSTS } from "@/lib/tools";

export async function BlogSection() {
  const t = await getTranslations("home");
  return (
    <section
      className="py-16 px-9 section-pad-x"
      style={{ background: "var(--lavender)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-page mx-auto">
        <div
          className="flex items-end justify-between mb-7 pb-4 flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="font-display font-black tracking-[-.8px]" style={{ fontSize: 26 }}>
              {t("blog_heading")}
            </h2>
            <div className="text-[13.5px] mt-1" style={{ color: "var(--text-2)" }}>
              {t("blog_sub")}
            </div>
          </div>
          <Link
            href="/blog"
            className="font-display text-[13.5px] font-bold flex items-center gap-1 flex-shrink-0"
            style={{ color: "var(--blue)" }}
          >
            {t("blog_view_all")} →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5 blog-row-3">
          {BLOG_POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="blog-card-hover group rounded-lg overflow-hidden flex flex-col cursor-pointer"
            >
              <div
                className="flex items-center justify-center overflow-hidden relative"
                style={{ height: 152, background: p.imgGrad }}
              >
                <div className="font-display font-black text-white" style={{ fontSize: 32, letterSpacing: "-1.5px", opacity: 0.13 }}>
                  {p.imgLabel}
                </div>
              </div>
              <div className="p-[18px] flex flex-col flex-1">
                <div
                  className="text-[11px] font-extrabold uppercase tracking-[.07em] mb-[6px]"
                  style={{ color: p.tagColor }}
                >
                  {p.tag}
                </div>
                <h3 className="font-display font-extrabold text-[14.5px] tracking-[-.3px] leading-[1.3] mb-2 flex-1 transition-colors group-hover:text-blue">
                  {p.title}
                </h3>
                <div className="flex items-center gap-[6px] text-xs mt-auto" style={{ color: "var(--text-3)" }}>
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center font-display font-extrabold"
                    style={{ background: p.authorBg, color: p.authorFg, fontSize: 8 }}
                  >
                    {p.authorInitials}
                  </div>
                  <span className="font-semibold" style={{ color: "var(--text-2)" }}>
                    {p.author}
                  </span>
                  <span>·</span>
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.read}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

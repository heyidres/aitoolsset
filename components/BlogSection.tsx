import { Link } from "@/lib/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getPublishedBlogPosts, type CmsBlogPost } from "@/lib/cms";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function BlogSection() {
  const t = await getTranslations("home");
  const posts = await getPublishedBlogPosts().catch(() => [] as CmsBlogPost[]);

  // No real articles yet — stay silent rather than show placeholder
  // content (same policy as the removed homepage NewsSection).
  if (posts.length === 0) return null;

  const latest = posts.slice(0, 3);

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
          {latest.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="blog-card-hover group rounded-lg overflow-hidden flex flex-col cursor-pointer bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center justify-center overflow-hidden relative"
                style={{
                  height: 152,
                  background: p.coverImageUrl
                    ? `url(${p.coverImageUrl}) center/cover no-repeat`
                    : "linear-gradient(135deg, var(--lavender), var(--mint))",
                }}
              >
                {!p.coverImageUrl && (
                  <div className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-1px", color: "rgba(0,82,255,.18)" }}>
                    {p.category}
                  </div>
                )}
              </div>
              <div className="p-[18px] flex flex-col flex-1">
                <div
                  className="text-[11px] font-extrabold uppercase tracking-[.07em] mb-[6px]"
                  style={{ color: "var(--blue)" }}
                >
                  {p.category}
                </div>
                <h3 className="font-display font-extrabold text-[14.5px] tracking-[-.3px] leading-[1.3] mb-2 flex-1 transition-colors group-hover:text-blue">
                  {p.title}
                </h3>
                <div className="flex items-center gap-[6px] text-xs mt-auto" style={{ color: "var(--text-3)" }}>
                  {p.author && (
                    <>
                      <span className="font-semibold" style={{ color: "var(--text-2)" }}>
                        {p.author}
                      </span>
                      <span>·</span>
                    </>
                  )}
                  <span>{fmtDate(p.publishedAt)}</span>
                  {p.readMinutes && (
                    <>
                      <span>·</span>
                      <span>{p.readMinutes} min</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "@/lib/i18n/navigation";

export type RelatedPostView = {
  slug: string;
  title: string;
  category: string;
  deck: string | null;
};

/**
 * Internal-link footer: hand-picked related blog posts. Internal linking
 * is a real ranking lever, and these give the category page topical depth.
 * Renders only when the editor has selected posts.
 */
export function CategoryRelatedPosts({ posts }: { posts: RelatedPostView[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="py-16 px-9 section-pad-x bg-white" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1320px] mx-auto">
        <div className="mb-7">
          <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>Keep reading</div>
          <h2 className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-1px", lineHeight: 1.15 }}>
            Related guides &amp; comparisons
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 search-row-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group bg-white rounded-lg p-5 flex flex-col transition-all hover:-translate-y-0.5"
              style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="text-[10.5px] font-extrabold uppercase tracking-[.06em] mb-2" style={{ color: "var(--blue)" }}>
                {p.category}
              </div>
              <div className="font-display text-[16px] font-extrabold leading-[1.3] mb-2 transition-colors group-hover:text-blue" style={{ color: "var(--text)", letterSpacing: "-.3px" }}>
                {p.title}
              </div>
              {p.deck && (
                <div
                  className="text-[13px] leading-[1.55] overflow-hidden"
                  style={{ color: "var(--text-2)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                >
                  {p.deck}
                </div>
              )}
              <span className="font-display text-xs font-bold mt-3" style={{ color: "var(--blue)" }}>Read →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

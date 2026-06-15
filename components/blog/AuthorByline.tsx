import Link from "next/link";
import type { CmsAuthor } from "@/lib/cms";

/**
 * Compact byline row above the article — shows lead author with
 * photo + role, "+N more" pill when there are co-authors, and a
 * "Reviewed by" attribution. Click any name to open their profile.
 */
export function AuthorByline({
  authors,
  reviewedBy,
}: {
  authors: CmsAuthor[];
  reviewedBy: CmsAuthor | null;
}) {
  if (authors.length === 0 && !reviewedBy) return null;

  const lead = authors[0] ?? null;
  const coCount = Math.max(0, authors.length - 1);

  return (
    <div className="flex items-center gap-[14px] flex-wrap">
      {lead && (
        <Link
          href={`/blog/author/${lead.slug}`}
          className="flex items-center gap-[10px] hover:opacity-90 transition-opacity"
          style={{ textDecoration: "none" }}
        >
          <AuthorAvatar author={lead} size={42} />
          <div className="flex flex-col">
            <div className="font-display text-sm font-extrabold" style={{ color: "var(--text)" }}>
              {lead.name}
              {coCount > 0 && (
                <span
                  style={{ color: "var(--text-3)", fontWeight: 600, marginLeft: 6, fontSize: 12 }}
                >
                  + {coCount} more
                </span>
              )}
            </div>
            <div className="text-xs" style={{ color: "var(--text-3)" }}>
              {lead.role ?? "AI Tools Set"}
            </div>
          </div>
        </Link>
      )}

      {reviewedBy && (
        <>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
          <div className="flex items-center gap-[8px]" style={{ fontSize: 12.5 }}>
            <span style={{ color: "var(--text-3)" }}>Reviewed by</span>
            <Link
              href={`/blog/author/${reviewedBy.slug}`}
              className="flex items-center gap-[6px] font-display font-bold"
              style={{ color: "var(--text-2)", textDecoration: "none" }}
            >
              <AuthorAvatar author={reviewedBy} size={22} />
              {reviewedBy.name}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function AuthorAvatar({ author, size = 42 }: { author: CmsAuthor; size?: number }) {
  if (author.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.photoUrl}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          background: "#fff",
        }}
      />
    );
  }
  const initials = author.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #0052ff, #578bfa)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        flexShrink: 0,
        fontSize: Math.max(10, Math.floor(size / 3)),
        fontFamily: "var(--font-manrope), sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

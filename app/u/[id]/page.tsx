/**
 * /u/[id] — public profile page.
 *
 * Shows the user's display name + avatar, their saved-tool
 * count, and every review they've written. Used for trust
 * signals on tool detail pages (reviewer cards link here).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getUserById, getSavedCount, getReviewsByUser } from "@/lib/cms";

export const runtime = "nodejs";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id).catch(() => null);
  if (!user) return { title: "User not found" };
  const name = user.name ?? "User";
  return {
    title: `${name} — AI Tools Set`,
    description: `${name}'s reviews and saved AI tools on AI Tools Set.`,
  };
}

function relativeDate(d: Date): string {
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diff < day) return "today";
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id).catch(() => null);
  if (!user) notFound();

  const [savedCount, reviews] = await Promise.all([
    getSavedCount(user.id).catch(() => 0),
    getReviewsByUser(user.id).catch(() => []),
  ]);

  const displayName = user.name?.trim() || "AI Tools Set member";
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <main>
      <Nav />

      {/* Header */}
      <section
        className="bg-white px-9 pt-14 pb-10 section-pad-x"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-page mx-auto flex items-center gap-7 flex-wrap">
          <div
            className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-display font-extrabold text-white flex-shrink-0 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)", fontSize: 30 }}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1
                className="font-display font-black"
                style={{ fontSize: 32, letterSpacing: "-1px", lineHeight: 1.1 }}
              >
                {displayName}
              </h1>
              {user.role !== "user" && (
                <span
                  className="text-[11px] font-bold uppercase tracking-[.06em] px-[8px] py-[3px] rounded-pill"
                  style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)" }}
                >
                  {user.role === "admin" ? "Admin" : "Editor"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-5 flex-wrap text-sm" style={{ color: "var(--text-2)" }}>
              <span>
                <strong className="tnum" style={{ color: "var(--text)", fontWeight: 800 }}>
                  {reviews.length}
                </strong>{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </span>
              <span style={{ color: "var(--border-2)" }}>·</span>
              <span>
                <strong className="tnum" style={{ color: "var(--text)", fontWeight: 800 }}>
                  {savedCount}
                </strong>{" "}
                {savedCount === 1 ? "saved tool" : "saved tools"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-9 py-14 section-pad-x" style={{ background: "var(--cream)" }}>
        <div className="max-w-page mx-auto">
          <h2
            className="font-display font-extrabold mb-7"
            style={{ fontSize: 22, letterSpacing: "-.4px" }}
          >
            Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div
              className="rounded-lg p-10 text-center bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <div style={{ fontSize: 34, marginBottom: 10 }}>📝</div>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>
                {displayName} hasn&rsquo;t written any reviews yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg p-5 bg-white"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Link
                      href={`/ai-tool/${r.toolSlug}`}
                      className="font-display font-extrabold transition-colors hover:text-blue"
                      style={{ fontSize: 16, color: "var(--text)" }}
                    >
                      {r.toolName}
                    </Link>
                    <span style={{ color: "var(--border-2)" }}>·</span>
                    <span style={{ color: "#f59e0b", fontSize: 14 }}>
                      {"★".repeat(r.rating)}
                      <span style={{ color: "var(--border-2)" }}>{"★".repeat(5 - r.rating)}</span>
                    </span>
                    <span className="text-xs ml-auto" style={{ color: "var(--text-3)" }}>
                      {relativeDate(r.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-[1.7]" style={{ color: "var(--text-2)" }}>
                    &ldquo;{r.body}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

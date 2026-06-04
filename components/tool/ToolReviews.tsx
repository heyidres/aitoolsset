"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ToolDetail } from "@/lib/tool-detail";
import { REVIEW_BREAKDOWN } from "@/lib/tool-detail";
import { submitReview } from "@/lib/user-actions";

const PALETTES = [
  ["#dbeafe", "#1d4ed8"],
  ["#fce7f3", "#db2777"],
  ["#d1fae5", "#059669"],
  ["#fef3c7", "#d97706"],
];

type Review = ToolDetail["reviews"][number];

type CurrentUser = { id: string; name: string | null; image: string | null } | null;

export function ToolReviews({
  name,
  detail,
  toolId,
  reviewsOverride,
  currentUser,
}: {
  name: string;
  detail: ToolDetail;
  /** Postgres tool id — required to persist a new review. */
  toolId?: string;
  /** Real DB reviews. When provided, replaces the demo list. */
  reviewsOverride?: Review[];
  /** Session user, if signed in. Null = show "Sign in to review" prompt. */
  currentUser?: CurrentUser;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState(currentUser?.name ?? "");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const reviews = reviewsOverride ?? detail.reviews;
  // Persisting requires both a signed-in user and a real toolId.
  const canPersist = !!toolId && !!currentUser;

  const submit = () => {
    setError(null);
    if (!rating) {
      setError("Pick a star rating first.");
      return;
    }
    if (text.trim().length < 20) {
      setError("Review needs to be at least 20 characters.");
      return;
    }

    if (!canPersist) {
      // Local-only fallback for hardcoded seed tools (no toolId) or when
      // signed-out. We just nudge them into the optimistic UI without DB.
      if (!currentUser) {
        router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      setError("Reviews on this tool aren't synced to the database yet.");
      return;
    }

    const fd = new FormData();
    fd.set("toolId", toolId!);
    fd.set("rating", String(rating));
    if (role.trim()) fd.set("role", role.trim());
    fd.set("body", text.trim());

    start(async () => {
      const result = await submitReview(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setRating(0);
      setHoverRating(0);
      setRole("");
      setText("");
      router.refresh();
    });
  };

  return (
    <section id="reviews" className="px-9 py-12 bg-white section-pad-x" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-page mx-auto">
        <div
          className="flex items-center justify-between mb-7 pb-4 flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="font-display font-extrabold" style={{ fontSize: 24, letterSpacing: "-.6px" }}>
            User Reviews
          </div>
          {currentUser ? (
            <button
              onClick={() => setOpen((v) => !v)}
              className="font-display text-[13px] font-bold text-white px-5 py-[10px] rounded-pill whitespace-nowrap transition-colors hover:bg-blue-h"
              style={{ background: "var(--blue)" }}
            >
              Write a Review
            </button>
          ) : (
            <a
              href={`/api/auth/signin?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
              className="font-display text-[13px] font-bold text-white px-5 py-[10px] rounded-pill whitespace-nowrap transition-colors hover:bg-blue-h inline-block"
              style={{ background: "var(--blue)" }}
            >
              Sign in to review
            </a>
          )}
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-10 items-start mb-6 review-summary-2">
          <div>
            <div className="font-display font-black tnum" style={{ fontSize: 52, letterSpacing: "-2px", lineHeight: 1 }}>
              4.8
            </div>
            <div className="my-1" style={{ color: "#f59e0b", fontSize: 16 }}>
              ★★★★★
            </div>
            <div className="text-[13px] tnum" style={{ color: "var(--text-3)" }}>
              2,341 reviews
            </div>
          </div>
          <div>
            {REVIEW_BREAKDOWN.map((r) => (
              <div key={r.star} className="flex items-center gap-2 mb-[5px]">
                <span className="text-[11.5px] text-right flex-shrink-0 tnum" style={{ color: "var(--text-3)", width: 20 }}>
                  {r.star}★
                </span>
                <div className="flex-1 h-[6px] rounded-[3px] overflow-hidden" style={{ background: "var(--surface)" }}>
                  <div className="h-full rounded-[3px]" style={{ width: `${r.pct}%`, background: "#f59e0b" }} />
                </div>
                <span className="text-[11px] tnum" style={{ color: "var(--text-3)", width: 30 }}>
                  {r.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {open && (
          <div
            className="rounded-lg p-[22px] mb-5"
            style={{ background: "var(--bg)", border: "1.5px solid var(--border)" }}
          >
            <div className="font-display text-[15px] font-extrabold mb-4">
              Share your experience with {name}
            </div>
            <div className="flex gap-[5px] mb-[14px]" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((v) => {
                const active = (hoverRating || rating) >= v;
                return (
                  <span
                    key={v}
                    className="text-2xl cursor-pointer transition-colors"
                    style={{ color: active ? "#f59e0b" : "var(--border-2)" }}
                    onMouseOver={() => setHoverRating(v)}
                    onClick={() => setRating(v)}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            {currentUser?.name && (
              <div className="text-xs mb-[10px]" style={{ color: "var(--text-3)" }}>
                Posting as <strong style={{ color: "var(--text-2)", fontWeight: 700 }}>{currentUser.name}</strong>
              </div>
            )}
            <input
              type="text"
              placeholder="Your role (optional — e.g. Software Engineer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded text-sm outline-none px-[14px] py-[10px] mb-[10px] transition-colors focus:border-blue"
              style={{ border: "1.5px solid var(--border)", background: "var(--white)", color: "var(--text)" }}
            />
            <textarea
              placeholder="Write your review — what do you use it for? What works well? What could be better? (20+ characters)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[100px] resize-y rounded text-sm outline-none px-[14px] py-[10px] mb-3 transition-colors focus:border-blue"
              style={{ border: "1.5px solid var(--border)", background: "var(--white)", color: "var(--text)" }}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="font-display text-[13.5px] font-bold text-white px-[22px] py-[10px] rounded-pill transition-colors hover:bg-blue-h disabled:opacity-60"
                style={{ background: "var(--blue)" }}
              >
                {pending ? "Posting…" : "Submit Review"}
              </button>
              {error && (
                <span className="text-xs font-semibold" style={{ color: "var(--red)" }}>
                  {error}
                </span>
              )}
            </div>
          </div>
        )}

        <div>
          {reviews.map((r, i) => (
            <div key={i} className="py-5" style={{ borderBottom: i < reviews.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="flex items-start gap-[10px] mb-[10px]">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-display text-[13px] font-extrabold flex-shrink-0"
                  style={{ background: r.bg, color: r.fg }}
                >
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold mb-[2px]">{r.name}</div>
                  <div className="text-xs flex items-center gap-2 flex-wrap" style={{ color: "var(--text-3)" }}>
                    <span>{r.role}</span>
                    <span>·</span>
                    <span>Verified user</span>
                    <span>·</span>
                    <span>{r.date}</span>
                  </div>
                </div>
                <div className="ml-auto text-[13px] flex-shrink-0" style={{ color: "#f59e0b" }}>
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
              </div>
              <div className="text-sm leading-[1.7]" style={{ color: "var(--text-2)" }}>
                &ldquo;{r.text}&rdquo;
              </div>
              <div className="flex items-center gap-[10px] mt-[10px] text-xs" style={{ color: "var(--text-3)" }}>
                Was this helpful?
                <button
                  className="text-xs font-semibold px-[10px] py-[3px] rounded-[5px] transition-colors hover:border-blue hover:text-blue"
                  style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
                >
                  👍 Yes ({r.helpful})
                </button>
                <button
                  className="text-xs font-semibold px-[10px] py-[3px] rounded-[5px] transition-colors hover:border-blue hover:text-blue"
                  style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
                >
                  👎 No ({r.notHelpful})
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="mt-5 font-display text-[13.5px] font-bold px-[22px] py-[10px] rounded-pill"
          style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.15)" }}
        >
          Load more reviews
        </button>
      </div>
    </section>
  );
}

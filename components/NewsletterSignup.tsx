/**
 * Newsletter signup — reusable across the footer, the blog
 * sidebar, the news sidebar, and any future CTA placement.
 *
 *  • Pass a unique `source` so we know which surface drove the
 *    signup (analytics later)
 *  • `variant="dark"` flips colours for dark backgrounds
 *  • Submits to the subscribeNewsletter server action; shows a
 *    friendly inline message instead of redirecting
 */

"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/lib/user-actions";

type Variant = "light" | "dark" | "inline";

export function NewsletterSignup({
  source,
  variant = "light",
  headline,
  sub,
}: {
  source: string;
  variant?: Variant;
  headline?: string;
  sub?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "already" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus("idle");
    const fd = new FormData(e.currentTarget);
    fd.set("source", source);
    start(async () => {
      const result = await subscribeNewsletter(fd);
      if (!result.ok) {
        setStatus("error");
        setError(result.error);
        return;
      }
      setStatus(result.alreadySubscribed ? "already" : "ok");
      if (!result.alreadySubscribed) setEmail("");
    });
  };

  const isDark = variant === "dark";
  const isInline = variant === "inline";

  return (
    <div
      style={{
        background: isDark ? "var(--near-black)" : isInline ? "transparent" : "var(--white)",
        color: isDark ? "rgba(255,255,255,.9)" : "var(--text)",
        borderRadius: isInline ? 0 : 16,
        border: isInline ? "none" : isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid var(--border)",
        padding: isInline ? 0 : 24,
      }}
    >
      {!isInline && headline && (
        <div
          className="font-display font-extrabold mb-1"
          style={{ fontSize: 16, letterSpacing: "-.3px" }}
        >
          {headline}
        </div>
      )}
      {!isInline && sub && (
        <p
          className="mb-4 text-sm"
          style={{ color: isDark ? "rgba(255,255,255,.55)" : "var(--text-2)", lineHeight: 1.55 }}
        >
          {sub}
        </p>
      )}

      <form onSubmit={submit} className="flex gap-2 items-stretch">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            flex: 1,
            minWidth: 0,
            height: 40,
            padding: "0 14px",
            fontSize: 13.5,
            borderRadius: 100,
            border: isDark ? "1.5px solid rgba(255,255,255,.15)" : "1.5px solid var(--border)",
            background: isDark ? "rgba(255,255,255,.05)" : "var(--white)",
            color: isDark ? "#fff" : "var(--text)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={pending || status === "ok"}
          className="font-display text-[13px] font-bold text-white whitespace-nowrap transition-colors hover:bg-blue-h disabled:opacity-60"
          style={{
            background: "var(--blue)",
            padding: "0 18px",
            height: 40,
            borderRadius: 100,
            border: "none",
            cursor: "pointer",
          }}
        >
          {pending ? "…" : status === "ok" ? "Subscribed ✓" : "Subscribe"}
        </button>
      </form>

      {status === "ok" && (
        <div className="mt-3 text-xs font-semibold" style={{ color: isDark ? "#4ade80" : "var(--green)" }}>
          You&rsquo;re on the list. Check your inbox for confirmation.
        </div>
      )}
      {status === "already" && (
        <div className="mt-3 text-xs font-semibold" style={{ color: isDark ? "rgba(255,255,255,.55)" : "var(--text-2)" }}>
          Already subscribed — see you in your inbox.
        </div>
      )}
      {status === "error" && (
        <div className="mt-3 text-xs font-semibold" style={{ color: "var(--red)" }}>
          {error ?? "Could not subscribe."}
        </div>
      )}
    </div>
  );
}

/**
 * Search input — client-side form that submits to /search?q=…
 *
 * Kept as a tiny client island so the rest of /search/page.tsx
 * can stay a Server Component (and run the DB query at request
 * time without bundling).
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className="relative max-w-2xl">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search 2,400+ AI tools…"
        autoFocus
        style={{
          width: "100%",
          height: 56,
          padding: "0 130px 0 50px",
          fontSize: 16,
          fontFamily: "var(--font-dm-sans), sans-serif",
          borderRadius: 100,
          border: "1.5px solid var(--border)",
          background: "var(--white)",
          outline: "none",
          transition: "border-color .15s, box-shadow .15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--blue)";
          e.currentTarget.style.boxShadow = "0 0 0 4px var(--blue-soft)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <button
        type="submit"
        style={{
          position: "absolute",
          right: 8,
          top: 8,
          height: 40,
          padding: "0 22px",
          fontSize: 13.5,
          fontFamily: "var(--font-manrope), sans-serif",
          fontWeight: 700,
          color: "#fff",
          background: "var(--blue)",
          border: "none",
          borderRadius: 100,
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}

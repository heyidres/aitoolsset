"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedDefaultCategories } from "./_actions";

export function SeedDefaultsButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const click = () => {
    setMsg(null);
    setErr(null);
    start(async () => {
      try {
        const r = await seedDefaultCategories();
        if (r.created.length === 0) {
          setMsg(`All ${r.skipped.length} default categories already exist. Nothing to do.`);
        } else {
          setMsg(`Created ${r.created.length} categor${r.created.length === 1 ? "y" : "ies"}.${r.skipped.length ? ` Skipped existing: ${r.skipped.length}.` : ""}`);
        }
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Seed failed");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button type="button" onClick={click} disabled={pending} className="adm-btn-sm primary" style={{ padding: "10px 22px", fontSize: 13 }}>
        {pending ? "Creating categories…" : "✨ Seed 48 default categories"}
      </button>
      {msg && <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{msg}</div>}
      {err && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>{err}</div>}
    </div>
  );
}

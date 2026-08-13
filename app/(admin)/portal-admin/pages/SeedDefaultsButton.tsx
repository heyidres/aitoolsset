"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedDefaultPages } from "./_actions";

export function SeedDefaultsButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const click = () => {
    setMsg(null); setErr(null);
    start(async () => {
      try {
        const result = await seedDefaultPages();
        if (result.created.length === 0) {
          setMsg(`All ${result.skipped.length} default pages already exist. Nothing to do.`);
        } else {
          setMsg(
            `Created ${result.created.length} draft${result.created.length === 1 ? "" : "s"}: ${result.created.join(", ")}.${
              result.skipped.length ? ` Skipped existing: ${result.skipped.join(", ")}.` : ""
            }`
          );
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
        {pending ? "Creating drafts…" : "✨ Seed default pages"}
      </button>
      {msg && (
        <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, maxWidth: 460, textAlign: "center" }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, maxWidth: 460, textAlign: "center" }}>
          {err}
        </div>
      )}
    </div>
  );
}

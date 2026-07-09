"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "../_components/admin-ui";
import { saveSlot, resetSlotAction } from "./_actions";
import type { SlotKey, SlotMeta } from "@/lib/site-content";

type Row = {
  key: SlotKey;
  current: string;
  isOverride: boolean;
  meta: SlotMeta;
};

export function SlotRow({ slot }: { slot: Row }) {
  const router = useRouter();
  const [value, setValue] = useState(slot.current);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const fd = new FormData();
    fd.set("slotKey", slot.key);
    fd.set("value", value);
    start(async () => {
      const r = await saveSlot(fd);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setMsg("Saved");
      setEditing(false);
      router.refresh();
    });
  };

  const reset = () => {
    if (!confirm(`Reset "${slot.meta.label}" to the code default? Your custom text will be lost.`)) return;
    setMsg(null);
    setErr(null);
    start(async () => {
      const r = await resetSlotAction(slot.key);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setMsg("Reset");
      setEditing(false);
      router.refresh();
    });
  };

  const isTextarea = slot.meta.kind === "textarea";

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: editing ? "1fr" : "minmax(200px, 280px) 1fr auto",
        gap: 14,
        alignItems: editing ? undefined : "center",
      }}
    >
      {editing ? (
        <form onSubmit={save}>
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {slot.meta.label}
              </div>
              <code
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-3)",
                }}
              >
                {slot.key}
              </code>
            </div>
            {slot.isOverride && <Pill tone="blue">Override</Pill>}
          </div>

          <div className="adm-input-wrap">
            {isTextarea ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                maxLength={8000}
                style={{ width: "100%", padding: "10px 12px", fontSize: 13.5 }}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={400}
                style={{ width: "100%" }}
              />
            )}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <button type="submit" disabled={pending} className="adm-btn-sm primary">
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setValue(slot.current);
                setErr(null);
                setMsg(null);
              }}
              className="adm-btn-sm ghost"
            >
              Cancel
            </button>
            {slot.isOverride && (
              <button
                type="button"
                onClick={reset}
                disabled={pending}
                className="adm-btn-sm ghost"
                style={{ color: "var(--red)" }}
              >
                Reset to default
              </button>
            )}
            {err && (
              <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>{err}</span>
            )}
            {msg && (
              <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{msg}</span>
            )}
          </div>
        </form>
      ) : (
        <>
          <div>
            <div
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {slot.meta.label}
              {slot.isOverride && <Pill tone="blue">Override</Pill>}
            </div>
            <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>{slot.key}</code>
          </div>
          <div
            style={{
              color: "var(--text-2)",
              fontSize: 13.5,
              lineHeight: 1.55,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {slot.current}
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setValue(slot.current);
            }}
            className="adm-btn-sm ghost"
            style={{ whiteSpace: "nowrap" }}
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}

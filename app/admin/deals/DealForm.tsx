"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

export type DealFormValues = {
  toolId: string;
  type: "percent" | "flat" | "trial";
  amount: number;
  label: string;
  headline: string;
  description: string;
  code: string;
  savingsUsd: string;
  expiresAt: string; // yyyy-mm-dd
  exclusive: boolean;
  blackFriday: boolean;
  verified: boolean;
  active: boolean;
};

const EMPTY: DealFormValues = {
  toolId: "",
  type: "percent",
  amount: 20,
  label: "",
  headline: "",
  description: "",
  code: "",
  savingsUsd: "",
  expiresAt: "",
  exclusive: false,
  blackFriday: false,
  verified: true,
  active: true,
};

export function DealForm({
  initial = EMPTY,
  mode,
  action,
  toolOptions,
}: {
  initial?: DealFormValues;
  mode: "create" | "edit";
  action: (fd: FormData) => Promise<void>;
  toolOptions: Array<{ id: string; name: string }>;
}) {
  const [values, setValues] = useState<DealFormValues>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const u = <K extends keyof DealFormValues>(k: K, v: DealFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await action(fd);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Save failed");
      }
    });
  };

  return (
    <form onSubmit={submit} className="adm-panel" style={{ padding: 28, maxWidth: 880 }}>
      <input type="hidden" name="exclusive" value={values.exclusive ? "on" : ""} />
      <input type="hidden" name="blackFriday" value={values.blackFriday ? "on" : ""} />
      <input type="hidden" name="verified" value={values.verified ? "on" : ""} />
      <input type="hidden" name="active" value={values.active ? "on" : ""} />

      <Section title="Tool & deal">
        <Field label="Tool" required hint="The deal will appear on this tool's card + the deals page">
          <select name="toolId" required value={values.toolId} onChange={(e) => u("toolId", e.target.value)}>
            <option value="">Choose a tool…</option>
            {toolOptions.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </Field>
        <Row>
          <Field label="Type" required>
            <select name="type" required value={values.type} onChange={(e) => u("type", e.target.value as DealFormValues["type"])}>
              <option value="percent">% off</option>
              <option value="flat">Flat USD</option>
              <option value="trial">Free trial</option>
            </select>
          </Field>
          <Field label="Amount" required hint="20 for 20%, 49 for $49, days for trials">
            <input type="number" name="amount" min={0} max={1000} required value={values.amount} onChange={(e) => u("amount", parseInt(e.target.value || "0", 10))} />
          </Field>
        </Row>
        <Field label="Short label" hint="Shown on the tool card as a ribbon. e.g. '20% off annual'">
          <input type="text" name="label" maxLength={60} value={values.label} onChange={(e) => u("label", e.target.value)} placeholder="20% off annual Pro" />
        </Field>
      </Section>

      <Section title="Copy">
        <Field label="Headline" required>
          <input type="text" name="headline" maxLength={120} required value={values.headline} onChange={(e) => u("headline", e.target.value)} placeholder="Get 20% off Midjourney annual Pro" />
        </Field>
        <Field label="Description" required>
          <textarea name="description" rows={4} required value={values.description} onChange={(e) => u("description", e.target.value)} placeholder="Full pitch shown on the deals page…" />
        </Field>
        <Row>
          <Field label="Coupon code" hint="Leave blank if no code">
            <input type="text" name="code" value={values.code} onChange={(e) => u("code", e.target.value)} placeholder="AITOOLS20" style={{ fontFamily: "var(--mono)", textTransform: "uppercase" }} />
          </Field>
          <Field label="Estimated savings (USD)">
            <input type="number" name="savingsUsd" min={0} value={values.savingsUsd} onChange={(e) => u("savingsUsd", e.target.value)} placeholder="48" />
          </Field>
        </Row>
        <Field label="Expires on" hint="Optional — leave blank for evergreen">
          <input type="date" name="expiresAt" value={values.expiresAt} onChange={(e) => u("expiresAt", e.target.value)} />
        </Field>
      </Section>

      <Section title="Flags">
        <ToggleRow title="Active" desc="Show on the public deals page + tool cards" on={values.active} onChange={(v) => u("active", v)} />
        <ToggleRow title="Verified" desc="Show the verified badge on the offer card" on={values.verified} onChange={(v) => u("verified", v)} />
        <ToggleRow title="Exclusive" desc="Highlight as an AI Tools Set exclusive" on={values.exclusive} onChange={(v) => u("exclusive", v)} />
        <ToggleRow title="Black Friday" desc="Surface in the Black Friday filter" on={values.blackFriday} onChange={(v) => u("blackFriday", v)} />
      </Section>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={pending} className="adm-btn-sm primary" style={{ padding: "10px 18px", fontSize: 13 }}>
          {pending ? "Saving…" : mode === "create" ? "Create deal" : "Save changes"}
        </button>
        <Link href="/admin/deals" className="adm-btn-sm ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Cancel</Link>
      </div>

      {err && (<div style={{ marginTop: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, color: "var(--red)", fontSize: 12.5, fontWeight: 600 }}>{err}</div>)}
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ marginBottom: 22 }}><div style={{ fontFamily: "var(--font-manrope)", fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>{title}</div>{children}</div>; }
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontFamily: "var(--font-manrope)", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</label><div className="adm-input-wrap">{children}</div>{hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}</div>; }
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>; }
function ToggleRow({ title, desc, on, onChange }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void }) { return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}><div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-manrope)", fontSize: 13, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>{desc}</div></div><button type="button" onClick={() => onChange(!on)} aria-pressed={on} style={{ width: 42, height: 24, borderRadius: 100, background: on ? "var(--blue)" : "var(--border-2)", position: "relative", transition: "background .2s", flexShrink: 0 }}><span style={{ position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "#fff", top: 3, left: 3, transform: on ? "translateX(18px)" : "translateX(0)", transition: "transform .2s" }} /></button></div>; }

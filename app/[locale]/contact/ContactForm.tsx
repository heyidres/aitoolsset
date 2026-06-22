"use client";

import { useState, useTransition } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { sendContactMessage } from "./_actions";

const SUBJECTS = [
  "General enquiry",
  "Submit a tool",
  "Advertising & partnerships",
  "Report an issue",
  "Press / media",
  "Other",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await sendContactMessage(fd);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="cf-success show">
        <div className="cf-success-icon">✓</div>
        <h3>Message sent!</h3>
        <p>Thanks for reaching out. We&rsquo;ll get back to you at the email you provided within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="cf-row">
        <div className="fld">
          <label>Name <span className="req">*</span></label>
          <input type="text" name="name" placeholder="Jane Doe" required maxLength={80} />
        </div>
        <div className="fld">
          <label>Email <span className="req">*</span></label>
          <input type="email" name="email" placeholder="jane@example.com" required maxLength={320} />
        </div>
      </div>
      <div className="fld">
        <label>Subject <span className="req">*</span></label>
        <select name="subject" required defaultValue="">
          <option value="" disabled>Choose a topic</option>
          {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>
      <div className="fld">
        <label>Message <span className="req">*</span></label>
        <textarea name="message" placeholder="How can we help?" required minLength={10} maxLength={4000} />
      </div>

      <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

      <button type="submit" className="cf-submit" disabled={pending}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        {pending ? "Sending…" : "Send message"}
      </button>
      <div className="cf-note">We typically reply within one business day.</div>
      {err && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--red-bg)", border: "1px solid #fecaca", color: "var(--red)", fontSize: 13, fontWeight: 600, borderRadius: 10 }}>
          {err}
        </div>
      )}
    </form>
  );
}

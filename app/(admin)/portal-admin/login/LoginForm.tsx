"use client";

import { useState, useTransition } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { requestMagicLink, signInWithGoogle } from "./_actions";

type Props = {
  turnstileSiteKey?: string;
  hasResend: boolean;
  hasGoogle: boolean;
  callbackUrl: string;
  initialSent: boolean;
};

export function LoginForm({ turnstileSiteKey, hasResend, hasGoogle, callbackUrl, initialSent }: Props) {
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await requestMagicLink(fd);
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  }

  if (sent) {
    return (
      <div className="al-note" role="status">
        <div className="al-note-title">Check your email</div>
        <p>
          If that address is authorized, a secure sign-in link is on its way. It expires shortly —
          open it on this device.
        </p>
        <button className="al-link" onClick={() => setSent(false)} type="button">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="al-methods">
      {hasResend && (
        <form onSubmit={onSubmit} className="al-form">
          <label className="al-label" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="al-input"
          />
          <TurnstileWidget siteKey={turnstileSiteKey} />
          {error && <div className="al-error">{error}</div>}
          <button className="al-btn" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}

      {hasResend && hasGoogle && <div className="al-divider"><span>or</span></div>}

      {hasGoogle && (
        <form action={() => startTransition(() => signInWithGoogle(callbackUrl))}>
          <button className="al-btn al-btn-ghost" type="submit" disabled={pending}>
            Continue with Google
          </button>
        </form>
      )}

      {!hasResend && !hasGoogle && (
        <div className="al-error">
          No sign-in method is configured. Set RESEND_API_KEY (magic links) or Google OAuth env vars.
        </div>
      )}
    </div>
  );
}

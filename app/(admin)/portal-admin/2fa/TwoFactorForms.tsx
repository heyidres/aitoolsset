"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmEnrollment, verifyCode, resetOwnMfa } from "./_actions";

const codeInputProps = {
  inputMode: "numeric" as const,
  autoComplete: "one-time-code",
  maxLength: 9,
  placeholder: "000000",
  className: "al-code-input",
};

/** Enrollment: confirm first code, then reveal one-time backup codes. */
export function EnrollForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  if (codes) {
    return (
      <div>
        <div className="al-note">
          <div className="al-note-title">Save your backup codes</div>
          <p>
            Store these somewhere safe. Each works once if you lose your authenticator. They
            won&apos;t be shown again.
          </p>
        </div>
        <div className="al-backup">
          {codes.map((c) => (
            <code key={c}>{c}</code>
          ))}
        </div>
        <button className="al-btn" type="button" onClick={() => router.replace(callbackUrl)}>
          I&apos;ve saved them — continue
        </button>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const code = String(new FormData(e.currentTarget).get("code") ?? "");
    startTransition(async () => {
      const res = await confirmEnrollment(code);
      if (res.ok) setCodes(res.backupCodes);
      else setError(res.error);
    });
  }

  return (
    <form className="al-form" onSubmit={onSubmit}>
      <input name="code" {...codeInputProps} maxLength={6} autoFocus />
      {error && <div className="al-error">{error}</div>}
      <button className="al-btn" type="submit" disabled={pending}>
        {pending ? "Verifying…" : "Verify & enable"}
      </button>
    </form>
  );
}

/** Verify: accept a TOTP code or a backup recovery code. */
export function VerifyForm({ callbackUrl, accountEmail }: { callbackUrl: string; accountEmail: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const code = String(new FormData(e.currentTarget).get("code") ?? "");
    startTransition(async () => {
      const res = await verifyCode(code, callbackUrl);
      // On success the action redirects; only a failure returns here.
      if (res && !res.ok) setError(res.error);
    });
  }

  function onReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetError(null);
    const email = String(new FormData(e.currentTarget).get("confirmEmail") ?? "");
    startTransition(async () => {
      const res = await resetOwnMfa(email);
      if (res.ok) router.replace("/portal-admin/2fa");
      else setResetError(res.error);
    });
  }

  if (showReset) {
    return (
      <form className="al-form" onSubmit={onReset}>
        <div className="al-note">
          <div className="al-note-title">Reset two-factor auth</div>
          <p>
            Type your account email ({accountEmail}) to confirm. You&apos;ll set up 2FA again from
            scratch, and we&apos;ll email you a heads-up in case this wasn&apos;t you.
          </p>
        </div>
        <input
          name="confirmEmail"
          type="email"
          placeholder={accountEmail}
          required
          autoFocus
          className="al-input"
        />
        {resetError && <div className="al-error">{resetError}</div>}
        <button className="al-btn" type="submit" disabled={pending}>
          {pending ? "Resetting…" : "Reset 2FA"}
        </button>
        <button className="al-link" type="button" onClick={() => setShowReset(false)}>
          Cancel
        </button>
      </form>
    );
  }

  return (
    <form className="al-form" onSubmit={onSubmit}>
      <input name="code" {...codeInputProps} autoFocus />
      {error && <div className="al-error">{error}</div>}
      <button className="al-btn" type="submit" disabled={pending}>
        {pending ? "Verifying…" : "Verify"}
      </button>
      <button className="al-link" type="button" onClick={() => setShowReset(true)}>
        Lost your device and backup codes?
      </button>
    </form>
  );
}

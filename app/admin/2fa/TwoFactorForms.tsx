"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmEnrollment, verifyCode } from "./_actions";

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
export function VerifyForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  return (
    <form className="al-form" onSubmit={onSubmit}>
      <input name="code" {...codeInputProps} autoFocus />
      {error && <div className="al-error">{error}</div>}
      <button className="al-btn" type="submit" disabled={pending}>
        {pending ? "Verifying…" : "Verify"}
      </button>
    </form>
  );
}

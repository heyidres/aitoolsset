/**
 * Cloudflare Turnstile widget. Renders a single hidden input
 * named "turnstileToken" so the surrounding form submits the
 * token automatically.
 *
 * No-ops when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set — useful
 * for local dev / staging without a Cloudflare account.
 */

"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Props = {
  /** Pass the public site key (from /lib/turnstile). */
  siteKey?: string;
  /** Optional: light or dark theme. Defaults to "auto". */
  theme?: "light" | "dark" | "auto";
  /**
   * Widget visibility. "always" shows the managed checkbox (default,
   * used on login/contact/submit). "interaction-only" stays invisible
   * and still issues a token silently, only surfacing a challenge if
   * Cloudflare actually demands one — used for low-risk spots like the
   * footer newsletter so the "Verify you are human" box isn't visible.
   */
  appearance?: "always" | "interaction-only";
  /** Optional: pre-rendered widget id callback for managed forms. */
  onVerified?: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: string;
          appearance?: string;
          callback?: (token: string) => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ siteKey, theme = "auto", appearance = "always", onVerified }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey) return;
    const tryRender = () => {
      if (!window.turnstile || !ref.current) return false;
      window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme,
        appearance,
        callback: (t: string) => {
          setToken(t);
          onVerified?.(t);
        },
      });
      return true;
    };
    if (tryRender()) return;
    const id = setInterval(() => {
      if (tryRender()) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [siteKey, theme, appearance, onVerified]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div ref={ref} />
      <input type="hidden" name="turnstileToken" value={token} />
    </>
  );
}

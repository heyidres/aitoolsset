"use client";

import { RouteError } from "@/components/RouteError";

/**
 * Error boundary for a single tool page. Catches render errors here (within
 * the site) so a visitor sees a friendly page instead of the bare global
 * error boundary. No internals exposed — just a retry + a support reference.
 */
export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} logTag="[ai-tool/[slug]] render failed" />;
}

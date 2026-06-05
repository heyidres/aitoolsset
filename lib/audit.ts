/**
 * Append-only audit log for admin / editor actions.
 *
 * Writes to the `audit_log` table. Failures are swallowed —
 * we never want logging to break the action it's tracking.
 *
 * Usage:
 *   await logAdmin("tool.publish", `tool:${id}`, { slug: t.slug });
 *
 * Conventions:
 *   action — namespaced verb. e.g. "tool.publish", "page.delete",
 *            "user.promote", "submission.approve"
 *   target — free-form identifier. "<entity>:<id>" works well
 *   meta   — small JSON blob with extra context (no PII please)
 */

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export async function logAdmin(
  action: string,
  target: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    const session = await auth();
    await db.insert(auditLog).values({
      actorId: session?.user?.id ?? null,
      action,
      target,
      meta: meta ?? null,
    });
  } catch (e) {
    // Never let audit logging break the caller.
    console.error("[audit] write failed:", e);
  }
}

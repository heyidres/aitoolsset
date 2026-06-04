/**
 * Shared helpers for API route handlers.
 */

import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/**
 * Parse + validate JSON body against a Zod schema.
 * Returns the typed body or a 400 response. Use like:
 *
 *   const body = await parseBody(req, MySchema);
 *   if (body instanceof Response) return body;
 *   // body is now typed
 */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return fail("Validation failed", 422, { issues: result.error.flatten() });
  }
  return result.data;
}

/** Guard a cron endpoint. Returns null if authorised, else a Response. */
export function guardCron(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return fail("CRON_SECRET is not configured", 500);
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) return fail("Forbidden", 403);
  return null;
}

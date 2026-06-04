/**
 * Public-facing save toggle. Body: { slug: string }.
 *
 * Signed-in: writes to `saved_tool` and bumps the cached tool.saveCount.
 * Signed-out: 401 so the client knows to keep state in localStorage only.
 *
 * Slug → toolId resolution happens server-side so the client never
 * needs to know the Postgres UUID; the legacy hardcoded TOOLS list
 * doesn't have DB rows, so its toggles return 404 and the client
 * gracefully falls back to localStorage-only.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { toggleSave } from "@/lib/user-actions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to sync saves" }, { status: 401 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const [t] = await db.select({ id: tools.id }).from(tools).where(eq(tools.slug, slug)).limit(1);
  if (!t) {
    // Hardcoded seed tool — not in DB. Client should rely on localStorage.
    return NextResponse.json({ error: "Tool not in DB", legacy: true }, { status: 404 });
  }

  const result = await toggleSave(t.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ saved: result.saved });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ saved: [] });
  }
  const { getSavedToolIds } = await import("@/lib/cms");
  const ids = await getSavedToolIds(session.user.id);
  if (ids.length === 0) return NextResponse.json({ saved: [] });
  // Resolve DB ids → slugs in a single round-trip.
  const all = await db.select({ id: tools.id, slug: tools.slug }).from(tools);
  const want = new Set(ids);
  const saved = all.filter((r) => want.has(r.id)).map((r) => r.slug);
  return NextResponse.json({ saved });
}

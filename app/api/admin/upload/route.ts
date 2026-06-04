/**
 * Image upload endpoint for the admin CMS.
 *
 * POST multipart/form-data with a `file` field (image up to 5 MB).
 * Returns { url } — the public URL of the uploaded image.
 *
 * Dual-mode implementation:
 *   • Production / Vercel: writes to Vercel Blob (BLOB_READ_WRITE_TOKEN set)
 *   • Local dev:           falls back to public/uploads/ on the filesystem
 *
 *   Vercel's serverless filesystem is read-only at runtime, so the local
 *   path only works in dev. The Blob branch transparently kicks in once
 *   the env var is present.
 */

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Allowed: PNG, JPEG, WebP, GIF, SVG.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.` },
      { status: 400 }
    );
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  // Prod (Vercel Blob) when token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Blob upload failed: ${msg}` }, { status: 500 });
    }
  }

  // Local dev fallback — write to public/uploads/
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  const filePath = path.join(uploadsDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}

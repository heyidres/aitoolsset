"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toolSubmissions, tools } from "@/lib/db/schema";
import { slugify } from "@/lib/cms";
import { logAdmin } from "@/lib/audit";

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "admin" && session.user.role !== "editor") throw new Error("Not authorised");
  return session;
}

/**
 * Approve a submission and create a tool row from it. The new
 * tool starts as draft so an editor can polish it before
 * publishing.
 */
export async function approveSubmission(submissionId: string) {
  const session = await requireEditor();

  const [sub] = await db.select().from(toolSubmissions).where(eq(toolSubmissions.id, submissionId)).limit(1);
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "pending") throw new Error(`Already ${sub.status}`);

  // Make sure slug is unique
  let baseSlug = slugify(sub.name);
  let slug = baseSlug;
  let n = 1;
  while (true) {
    const [exists] = await db.select({ id: tools.id }).from(tools).where(eq(tools.slug, slug)).limit(1);
    if (!exists) break;
    n++;
    slug = `${baseSlug}-${n}`;
  }

  // Derive a clean domain from the website URL
  let domain = "";
  try {
    domain = new URL(sub.websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = sub.websiteUrl;
  }

  const pricingNormalised: "free" | "freemium" | "paid" =
    /free/i.test(sub.pricingModel) && /paid|premium/i.test(sub.pricingModel) ? "freemium" :
      /^free$/i.test(sub.pricingModel) ? "free" :
        /paid|premium/i.test(sub.pricingModel) ? "paid" : "freemium";

  const [newTool] = await db
    .insert(tools)
    .values({
      slug,
      name: sub.name,
      tagline: sub.tagline,
      domain,
      websiteUrl: sub.websiteUrl,
      category: sub.category,
      description: sub.description,
      pricing: pricingNormalised,
      logoUrl: sub.logoUrl ?? null,
      screenshotUrl: sub.screenshotUrl ?? null,
      verified: false,
      featured: sub.plan === "featured" || sub.plan === "enterprise",
      status: "draft", // editor finishes the polish before going live
    })
    .returning({ id: tools.id });

  await db
    .update(toolSubmissions)
    .set({
      status: "approved",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      approvedToolId: newTool.id,
    })
    .where(eq(toolSubmissions.id, submissionId));

  await logAdmin("submission.approve", `submission:${submissionId}`, { toolId: newTool.id, slug });
  revalidatePath("/portal-admin/submissions");
  revalidatePath("/portal-admin/tools");
  revalidatePath("/portal-admin");
}

export async function rejectSubmission(submissionId: string, reason?: string) {
  const session = await requireEditor();

  await db
    .update(toolSubmissions)
    .set({
      status: "rejected",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      rejectionReason: reason ?? null,
    })
    .where(eq(toolSubmissions.id, submissionId));

  await logAdmin("submission.reject", `submission:${submissionId}`, { reason });
  revalidatePath("/portal-admin/submissions");
  revalidatePath("/portal-admin");
}

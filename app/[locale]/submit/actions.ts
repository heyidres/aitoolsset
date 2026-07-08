/**
 * /submit form server action.
 *
 * Public — no auth required. Anyone can submit a tool; the
 * admin queue at /admin/submissions reviews + approves before
 * the tool lands in /admin/tools as a draft.
 */

"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { toolSubmissions } from "@/lib/db/schema";
import { limit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const SubmissionInput = z.object({
  plan: z.enum(["standard", "featured", "enterprise"]).default("standard"),
  name: z.string().min(1).max(80),
  websiteUrl: z.string().url(),
  category: z.string().min(1),
  pricingModel: z.string().min(1),
  tagline: z.string().min(1).max(140),
  description: z.string().min(40),
  submitterName: z.string().min(1).max(80),
  submitterEmail: z.string().email(),
  twitterHandle: z.string().optional().default(""),
  launchDate: z.string().optional().default(""),
  dealCopy: z.string().optional().default(""),
});

export type SubmitToolResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function submitTool(formData: FormData): Promise<SubmitToolResult> {
  // Rate limit by IP — 3 submissions/hour stops spam.
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? hdrs.get("x-real-ip") ?? "unknown";
  const rl = limit("submit-tool-action", ip, 3, 60 * 60 * 1000);
  if (!rl.success) {
    return { ok: false, error: `Too many submissions. Try again at ${new Date(rl.resetAt).toLocaleTimeString()}.` };
  }

  // Turnstile bot check (no-op when not configured).
  const turnstileToken = (formData.get("turnstileToken") as string) ?? "";
  const verified = await verifyTurnstile(turnstileToken, ip);
  if (!verified) {
    return { ok: false, error: "Bot check failed. Refresh the page and try again." };
  }

  let parsed;
  try {
    parsed = SubmissionInput.parse({
      plan: (formData.get("plan") as string) ?? "standard",
      name: (formData.get("name") as string) ?? "",
      websiteUrl: (formData.get("websiteUrl") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      pricingModel: (formData.get("pricingModel") as string) ?? "",
      tagline: (formData.get("tagline") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      submitterName: (formData.get("submitterName") as string) ?? "",
      submitterEmail: (formData.get("submitterEmail") as string) ?? "",
      twitterHandle: (formData.get("twitterHandle") as string) ?? "",
      launchDate: (formData.get("launchDate") as string) ?? "",
      dealCopy: (formData.get("dealCopy") as string) ?? "",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
    }
    return { ok: false, error: "Invalid form data" };
  }

  try {
    const [row] = await db
      .insert(toolSubmissions)
      .values({
        ...parsed,
        twitterHandle: parsed.twitterHandle || null,
        launchDate: parsed.launchDate || null,
        dealCopy: parsed.dealCopy || null,
      })
      .returning({ id: toolSubmissions.id });

    revalidatePath("/admin/submissions");
    revalidatePath("/admin");
    await notifySubmission(parsed);
    return { ok: true, id: row.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not save submission: ${msg}` };
  }
}

// Best-effort email notifications — a failure here must never fail
// the submission itself, since the row is already saved.
async function notifySubmission(parsed: z.infer<typeof SubmissionInput>) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[submit-tool] (no Resend key — notification skipped)", parsed.name);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

    await resend.emails.send({
      from,
      to: parsed.submitterEmail,
      subject: `We've received your submission: ${parsed.name}`,
      text: `Thanks for submitting ${parsed.name} to AI Tools Set!\n\nOur editorial team reviews every submission within 48 hours. Once approved, we'll email you a secure payment link for the ${parsed.plan} plan — you won't be charged before that.\n\nQuestions? Just reply to this email.`,
    });

    await resend.emails.send({
      from,
      to: process.env.SUBMISSIONS_INBOX || "sales@aitoolsset.com",
      subject: `[Submission] ${parsed.name} (${parsed.plan})`,
      text: `New tool submission awaiting review:\n\nName: ${parsed.name}\nWebsite: ${parsed.websiteUrl}\nPlan: ${parsed.plan}\nCategory: ${parsed.category}\nSubmitter: ${parsed.submitterName} <${parsed.submitterEmail}>\n\nReview at /admin/submissions.`,
    });
  } catch (e) {
    console.error("[submit-tool] notification email failed:", e);
  }
}

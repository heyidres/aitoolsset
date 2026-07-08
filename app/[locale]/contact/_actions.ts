"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { limit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const ContactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(320),
  subject: z.string().min(2).max(60),
  message: z.string().min(10).max(4000),
});

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  // Rate limit by IP — 5 messages per hour stops spam without blocking real users.
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? hdrs.get("x-real-ip") ?? "unknown";
  const rl = limit("contact", ip, 5, 60 * 60 * 1000);
  if (!rl.success) {
    return { ok: false, error: `Too many messages. Try again at ${new Date(rl.resetAt).toLocaleTimeString()}.` };
  }

  // Turnstile bot check (no-op when not configured).
  const token = (formData.get("turnstileToken") as string) ?? "";
  if (!(await verifyTurnstile(token, ip))) {
    return { ok: false, error: "Bot check failed. Refresh the page and try again." };
  }

  let parsed;
  try {
    parsed = ContactSchema.parse({
      name: (formData.get("name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      subject: (formData.get("subject") as string) ?? "",
      message: (formData.get("message") as string) ?? "",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const first = e.errors[0];
      return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
    }
    return { ok: false, error: "Invalid form data" };
  }

  // Send via Resend if configured; otherwise log so the message
  // isn't silently lost in development.
  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: process.env.CONTACT_INBOX || "sales@aitoolsset.com",
        replyTo: parsed.email,
        subject: `[Contact] ${parsed.subject} — ${parsed.name}`,
        text: `From: ${parsed.name} <${parsed.email}>\nSubject: ${parsed.subject}\n\n${parsed.message}`,
      });
    } else {
      console.log("[contact] (no Resend key — message logged)", parsed);
    }
    return { ok: true };
  } catch (e) {
    console.error("[contact] send failed:", e);
    return { ok: false, error: "Could not send. Please email sales@aitoolsset.com directly." };
  }
}

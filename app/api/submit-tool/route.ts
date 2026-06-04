import { z } from "zod";
import { db } from "@/lib/db";
import { toolSubmissions } from "@/lib/db/schema";
import { ok, fail, parseBody } from "@/lib/api";

export const runtime = "nodejs";

const SubmitSchema = z.object({
  name: z.string().min(2).max(80),
  websiteUrl: z.string().url(),
  category: z.string().min(2).max(60),
  pricingModel: z.string().min(2).max(40),
  plan: z.enum(["free", "featured", "enterprise"]),
  tagline: z.string().min(8).max(120),
  description: z.string().min(80).max(4000),
  submitterName: z.string().min(2).max(80),
  submitterEmail: z.string().email().max(320),
  twitterHandle: z.string().max(40).optional(),
  launchDate: z.string().max(20).optional(), // ISO date string
  logoUrl: z.string().url().optional(),
  screenshotUrl: z.string().url().optional(),
  dealCopy: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const body = await parseBody(req, SubmitSchema);
  if (body instanceof Response) return body;

  try {
    const [row] = await db
      .insert(toolSubmissions)
      .values({
        name: body.name,
        websiteUrl: body.websiteUrl,
        category: body.category,
        pricingModel: body.pricingModel,
        plan: body.plan,
        tagline: body.tagline,
        description: body.description,
        submitterName: body.submitterName,
        submitterEmail: body.submitterEmail,
        twitterHandle: body.twitterHandle,
        launchDate: body.launchDate,
        logoUrl: body.logoUrl,
        screenshotUrl: body.screenshotUrl,
        dealCopy: body.dealCopy,
      })
      .returning({ id: toolSubmissions.id });

    // TODO: enqueue a confirmation email to submitterEmail (Resend)
    // TODO: post to #submissions Slack channel
    return ok({ id: row.id, status: "pending" }, { status: 201 });
  } catch (e) {
    console.error("[submit-tool] db error:", e);
    return fail("Could not store submission", 500);
  }
}

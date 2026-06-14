/**
 * Edit tool form. Loads the tool by id, hydrates the shared
 * ToolForm with current values (including all editorial detail
 * fields), and binds updateTool with the id pre-applied.
 */

import { notFound } from "next/navigation";
import { getToolById, getCategoryOptions } from "@/lib/cms";
import { ToolForm, type ToolFormValues } from "../../ToolForm";
import { updateTool } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tool, categoryOptions] = await Promise.all([
    getToolById(id),
    getCategoryOptions().catch(() => []),
  ]);
  if (!tool) notFound();

  const initial: ToolFormValues = {
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline,
    domain: tool.domain,
    websiteUrl: tool.websiteUrl,
    linkRel: tool.linkRel,
    category: tool.category,
    // Hydrate extras from the multi-cat column, dropping the primary so
    // the picker doesn't double-render it.
    extraCategories: (tool.categories ?? []).filter((s) => s !== tool.category),
    pricing: tool.pricing,
    description: tool.description,
    tagsCsv: tool.tags.join(", "),
    logoUrl: tool.logoUrl ?? "",
    screenshotUrl: tool.screenshotUrl ?? "",
    verified: tool.verified,
    featured: tool.featured,
    status: tool.status,
    madeBy: tool.madeBy ?? "",
    launched: tool.launched ?? "",
    weeklyUsers: tool.weeklyUsers ?? "",
    startingPrice: tool.startingPrice ?? "",
    hasApi: tool.hasApi === null ? "" : tool.hasApi ? "true" : "false",
    mobileApp: tool.mobileApp ?? "",
    browserExtension: tool.browserExtension === null ? "" : tool.browserExtension ? "true" : "false",
    socials: tool.socials ?? {},
    features: tool.features ?? [],
    pros: tool.pros ?? [],
    cons: tool.cons ?? [],
    plans: tool.plans ?? [],
    seoTitle: tool.seoTitle ?? "",
    seoDescription: tool.seoDescription ?? "",
  };

  const action = async (formData: FormData) => {
    "use server";
    await updateTool(id, formData);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ToolForm mode="edit" initial={initial} action={action} categoryOptions={categoryOptions} />
    </div>
  );
}

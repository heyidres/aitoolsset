import { notFound } from "next/navigation";
import { getAllCategories, getCategoryById, getToolOptionsByCategory } from "@/lib/cms";
import { CategoryForm, type CategoryFormValues } from "../../CategoryForm";
import { updateCategory } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Format a Date to a yyyy-mm-dd string for <input type="date">. */
function toDateInput(d: Date | null): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cat, all] = await Promise.all([getCategoryById(id), getAllCategories()]);
  if (!cat) notFound();

  // Tools currently in this category (used by the editor's-pick chooser + relevance)
  const toolsInCategory = await getToolOptionsByCategory(cat.slug).catch(() => []);

  const initial: CategoryFormValues = {
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon ?? "",
    color: cat.color ?? "#0052ff",
    description: cat.description ?? "",
    popular: cat.popular,
    orderIndex: cat.orderIndex,
    parentSlug: cat.parentSlug ?? "",
    bannerImageUrl: cat.bannerImageUrl ?? "",
    heroEyebrow: cat.heroEyebrow ?? "",
    heroTitle: cat.heroTitle ?? "",
    heroSubtitle: cat.heroSubtitle ?? "",
    introHtml: cat.introHtml ?? "",
    bottomHtml: cat.bottomHtml ?? "",
    seoTitle: cat.seoTitle ?? "",
    seoDescription: cat.seoDescription ?? "",
    featuredToolSlugs: cat.featuredToolSlugs,
    faqs: cat.faqs,
    toolRelevance: cat.toolRelevance,
    relevanceThreshold: cat.relevanceThreshold,
    lastReviewedAt: toDateInput(cat.lastReviewedAt),
    focusKeyword: cat.focusKeyword ?? "",
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateCategory(id, fd);
  };

  return (
    <CategoryForm
      mode="edit"
      initial={initial}
      action={action}
      allCategories={all.filter((c) => c.id !== id).map((c) => ({ slug: c.slug, name: c.name }))}
      toolsInCategory={toolsInCategory}
    />
  );
}

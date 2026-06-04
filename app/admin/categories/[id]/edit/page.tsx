import { notFound } from "next/navigation";
import { getAllCategories, getCategoryById } from "@/lib/cms";
import { CategoryForm, type CategoryFormValues } from "../../CategoryForm";
import { updateCategory } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cat, all] = await Promise.all([getCategoryById(id), getAllCategories()]);
  if (!cat) notFound();

  const initial: CategoryFormValues = {
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon ?? "",
    color: cat.color ?? "#0052ff",
    description: cat.description ?? "",
    popular: cat.popular,
    orderIndex: cat.orderIndex,
    parentSlug: cat.parentSlug ?? "",
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
    />
  );
}

import { getAllCategories, getPublishedBlogPosts } from "@/lib/cms";
import { CategoryForm } from "../CategoryForm";
import { createCategory } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const [all, posts] = await Promise.all([getAllCategories(), getPublishedBlogPosts().catch(() => [])]);
  return (
    <CategoryForm
      mode="create"
      action={createCategory}
      allCategories={all.map((c) => ({ slug: c.slug, name: c.name }))}
      blogPosts={posts.map((p) => ({ slug: p.slug, title: p.title }))}
    />
  );
}

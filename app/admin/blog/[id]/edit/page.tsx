import { notFound } from "next/navigation";
import { getBlogPostById, getAuthorOptions, getPublishedTools } from "@/lib/cms";
import { BlogForm, type BlogFormValues } from "../../BlogForm";
import { updateBlogPost } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toLocal(d: Date | null): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, authorOptions, allTools] = await Promise.all([
    getBlogPostById(id),
    getAuthorOptions().catch(() => []),
    getPublishedTools().catch(() => []),
  ]);
  if (!post) notFound();

  const toolOptions = allTools.map((t) => ({ slug: t.slug, name: t.name }));

  const initial: BlogFormValues = {
    title: post.title,
    slug: post.slug,
    category: post.category,
    deck: post.deck ?? "",
    coverImageUrl: post.coverImageUrl ?? "",
    author: post.author ?? "",
    authorSlugs: post.authorSlugs ?? [],
    reviewedBySlug: post.reviewedBySlug ?? "",
    tagsCsv: post.tags.join(", "),
    body: post.body,
    faqs: post.faqs ?? [],
    readMinutes: post.readMinutes ? String(post.readMinutes) : "",
    status: post.status,
    publishedAt: toLocal(post.publishedAt),
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateBlogPost(id, fd);
  };

  return (
    <BlogForm
      mode="edit"
      initial={initial}
      action={action}
      authorOptions={authorOptions}
      toolOptions={toolOptions}
    />
  );
}

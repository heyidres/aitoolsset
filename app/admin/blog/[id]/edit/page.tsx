import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/cms";
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
  const post = await getBlogPostById(id);
  if (!post) notFound();

  const initial: BlogFormValues = {
    title: post.title,
    slug: post.slug,
    category: post.category,
    deck: post.deck ?? "",
    coverImageUrl: post.coverImageUrl ?? "",
    author: post.author ?? "",
    tagsCsv: post.tags.join(", "),
    body: post.body,
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

  return <BlogForm mode="edit" initial={initial} action={action} />;
}

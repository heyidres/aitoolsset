import { getAuthorOptions, getPublishedTools } from "@/lib/cms";
import { BlogForm } from "../BlogForm";
import { createBlogPost } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const [authorOptions, allTools] = await Promise.all([
    getAuthorOptions().catch(() => []),
    getPublishedTools().catch(() => []),
  ]);
  const toolOptions = allTools.map((t) => ({ slug: t.slug, name: t.name }));
  return (
    <BlogForm
      mode="create"
      action={createBlogPost}
      authorOptions={authorOptions}
      toolOptions={toolOptions}
    />
  );
}

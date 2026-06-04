import { BlogForm } from "../BlogForm";
import { createBlogPost } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewBlogPostPage() {
  return <BlogForm mode="create" action={createBlogPost} />;
}

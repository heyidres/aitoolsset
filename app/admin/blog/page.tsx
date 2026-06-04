import Link from "next/link";
import { getAllBlogPosts } from "@/lib/cms";
import { BlogTable } from "./BlogTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = await getAllBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>No articles yet</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>Write your first editorial piece for /blog.</p>
          <Link href="/admin/blog/new" className="adm-btn-sm primary">+ New article</Link>
        </div>
      </div>
    );
  }

  return <BlogTable rows={posts} />;
}

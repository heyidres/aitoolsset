import { notFound } from "next/navigation";
import { getSitePageById } from "@/lib/cms";
import { PageForm, type PageFormValues } from "../../PageForm";
import { updateSitePage } from "../../_actions";

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

export default async function EditSitePagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getSitePageById(id);
  if (!page) notFound();

  const initial: PageFormValues = {
    title: page.title,
    slug: page.slug,
    deck: page.deck ?? "",
    coverImageUrl: page.coverImageUrl ?? "",
    body: page.body,
    status: page.status,
    publishedAt: toLocal(page.publishedAt),
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateSitePage(id, fd);
  };

  return <PageForm mode="edit" initial={initial} action={action} />;
}

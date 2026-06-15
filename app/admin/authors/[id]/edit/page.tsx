import { notFound } from "next/navigation";
import { getAuthorById } from "@/lib/cms";
import { AuthorForm, type AuthorFormValues } from "../../AuthorForm";
import { updateAuthor } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAuthorById(id);
  if (!a) notFound();

  const initial: AuthorFormValues = {
    name: a.name,
    slug: a.slug,
    role: a.role ?? "",
    bioHtml: a.bioHtml ?? "",
    photoUrl: a.photoUrl ?? "",
    credentialsCsv: a.credentials.join(", "),
    websiteUrl: a.websiteUrl ?? "",
    linkedinUrl: a.linkedinUrl ?? "",
    xUrl: a.xUrl ?? "",
    githubUrl: a.githubUrl ?? "",
    email: a.email ?? "",
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateAuthor(id, fd);
  };

  return <AuthorForm mode="edit" initial={initial} action={action} />;
}

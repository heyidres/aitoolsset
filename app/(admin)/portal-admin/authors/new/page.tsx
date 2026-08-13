import { AuthorForm } from "../AuthorForm";
import { createAuthor } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewAuthorPage() {
  const action = async (fd: FormData) => {
    "use server";
    await createAuthor(fd);
  };
  return <AuthorForm mode="create" action={action} />;
}

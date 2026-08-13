import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewsForm, EMPTY_FORM } from "../NewsForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewNewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?next=/admin/news/new");
  if (session.user.role !== "editor" && session.user.role !== "admin") {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>
          Editor role required.
        </div>
      </div>
    );
  }
  return <NewsForm mode="create" initial={EMPTY_FORM} />;
}

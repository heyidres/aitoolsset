import { PageForm } from "../PageForm";
import { createSitePage } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewSitePagePage() {
  return <PageForm mode="create" action={createSitePage} />;
}

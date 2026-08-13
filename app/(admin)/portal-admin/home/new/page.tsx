import { getPublishedTools } from "@/lib/cms";
import { HomeSectionForm } from "../HomeSectionForm";
import { createHomeSection } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewHomeSectionPage() {
  const tools = await getPublishedTools().catch(() => []);
  const toolOptions = tools.map((t) => ({ slug: t.slug, name: t.name }));
  return <HomeSectionForm mode="create" action={createHomeSection} toolOptions={toolOptions} />;
}

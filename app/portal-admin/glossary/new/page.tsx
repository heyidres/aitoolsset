import { getToolOptions } from "@/lib/cms";
import { GlossaryForm } from "../GlossaryForm";
import { createGlossaryTerm } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewGlossaryTermPage() {
  const tools = await getToolOptions();
  return <GlossaryForm mode="create" action={createGlossaryTerm} toolOptions={tools} />;
}

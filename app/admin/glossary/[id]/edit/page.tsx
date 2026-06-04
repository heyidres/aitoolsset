import { notFound } from "next/navigation";
import { getGlossaryTermById, getToolOptions } from "@/lib/cms";
import { GlossaryForm, type GlossaryFormValues } from "../../GlossaryForm";
import { updateGlossaryTerm } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditGlossaryTermPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [term, tools] = await Promise.all([getGlossaryTermById(id), getToolOptions()]);
  if (!term) notFound();

  const initial: GlossaryFormValues = {
    term: term.term,
    slug: term.slug,
    acronym: term.acronym ?? "",
    cat: term.cat,
    definition: term.definition,
    example: term.example ?? "",
    relatedCsv: term.related.join(", "),
    linkedToolId: term.linkedToolId ?? "",
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateGlossaryTerm(id, fd);
  };

  return <GlossaryForm mode="edit" initial={initial} action={action} toolOptions={tools} />;
}

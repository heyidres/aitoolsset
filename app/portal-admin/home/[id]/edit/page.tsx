import { notFound } from "next/navigation";
import { getHomeSectionById, getPublishedTools } from "@/lib/cms";
import { HomeSectionForm, type HomeSectionFormValues } from "../../HomeSectionForm";
import { updateHomeSection } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditHomeSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [section, tools] = await Promise.all([
    getHomeSectionById(id),
    getPublishedTools().catch(() => []),
  ]);
  if (!section) notFound();

  const initial: HomeSectionFormValues = {
    slug: section.slug,
    badge: section.badge,
    title: section.title,
    deck: section.deck,
    bgColor: section.bgColor,
    imageSide: section.imageSide,
    position: String(section.position),
    enabled: section.enabled,
    toolSlugs: section.toolSlugs,
    useCases: section.useCases,
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateHomeSection(id, fd);
  };

  const toolOptions = tools.map((t) => ({ slug: t.slug, name: t.name }));

  return <HomeSectionForm mode="edit" initial={initial} action={action} toolOptions={toolOptions} />;
}

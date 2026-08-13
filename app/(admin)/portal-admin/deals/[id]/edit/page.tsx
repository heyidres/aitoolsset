import { notFound } from "next/navigation";
import { getDealById, getToolOptions } from "@/lib/cms";
import { DealForm, type DealFormValues } from "../../DealForm";
import { updateDeal } from "../../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deal, tools] = await Promise.all([getDealById(id), getToolOptions()]);
  if (!deal) notFound();

  const initial: DealFormValues = {
    toolId: deal.toolId,
    type: deal.type,
    amount: deal.amount,
    label: deal.label ?? "",
    headline: deal.headline,
    description: deal.description,
    code: deal.code ?? "",
    savingsUsd: deal.savingsUsd ? String(deal.savingsUsd) : "",
    expiresAt: toDateInput(deal.expiresAt),
    exclusive: deal.exclusive,
    blackFriday: deal.blackFriday,
    verified: deal.verified,
    active: deal.active,
  };

  const action = async (fd: FormData) => {
    "use server";
    await updateDeal(id, fd);
  };

  return <DealForm mode="edit" initial={initial} action={action} toolOptions={tools} />;
}

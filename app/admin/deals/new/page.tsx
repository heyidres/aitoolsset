import Link from "next/link";
import { getToolOptions } from "@/lib/cms";
import { DealForm } from "../DealForm";
import { createDeal } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  const tools = await getToolOptions();
  if (tools.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>You need a tool first</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>Deals attach to a tool. Add one before creating a deal.</p>
          <Link href="/admin/tools/new" className="adm-btn-sm primary">+ Add a tool</Link>
        </div>
      </div>
    );
  }
  return <DealForm mode="create" action={createDeal} toolOptions={tools} />;
}

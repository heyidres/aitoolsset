import Link from "next/link";
import { getAllDeals } from "@/lib/cms";
import { DealsTable } from "./DealsTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DealsAdminPage() {
  const deals = await getAllDeals();

  if (deals.length === 0) {
    return (
      <div className="adm-panel">
        <div className="adm-panel-body" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏷️</div>
          <h2 style={{ fontFamily: "var(--font-manrope)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>No deals yet</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>Add a discount or promo code on top of an existing tool.</p>
          <Link href="/admin/deals/new" className="adm-btn-sm primary">+ Add your first deal</Link>
        </div>
      </div>
    );
  }

  return <DealsTable rows={deals} />;
}

/**
 * New tool form. Mounts the shared ToolForm in "create" mode
 * and passes the createTool server action + CMS categories so
 * the dropdown reflects the editor's curated category list.
 */

import { ToolForm } from "../ToolForm";
import { createTool } from "../_actions";
import { getCategoryOptions } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewToolPage() {
  const categoryOptions = await getCategoryOptions().catch(() => []);
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ToolForm mode="create" action={createTool} categoryOptions={categoryOptions} />
    </div>
  );
}

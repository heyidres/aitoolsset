/**
 * New tool form. Mounts the shared ToolForm in "create" mode
 * and passes the createTool server action.
 */

import { ToolForm } from "../ToolForm";
import { createTool } from "../_actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewToolPage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ToolForm mode="create" action={createTool} />
    </div>
  );
}

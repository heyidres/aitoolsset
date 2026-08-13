import { PagePlaceholder } from "../_components/PagePlaceholder";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <PagePlaceholder
      phase={3}
      title="Settings"
      description="Site name, support email, submission auto-approve, maintenance mode. Persists to a key/value table in Postgres. Coming in phase 3."
    />
  );
}

import { PagePlaceholder } from "../_components/PagePlaceholder";

export const dynamic = "force-dynamic";

export default function UsersPage() {
  return (
    <PagePlaceholder
      phase={3}
      title="Users"
      description="Promote editors, ban abusers, audit logins. Pulls from the Postgres user table. Coming in phase 3."
    />
  );
}

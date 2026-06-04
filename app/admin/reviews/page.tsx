import { PagePlaceholder } from "../_components/PagePlaceholder";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  return (
    <PagePlaceholder
      phase={3}
      title="Review moderation"
      description="Approve, reject, or flag user reviews. Pulls from the Postgres reviews table. Coming in phase 3 once a moderation status column is added to the schema."
    />
  );
}

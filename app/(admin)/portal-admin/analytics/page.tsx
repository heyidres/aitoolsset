import { PagePlaceholder } from "../_components/PagePlaceholder";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <PagePlaceholder
      phase={3}
      title="Analytics"
      description="Traffic sources, top pages, click-through rates. Hooks into Vercel Analytics + Plausible. Coming in phase 3."
    />
  );
}

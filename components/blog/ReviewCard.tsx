/**
 * Ranked review card rendered mid-article via
 *   [[review n=1 slug=... best="..."]] verdict + optional PROS:/CONS: [[/review]]
 *
 * The signature block for "best of" roundups. One unified premium card per
 * tool: a big rank numeral, the tool's real logo, a "Best for" pill, the
 * tool's REAL starting price from the DB, an editorial verdict, an integrated
 * pros/cons grid, and a CTA. The #1 pick gets an Editor's Choice treatment.
 *
 * Deliberately no star rating: synthetic ratings violate our review-integrity
 * policy, so the rank and best-for line carry the editorial signal instead.
 *
 * Server component. Wraps the card in a Link to the tool's profile so every
 * roundup feeds internal link equity to the tool pages.
 */

import { Link } from "@/lib/i18n/navigation";
import { Favicon } from "@/components/Favicon";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { sanitizeHtml } from "@/lib/sanitize";

export type ReviewCardTool = {
  slug: string;
  name: string;
  domain: string;
  verified: boolean;
  pricing: string;
  startingPrice: string | null;
  saveCount: number;
};

function priceLabel(t: ReviewCardTool): string {
  const sp = t.startingPrice?.trim();
  // A stored "$0" / "0" is really a free plan — show that, not a bare "$0".
  if (sp && !/^\$?0(\.0+)?$/.test(sp)) return sp;
  switch (t.pricing) {
    case "free": return "Free";
    case "freemium": return "Free plan available";
    case "trial": return "Free trial";
    case "credit": return "Pay per use";
    case "enterprise": return "Enterprise";
    default: return "Paid";
  }
}

export function ReviewCard({
  tool,
  slug,
  n,
  best,
  body,
  pros,
  cons,
}: {
  tool: ReviewCardTool | null;
  slug: string;
  n: number;
  best: string;
  body: string;
  pros: string[];
  cons: string[];
}) {
  if (!tool) {
    return (
      <div className="not-prose blog-review-missing">
        ⚠ Review card <code>{slug}</code> is missing or unpublished.
      </div>
    );
  }

  const isTop = n === 1;
  const hasProsCons = pros.length > 0 || cons.length > 0;

  return (
    <div className={`not-prose blog-review${isTop ? " blog-review-top" : ""}`}>
      <Link href={`/ai-tool/${tool.slug}`} className="blog-review-link">
        {isTop && <div className="blog-review-choice">★ Editor&apos;s Choice</div>}

        <div className="blog-review-head">
          {n > 0 && <div className="blog-review-rank">{n}</div>}
          <div className="blog-review-logo">
            <Favicon domain={tool.domain} name={tool.name} size={52} />
          </div>
          <div className="blog-review-id">
            <div className="blog-review-name">
              {tool.name}
              {tool.verified && <VerifiedBadge />}
            </div>
            {best && (
              <div className="blog-review-best">
                <span className="blog-review-best-label">Best for</span>
                <span className="blog-review-best-text">{best}</span>
              </div>
            )}
          </div>
          <div className="blog-review-price">{priceLabel(tool)}</div>
        </div>

        <div
          className="blog-review-verdict"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }}
        />

        {hasProsCons && (
          <div className="blog-review-pc">
            <div className="blog-review-pc-col blog-review-pros">
              <div className="blog-review-pc-title">✓ Pros</div>
              <ul>
                {pros.map((p, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p) }} />
                ))}
              </ul>
            </div>
            <div className="blog-review-pc-col blog-review-cons">
              <div className="blog-review-pc-title">✕ Cons</div>
              <ul>
                {cons.map((c, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(c) }} />
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="blog-review-foot">
          {tool.saveCount > 0 && (
            <span className="blog-review-saves">♥ {tool.saveCount.toLocaleString()} saves</span>
          )}
          <span className="blog-review-cta">Read full review →</span>
        </div>
      </Link>
    </div>
  );
}

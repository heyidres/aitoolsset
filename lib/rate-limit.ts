/**
 * ─────────────────────────────────────────────────────────────
 *  Simple rate limiter — token bucket per identifier
 * ─────────────────────────────────────────────────────────────
 *
 *  In-memory implementation. Good enough as a basic deterrent
 *  against scripted abuse on a public POST endpoint. NOT
 *  perfect for multi-instance serverless deploys (each Vercel
 *  function instance has its own bucket), but Vercel routes
 *  consecutive requests from the same IP to the same warm
 *  instance often enough that this stops real abuse.
 *
 *  Upgrade path: swap to @upstash/ratelimit + @upstash/redis
 *  when traffic warrants it. The shape of `limit()` matches
 *  Upstash's, so the caller stays unchanged.
 * ─────────────────────────────────────────────────────────────
 */

type Bucket = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Bucket>>();

function getStore(scope: string): Map<string, Bucket> {
  let store = stores.get(scope);
  if (!store) {
    store = new Map();
    stores.set(scope, store);
  }
  return store;
}

// Periodically prune expired buckets so the map doesn't grow forever.
// Runs lazily on each call rather than via setInterval (no leaks on cold-start).
let lastPrune = Date.now();
function pruneIfNeeded(store: Map<string, Bucket>) {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, b] of store) {
    if (b.resetAt < now) store.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Allow up to `max` requests per `windowMs` for the given identifier.
 *
 * @param scope     Logical bucket name (e.g. "submit-tool"). Different
 *                  scopes have independent counters.
 * @param identifier Per-caller key (usually an IP).
 * @param max       Max allowed requests in the window.
 * @param windowMs  Window size in milliseconds.
 */
export function limit(
  scope: string,
  identifier: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(scope);
  pruneIfNeeded(store);

  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.resetAt < now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    store.set(identifier, fresh);
    return { success: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= max) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

/**
 * Extract the best-effort client IP from request headers.
 * Vercel sets x-forwarded-for; fall back to x-real-ip; final
 * fallback is a constant so absent headers still produce a key.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

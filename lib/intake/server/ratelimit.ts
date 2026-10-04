// In-memory rate limit for POST /api/intake/start: 10 starts per client IP per 10 minutes, then 429.
//
// Best effort by design — each server instance keeps its own window (no database on this path), so it
// stops a script hammering one instance, not a distributed attack; Turnstile, when switched on, is the
// second line. Only requests that passed validation are counted (see the order in start/route.ts), so a
// parent correcting the form is never locked out by their own typos.

export const RATE_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 } as const;

/** Oldest keys are dropped beyond this, so a flood of distinct IPs cannot grow the map without bound. */
const MAX_KEYS = 10_000;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the oldest counted start leaves the window (0 when ok). */
  retryAfterSeconds: number;
}

/** Counts one start for `key` when allowed; a refused start is not counted. */
export function takeRateLimit(key: string, nowMs: number = Date.now()): RateLimitResult {
  const windowStart = nowMs - RATE_LIMIT.windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + RATE_LIMIT.windowMs - nowMs) / 1000)) };
  }
  recent.push(nowMs);
  // Re-insert so the Map's insertion order stays "least recently active first" for eviction.
  hits.delete(key);
  hits.set(key, recent);
  while (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next();
    if (oldest.done) break;
    hits.delete(oldest.value);
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Tests only: forget every window. */
export function resetRateLimit(): void {
  hits.clear();
}

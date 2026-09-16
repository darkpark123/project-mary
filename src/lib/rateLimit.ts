// ponytail: in-memory, per-instance sliding window - resets on cold start and
// isn't shared across serverless instances, so it slows down a single
// attacker hammering one warm instance but doesn't stop a distributed
// credential-stuffing attempt. Real ceiling: swap for Upstash Ratelimit
// (Redis-backed, serverless-safe) if login abuse shows up in practice.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limiter held in memory.
 *
 * Honest about its limits: this resets when the function instance recycles and
 * is not shared across instances, so it is a speed bump against casual abuse,
 * not a security control. For a personal contact form that is the right amount
 * of machinery — a shared store would add an external dependency and an outage
 * mode to protect one mailbox.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    // Opportunistic sweep so the map cannot grow without bound.
    if (buckets.size > 1000) {
      for (const [existing, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(existing);
      }
    }

    const bucket = buckets.get(key);

    if (bucket === undefined || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }

    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

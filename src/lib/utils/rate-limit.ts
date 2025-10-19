const WINDOW_MS = 60_000;

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 60) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, lastRefill: now };
  const elapsed = now - bucket.lastRefill;

  if (elapsed > WINDOW_MS) {
    bucket.tokens = limit;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - bucket.lastRefill)) / 1000);
    buckets.set(key, bucket);
    return { allowed: false, retryAfter };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true };
}

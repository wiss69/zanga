const buckets = new Map<string, { tokens: number; reset: number }>();
const CAP = 60;
const WINDOW = 60_000;

export function rateLimit(ip: string) {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { tokens: CAP, reset: now + WINDOW };
  if (now > bucket.reset) {
    bucket.tokens = CAP;
    bucket.reset = now + WINDOW;
  }
  if (bucket.tokens <= 0) {
    return {
      allowed: false as const,
      retryAfter: Math.ceil((bucket.reset - now) / 1000)
    };
  }
  bucket.tokens -= 1;
  buckets.set(ip, bucket);
  return { allowed: true as const, retryAfter: 0 };
}

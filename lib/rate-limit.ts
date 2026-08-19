interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove timestamps older than 1 hour
      const valid = record.timestamps.filter(ts => now - ts < 60 * 60 * 1000);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        record.timestamps = valid;
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Sliding Window Rate Limiter
 * @param identifier Unique key (e.g. `publish:${clientIp}`)
 * @param limit Maximum allowed requests within window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Filter out timestamps outside the sliding window
  const recent = record.timestamps.filter(ts => now - ts < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const resetInMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
    };
  }

  // Record this hit
  recent.push(now);
  rateLimitStore.set(identifier, { timestamps: recent });

  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    resetInMs: windowMs,
  };
}

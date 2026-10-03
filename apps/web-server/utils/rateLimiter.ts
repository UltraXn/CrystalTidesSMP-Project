export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs?: number;
}

export class MemoryRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly requests: Map<string, number[]>;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.requests = new Map();
  }

  check(key: string, now: number = Date.now()): RateLimitCheckResult {
    let timestamps = this.requests.get(key) ?? [];
    if (timestamps.length > 0 && now - timestamps[0] >= this.windowMs) {
      timestamps = [];
    }

    const windowStart = now - this.windowMs;
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0] ?? now;
      const resetTimeMs = oldest + this.windowMs;
      this.requests.set(key, validTimestamps);
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs,
      };
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetTimeMs: (validTimestamps[0] ?? now) + this.windowMs,
    };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

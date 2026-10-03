import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRateLimiter } from '../../utils/rateLimiter';

describe('MemoryRateLimiter (Sliding Window TDD)', () => {
  let limiter: MemoryRateLimiter;

  beforeEach(() => {
    limiter = new MemoryRateLimiter({
      windowMs: 1000, // 1 second window
      maxRequests: 3, // 3 requests per second
    });
  });

  it('allows requests within the configured max limit', () => {
    const key = '192.168.1.1';
    const now = 1000000;

    const res1 = limiter.check(key, now);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check(key, now + 100);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check(key, now + 200);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks subsequent requests exceeding maxRequests within the window', () => {
    const key = '192.168.1.2';
    const now = 1000000;

    limiter.check(key, now);
    limiter.check(key, now + 100);
    limiter.check(key, now + 200);

    const blockedRes = limiter.check(key, now + 300);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetTimeMs).toBeGreaterThan(now + 300);
  });

  it('slides the window and allows new requests after windowMs expires', () => {
    const key = '192.168.1.3';
    const now = 1000000;

    // Fill the window
    limiter.check(key, now);
    limiter.check(key, now + 100);
    limiter.check(key, now + 200);

    // After windowMs (1000ms), previous timestamps expire
    const laterRes = limiter.check(key, now + 1001);
    expect(laterRes.allowed).toBe(true);
    expect(laterRes.remaining).toBe(2);
  });

  it('tracks different IP addresses / client keys independently', () => {
    const clientA = 'ip-aaa';
    const clientB = 'ip-bbb';
    const now = 1000000;

    limiter.check(clientA, now);
    limiter.check(clientA, now + 10);
    limiter.check(clientA, now + 20);

    expect(limiter.check(clientA, now + 30).allowed).toBe(false);
    expect(limiter.check(clientB, now + 30).allowed).toBe(true);
  });

  it('resets counters manually when reset(key) is invoked', () => {
    const key = 'ip-reset';
    const now = 1000000;

    limiter.check(key, now);
    limiter.check(key, now);
    limiter.check(key, now);
    expect(limiter.check(key, now).allowed).toBe(false);

    limiter.reset(key);
    expect(limiter.check(key, now).allowed).toBe(true);
  });
});

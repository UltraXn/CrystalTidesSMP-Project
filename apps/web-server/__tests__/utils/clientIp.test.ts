/* eslint-disable sonarjs/no-hardcoded-ip -- fixture addresses (TEST-NET and Cloudflare edges) */
import { describe, it, expect } from 'vitest';
import type { Request } from 'express';
import { getClientIp, isCloudflareIp } from '../../utils/clientIp.js';
import { userOrIpKey } from '../../middleware/rateLimitMiddleware.js';

const fakeReq = (
  ip: string,
  headers: Record<string, string> = {},
  user?: { id: string; role: string },
) => ({ ip, headers, user, socket: { remoteAddress: ip } }) as unknown as Request;

describe('getClientIp', () => {
  it('uses CF-Connecting-IP when the peer is a Cloudflare edge', () => {
    const req = fakeReq('172.67.10.10', { 'cf-connecting-ip': '203.0.113.7' });

    expect(getClientIp(req)).toBe('203.0.113.7');
  });

  it('ignores CF-Connecting-IP forged by a client that bypassed Cloudflare', () => {
    const req = fakeReq('198.51.100.9', { 'cf-connecting-ip': '203.0.113.7' });

    expect(getClientIp(req)).toBe('198.51.100.9');
  });

  it('ignores a malformed CF-Connecting-IP', () => {
    const req = fakeReq('172.67.10.10', { 'cf-connecting-ip': 'not-an-ip' });

    expect(getClientIp(req)).toBe('172.67.10.10');
  });

  it('recognises IPv6 and IPv4-mapped Cloudflare edges', () => {
    expect(isCloudflareIp('2606:4700::1')).toBe(true);
    expect(isCloudflareIp('::ffff:104.16.0.1')).toBe(true);
    expect(isCloudflareIp('8.8.8.8')).toBe(false);
    expect(isCloudflareIp('garbage')).toBe(false);
  });
});

describe('rate limit keys', () => {
  it('limits authenticated callers per account', () => {
    const req = fakeReq('198.51.100.9', {}, { id: 'user-1', role: 'user' });

    expect(userOrIpKey(req)).toBe('user:user-1');
  });

  it('gives anonymous callers one bucket per IP whatever cookies they send', () => {
    const first = fakeReq('198.51.100.9', { cookie: 'device_id=aaa' });
    const second = fakeReq('198.51.100.9', { cookie: 'device_id=bbb' });

    expect(userOrIpKey(first)).toBe(userOrIpKey(second));
  });
});

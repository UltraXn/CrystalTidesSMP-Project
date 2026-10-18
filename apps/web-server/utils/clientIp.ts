import net from 'node:net';
import type { Request } from 'express';

// https://www.cloudflare.com/ips/ (checked 2026-10-17)
/* eslint-disable sonarjs/no-hardcoded-ip -- Cloudflare's published edge ranges */
const CLOUDFLARE_IPV4 = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
];

const CLOUDFLARE_IPV6 = [
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];
/* eslint-enable sonarjs/no-hardcoded-ip */

const cloudflareRanges = new net.BlockList();
for (const cidr of CLOUDFLARE_IPV4) {
  const [address, prefix] = cidr.split('/');
  cloudflareRanges.addSubnet(address, Number(prefix), 'ipv4');
}
for (const cidr of CLOUDFLARE_IPV6) {
  const [address, prefix] = cidr.split('/');
  cloudflareRanges.addSubnet(address, Number(prefix), 'ipv6');
}

const stripIpv4MappedPrefix = (ip: string) => (ip.startsWith('::ffff:') ? ip.slice(7) : ip);

export function isCloudflareIp(ip: string): boolean {
  const address = stripIpv4MappedPrefix(ip);
  switch (net.isIP(address)) {
    case 4:
      return cloudflareRanges.check(address, 'ipv4');
    case 6:
      return cloudflareRanges.check(address, 'ipv6');
    default:
      return false;
  }
}

/**
 * The API is served through Cloudflare and Cloud Run, so `req.ip` (resolved
 * with `trust proxy`) is the Cloudflare edge that forwarded the request. The
 * real client is in CF-Connecting-IP, but that header is only trusted when the
 * peer really is Cloudflare: anyone reaching the origin directly could forge it.
 */
export function getClientIp(req: Request): string {
  const peer = req.ip ?? req.socket.remoteAddress ?? '';
  const forwardedFor = req.headers['cf-connecting-ip'];

  if (typeof forwardedFor === 'string' && net.isIP(forwardedFor) && isCloudflareIp(peer)) {
    return forwardedFor;
  }
  return peer;
}

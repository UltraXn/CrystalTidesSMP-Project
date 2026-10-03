import dns from 'node:dns/promises';
import net from 'node:net';

export class SSRFSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SSRFSecurityError';
  }
}

/**
 * Checks whether an IPv4 address belongs to a private, loopback, or restricted range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4 is treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (RFC 1918)
  if (a === 10) return true;
  // 172.16.0.0/12 (RFC 1918: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (RFC 1918)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-Local & GCP/AWS Cloud Metadata Server 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 255.255.255.255 (Broadcast)
  if (parts.every((p) => p === 255)) return true;

  return false;
}

/**
 * Checks whether an IPv6 address belongs to a private, loopback, or link-local range.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // Unspecified ::
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
  // Unique Local Address (fc00::/7 -> fc.. or fd..)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // Link-Local (fe80::/10 -> fe8, fe9, fea, feb)
  if (/^fe[89ab]/.test(normalized)) return true;
  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (normalized.startsWith('::ffff:')) {
    const ipv4Part = ip.slice(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  return false;
}

function assertPublicHostname(hostname: string): void {
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal'
  ) {
    throw new SSRFSecurityError(`Access to internal hostname ${hostname} is strictly blocked.`);
  }
}

function checkIpLiteral(hostname: string): boolean {
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      throw new SSRFSecurityError(`Direct access to private/link-local IPv4 ${hostname} is blocked.`);
    }
    return true;
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      throw new SSRFSecurityError(`Direct access to private/loopback IPv6 ${hostname} is blocked.`);
    }
    return true;
  }

  return false;
}

async function verifyDnsRecords(hostname: string): Promise<void> {
  try {
    const records = await dns.lookup(hostname, { all: true });
    for (const record of records) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        throw new SSRFSecurityError(
          `Domain ${hostname} resolved to prohibited private/internal IPv4: ${record.address}`,
        );
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        throw new SSRFSecurityError(
          `Domain ${hostname} resolved to prohibited private/internal IPv6: ${record.address}`,
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof SSRFSecurityError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new SSRFSecurityError(`Failed to resolve DNS for ${hostname}: ${message}`);
  }
}

/**
 * Validates a target URL against SSRF attacks (specifically guarding GCP metadata and private networks).
 */
export async function validateSafeUrl(urlStr: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new SSRFSecurityError(`Invalid URL format: ${urlStr}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SSRFSecurityError(
      `Unsupported protocol: ${parsed.protocol}. Only http: and https: are allowed.`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  assertPublicHostname(hostname);

  if (checkIpLiteral(hostname)) {
    return parsed;
  }

  await verifyDnsRecords(hostname);
  return parsed;
}

/**
 * Safe fetch wrapper that guards against SSRF before making the request.
 */
export async function safeFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input.toString();
  await validateSafeUrl(urlStr);
  return fetch(urlStr, init);
}

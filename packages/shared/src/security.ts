/**
 * Validates whether a redirect URL is safe to navigate to,
 * preventing Open Redirect vulnerabilities (CWE-601).
 *
 * Rules:
 * 1. Empty or whitespace-only inputs are rejected.
 * 2. Dangerous URI schemes (javascript:, data:, vbscript:, file:) are rejected.
 * 3. Relative paths starting with '/' are permitted UNLESS they are protocol-relative (e.g. '//attacker.com').
 * 4. Absolute URLs must use http: or https: and their hostname must strictly match an allowed host or a trusted subdomain.
 */
export function isAllowedRedirectUrl(url: string, allowedHosts: string[]): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Reject protocol-relative URLs (//attacker.com, ///attacker.com, \\attacker.com)
  if (trimmed.startsWith('//') || trimmed.startsWith('///') || trimmed.startsWith('\\\\')) {
    return false;
  }

  // Dangerous URI schemes check
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Pure relative paths (/dashboard, /auth/callback?code=123)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return allowedHosts.some((allowed) => {
      const target = allowed.toLowerCase();
      return host === target || host.endsWith(`.${target}`);
    });
  } catch {
    return false;
  }
}

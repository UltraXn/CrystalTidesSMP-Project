import { describe, it, expect } from 'vitest';
import { isAllowedRedirectUrl } from '@crystaltides/shared';

describe('isAllowedRedirectUrl (Open Redirect Security)', () => {
  const allowedHosts = ['crystaltidessmp.net', 'panel.crystaltidessmp.net'];

  it('allows relative paths without host', () => {
    expect(isAllowedRedirectUrl('/dashboard', allowedHosts)).toBe(true);
    expect(isAllowedRedirectUrl('/auth/callback?code=123', allowedHosts)).toBe(true);
  });

  it('allows absolute URLs matching allowed hosts', () => {
    expect(isAllowedRedirectUrl('https://crystaltidessmp.net/welcome', allowedHosts)).toBe(true);
    expect(isAllowedRedirectUrl('https://panel.crystaltidessmp.net/server', allowedHosts)).toBe(true);
  });

  it('rejects external untrusted domains', () => {
    expect(isAllowedRedirectUrl('https://malicious-phishing.com', allowedHosts)).toBe(false);
    expect(isAllowedRedirectUrl('http://attacker.com/steal-session', allowedHosts)).toBe(false);
  });

  it('rejects subdomain bypass tricks (e.g. crystaltidessmp.net.attacker.com)', () => {
    expect(isAllowedRedirectUrl('https://crystaltidessmp.net.attacker.com', allowedHosts)).toBe(false);
  });

  it('rejects protocol-relative URL bypasses (//attacker.com)', () => {
    expect(isAllowedRedirectUrl('//attacker.com/evil', allowedHosts)).toBe(false);
    expect(isAllowedRedirectUrl('///attacker.com/evil', allowedHosts)).toBe(false);
  });

  it('rejects dangerous URI schemes (javascript:, data:, vbscript:)', () => {
    expect(isAllowedRedirectUrl('javascript:alert(1)', allowedHosts)).toBe(false);
    expect(isAllowedRedirectUrl('data:text/html,<script>alert(1)</script>', allowedHosts)).toBe(false);
  });

  it('rejects malformed or empty URLs', () => {
    expect(isAllowedRedirectUrl('', allowedHosts)).toBe(false);
    expect(isAllowedRedirectUrl('   ', allowedHosts)).toBe(false);
    expect(isAllowedRedirectUrl('http://', allowedHosts)).toBe(false);
  });
});

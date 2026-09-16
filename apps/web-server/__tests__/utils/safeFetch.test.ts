import { describe, it, expect } from 'vitest';
import { validateSafeUrl, SSRFSecurityError } from '../../utils/safeFetch.js';

describe('SSRF Security Guard (safeFetch)', () => {
  it('strictly blocks GCP Metadata Server IPv4 (169.254.169.254)', async () => {
    await expect(
      validateSafeUrl(
        'http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token',
      ),
    ).rejects.toThrow(SSRFSecurityError);
  });

  it('strictly blocks GCP internal hostnames (metadata.google.internal)', async () => {
    await expect(
      validateSafeUrl('http://metadata.google.internal/computeMetadata/v1/'),
    ).rejects.toThrow(SSRFSecurityError);
  });

  it('strictly blocks IPv4 loopback (127.0.0.1)', async () => {
    await expect(validateSafeUrl('http://127.0.0.1:3001/api/system/health')).rejects.toThrow(
      SSRFSecurityError,
    );
    await expect(validateSafeUrl('http://localhost:3001/')).rejects.toThrow(SSRFSecurityError);
  });

  it('strictly blocks RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', async () => {
    await expect(validateSafeUrl('http://10.0.0.1/admin')).rejects.toThrow(SSRFSecurityError);
    await expect(validateSafeUrl('http://172.20.0.5:8080/')).rejects.toThrow(SSRFSecurityError);
    await expect(validateSafeUrl('http://192.168.1.100/')).rejects.toThrow(SSRFSecurityError);
  });

  it('strictly blocks unsupported URI schemes (file:, gopher:, ftp:)', async () => {
    await expect(validateSafeUrl('file:///etc/passwd')).rejects.toThrow(SSRFSecurityError);
    await expect(validateSafeUrl('gopher://127.0.0.1/')).rejects.toThrow(SSRFSecurityError);
  });

  it('allows legitimate public HTTPS URLs', async () => {
    const url = await validateSafeUrl('https://crystaltidessmp.net/api/news');
    expect(url.hostname).toBe('crystaltidessmp.net');
    expect(url.protocol).toBe('https:');
  });
});

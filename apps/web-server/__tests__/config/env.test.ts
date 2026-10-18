import { describe, it, expect } from 'vitest';
import { EnvValidationError, parseEnv } from '../../config/env.js';

const VALID: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  ADMIN_JWT_SECRET: 'a'.repeat(32),
  COOKIE_SECRET: 'c'.repeat(32),
  JWT_SECRET: 'j'.repeat(32),
};

const problemsFor = (overrides: NodeJS.ProcessEnv): string[] => {
  try {
    parseEnv({ ...VALID, ...overrides });
  } catch (error) {
    if (error instanceof EnvValidationError) return error.problems;
    throw error;
  }
  return [];
};

describe('parseEnv', () => {
  it('accepts a complete configuration and applies defaults', () => {
    const env = parseEnv(VALID);

    expect(env.TRUST_PROXY_HOPS).toBe(1);
    expect(env.TOTP_ENCRYPTION_KEY).toBeUndefined();
  });

  it('requires a dedicated cookie secret instead of a hardcoded fallback', () => {
    expect(problemsFor({ COOKIE_SECRET: undefined })).toEqual([
      'COOKIE_SECRET: COOKIE_SECRET is required',
    ]);
    expect(problemsFor({ COOKIE_SECRET: VALID.JWT_SECRET })).toEqual([
      'COOKIE_SECRET: COOKIE_SECRET must not reuse ADMIN_JWT_SECRET or JWT_SECRET',
    ]);
  });

  it('rejects short secrets without echoing their value', () => {
    const problems = problemsFor({ ADMIN_JWT_SECRET: 'hunter2' });

    expect(problems).toEqual(['ADMIN_JWT_SECRET: ADMIN_JWT_SECRET must be at least 32 characters']);
    expect(problems.join(' ')).not.toContain('hunter2');
  });

  it('reports every missing variable at once', () => {
    const problems = problemsFor({ SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: '' });

    expect(problems.map((problem) => problem.split(':')[0])).toEqual([
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]);
  });

  it('validates optional keys only when they are set', () => {
    expect(problemsFor({ TOTP_ENCRYPTION_KEY: '' })).toEqual([]);
    expect(problemsFor({ TOTP_ENCRYPTION_KEY: Buffer.alloc(16).toString('base64') })).toEqual([
      'TOTP_ENCRYPTION_KEY: TOTP_ENCRYPTION_KEY must be 32 base64-encoded bytes',
    ]);
    expect(problemsFor({ BRIDGE_WS_TOKEN: 'short' })).toEqual([
      'BRIDGE_WS_TOKEN: BRIDGE_WS_TOKEN must be at least 32 characters',
    ]);
  });

  it('refuses the mock database in production', () => {
    expect(problemsFor({ MOCK_DATABASE: 'true' })).toEqual([
      'MOCK_DATABASE: MOCK_DATABASE cannot be enabled in production',
    ]);
    expect(problemsFor({ MOCK_DATABASE: 'true', NODE_ENV: 'test' })).toEqual([]);
  });
});

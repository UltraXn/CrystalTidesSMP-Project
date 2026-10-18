import { describe, it, expect } from 'vitest';

// A module that reloads the local .env with `override: true` silently swaps the
// hermetic test env for production credentials. Importing the whole app must
// leave the values from vitest.config.ts untouched.
describe('Test environment isolation', () => {
  it('keeps the hermetic env after importing every route and service', async () => {
    await import('../app.js');

    expect(process.env.SUPABASE_URL).toBe('https://supabase.test.invalid');
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-role-key');
    expect(process.env.GEMINI_API_KEY).toBe('');
    expect(process.env.MOCK_DATABASE).toBe('true');
  });
});

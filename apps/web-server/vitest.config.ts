import { defineConfig } from 'vitest/config';

// Hermetic test environment. Vitest applies these before any module loads and
// dotenv never overrides variables that already exist, so the local `.env`
// (production credentials) can never leak into a test run: Supabase points to
// an unresolvable host, MySQL uses the mock pool and every third-party
// credential is blank so code paths fall back to their offline behaviour.
const TEST_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  MOCK_DATABASE: 'true',
  SUPABASE_URL: 'https://supabase.test.invalid',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_SUPABASE_URL: 'https://supabase.test.invalid',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  MC_DB_HOST: '127.0.0.1',
  MC_DB_PASSWORD: '',
  MC_SERVER_HOST: '127.0.0.1',
  MC_SERVER_PORT: '1',
  ADMIN_JWT_SECRET: 'test-admin-jwt-secret-0123456789abcdef',
  JWT_SECRET: 'test-jwt-secret-0123456789abcdef0123',
  COOKIE_SECRET: 'test-cookie-secret-0123456789abcdef',
  // 32 zero bytes, base64-encoded. Test-only key.
  TOTP_ENCRYPTION_KEY: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  BOT_API_KEY: '',
  SERVER_API_KEY: '',
  KOFI_VERIFICATION_TOKEN: 'test-kofi-token',
  MC_WEBHOOK_SECRET: 'test-mc-webhook-secret',
  RAG_INGEST_SECRET: 'test-rag-ingest-secret',
  TURNSTILE_SECRET_KEY: '',
  VAULT_ADDR: '',
  VAULT_TOKEN: '',
  GEMINI_API_KEY: '',
  GOOGLE_AI_KEY: '',
  GROQ_API_KEY: '',
  OPENROUTER_API_KEY: '',
  COHERE_API_KEY: '',
  DISCORD_BOT_TOKEN: '',
  DISCORD_TOKEN: '',
  DISCORD_WEBHOOK_URL: '',
  DISCORD_NEWS_WEBHOOK_URL: '',
  DISCORD_SECURITY_WEBHOOK_URL: '',
  DISCORD_MC_EVENTS_WEBHOOK: '',
  DISCORD_FORUM_WEBHOOK: '',
  DISCORD_SUGGESTIONS_WEBHOOK_URL: '',
  DISCORD_ANNOUNCEMENTS_WEBHOOK_URL: '',
  DISCORD_DONATION_WEBHOOK_URL: '',
  NOTION_API_KEY: '',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: '',
  GOOGLE_PRIVATE_KEY: '',
  R2_ENDPOINT: '',
  R2_ACCESS_KEY: '',
  R2_SECRET_KEY: '',
  CLOUDFLARE_API_TOKEN: '',
  MICROSOFT_CLIENT_SECRET: '',
  TWITCH_CLIENT_SECRET: '',
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: TEST_ENV,
    pool: 'forks',
    maxWorkers: 2,
    include: ['__tests__/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/reports/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '__tests__/**',
        'scripts/**',
        'coverage/**',
        'reports/**',
      ],
    },
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});

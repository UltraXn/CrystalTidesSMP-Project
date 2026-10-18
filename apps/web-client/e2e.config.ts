import { defineConfig } from 'e2e';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  ai: {
    // Reads provider from env: 'gemini', 'anthropic', 'openai' or 'openrouter'
    provider: process.env.E2E_AI_PROVIDER || 'gemini',
    cacheDir: './.e2e-cache',
    recordReplay: true,
  },
});


import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import fs from 'fs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storybookConfigDir = path.join(dirname, '.storybook');
const storybookMain = path.join(storybookConfigDir, 'main.ts');
const storybookMainJs = path.join(storybookConfigDir, 'main.js');
const isProduction = process.env.NODE_ENV === 'production';
const hasStorybook = !isProduction && (fs.existsSync(storybookMain) || fs.existsSync(storybookMainJs));

export default defineConfig({
  envDir: '../../',
  plugins: [react() as unknown as PluginOption],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-icons', '@hello-pangea/dnd'],
          'three-vendor': ['three', 'skinview3d', 'react-skinview3d'],
          'utils-vendor': ['date-fns', 'zod', 'i18next', 'react-i18next'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/src': path.resolve(__dirname, 'src'),
      '@crystaltides/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    allowedHosts: ['crystaltidessmp.net'],
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: ['..'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
    root: '.',
    projects: hasStorybook ? [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: storybookConfigDir,
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ] : [],
  },
});

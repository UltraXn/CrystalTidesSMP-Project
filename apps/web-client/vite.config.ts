import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
// import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'; // Temporarily disabled due to dep conflict


export default defineConfig(() => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));


  return {
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
        '@': path.resolve(dirname, 'src'),
        '/src': path.resolve(dirname, 'src'),
        '@crystaltides/shared': path.resolve(dirname, '../../packages/shared/src/index.ts'),
      },
    },
    server: {
      allowedHosts: ['crystaltidessmp.net'],
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
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
      projects: [], // hasStorybook ? [ ... ] : [] - Disabled to unblock Storybook UI
    },
  };
});

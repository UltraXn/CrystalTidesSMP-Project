import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { boneyardPlugin } from 'boneyard-js/vite';
import path from 'path';
import { fileURLToPath } from 'url';

function oxcMinifyPlugin(): PluginOption {
  return {
    name: 'vite-plugin-oxc-minifier',
    apply: 'build',
    enforce: 'post',
    async renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js') && !chunk.fileName.endsWith('.mjs')) {
        return null;
      }
      const { minifySync } = await import('oxc-minify');
      const result = minifySync(chunk.fileName, code, {
        module: true,
        compress: {
          dropConsole: true,
          dropDebugger: true,
          target: 'es2020',
          unused: true,
          joinVars: true,
          sequences: true,
          treeshake: {
            annotations: true,
            propertyReadSideEffects: false,
            unknownGlobalSideEffects: false,
          },
        },
        mangle: {
          toplevel: true,
        },
        codegen: {
          removeWhitespace: true,
        },
        sourcemap: false,
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(
          `[oxc-minify] Error minificando ${chunk.fileName}:\n${result.errors.map((e) => (typeof e === 'object' && e ? JSON.stringify(e) : e)).join('\n')}`,
        );
      }

      return {
        code: result.code,
        map: null,
      };
    },
  };
}

export default defineConfig(async () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const isOxc =
    process.env.VITE_MINIFIER === 'oxc' ||
    process.argv.includes('oxc') ||
    process.argv.includes('--oxc');

  if (isOxc) {
    process.env.NODE_ENV = 'production';
  }

  const plugins: PluginOption[] = [react({ plugins: [] }) as unknown as PluginOption];
  if (!process.env.VITEST) {
    const tailwindcss = (await import('@tailwindcss/vite')).default;
    plugins.push(tailwindcss());
  }
  if (process.env.BONEYARD === 'true') {
    plugins.push(boneyardPlugin({ skipInitial: true }));
  }
  if (isOxc) {
    plugins.push(oxcMinifyPlugin());
  }

  return {
    mode: isOxc ? 'production' : undefined,
    define: isOxc
      ? {
          'process.env.NODE_ENV': JSON.stringify('production'),
        }
      : undefined,
    plugins,
    optimizeDeps: {
      entries: ['index.html', 'src/main.tsx', 'src/App.tsx'],
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router',
        'framer-motion',
        'gsap',
        'lucide-react',
        '@hello-pangea/dnd',
        'three',
        'three/examples/jsm/loaders/GLTFLoader.js',
        'skinview3d',
        'react-skinview3d',
        'recharts',
        'date-fns',
        'zod',
        'i18next',
        'react-i18next',
        'i18next-browser-languagedetector',
        'canvas-confetti',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'react-markdown',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'boneyard-js/react',
        'embla-carousel-react',
        'embla-carousel-autoplay',
        'embla-carousel-fade',
        'html2canvas',
        'react-big-calendar',
        'react-is',
        '@tauri-apps/api',
        '@tauri-apps/api/window',
        '@tauri-apps/plugin-opener',
      ],
      exclude: ['@crystaltides/shared', 'msw'],
    },
    esbuild: {
      drop: (process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []) as (
        | 'console'
        | 'debugger'
      )[],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      target: 'es2020',
      minify: isOxc ? false : ('esbuild' as const),
      cssMinify: 'esbuild' as const,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router'],
            'motion-vendor': ['framer-motion', 'gsap'],
            'icons-vendor': ['lucide-react'],
            'dnd-vendor': ['@hello-pangea/dnd'],
            'three-vendor': ['three', 'skinview3d', 'react-skinview3d'],
            'chart-vendor': ['recharts'],
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
      dedupe: ['three'],
    },
    server: {
      allowedHosts: ['crystaltidessmp.net', 'crystaltides.net'],
      watch: {
        ignored: ['**/storybook-static/**', '**/.stryker-tmp/**', '**/dist/**', '**/cypress/**'],
      },
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
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
      setupFiles: ['./src/test/setup.ts'],
      include: process.env.VITE_TEST_INCLUDE
        ? process.env.VITE_TEST_INCLUDE.split(',').map((p) => p.trim())
        : ['./src/**/*.{test,spec}.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/e2e/**',
        '**/.stryker-tmp/**',
      ],
      pool: 'forks',
      maxWorkers: 2,
      css: false,
      root: '.',
      coverage: {
        provider: 'v8' as const,
        reporter: ['text', 'lcov'],
        reportsDirectory: './coverage',
      },
    },
  };
});

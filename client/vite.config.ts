/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react() as any],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/src': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    proxy: {
        '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false
        }
    },
    fs: {
      allow: ['..']
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
    root: '.',
  }
})

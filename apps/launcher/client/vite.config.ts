import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  esbuild: {
    drop: (process.env.NODE_ENV === "production"
      ? ["console", "debugger"]
      : []) as ("console" | "debugger")[],
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-tauri": [
            "@tauri-apps/api",
            "@tauri-apps/plugin-opener",
            "@tauri-apps/plugin-process",
            "@tauri-apps/plugin-updater",
          ],
          "vendor-supabase": ["@supabase/supabase-js", "@supabase/phoenix"],
          "vendor-skin3d": ["skinview3d"],
          "vendor-icons": ["lucide-react", "morphicons"],
        },
      },
    },
  },

  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 14200,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 14201,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});

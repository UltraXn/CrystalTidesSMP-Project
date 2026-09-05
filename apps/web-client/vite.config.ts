import { defineConfig } from "vitest/config";
import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { boneyardPlugin } from "boneyard-js/vite";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig(async () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const plugins: PluginOption[] = [react() as unknown as PluginOption];
  if (!process.env.VITEST) {
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    plugins.push(tailwindcss());
  }
  plugins.push(boneyardPlugin());

  return {
    envDir: "../../",
    plugins,
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "motion-vendor": ["framer-motion", "gsap"],
            "icons-vendor": ["lucide-react"],
            "dnd-vendor": ["@hello-pangea/dnd"],
            "three-vendor": ["three", "skinview3d", "react-skinview3d"],
            "chart-vendor": ["recharts"],
            "utils-vendor": ["date-fns", "zod", "i18next", "react-i18next"],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(dirname, "src"),
        "/src": path.resolve(dirname, "src"),
        "@crystaltides/shared": path.resolve(
          dirname,
          "../../packages/shared/src/index.ts",
        ),
      },
      dedupe: ["three"],
    },
    server: {
      allowedHosts: ["crystaltidessmp.net"],
      proxy: {
        "/api": {
          target: process.env.VITE_PROXY_TARGET || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
      fs: {
        allow: [".."],
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: process.env.VITE_TEST_INCLUDE
        ? process.env.VITE_TEST_INCLUDE.split(",").map((p) => p.trim())
        : ["./src/**/*.{test,spec}.{ts,tsx}"],
      root: ".",
    },
  };
});

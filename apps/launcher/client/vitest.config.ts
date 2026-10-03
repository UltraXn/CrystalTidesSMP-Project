import { defineConfig, type ViteUserConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

type PluginOption = NonNullable<ViteUserConfig["plugins"]>[number];

export default defineConfig({
  plugins: [react() as unknown as PluginOption],
  test: {
    globals: true,
    environment: "jsdom",
  },
});

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // server-only is a Next.js guard that errors at import time in non-Next contexts.
      // In vitest (node env) we stub it out so lib files can be imported normally.
      "server-only": path.resolve(__dirname, "src/__mocks__/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/app/api/**"],
      reporter: ["text", "html"],
    },
  },
});

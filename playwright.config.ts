import { defineConfig } from "@playwright/test";
const PORT = 3120;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry", screenshot: "only-on-failure" },
  webServer: { command: `npm start -- -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});

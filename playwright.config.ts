import { defineConfig, devices } from "@playwright/test";

// Exercise the actual bundled app and GitHub Pages-style nested assets/routes.
const port = process.env.PLAYWRIGHT_PORT || "4173";
const origin = `http://127.0.0.1:${port}`;
const basePath = "/kink-profile/pr-0/";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  failOnFlakyTests: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: origin + basePath,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: origin + basePath,
    // Never accidentally validate an old build or a different checkout.
    reuseExistingServer: false,
    timeout: 180_000,
    env: { VITE_BASE_PATH: basePath, VITE_PREVIEW_PR: "0" },
  },
});

import { defineConfig, devices } from "@playwright/test";
const origin = "http://127.0.0.1:4174";
const basePath = "/kink-profile/pr-0/";
export default defineConfig({
  testDir: "./visual",
  outputDir: "visual-results",
  forbidOnly: !!process.env.CI,
  failOnFlakyTests: !!process.env.CI,
  workers: 2,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.001 } },
  reporter: [["list"], ["html", { outputFolder: "visual-report", open: "never" }]],
  use: { baseURL: origin + basePath, locale: "en-US", timezoneId: "UTC", colorScheme: "light", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4174 --strictPort",
    url: origin + basePath,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { VITE_BASE_PATH: basePath, VITE_PREVIEW_PR: "0" },
  },
});

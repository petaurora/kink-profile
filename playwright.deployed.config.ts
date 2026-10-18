import { execFileSync } from "node:child_process";
import { defineConfig, devices } from "@playwright/test";
const remote = process.env.SMOKE_BASE_URL;
if (remote && !process.env.SMOKE_EXPECTED_SHA) throw new Error("Hosted smoke checks require SMOKE_EXPECTED_SHA.");
const localBase = "http://127.0.0.1:4175/kink-profile/pr-0/";
process.env.SMOKE_EXPECTED_SHA ??= execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
export default defineConfig({
  testDir: "./smoke",
  outputDir: "smoke-results",
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: "smoke-report", open: "never" }]],
  use: { ...devices["Desktop Chrome"], baseURL: remote ?? localBase, serviceWorkers: "block", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: remote ? undefined : {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4175 --strictPort",
    url: localBase,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { VITE_BASE_PATH: "/kink-profile/pr-0/", VITE_PREVIEW_PR: "0", VITE_BUILD_COMMIT: process.env.SMOKE_EXPECTED_SHA },
  },
});

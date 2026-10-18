import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";
export default mergeConfig(viteConfig, defineConfig({
  test: {
    maxWorkers: 2,
    exclude: [...configDefaults.exclude, "e2e/**", "visual/**", "smoke/**"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/services/**/*.{ts,tsx}", "src/features/quizzes/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts"],
      reporter: ["text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage",
    },
  },
}));

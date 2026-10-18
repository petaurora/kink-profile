import { readFileSync } from "node:fs";
import { relative } from "node:path";
const report = JSON.parse(readFileSync(process.argv[2] ?? "coverage/coverage-summary.json", "utf8"));
const budgets = JSON.parse(readFileSync(new URL("../quality/coverage-budget.json", import.meta.url), "utf8"));
const files = Object.entries(report).filter(([name]) => name !== "total")
  .map(([name, result]) => [relative(process.cwd(), name).replaceAll("\\", "/"), result]);
let failed = false;
for (const { name, prefix, minimum } of budgets.groups) {
  const selected = files.filter(([path]) => path.startsWith(prefix));
  if (!selected.length) throw new Error(`Coverage group is missing: ${name}`);
  for (const [metric, required] of Object.entries(minimum)) {
    const covered = selected.reduce((sum, [, result]) => sum + result[metric].covered, 0);
    const total = selected.reduce((sum, [, result]) => sum + result[metric].total, 0);
    const actual = total ? 100 * covered / total : 100;
    console.log(`${name} ${metric}: ${actual.toFixed(2)}% (minimum ${required}%)`);
    if (!Number.isFinite(actual) || actual < required) failed = true;
  }
}
if (failed) throw new Error("Coverage regressed below a reviewed baseline. Inspect coverage/index.html before changing a budget.");

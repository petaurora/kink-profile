import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
const budget = JSON.parse(readFileSync(new URL("../quality/bundle-budget.json", import.meta.url), "utf8"));
function files(path) {
  return readdirSync(path).flatMap(name => {
    const file = join(path, name);
    return statSync(file).isDirectory() ? files(file) : [file];
  });
}
const measurements = { javascriptGzipBytes: 0, cssGzipBytes: 0, largestJavascriptGzipBytes: 0 };
let scripts = 0;
for (const file of files(process.argv[2] ?? "dist/assets")) {
  if (!/\.(js|css)$/.test(file)) continue;
  const size = gzipSync(readFileSync(file), { level: 9 }).length;
  if (file.endsWith(".js")) {
    scripts++;
    measurements.javascriptGzipBytes += size;
    measurements.largestJavascriptGzipBytes = Math.max(measurements.largestJavascriptGzipBytes, size);
  } else measurements.cssGzipBytes += size;
}
if (!scripts) throw new Error("No production JavaScript was found; build the application first.");
let failed = false;
for (const [metric, actual] of Object.entries(measurements)) {
  console.log(`${metric}: ${actual} bytes (maximum ${budget[metric]})`);
  if (!Number.isFinite(budget[metric]) || actual > budget[metric]) failed = true;
}
if (failed) throw new Error("Production bundle exceeds its reviewed transfer-size budget.");

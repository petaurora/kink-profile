import { readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** Compare resolved lockfile entries; audit advisories must identify their nodes. */
export function reviewDependencies(base, head, audit) {
  if (!base.packages || !head.packages || !audit.vulnerabilities || !audit.metadata?.vulnerabilities) {
    throw new Error("Dependency review requires lockfile v2/v3 and a complete npm audit report.");
  }
  const changed = Object.entries(head.packages).filter(([path, value]) => path &&
    (base.packages[path]?.version !== value.version || base.packages[path]?.integrity !== value.integrity));
  const changedPaths = new Set(changed.map(([path]) => path));
  const failures = [];
  for (const [name, value] of Object.entries(audit.vulnerabilities)) {
    if (!["high", "critical"].includes(value.severity)) continue;
    if (!Array.isArray(value.nodes) || !value.nodes.length) throw new Error(`Missing advisory locations: ${name}`);
    for (const node of value.nodes) {
      if (!head.packages[node]) throw new Error(`Audit refers to an unknown lockfile entry: ${node}`);
      if (changedPaths.has(node)) failures.push(`${name}@${head.packages[node].version}: ${value.severity}`);
    }
  }
  return { changed: changed.map(([path, value]) => `${path}@${value.version}`), failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const baseSha = process.env.DEPENDENCY_BASE_SHA;
  if (!/^[a-f0-9]{40}$/.test(baseSha ?? "")) throw new Error("DEPENDENCY_BASE_SHA must be a full commit SHA.");
  const hasBaseLock = execFileSync("git", ["ls-tree", "--name-only", baseSha, "--", "package-lock.json"], { encoding: "utf8" }).trim();
  const base = hasBaseLock ? JSON.parse(execFileSync("git", ["show", `${baseSha}:package-lock.json`], { encoding: "utf8" })) : { packages: {} };
  const head = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const result = spawnSync("npm", ["audit", "--package-lock-only", "--json"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.error || ![0, 1].includes(result.status)) throw new Error("npm audit could not produce a dependency review report.");
  const audit = JSON.parse(result.stdout);
  const review = reviewDependencies(base, head, audit);
  console.log(`${review.changed.length} added or changed resolved dependencies reviewed.`);
  if (review.failures.length) throw new Error(`Introduced vulnerable dependencies:\n${review.failures.join("\n")}`);
}

import { expect, test } from "vitest";
import { reviewDependencies } from "./review-dependencies.mjs";
const lock = version => ({ packages: { "node_modules/example": { version, integrity: `sha512-${version}` } } });
const report = (nodes = ["node_modules/example"]) => ({ vulnerabilities: { example: { severity: "high", nodes } }, metadata: { vulnerabilities: { high: 1 } } });
test("rejects a high advisory introduced by a transitive version change", () => {
  expect(reviewDependencies(lock("1"), lock("2"), report()).failures).toEqual(["example@2: high"]);
});
test("separates existing advisories from introduced dependencies", () => {
  expect(reviewDependencies(lock("1"), lock("1"), report()).failures).toEqual([]);
});
test("rejects incomplete or inconsistent scanner results", () => {
  expect(() => reviewDependencies(lock("1"), lock("2"), {})).toThrow();
  expect(() => reviewDependencies(lock("1"), lock("2"), report(["node_modules/missing"]))).toThrow();
});
test("accepts a clean audit for added dependencies", () => {
  expect(reviewDependencies({ packages: {} }, lock("2"), { vulnerabilities: {}, metadata: { vulnerabilities: {} } })).toMatchObject({ failures: [], changed: ["node_modules/example@2"] });
});

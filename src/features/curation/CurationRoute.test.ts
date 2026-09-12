import { describe, expect, it } from "vitest";
import { resolveCurationReturnPath } from "./CurationRoute";

describe("Curation return navigation", () => {
  it("returns Advanced Settings visits to Settings", () => {
    expect(resolveCurationReturnPath({ from: "/settings" })).toBe("/settings");
  });

  it("falls back to Hub for direct or unrelated entry", () => {
    expect(resolveCurationReturnPath(undefined)).toBe("/");
    expect(resolveCurationReturnPath({ from: "/profile" })).toBe("/");
  });
});

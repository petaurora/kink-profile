import { describe, expect, it } from "vitest";
import { resolveRewardsReturnPath } from "./RewardsRoute";

describe("RewardsRoute return navigation", () => {
  it("returns profile-origin toolbox visits to the profile", () => {
    expect(resolveRewardsReturnPath({ from: "/profile" })).toBe("/profile");
  });

  it("falls back to Explore for direct entry or unrelated state", () => {
    expect(resolveRewardsReturnPath(undefined)).toBe("/");
    expect(resolveRewardsReturnPath({ from: "/settings" })).toBe("/");
    expect(resolveRewardsReturnPath({ from: "https://example.com" })).toBe("/");
  });
});

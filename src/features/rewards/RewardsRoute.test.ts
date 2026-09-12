import { describe, expect, it } from "vitest";
import { legacyRewardsDestination } from "./RewardsRoute";

describe("legacy Rewards route", () => {
  it("redirects catalog-oriented entry points into Catalog", () => {
    expect(legacyRewardsDestination("")).toBe("/catalog/rewards");
    expect(legacyRewardsDestination("?workspace=catalog")).toBe(
      "/catalog/rewards",
    );
  });

  it("redirects the legacy tools workspace into canonical R/P Tools", () => {
    expect(legacyRewardsDestination("?workspace=tools")).toBe(
      "/tools/rewards/randomizer",
    );
  });
});

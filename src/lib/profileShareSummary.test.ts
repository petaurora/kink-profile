import { describe, expect, it } from "vitest";
import { kinkCatalog } from "../data/kinkCatalog.generated";
import { createEmptyCatalogProfileState } from "./catalogProfile";
import { createEmptyProfile } from "./profileStorage";
import {
  PROFILE_SHARE_SUMMARY_VERSION,
  buildProfileShareSummary,
} from "./profileShareSummary";

describe("profile share summary", () => {
  it("renders sparse profiles honestly instead of turning unknown into zero", () => {
    const model = buildProfileShareSummary(
      "babygirl",
      createEmptyProfile(),
      createEmptyCatalogProfileState(),
      "2026-09-07T19:00:00.000Z",
    );

    expect(model.version).toBe(PROFILE_SHARE_SUMMARY_VERSION);
    expect(model.displayName).toBe("babygirl");
    expect(model.orientation).toBe("Still emerging");
    expect(model.radarAxes.every((axis) => axis.affinity === null)).toBe(true);
    expect(model.radarAxes.every((axis) => axis.state === "unknown")).toBe(true);
    expect(model.interestAreas).toEqual([]);
  });

  it("keeps positive interests, Interest Areas, and explicit Hard Limits semantically separate", () => {
    const loveItem = kinkCatalog[0]!;
    const curiousItem = kinkCatalog[1]!;
    const limitItem = kinkCatalog[2]!;
    const catalogProfile = createEmptyCatalogProfileState();

    catalogProfile.preferences[loveItem.id] = {
      overall: "love",
      updatedAt: "2026-09-07T18:00:00.000Z",
    };
    catalogProfile.preferences[curiousItem.id] = {
      overall: "curious",
      updatedAt: "2026-09-07T18:00:00.000Z",
    };
    catalogProfile.preferences[limitItem.id] = {
      overall: "hard_limit",
      updatedAt: "2026-09-07T18:00:00.000Z",
    };

    const model = buildProfileShareSummary(
      "Kitty",
      createEmptyProfile(),
      catalogProfile,
      "2026-09-07T19:00:00.000Z",
    );

    expect(model.topInterests.map((item) => item.catalogId)).toContain(loveItem.id);
    expect(model.topInterests.map((item) => item.catalogId)).toContain(curiousItem.id);
    expect(model.topInterests.map((item) => item.catalogId)).not.toContain(limitItem.id);

    expect(
      model.interestAreas.flatMap((area) => area.items.map((item) => item.catalogId)),
    ).toContain(loveItem.id);
    expect(
      model.interestAreas.flatMap((area) => area.items.map((item) => item.catalogId)),
    ).not.toContain(limitItem.id);

    expect(model.hardLimits).toEqual([
      {
        catalogId: limitItem.id,
        label: limitItem.label,
      },
    ]);
  });

  it("contains presentation-ready content only, not private source history", () => {
    const loveItem = kinkCatalog[0]!;
    const limitItem = kinkCatalog[2]!;
    const catalogProfile = createEmptyCatalogProfileState();

    catalogProfile.preferences[loveItem.id] = {
      overall: "love",
      updatedAt: "2026-09-07T18:00:00.000Z",
    };
    catalogProfile.preferences[limitItem.id] = {
      overall: "hard_limit",
      updatedAt: "2026-09-07T18:00:00.000Z",
    };
    catalogProfile.comparisons.push({
      id: "private-comparison-id",
      leftKinkId: loveItem.id,
      rightKinkId: limitItem.id,
      scope: { type: "overall" },
      result: "left",
      timestamp: "2026-09-07T18:30:00.000Z",
    });

    const model = buildProfileShareSummary(
      "babygirl",
      createEmptyProfile(),
      catalogProfile,
      "2026-09-07T19:00:00.000Z",
    );
    const serialized = JSON.stringify(model);

    expect(serialized).not.toContain("private-comparison-id");
    expect(serialized).not.toContain("sourceEvidenceIds");
    expect(serialized).not.toContain("comparisons");
    expect(serialized).not.toContain("answers");
    expect(serialized).not.toContain("schemaVersion");
    expect(serialized).not.toContain("relevanceScore");
    expect(serialized).not.toContain("rewardsPunishments");
    expect(serialized).not.toContain("randomEligible");
    expect(serialized).not.toContain("RewardPunishmentRecipe");
    expect(serialized).not.toContain("contextual comparisons");
  });
});

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


  it("keeps M12 run history and movement metadata out of default share summaries", () => {
    const first = kinkCatalog[0]!;
    const second = kinkCatalog[1]!;
    const catalogProfile = createEmptyCatalogProfileState();

    catalogProfile.preferences[first.id] = {
      overall: "love",
      updatedAt: "2026-09-08T20:00:00.000Z",
    };
    catalogProfile.rankingHistory = {
      activeRunId: "private-active-run",
      runs: {
        "private-archived-run": {
          id: "private-archived-run",
          startedAt: "2026-09-01T00:00:00.000Z",
          archivedAt: "2026-09-07T00:00:00.000Z",
          status: "archived",
          algorithmVersion: 1,
          snapshots: {
            categories: {},
            overall: {
              capturedAt: "2026-09-07T00:00:00.000Z",
              confidence: 0.8,
              items: [
                {
                  catalogId: first.id,
                  rank: 7,
                  comparisons: 8,
                  confidence: 1,
                },
              ],
            },
          },
        },
        "private-active-run": {
          id: "private-active-run",
          startedAt: "2026-09-07T00:00:00.000Z",
          status: "active",
          algorithmVersion: 1,
        },
      },
    };
    catalogProfile.comparisons.push({
      id: "private-current-comparison",
      runId: "private-active-run",
      leftKinkId: first.id,
      rightKinkId: second.id,
      scope: { type: "overall" },
      result: "left",
      timestamp: "2026-09-08T20:30:00.000Z",
    });

    const serialized = JSON.stringify(
      buildProfileShareSummary(
        "babygirl",
        createEmptyProfile(),
        catalogProfile,
        "2026-09-08T21:30:00.000Z",
      ),
    );

    expect(serialized).not.toContain("private-archived-run");
    expect(serialized).not.toContain("private-active-run");
    expect(serialized).not.toContain("private-current-comparison");
    expect(serialized).not.toContain("rankingHistory");
    expect(serialized).not.toContain("snapshots");
    expect(serialized).not.toContain("previousRank");
    expect(serialized).not.toContain("previousCapturedAt");
  });

});

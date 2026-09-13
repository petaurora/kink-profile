import { describe, expect, it } from "vitest";
import { buildHubMetrics } from "./hubMetrics";

describe("Hub metrics", () => {
  it("derives profile depth and ready-choice counts from stored state", () => {
    const snapshot = {
      catalogProfile: {
        preferences: {
          one: { overall: "like", updatedAt: "2026-09-13T12:00:00.000Z" },
          two: { overall: "hard_limit", updatedAt: "2026-09-13T12:01:00.000Z" },
        },
        comparisons: [{ winnerId: "one", loserId: "two" }],
      },
      canonicalSignals: [
        { overall: { affinity: 0.8, coverage: 0.5 } },
        { overall: { affinity: null, coverage: 0 } },
      ],
      rewardPunishmentProfile: {
        preferences: {
          first: {
            reward: { suitability: "strong", randomEligible: true },
            punishment: { suitability: "unset", randomEligible: false },
          },
          second: {
            reward: { suitability: "works", randomEligible: true },
            punishment: { suitability: "works", randomEligible: true },
          },
        },
      },
    } as unknown as Parameters<typeof buildHubMetrics>[0];

    expect(buildHubMetrics(snapshot)).toEqual({
      catalogRatedCount: 2,
      rankingChoiceCount: 1,
      evidencedThemeCount: 1,
      contextPreferenceCount: 2,
      readyChoiceCount: 3,
    });
  });
});

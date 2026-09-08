import { describe, expect, it } from "vitest";
import {
  createEmptyRewardPunishmentProfileState,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import {
  buildRewardPunishmentOverallProfileSummary,
  REWARD_PUNISHMENT_PROFILE_RANKING_MIN_COMPARISONS,
} from "./rewardPunishmentProfileSummary";
import { createEmptyProfile } from "./profileStorage";
import { createEmptyCatalogProfileState } from "./catalogProfile";
import { buildCatalogResultView } from "./catalogResults";

const catalogResultView = buildCatalogResultView(
  createEmptyProfile(),
  createEmptyCatalogProfileState(),
);

function positiveProfile(
  context: "reward" | "punishment",
  count = 3,
) {
  let profile = createEmptyRewardPunishmentProfileState();
  for (const primitive of rewardPunishmentPrimitives.slice(
    0,
    count,
  )) {
    profile = setContextSuitability(
      profile,
      primitive.ref,
      context,
      "works",
      "2026-09-08T20:00:00.000Z",
    );
  }
  return profile;
}

describe("M11.9 overall-profile summary", () => {
  it("keeps reward and punishment direct profile lanes independent", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    const reward = rewardPunishmentPrimitives[0];
    const punishment = rewardPunishmentPrimitives[1];

    profile = setContextSuitability(
      profile,
      reward.ref,
      "reward",
      "strong",
    );
    profile = setContextSuitability(
      profile,
      punishment.ref,
      "punishment",
      "works",
    );

    const summary = buildRewardPunishmentOverallProfileSummary(
      profile,
      [],
      [],
      catalogResultView,
    );

    expect(summary.reward.confirmedItems.map((item) => item.primitiveKey))
      .toContain(rewardPunishmentPrimitiveKey(reward.ref));
    expect(summary.reward.confirmedItems.map((item) => item.primitiveKey))
      .not.toContain(rewardPunishmentPrimitiveKey(punishment.ref));
    expect(
      summary.punishment.confirmedItems.map(
        (item) => item.primitiveKey,
      ),
    ).toContain(rewardPunishmentPrimitiveKey(punishment.ref));
  });

  it("does not label a contextual ranking Top until enough real ordering evidence exists", () => {
    const profile = positiveProfile("reward", 3);
    const [a, b, c] = rewardPunishmentPrimitives;
    const comparisons = [
      {
        id: "one",
        context: "reward" as const,
        leftPrimitiveKey: rewardPunishmentPrimitiveKey(a.ref),
        rightPrimitiveKey: rewardPunishmentPrimitiveKey(b.ref),
        result: "left" as const,
        timestamp: "2026-09-08T20:00:00.000Z",
      },
      {
        id: "two",
        context: "reward" as const,
        leftPrimitiveKey: rewardPunishmentPrimitiveKey(b.ref),
        rightPrimitiveKey: rewardPunishmentPrimitiveKey(c.ref),
        result: "right" as const,
        timestamp: "2026-09-08T20:01:00.000Z",
      },
    ];

    const early = buildRewardPunishmentOverallProfileSummary(
      profile,
      comparisons,
      [],
      catalogResultView,
    );
    expect(early.reward.rankingReady).toBe(false);
    expect(early.reward.heading).toBe("Confirmed rewards");
    expect(early.reward.confirmedItems.every((item) => item.rank === undefined))
      .toBe(true);

    comparisons.push({
      id: "three",
      context: "reward",
      leftPrimitiveKey: rewardPunishmentPrimitiveKey(a.ref),
      rightPrimitiveKey: rewardPunishmentPrimitiveKey(c.ref),
      result: "left",
      timestamp: "2026-09-08T20:02:00.000Z",
    });

    const ready = buildRewardPunishmentOverallProfileSummary(
      profile,
      comparisons,
      [],
      catalogResultView,
    );
    expect(ready.reward.rankingComparisons).toBe(
      REWARD_PUNISHMENT_PROFILE_RANKING_MIN_COMPARISONS,
    );
    expect(ready.reward.rankingReady).toBe(true);
    expect(ready.reward.heading).toBe("Top Rewards");
    expect(ready.reward.confirmedItems.some((item) => item.rank !== undefined))
      .toBe(true);
  });

  it("shows only positively established categories in the compact profile lane", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    const primitive = rewardPunishmentPrimitives.find(
      (candidate) => candidate.contextCategories.length > 0,
    )!;

    profile = setContextSuitability(
      profile,
      primitive.ref,
      "reward",
      "strong",
    );

    const summary = buildRewardPunishmentOverallProfileSummary(
      profile,
      [],
      [],
      catalogResultView,
    );

    expect(summary.reward.categories.length).toBeGreaterThan(0);
    expect(
      summary.reward.categories.every(
        (category) => category.affinity >= 45,
      ),
    ).toBe(true);
    expect(summary.reward.categories.length).toBeLessThanOrEqual(4);
  });

  it("deduplicates confirmed and suggested items by stable primitive identity", () => {
    const profile = positiveProfile("reward", 4);
    const summary = buildRewardPunishmentOverallProfileSummary(
      profile,
      [],
      [],
      catalogResultView,
    );

    const confirmedKeys = summary.reward.confirmedItems.map(
      (item) => item.primitiveKey,
    );
    expect(new Set(confirmedKeys).size).toBe(confirmedKeys.length);

    const suggestedKeys = summary.reward.suggestions.map(
      (item) => item.primitiveKey,
    );
    expect(new Set(suggestedKeys).size).toBe(suggestedKeys.length);
    expect(
      suggestedKeys.some((key) => confirmedKeys.includes(key)),
    ).toBe(false);
  });

  it("never promotes No/Never/Unset into confirmed representative items", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    const [strong, no, never] = rewardPunishmentPrimitives;

    profile = setContextSuitability(
      profile,
      strong.ref,
      "punishment",
      "strong",
    );
    profile = setContextSuitability(
      profile,
      no.ref,
      "punishment",
      "no",
    );
    profile = setContextSuitability(
      profile,
      never.ref,
      "punishment",
      "never",
    );

    const summary = buildRewardPunishmentOverallProfileSummary(
      profile,
      [],
      [],
      catalogResultView,
    );

    expect(
      summary.punishment.confirmedItems.map(
        (item) => item.primitiveKey,
      ),
    ).toEqual([rewardPunishmentPrimitiveKey(strong.ref)]);
  });
});

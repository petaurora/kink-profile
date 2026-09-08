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
  calculateRewardPunishmentRanking,
  eligibleRewardPunishmentPrimitives,
  selectNextRewardPunishmentPair,
  type RewardPunishmentComparison,
} from "./rewardPunishmentRanking";

const a = rewardPunishmentPrimitives[0];
const b = rewardPunishmentPrimitives[1];
const c = rewardPunishmentPrimitives[2];

function comparison(
  context: "reward" | "punishment",
  left = a,
  right = b,
): RewardPunishmentComparison {
  return {
    id: context + "-1",
    context,
    leftPrimitiveKey: rewardPunishmentPrimitiveKey(left.ref),
    rightPrimitiveKey: rewardPunishmentPrimitiveKey(right.ref),
    result: "left",
    timestamp: "2026-09-08T00:00:00.000Z",
  };
}

describe("M11.5 contextual ranking eligibility", () => {
  it("includes strong / works / depends and excludes no / never / unset", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, a.ref, "reward", "strong");
    profile = setContextSuitability(profile, b.ref, "reward", "works");
    profile = setContextSuitability(profile, c.ref, "reward", "depends");

    expect(
      eligibleRewardPunishmentPrimitives(
        profile,
        [a, b, c],
        "reward",
      ),
    ).toHaveLength(3);

    profile = setContextSuitability(profile, b.ref, "reward", "no");
    profile = setContextSuitability(profile, c.ref, "reward", "never");

    expect(
      eligibleRewardPunishmentPrimitives(
        profile,
        [a, b, c],
        "reward",
      ).map((primitive) => primitive.ref),
    ).toEqual([a.ref]);
  });

  it("keeps reward and punishment eligibility independent", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, a.ref, "reward", "works");
    profile = setContextSuitability(profile, b.ref, "punishment", "works");

    expect(
      eligibleRewardPunishmentPrimitives(profile, [a, b], "reward")
        .map((item) => item.ref),
    ).toEqual([a.ref]);
    expect(
      eligibleRewardPunishmentPrimitives(
        profile,
        [a, b],
        "punishment",
      ).map((item) => item.ref),
    ).toEqual([b.ref]);
  });
});

describe("M11.5 contextual comparison separation", () => {
  it("reward comparison never changes punishment rank", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    for (const primitive of [a, b]) {
      profile = setContextSuitability(
        profile,
        primitive.ref,
        "reward",
        "works",
      );
      profile = setContextSuitability(
        profile,
        primitive.ref,
        "punishment",
        "works",
      );
    }

    const reward = calculateRewardPunishmentRanking(
      profile,
      [a, b],
      [comparison("reward")],
      "reward",
    );
    const punishment = calculateRewardPunishmentRanking(
      profile,
      [a, b],
      [comparison("reward")],
      "punishment",
    );

    expect(reward.orderingComparisons).toBe(1);
    expect(reward.items[0].primitive.ref).toEqual(a.ref);
    expect(punishment.orderingComparisons).toBe(0);
    expect(punishment.items.every((item) => item.rating === 1500)).toBe(true);
  });

  it("preserves historical comparisons while excluding newly ineligible items from active rank", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    for (const primitive of [a, b]) {
      profile = setContextSuitability(
        profile,
        primitive.ref,
        "reward",
        "works",
      );
    }
    const history = [comparison("reward")];

    profile = setContextSuitability(profile, b.ref, "reward", "no");
    const snapshot = calculateRewardPunishmentRanking(
      profile,
      [a, b],
      history,
      "reward",
    );

    expect(history).toHaveLength(1);
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.orderingComparisons).toBe(0);
  });

  it("selects low-evidence adaptive pairs from eligible items only", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    for (const primitive of [a, b, c]) {
      profile = setContextSuitability(
        profile,
        primitive.ref,
        "reward",
        "works",
      );
    }

    const pair = selectNextRewardPunishmentPair(
      profile,
      [a, b, c],
      [comparison("reward", a, b)],
      "reward",
    );

    expect(pair).not.toBeNull();
    const keys = pair!.map((primitive) =>
      rewardPunishmentPrimitiveKey(primitive.ref),
    );
    expect(keys).toContain(rewardPunishmentPrimitiveKey(c.ref));
  });
});

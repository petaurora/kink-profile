import { describe, expect, it } from "vitest";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import {
  createEmptyRewardPunishmentRankingState,
  loadRewardPunishmentRankingState,
  saveRewardPunishmentRankingState,
  type RewardPunishmentRankingStorageLike,
} from "./rewardPunishmentRankingStorage";

function memoryStorage(): RewardPunishmentRankingStorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("M11.5 ranking storage", () => {
  it("roundtrips raw comparisons with explicit context identity", () => {
    const storage = memoryStorage();
    const [left, right] = rewardPunishmentPrimitives;
    const state = createEmptyRewardPunishmentRankingState();
    state.comparisons.push({
      id: "c1",
      context: "punishment",
      leftPrimitiveKey: rewardPunishmentPrimitiveKey(left.ref),
      rightPrimitiveKey: rewardPunishmentPrimitiveKey(right.ref),
      result: "equal",
      timestamp: "2026-09-08T00:00:00.000Z",
    });

    saveRewardPunishmentRankingState(state, storage);
    expect(loadRewardPunishmentRankingState(storage)).toEqual(state);
  });

  it("drops stale primitive refs without destroying valid history", () => {
    const storage = memoryStorage();
    const [left, right] = rewardPunishmentPrimitives;
    storage.setItem(
      "pet-profile-rewards-punishments-ranking-v1",
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          {
            id: "valid",
            context: "reward",
            leftPrimitiveKey: rewardPunishmentPrimitiveKey(left.ref),
            rightPrimitiveKey: rewardPunishmentPrimitiveKey(right.ref),
            result: "left",
            timestamp: "2026-09-08T00:00:00.000Z",
          },
          {
            id: "stale",
            context: "reward",
            leftPrimitiveKey: "action:nope",
            rightPrimitiveKey: rewardPunishmentPrimitiveKey(right.ref),
            result: "left",
            timestamp: "2026-09-08T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(loadRewardPunishmentRankingState(storage).comparisons)
      .toHaveLength(1);
  });
});

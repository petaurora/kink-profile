import { describe, expect, it } from "vitest";
import {
  REWARD_PUNISHMENT_SORTER_UI_STORAGE_KEY,
  loadRewardPunishmentSorterUiState,
  saveRewardPunishmentSorterUiState,
  type RewardPunishmentSorterStorageLike,
} from "./rewardPunishmentSorterStorage";

function memoryStorage(): RewardPunishmentSorterStorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("M11.4 sorter UI storage", () => {
  it("starts checkpoint history at the current completed milestone so old progress is not replayed", () => {
    expect(
      loadRewardPunishmentSorterUiState(63, memoryStorage())
        .lastCelebratedCheckpoint,
    ).toBe(50);
  });

  it("persists the latest celebrated checkpoint", () => {
    const storage = memoryStorage();
    saveRewardPunishmentSorterUiState(
      { schemaVersion: 1, lastCelebratedCheckpoint: 75 },
      storage,
    );
    expect(
      loadRewardPunishmentSorterUiState(76, storage)
        .lastCelebratedCheckpoint,
    ).toBe(75);
  });

  it("falls back safely when storage is malformed", () => {
    const storage = memoryStorage();
    storage.setItem(REWARD_PUNISHMENT_SORTER_UI_STORAGE_KEY, "{nah");
    expect(
      loadRewardPunishmentSorterUiState(26, storage)
        .lastCelebratedCheckpoint,
    ).toBe(25);
  });
});

import { describe, expect, it } from "vitest";
import {
  REWARD_PUNISHMENT_RECIPE_STORAGE_KEY,
  loadRewardPunishmentRecipeState,
  saveRewardPunishmentRecipeState,
  type RewardPunishmentRecipeStorageLike,
} from "./rewardPunishmentRecipeStorage";
import type { RewardPunishmentRecipeState } from "./rewardPunishmentRecipes";

function memoryStorage(): RewardPunishmentRecipeStorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("M11.7 recipe storage", () => {
  it("roundtrips recipes including ordered custom components", () => {
    const storage = memoryStorage();
    const state: RewardPunishmentRecipeState = {
      schemaVersion: 1,
      recipes: [
        {
          id: "r1",
          kind: "punishment",
          name: "Sequence",
          components: [
            {
              kind: "primitive",
              ref: { kind: "catalog", id: "stale-but-preserved" },
            },
            { kind: "custom", id: "c1", label: "Check in" },
          ],
          notes: "Notes",
          tags: ["tag"],
          randomEligible: false,
          createdAt: "2026-09-08T00:00:00.000Z",
          updatedAt: "2026-09-08T00:00:00.000Z",
        },
      ],
    };

    saveRewardPunishmentRecipeState(state, storage);
    expect(loadRewardPunishmentRecipeState(storage)).toEqual(state);
  });

  it("keeps stale refs instead of silently deleting evidence needed for Needs review", () => {
    const storage = memoryStorage();
    storage.setItem(
      REWARD_PUNISHMENT_RECIPE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        recipes: [
          {
            id: "r1",
            kind: "reward",
            name: "Old recipe",
            components: [
              {
                kind: "primitive",
                ref: { kind: "action", id: "retired-action" },
              },
            ],
            randomEligible: true,
            createdAt: "2026-09-08T00:00:00.000Z",
            updatedAt: "2026-09-08T00:00:00.000Z",
          },
        ],
      }),
    );

    const state = loadRewardPunishmentRecipeState(storage);
    expect(state.recipes).toHaveLength(1);
    expect(state.recipes[0].components[0]).toEqual({
      kind: "primitive",
      ref: { kind: "action", id: "retired-action" },
    });
  });

  it("falls back safely for malformed top-level data", () => {
    const storage = memoryStorage();
    storage.setItem(REWARD_PUNISHMENT_RECIPE_STORAGE_KEY, "{oops");
    expect(loadRewardPunishmentRecipeState(storage)).toEqual({
      schemaVersion: 1,
      recipes: [],
    });
  });
});

import { describe, expect, it } from "vitest";
import { rewardPunishmentActions } from "./rewardPunishmentLibrary";
import {
  createEmptyRewardPunishmentProfileState,
  getContextualUseState,
  setContextRandomEligible,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  REWARD_PUNISHMENT_PROFILE_STORAGE_KEY,
  loadRewardPunishmentProfile,
  saveRewardPunishmentProfile,
  type RewardPunishmentStorageLike,
} from "./rewardPunishmentProfileStorage";

function memoryStorage(
  initial: Record<string, string> = {},
): RewardPunishmentStorageLike & { values: Record<string, string> } {
  const values = { ...initial };
  return {
    values,
    getItem(key) {
      return values[key] ?? null;
    },
    setItem(key, value) {
      values[key] = value;
    },
  };
}

describe("M11 contextual-use storage", () => {
  it("round-trips authoritative reward and punishment overlays", () => {
    const storage = memoryStorage();
    const ref = { kind: "catalog" as const, id: "hairbrush-spanking" };

    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, ref, "reward", "strong");
    profile = setContextRandomEligible(profile, ref, "reward", true);
    profile = setContextSuitability(profile, ref, "punishment", "depends");

    saveRewardPunishmentProfile(profile, storage);
    const loaded = loadRewardPunishmentProfile(storage);

    expect(getContextualUseState(loaded, ref, "reward")).toMatchObject({
      suitability: "strong",
      randomEligible: true,
    });
    expect(getContextualUseState(loaded, ref, "punishment")).toMatchObject({
      suitability: "depends",
      randomEligible: false,
    });
  });

  it("falls back safely for malformed top-level storage", () => {
    const storage = memoryStorage({
      [REWARD_PUNISHMENT_PROFILE_STORAGE_KEY]: "{not-json",
    });

    expect(loadRewardPunishmentProfile(storage)).toEqual(
      createEmptyRewardPunishmentProfileState(),
    );
  });

  it("ignores stale or unknown primitive references", () => {
    const storage = memoryStorage({
      [REWARD_PUNISHMENT_PROFILE_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        preferences: {
          stale: {
            ref: { kind: "action", id: "action-does-not-exist" },
            reward: { suitability: "works", randomEligible: false },
            punishment: { suitability: "unset", randomEligible: false },
            updatedAt: "2026-09-08T18:00:00.000Z",
          },
        },
      }),
    });

    expect(loadRewardPunishmentProfile(storage).preferences).toEqual({});
  });

  it("sanitizes impossible random eligibility on load", () => {
    const action = rewardPunishmentActions[0];
    const storage = memoryStorage({
      [REWARD_PUNISHMENT_PROFILE_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        preferences: {
          item: {
            ref: { kind: "action", id: action.id },
            reward: { suitability: "never", randomEligible: true },
            punishment: { suitability: "no", randomEligible: true },
            updatedAt: "2026-09-08T18:00:00.000Z",
          },
        },
      }),
    });

    const loaded = loadRewardPunishmentProfile(storage);
    const ref = { kind: "action" as const, id: action.id };

    expect(getContextualUseState(loaded, ref, "reward").randomEligible).toBe(
      false,
    );
    expect(
      getContextualUseState(loaded, ref, "punishment").randomEligible,
    ).toBe(false);
  });

  it("canonicalizes preference keys from the persisted primitive ref", () => {
    const storage = memoryStorage({
      [REWARD_PUNISHMENT_PROFILE_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        preferences: {
          "wrong:key": {
            ref: { kind: "catalog", id: "wall-sit" },
            reward: { suitability: "works", randomEligible: false },
            punishment: { suitability: "unset", randomEligible: false },
            updatedAt: "2026-09-08T18:00:00.000Z",
          },
        },
      }),
    });

    const loaded = loadRewardPunishmentProfile(storage);
    expect(Object.keys(loaded.preferences)).toEqual(["catalog:wall-sit"]);
  });
});

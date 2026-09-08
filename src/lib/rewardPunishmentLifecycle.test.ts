import { describe, expect, it } from "vitest";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import {
  createEmptyRewardPunishmentAuthoritativeState,
  parseRewardPunishmentAuthoritativeState,
} from "./rewardPunishmentLifecycle";

const [first, second] = rewardPunishmentPrimitives;

describe("M11.8 authoritative lifecycle payload", () => {
  it("strictly accepts direct state + contextual comparisons + recipes together", () => {
    const state = createEmptyRewardPunishmentAuthoritativeState();
    const firstKey = rewardPunishmentPrimitiveKey(first.ref);
    const secondKey = rewardPunishmentPrimitiveKey(second.ref);

    state.profile.preferences[firstKey] = {
      ref: first.ref,
      reward: {
        suitability: "works",
        randomEligible: true,
        note: "Context note",
      },
      punishment: {
        suitability: "no",
        randomEligible: false,
      },
      updatedAt: "2026-09-08T20:00:00.000Z",
    };
    state.ranking.comparisons.push({
      id: "rp-cmp",
      context: "reward",
      leftPrimitiveKey: firstKey,
      rightPrimitiveKey: secondKey,
      result: "left",
      timestamp: "2026-09-08T20:01:00.000Z",
    });
    state.recipes.recipes.push({
      id: "recipe-1",
      kind: "reward",
      name: "Combo",
      components: [
        { kind: "primitive", ref: first.ref },
        { kind: "custom", id: "custom-1", label: "Check in" },
      ],
      notes: "Recipe note",
      tags: ["care"],
      randomEligible: true,
      createdAt: "2026-09-08T20:02:00.000Z",
      updatedAt: "2026-09-08T20:02:00.000Z",
    });

    expect(parseRewardPunishmentAuthoritativeState(state)).toEqual(state);
  });

  it("allows stale primitive refs inside recipes so Needs review evidence survives", () => {
    const state = createEmptyRewardPunishmentAuthoritativeState();
    state.recipes.recipes.push({
      id: "old-recipe",
      kind: "punishment",
      name: "Old combo",
      components: [
        {
          kind: "primitive",
          ref: { kind: "catalog", id: "retired-item" },
        },
      ],
      randomEligible: false,
      createdAt: "2026-09-08T20:00:00.000Z",
      updatedAt: "2026-09-08T20:00:00.000Z",
    });

    expect(parseRewardPunishmentAuthoritativeState(state)?.recipes.recipes)
      .toHaveLength(1);
  });

  it("rejects stale direct contextual refs and stale contextual ranking refs", () => {
    const state = createEmptyRewardPunishmentAuthoritativeState();
    state.profile.preferences["catalog:retired-item"] = {
      ref: { kind: "catalog", id: "retired-item" },
      reward: { suitability: "works", randomEligible: false },
      punishment: { suitability: "unset", randomEligible: false },
      updatedAt: "2026-09-08T20:00:00.000Z",
    };
    expect(parseRewardPunishmentAuthoritativeState(state)).toBeNull();

    const rankingOnly = createEmptyRewardPunishmentAuthoritativeState();
    rankingOnly.ranking.comparisons.push({
      id: "bad",
      context: "reward",
      leftPrimitiveKey: "catalog:retired-item",
      rightPrimitiveKey: rewardPunishmentPrimitiveKey(first.ref),
      result: "left",
      timestamp: "2026-09-08T20:00:00.000Z",
    });
    expect(parseRewardPunishmentAuthoritativeState(rankingOnly)).toBeNull();
  });

  it("rejects impossible direct random eligibility instead of silently normalizing import data", () => {
    const state = createEmptyRewardPunishmentAuthoritativeState();
    const key = rewardPunishmentPrimitiveKey(first.ref);
    state.profile.preferences[key] = {
      ref: first.ref,
      reward: { suitability: "never", randomEligible: true },
      punishment: { suitability: "unset", randomEligible: false },
      updatedAt: "2026-09-08T20:00:00.000Z",
    };

    expect(parseRewardPunishmentAuthoritativeState(state)).toBeNull();
  });

  it("rejects recursive/unknown recipe component kinds", () => {
    const state = createEmptyRewardPunishmentAuthoritativeState();
    state.recipes.recipes.push({
      id: "bad-recipe",
      kind: "reward",
      name: "Bad",
      components: [
        { kind: "recipe", id: "nested" } as never,
      ],
      randomEligible: false,
      createdAt: "2026-09-08T20:00:00.000Z",
      updatedAt: "2026-09-08T20:00:00.000Z",
    });

    expect(parseRewardPunishmentAuthoritativeState(state)).toBeNull();
  });
});

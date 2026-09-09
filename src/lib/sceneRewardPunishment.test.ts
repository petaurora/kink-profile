import { describe, expect, it } from "vitest";
import type { RewardPunishmentPrimitive } from "./rewardPunishmentLibrary";
import {
  createEmptyRewardPunishmentProfileState,
  setContextRandomEligible,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import type { RewardPunishmentRecipe } from "./rewardPunishmentRecipes";
import {
  pickSceneRewardPunishment,
  resolveSceneRewardPunishmentSource,
} from "./sceneRewardPunishment";

const rewardPrimitive: RewardPunishmentPrimitive = {
  ref: { kind: "catalog", id: "reward-one" },
  label: "Reward one",
  sourceType: "catalog",
  contextCategories: [],
  sourceOrigins: [],
};

const punishmentPrimitive: RewardPunishmentPrimitive = {
  ref: { kind: "catalog", id: "punishment-one" },
  label: "Punishment one",
  sourceType: "catalog",
  contextCategories: [],
  sourceOrigins: [],
};

function eligibleProfile() {
  let profile = createEmptyRewardPunishmentProfileState();

  profile = setContextSuitability(
    profile,
    rewardPrimitive.ref,
    "reward",
    "strong",
    "now",
  );
  profile = setContextRandomEligible(
    profile,
    rewardPrimitive.ref,
    "reward",
    true,
    "now",
  );

  profile = setContextSuitability(
    profile,
    punishmentPrimitive.ref,
    "punishment",
    "works",
    "now",
  );
  profile = setContextRandomEligible(
    profile,
    punishmentPrimitive.ref,
    "punishment",
    true,
    "now",
  );

  return profile;
}

describe("M13.7 M11 scene integration", () => {
  it("uses M11 random eligibility rather than creating scene-local suitability", () => {
    const pick = pickSceneRewardPunishment(
      eligibleProfile(),
      [],
      "reward",
      {
        primitives: [rewardPrimitive, punishmentPrimitive],
        rng: () => 0,
      },
    );

    expect(pick).toMatchObject({
      context: "reward",
      label: "Reward one",
      source: {
        kind: "reward_punishment",
        context: "reward",
        entry: {
          kind: "primitive",
          ref: rewardPrimitive.ref,
        },
      },
    });
  });

  it("returns nothing when M11 has no random-eligible entries", () => {
    expect(
      pickSceneRewardPunishment(
        createEmptyRewardPunishmentProfileState(),
        [],
        "reward",
        {
          primitives: [rewardPrimitive],
          rng: () => 0,
        },
      ),
    ).toBeNull();
  });

  it("chooses the context before the entry for Either mode", () => {
    const reward = pickSceneRewardPunishment(
      eligibleProfile(),
      [],
      "either",
      {
        primitives: [rewardPrimitive, punishmentPrimitive],
        rng: () => 0,
      },
    );
    const punishment = pickSceneRewardPunishment(
      eligibleProfile(),
      [],
      "either",
      {
        primitives: [rewardPrimitive, punishmentPrimitive],
        rng: () => 0.75,
      },
    );

    expect(reward?.context).toBe("reward");
    expect(punishment?.context).toBe("punishment");
  });

  it("can resolve stable recipe IDs for display", () => {
    const recipe: RewardPunishmentRecipe = {
      id: "recipe-1",
      kind: "reward",
      name: "Favorite reward",
      components: [{ kind: "custom", id: "c1", label: "Custom" }],
      randomEligible: true,
      createdAt: "now",
      updatedAt: "now",
    };

    expect(
      resolveSceneRewardPunishmentSource(
        {
          kind: "reward_punishment",
          context: "reward",
          entry: {
            kind: "recipe",
            recipeId: "recipe-1",
          },
        },
        [recipe],
        [],
      ),
    ).toEqual({
      label: "Favorite reward",
      kindLabel: "Recipe",
      exists: true,
    });
  });
});

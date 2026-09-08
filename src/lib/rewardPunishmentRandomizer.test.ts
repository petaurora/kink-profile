import { describe, expect, it } from "vitest";
import {
  createEmptyRewardPunishmentProfileState,
  setContextRandomEligible,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import {
  buildRewardPunishmentRandomPool,
  pickRewardPunishmentFromProfile,
  pickRewardPunishmentRandomPrimitive,
} from "./rewardPunishmentRandomizer";

const a = rewardPunishmentPrimitives[0];
const b = rewardPunishmentPrimitives[1];
const c = rewardPunishmentPrimitives[2];

function approve(
  profile: ReturnType<typeof createEmptyRewardPunishmentProfileState>,
  primitive: typeof a,
  context: "reward" | "punishment",
  suitability: "strong" | "works" = "works",
) {
  let next = setContextSuitability(
    profile,
    primitive.ref,
    context,
    suitability,
    "2026-09-08T00:00:00.000Z",
  );
  next = setContextRandomEligible(
    next,
    primitive.ref,
    context,
    true,
    "2026-09-08T00:00:00.000Z",
  );
  return next;
}

describe("M11.6 random pool eligibility", () => {
  it("requires both direct positive suitability and explicit random eligibility", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      a.ref,
      "reward",
      "works",
    );
    profile = approve(profile, b, "reward", "strong");

    expect(
      buildRewardPunishmentRandomPool(
        profile,
        [a, b, c],
        "reward",
      ).map((primitive) => primitive.ref),
    ).toEqual([b.ref]);
  });

  it("never admits depends/no/never/unset even when malformed state tries to mark them eligible", () => {
    const profile = createEmptyRewardPunishmentProfileState();
    const key = rewardPunishmentPrimitiveKey(a.ref);
    const malformed = {
      ...profile,
      preferences: {
        [key]: {
          ref: a.ref,
          reward: {
            suitability: "depends" as const,
            randomEligible: true,
          },
          punishment: {
            suitability: "unset" as const,
            randomEligible: false,
          },
          updatedAt: "2026-09-08T00:00:00.000Z",
        },
      },
    };

    expect(
      buildRewardPunishmentRandomPool(
        malformed,
        [a],
        "reward",
      ),
    ).toEqual([]);
  });

  it("keeps reward and punishment pools independent", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = approve(profile, a, "reward");
    profile = approve(profile, b, "punishment");

    expect(
      buildRewardPunishmentRandomPool(profile, [a, b], "reward")
        .map((primitive) => primitive.ref),
    ).toEqual([a.ref]);
    expect(
      buildRewardPunishmentRandomPool(
        profile,
        [a, b],
        "punishment",
      ).map((primitive) => primitive.ref),
    ).toEqual([b.ref]);
  });

  it("cannot promote an inferred/unrated primitive because inference is not an input", () => {
    const profile = createEmptyRewardPunishmentProfileState();
    expect(
      pickRewardPunishmentFromProfile(
        profile,
        [a, b, c],
        "reward",
        { rng: () => 0 },
      ),
    ).toBeNull();
  });
});

describe("M11.6 random selection", () => {
  it("uses injectable RNG deterministically with equal pool weighting", () => {
    expect(
      pickRewardPunishmentRandomPrimitive([a, b, c], {
        rng: () => 0,
      })?.ref,
    ).toEqual(a.ref);
    expect(
      pickRewardPunishmentRandomPrimitive([a, b, c], {
        rng: () => 0.34,
      })?.ref,
    ).toEqual(b.ref);
    expect(
      pickRewardPunishmentRandomPrimitive([a, b, c], {
        rng: () => 0.99,
      })?.ref,
    ).toEqual(c.ref);
  });

  it("avoids immediately repeating the previous result when alternatives exist", () => {
    const previousKey = rewardPunishmentPrimitiveKey(a.ref);
    expect(
      pickRewardPunishmentRandomPrimitive([a, b], {
        previousPrimitiveKey: previousKey,
        rng: () => 0,
      })?.ref,
    ).toEqual(b.ref);
  });

  it("still returns the only eligible item when the pool has one item", () => {
    expect(
      pickRewardPunishmentRandomPrimitive([a], {
        previousPrimitiveKey: rewardPunishmentPrimitiveKey(a.ref),
        rng: () => 0.9,
      })?.ref,
    ).toEqual(a.ref);
  });

  it("returns null for an empty pool", () => {
    expect(
      pickRewardPunishmentRandomPrimitive([], { rng: () => 0 }),
    ).toBeNull();
  });
});

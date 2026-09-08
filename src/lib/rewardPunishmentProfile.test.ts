import { describe, expect, it } from "vitest";
import {
  canBeRandomEligible,
  createEmptyRewardPunishmentProfileState,
  getContextualUseState,
  setContextNote,
  setContextRandomEligible,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import type { RewardPunishmentPrimitiveRef } from "./rewardPunishmentLibrary";

const ref: RewardPunishmentPrimitiveRef = {
  kind: "catalog",
  id: "hairbrush-spanking",
};

describe("M11 contextual-use profile", () => {
  it("starts reward and punishment independently unset", () => {
    const profile = createEmptyRewardPunishmentProfileState();

    expect(getContextualUseState(profile, ref, "reward")).toEqual({
      suitability: "unset",
      randomEligible: false,
    });
    expect(getContextualUseState(profile, ref, "punishment")).toEqual({
      suitability: "unset",
      randomEligible: false,
    });
  });

  it("changing reward suitability never manufactures punishment evidence", () => {
    const profile = setContextSuitability(
      createEmptyRewardPunishmentProfileState(),
      ref,
      "reward",
      "strong",
      "2026-09-08T18:00:00.000Z",
    );

    expect(getContextualUseState(profile, ref, "reward").suitability).toBe(
      "strong",
    );
    expect(
      getContextualUseState(profile, ref, "punishment").suitability,
    ).toBe("unset");
  });

  it("supports the same primitive as strong in both contexts", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, ref, "reward", "strong");
    profile = setContextSuitability(profile, ref, "punishment", "strong");

    expect(getContextualUseState(profile, ref, "reward").suitability).toBe(
      "strong",
    );
    expect(
      getContextualUseState(profile, ref, "punishment").suitability,
    ).toBe("strong");
  });

  it("keeps random eligibility independent for positive states", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, ref, "reward", "works");
    profile = setContextRandomEligible(profile, ref, "reward", true);

    expect(getContextualUseState(profile, ref, "reward")).toMatchObject({
      suitability: "works",
      randomEligible: true,
    });

    expect(
      getContextualUseState(profile, ref, "punishment").randomEligible,
    ).toBe(false);
  });

  it("forces non-positive and never states out of the random pool", () => {
    expect(canBeRandomEligible("strong")).toBe(true);
    expect(canBeRandomEligible("works")).toBe(true);
    expect(canBeRandomEligible("depends")).toBe(false);
    expect(canBeRandomEligible("never")).toBe(false);

    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, ref, "punishment", "strong");
    profile = setContextRandomEligible(profile, ref, "punishment", true);
    profile = setContextSuitability(profile, ref, "punishment", "never");

    expect(getContextualUseState(profile, ref, "punishment")).toMatchObject({
      suitability: "never",
      randomEligible: false,
    });
  });

  it("stores notes independently per context", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextNote(profile, ref, "reward", "Lovely with planning.");
    profile = setContextNote(
      profile,
      ref,
      "punishment",
      "Only in explicitly agreed scenes.",
    );

    expect(getContextualUseState(profile, ref, "reward").note).toBe(
      "Lovely with planning.",
    );
    expect(getContextualUseState(profile, ref, "punishment").note).toBe(
      "Only in explicitly agreed scenes.",
    );
  });

  it("drops a fully empty primitive overlay instead of persisting noise", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, ref, "reward", "works");
    profile = setContextSuitability(profile, ref, "reward", "unset");

    expect(profile.preferences).toEqual({});
  });
});

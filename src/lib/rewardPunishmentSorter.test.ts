import { describe, expect, it } from "vitest";
import {
  createEmptyRewardPunishmentProfileState,
  setContextNote,
  setContextRandomEligible,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  applySorterChoice,
  buildSorterCounts,
  buildSorterQueue,
  crossedSorterCheckpoint,
  deriveSorterSuggestion,
  deterministicSorterCadenceInterval,
  isSorterProtected,
  restoreSorterPreference,
  sorterBucketForPrimitive,
} from "./rewardPunishmentSorter";
import {
  rewardPunishmentPrimitives,
  rewardPunishmentPrimitiveKey,
} from "./rewardPunishmentLibrary";
import type { InferredContextProposal } from "./rewardPunishmentInference";

const first = rewardPunishmentPrimitives[0];
const second = rewardPunishmentPrimitives[1];

function proposal(
  ref: typeof first.ref,
  context: "reward" | "punishment",
  score: number,
  confidence: number,
): InferredContextProposal {
  return {
    inferenceVersion: 1,
    ref,
    context,
    score,
    confidence,
    band: "likely",
    categoryContributions: [],
    reasons: [],
    sourceEvidenceIds: ["test"],
  };
}

describe("M11.4 sorter mapping", () => {
  it.each([
    ["reward", "works", "no", "reward"],
    ["punishment", "no", "works", "punishment"],
    ["both", "works", "works", "both"],
    ["neither", "no", "no", "neither"],
  ] as const)(
    "maps %s to coarse states without inventing nuance",
    (choice, reward, punishment, bucket) => {
      const next = applySorterChoice(
        createEmptyRewardPunishmentProfileState(),
        first.ref,
        choice,
        { updatedAt: "2026-09-08T00:00:00.000Z" },
      );

      expect(next.preferences[rewardPunishmentPrimitiveKey(first.ref)].reward.suitability)
        .toBe(reward);
      expect(next.preferences[rewardPunishmentPrimitiveKey(first.ref)].punishment.suitability)
        .toBe(punishment);
      expect(sorterBucketForPrimitive(next, first.ref)).toBe(bucket);
      expect(next.preferences[rewardPunishmentPrimitiveKey(first.ref)].reward.randomEligible)
        .toBe(false);
      expect(next.preferences[rewardPunishmentPrimitiveKey(first.ref)].punishment.randomEligible)
        .toBe(false);
    },
  );

  it("leaves profile identity untouched on Skip", () => {
    const profile = createEmptyRewardPunishmentProfileState();
    expect(applySorterChoice(profile, first.ref, "skip")).toBe(profile);
  });
});

describe("M11.4 state protection + undo", () => {
  it("protects nuanced states, notes, and deliberate random-pool choices", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, first.ref, "reward", "strong");
    expect(isSorterProtected(profile, first.ref)).toBe(true);

    let noted = createEmptyRewardPunishmentProfileState();
    noted = setContextNote(noted, first.ref, "reward", "specific context");
    expect(isSorterProtected(noted, first.ref)).toBe(true);

    let random = createEmptyRewardPunishmentProfileState();
    random = setContextSuitability(random, first.ref, "reward", "works");
    random = setContextRandomEligible(random, first.ref, "reward", true);
    expect(isSorterProtected(random, first.ref)).toBe(true);
  });

  it("does not overwrite protected nuance without explicit permission", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, first.ref, "reward", "never");
    const unchanged = applySorterChoice(profile, first.ref, "both");
    expect(unchanged).toBe(profile);

    const replaced = applySorterChoice(profile, first.ref, "both", {
      allowProtected: true,
    });
    expect(sorterBucketForPrimitive(replaced, first.ref)).toBe("both");
  });

  it("restores the exact previous contextual preference for Undo", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, first.ref, "reward", "works");
    const previous = profile.preferences[
      rewardPunishmentPrimitiveKey(first.ref)
    ];
    const changed = applySorterChoice(profile, first.ref, "both");
    const restored = restoreSorterPreference(changed, first.ref, previous);
    expect(restored.preferences[rewardPunishmentPrimitiveKey(first.ref)])
      .toEqual(previous);
  });
});

describe("M11.4 queue + suggestions", () => {
  it("keeps protected incomplete items out of normal unsorted work", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, first.ref, "reward", "strong");

    const queue = buildSorterQueue(
      profile,
      [first, second],
      { type: "unsorted" },
    );
    expect(queue.map((primitive) => primitive.ref))
      .not.toContainEqual(first.ref);
    expect(queue.map((primitive) => primitive.ref))
      .toContainEqual(second.ref);
  });

  it("prioritizes high-confidence inferred candidates without selecting them", () => {
    const reward = new Map([
      [
        rewardPunishmentPrimitiveKey(second.ref),
        proposal(second.ref, "reward", 0.9, 0.9),
      ],
    ]);
    const queue = buildSorterQueue(
      createEmptyRewardPunishmentProfileState(),
      [first, second],
      { type: "unsorted" },
      reward,
    );

    expect(queue[0].ref).toEqual(second.ref);
    expect(
      deriveSorterSuggestion(
        reward.get(rewardPunishmentPrimitiveKey(second.ref)),
        undefined,
      ),
    ).toBe("reward");
    expect(
      sorterBucketForPrimitive(
        createEmptyRewardPunishmentProfileState(),
        second.ref,
      ),
    ).toBe("unclassified");
  });
});

describe("M11.4 progress + cadence", () => {
  it("counts only fully direct classifications as classified", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, first.ref, "reward", "works");
    profile = applySorterChoice(profile, second.ref, "both");

    const counts = buildSorterCounts(profile, [first, second]);
    expect(counts.classified).toBe(1);
    expect(counts.partial).toBe(1);
    expect(counts.both).toBe(1);
  });

  it("uses deterministic variable cadence bounded to 1..7", () => {
    const values = Array.from({ length: 30 }, (_, index) =>
      deterministicSorterCadenceInterval(String(index)),
    );
    expect(new Set(values).size).toBeGreaterThan(1);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...values)).toBeLessThanOrEqual(7);
    expect(deterministicSorterCadenceInterval("same"))
      .toBe(deterministicSorterCadenceInterval("same"));
  });

  it("detects only newly crossed 25-item checkpoints", () => {
    expect(crossedSorterCheckpoint(24, 25)).toBe(25);
    expect(crossedSorterCheckpoint(25, 26)).toBeUndefined();
    expect(crossedSorterCheckpoint(49, 50)).toBe(50);
    expect(crossedSorterCheckpoint(50, 50)).toBeUndefined();
  });
});

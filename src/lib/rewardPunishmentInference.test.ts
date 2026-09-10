import { describe, expect, it } from "vitest";
import {
  kinkCatalog,
  type KinkCatalogItem,
} from "../data/kinkCatalog.generated";
import {
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./rewardPunishmentLibrary";
import {
  createEmptyRewardPunishmentProfileState,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  REWARD_PUNISHMENT_CATEGORY_BREADTH_TARGET,
  REWARD_PUNISHMENT_INFERENCE_VERSION,
  buildInferredContextProposal,
  buildRewardPunishmentCategoryProfile,
} from "./rewardPunishmentInference";
import type { CatalogResultView } from "./catalogResults";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";

const impactA = rewardPunishmentPrimitives.find(
  (primitive) =>
    primitive.ref.kind === "action" &&
    primitive.ref.id === "action-alternating-hand-and-paddle",
)!;
const impactB = rewardPunishmentPrimitives.find(
  (primitive) =>
    primitive.ref.kind === "action" &&
    primitive.ref.id ===
      "action-alternating-sting-and-thud-implements",
)!;
const impactTarget = rewardPunishmentPrimitives.find(
  (primitive) =>
    primitive.ref.kind === "action" &&
    primitive.ref.id === "action-alternating-sting-thud-impacts",
)!;

function emptyCatalogView(): CatalogResultView {
  return {
    items: [],
    byCatalogId: new Map(),
    exclusions: {
      hardLimits: [],
      notInterested: [],
      notApplicable: [],
    },
  };
}

function proposalFor(
  primitive: RewardPunishmentPrimitive,
  context: "reward" | "punishment",
  profile = createEmptyRewardPunishmentProfileState(),
  canonicalSignals: readonly CanonicalSignalResult[] = [],
  catalogResultView: CatalogResultView = emptyCatalogView(),
  primitives: readonly RewardPunishmentPrimitive[] = [
    impactA,
    impactB,
    impactTarget,
  ],
) {
  const categoryProfile = buildRewardPunishmentCategoryProfile(
    profile,
    context,
    primitives,
  );

  return buildInferredContextProposal(primitive, context, {
    profile,
    canonicalSignals,
    catalogResultView,
    categoryProfile,
    primitives,
  });
}

describe("M11.3 category aggregation", () => {
  it("derives reward and punishment categories independently from direct evidence", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      impactA.ref,
      "reward",
      "strong",
    );
    profile = setContextSuitability(
      profile,
      impactB.ref,
      "reward",
      "works",
    );
    profile = setContextSuitability(
      profile,
      impactA.ref,
      "punishment",
      "no",
    );

    const reward = buildRewardPunishmentCategoryProfile(
      profile,
      "reward",
      [impactA, impactB],
    ).find((category) => category.categoryId === "impact");
    const punishment = buildRewardPunishmentCategoryProfile(
      profile,
      "punishment",
      [impactA, impactB],
    ).find((category) => category.categoryId === "impact");

    expect(reward?.affinity).toBe(0.875);
    expect(reward?.evidenceCount).toBe(2);
    expect(reward?.coverage).toBeCloseTo(
      2 / REWARD_PUNISHMENT_CATEGORY_BREADTH_TARGET,
      3,
    );
    expect(punishment?.affinity).toBe(0);
    expect(punishment?.evidenceCount).toBe(1);
  });

  it("tracks never as boundary metadata without changing the zero projection", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      impactA.ref,
      "punishment",
      "never",
    );

    const category = buildRewardPunishmentCategoryProfile(
      profile,
      "punishment",
      [impactA],
    )[0];

    expect(category.affinity).toBe(0);
    expect(category.boundaryCount).toBe(1);
    expect(category.sourceEvidenceIds[0]).toContain("m11-direct:");
  });
});

describe("M11.3 inferred contextual proposals", () => {
  it("uses direct category patterns and similar confirmed items without creating direct state", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      impactA.ref,
      "reward",
      "strong",
    );
    profile = setContextSuitability(
      profile,
      impactB.ref,
      "reward",
      "works",
    );

    const before = JSON.stringify(profile);
    const proposal = proposalFor(impactTarget, "reward", profile);

    expect(proposal?.inferenceVersion).toBe(
      REWARD_PUNISHMENT_INFERENCE_VERSION,
    );
    expect(proposal?.score).toBeGreaterThan(0.5);
    expect(proposal?.sourceEvidenceIds.some((id) =>
      id.includes("m11-direct:"),
    )).toBe(true);
    expect(JSON.stringify(profile)).toBe(before);
  });

  it("never surfaces inference once the context has direct evidence", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      impactTarget.ref,
      "reward",
      "no",
    );

    expect(proposalFor(impactTarget, "reward", profile)).toBeNull();
  });

  it("reuses canonical M7 signal evidence for catalog-linked primitives", () => {
    const mappedItem = kinkCatalog.find(
      (item) => item.signalMappings.length > 0,
    ) as KinkCatalogItem;
    const primitive = rewardPunishmentPrimitives.find(
      (candidate) =>
        candidate.ref.kind === "catalog" &&
        candidate.ref.id === mappedItem.id,
    )!;
    const mapping = mappedItem.signalMappings[0];
    const canonicalSignals = buildCanonicalSignalFixtures([
      {
        signalId: mapping.signalId,
        affinity: 100,
        coverage: 80,
        sourceEvidenceIds: ["quiz:test:signal"],
      },
    ]);

    const proposal = proposalFor(
      primitive,
      "reward",
      createEmptyRewardPunishmentProfileState(),
      canonicalSignals,
      emptyCatalogView(),
      [primitive],
    );

    expect(proposal?.score).toBeGreaterThan(0.5);
    expect(proposal?.sourceEvidenceIds).toContain("quiz:test:signal");
  });

  it("blocks Hard Limits before proposal scoring", () => {
    const primitive = rewardPunishmentPrimitives.find(
      (candidate) => candidate.ref.kind === "catalog",
    )!;
    const item = kinkCatalog.find(
      (candidate) =>
        primitive.ref.kind === "catalog" &&
        candidate.id === primitive.ref.id,
    )!;
    const result = {
      item,
      explicitState: "hard_limit" as const,
      meaningfulPairwiseComparisons: 0,
      excludedFromNewRanking: true,
    };
    const view: CatalogResultView = {
      items: [result],
      byCatalogId: new Map([[item.id, result]]),
      exclusions: {
        hardLimits: [result],
        notInterested: [],
        notApplicable: [],
      },
    };

    expect(
      proposalFor(
        primitive,
        "reward",
        createEmptyRewardPunishmentProfileState(),
        [],
        view,
        [primitive],
      ),
    ).toBeNull();
    expect(
      proposalFor(
        primitive,
        "punishment",
        createEmptyRewardPunishmentProfileState(),
        [],
        view,
        [primitive],
      ),
    ).toBeNull();
  });

  it("does not turn general dislike into positive punishment evidence", () => {
    const primitive = rewardPunishmentPrimitives.find(
      (candidate) => candidate.ref.kind === "catalog",
    )!;
    if (primitive.ref.kind !== "catalog") throw new Error("catalog expected");
    const item = kinkCatalog.find(
      (candidate) => candidate.id === primitive.ref.id,
    )!;

    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      impactA.ref,
      "punishment",
      "strong",
    );

    const primitives = [impactA, primitive];
    const categoryProfile = buildRewardPunishmentCategoryProfile(
      profile,
      "punishment",
      primitives,
    );
    const makeView = (
      state: "love" | "not_interested",
    ): CatalogResultView => {
      const result = {
        item,
        explicitState: state,
        meaningfulPairwiseComparisons: 0,
        excludedFromNewRanking: false,
      };
      return {
        items: [result],
        byCatalogId: new Map([[item.id, result]]),
        exclusions: {
          hardLimits: [],
          notInterested: state === "not_interested" ? [result] : [],
          notApplicable: [],
        },
      };
    };

    const disliked = buildInferredContextProposal(
      primitive,
      "punishment",
      {
        profile,
        canonicalSignals: [],
        catalogResultView: makeView("not_interested"),
        categoryProfile,
        primitives,
      },
    );
    const loved = buildInferredContextProposal(
      primitive,
      "punishment",
      {
        profile,
        canonicalSignals: [],
        catalogResultView: makeView("love"),
        categoryProfile,
        primitives,
      },
    );

    expect(disliked?.score).toBe(loved?.score);
    expect(disliked?.confidence).toBe(loved?.confidence);
  });

  it("keeps proposal generation out of category aggregation, preventing feedback loops", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      impactA.ref,
      "reward",
      "strong",
    );

    const before = buildRewardPunishmentCategoryProfile(
      profile,
      "reward",
      [impactA, impactTarget],
    );
    proposalFor(
      impactTarget,
      "reward",
      profile,
      [],
      emptyCatalogView(),
      [impactA, impactTarget],
    );
    const after = buildRewardPunishmentCategoryProfile(
      profile,
      "reward",
      [impactA, impactTarget],
    );

    expect(after).toEqual(before);
  });
});

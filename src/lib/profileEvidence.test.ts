import { describe, expect, it } from "vitest";
import type { KinkCatalogItem } from "../data/kinkCatalog.generated";
import type { QuizDefinition } from "../data/quizzes";
import type { QuizQuestion } from "../data/quizQuestions";
import type { SignalId } from "../data/signals";
import {
  createEmptyCatalogProfileState,
  setCatalogPreference,
} from "./catalogProfile";
import type { KinkComparison } from "./kinkRanking";
import type { StoredProfile } from "./profileStorage";
import {
  buildAllCatalogEvidenceSnapshots,
  buildCatalogEvidenceSnapshot,
  buildQuizInferenceSignalProfile,
  buildQuizSignalEvidence,
  dedupeQuizSignalEvidence,
  inferCatalogAffinity,
  projectDirectCatalogEvidenceToSignals,
  projectExplicitCatalogEvidenceToSignals,
  projectPairwiseCatalogEvidenceToSignals,
  selectExplicitCatalogEvidence,
  selectPairwiseCatalogEvidence,
  type PairwiseCatalogEvidence,
  type QuizSignalEvidence,
} from "./profileEvidence";

function quizEvidence(
  evidenceId: string,
  quizId: "dominance-submission" | "roles-headspaces",
  signalId: SignalId,
  affinity: number,
  coverage: number,
  sourceVersion = 1,
): QuizSignalEvidence {
  return {
    kind: "quiz_signal",
    sourceType: "quiz",
    evidenceId,
    quizId,
    sourceVersion,
    signalId,
    affinity,
    coverage,
  };
}

const receivingControlItem = {
  id: "item-a",
  signalMappings: [{ signalId: "receiving_control" as const, weight: 1 }],
};

const mixedItem = {
  id: "item-mixed",
  signalMappings: [
    { signalId: "receiving_control" as const, weight: 1 },
    { signalId: "structure" as const, weight: 1 },
  ],
};

describe("quiz signal evidence", () => {
  it("builds source-aware evidence from weighted quiz answers", () => {
    const quizDefinitions: QuizDefinition[] = [
      {
        id: "dominance-submission",
        title: "Test",
        shortTitle: "Test",
        eyebrow: "Test",
        description: "Test",
        icon: "x",
        estimatedMinutes: 1,
        version: 1,
        availability: "available",
        questionIds: ["test-q"],
        contributesToOverall: true,
      },
    ];
    const questions: QuizQuestion[] = [
      {
        kind: "weighted",
        id: "test-q",
        prompt: "Test",
        weights: {
          receiving_control: 1,
          giving_control: 0.5,
        },
      },
    ];
    const profile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: 7,
          answers: { "test-q": 4 },
        },
      },
    };

    const evidence = buildQuizSignalEvidence(
      profile,
      quizDefinitions,
      questions,
    );

    expect(evidence).toEqual([
      expect.objectContaining({
        evidenceId: "quiz:dominance-submission:receiving_control",
        quizId: "dominance-submission",
        sourceVersion: 7,
        signalId: "receiving_control",
        affinity: 100,
        coverage: 100,
      }),
      expect.objectContaining({
        evidenceId: "quiz:dominance-submission:giving_control",
        quizId: "dominance-submission",
        sourceVersion: 7,
        signalId: "giving_control",
        affinity: 100,
        coverage: 100,
      }),
    ]);
  });

  it("does not create signal evidence for legacy/non-weighted quiz questions", () => {
    const profile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "starter-profile": {
          quizVersion: 1,
          answers: { "q-1": 4 },
        },
      },
    };

    expect(buildQuizSignalEvidence(profile)).toEqual([]);
  });

  it("replaces an older contribution from the same quiz+signal source", () => {
    const oldEvidence = quizEvidence(
      "quiz:dominance-submission:receiving_control",
      "dominance-submission",
      "receiving_control",
      20,
      100,
      1,
    );
    const otherSource = quizEvidence(
      "quiz:roles-headspaces:receiving_control",
      "roles-headspaces",
      "receiving_control",
      70,
      80,
      3,
    );
    const retake = {
      ...oldEvidence,
      sourceVersion: 2,
      affinity: 90,
    };

    const deduped = dedupeQuizSignalEvidence([
      oldEvidence,
      otherSource,
      retake,
    ]);

    expect(deduped).toHaveLength(2);
    expect(
      deduped.find(
        (item) =>
          item.evidenceId ===
          "quiz:dominance-submission:receiving_control",
      ),
    ).toEqual(retake);
    expect(deduped).toContainEqual(otherSource);
  });

  it("combines independent quiz sources without losing provenance", () => {
    const evidence = [
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        100,
        50,
      ),
      quizEvidence(
        "quiz:roles-headspaces:receiving_control",
        "roles-headspaces",
        "receiving_control",
        0,
        50,
      ),
    ];

    const signal = buildQuizInferenceSignalProfile(evidence).get(
      "receiving_control",
    );

    expect(signal?.affinity).toBe(50);
    expect(signal?.coverage).toBe(75);
    expect(signal?.sourceEvidenceIds).toEqual([
      "quiz:dominance-submission:receiving_control",
      "quiz:roles-headspaces:receiving_control",
    ]);
  });
});

describe("catalog inference", () => {
  it("keeps affinity separate from mapping coverage", () => {
    const signalProfile = buildQuizInferenceSignalProfile([
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        100,
        100,
      ),
    ]);

    const inferred = inferCatalogAffinity(mixedItem, signalProfile);

    expect(inferred?.affinity).toBe(100);
    expect(inferred?.coverage).toBe(50);
    expect(inferred?.matchedSignals.map((item) => item.signalId)).toEqual([
      "receiving_control",
    ]);
  });

  it("retains matched SignalId and quiz-source provenance", () => {
    const signalProfile = buildQuizInferenceSignalProfile([
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        80,
        100,
      ),
    ]);

    const inferred = inferCatalogAffinity(receivingControlItem, signalProfile);

    expect(inferred).toEqual(
      expect.objectContaining({
        evidenceId: "catalog-inference:item-a",
        sourceType: "catalog_inference",
        affinity: 80,
        coverage: 100,
      }),
    );
    expect(inferred?.matchedSignals[0]).toEqual(
      expect.objectContaining({
        signalId: "receiving_control",
        sourceEvidenceIds: [
          "quiz:dominance-submission:receiving_control",
        ],
      }),
    );
  });

  it("returns no inference when mapped signals have no quiz evidence", () => {
    expect(inferCatalogAffinity(receivingControlItem, new Map())).toBeUndefined();
  });
});

describe("direct catalog evidence adapters", () => {
  it("exposes only explicitly stored directional sources, not fallback values", () => {
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "item-a",
      "overall",
      "like",
      "2026-09-06T00:00:00.000Z",
    );
    profile = setCatalogPreference(
      profile,
      "item-a",
      "receiving",
      "hard_limit",
      "2026-09-06T00:01:00.000Z",
    );

    const evidence = selectExplicitCatalogEvidence(profile, "item-a");

    expect(evidence.map((item) => [item.context, item.state])).toEqual([
      ["overall", "like"],
      ["receiving", "hard_limit"],
    ]);
  });

  it("adapts raw pairwise history without converting results to explicit state", () => {
    const comparison: KinkComparison = {
      id: "cmp-1",
      leftKinkId: "item-a",
      rightKinkId: "item-b",
      scope: { type: "category", categoryId: "cat" },
      result: "left",
      timestamp: "2026-09-06T00:00:00.000Z",
    };

    const evidence = selectPairwiseCatalogEvidence([comparison], "item-a");

    expect(evidence).toEqual([
      expect.objectContaining({
        evidenceId: "catalog-pairwise:cmp-1",
        comparisonId: "cmp-1",
        result: "left",
      }),
    ]);
    expect(evidence[0]).not.toHaveProperty("state");
  });

  it("represents explicit, pairwise, and inferred evidence simultaneously", () => {
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "item-a",
      "overall",
      "like",
      "2026-09-06T00:00:00.000Z",
    );
    catalogProfile = {
      ...catalogProfile,
      comparisons: [
        {
          id: "cmp-1",
          leftKinkId: "item-a",
          rightKinkId: "item-b",
          scope: { type: "overall" },
          result: "left",
          timestamp: "2026-09-06T00:01:00.000Z",
        },
      ],
    };

    const signalProfile = buildQuizInferenceSignalProfile([
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        85,
        100,
      ),
    ]);

    const snapshot = buildCatalogEvidenceSnapshot(
      receivingControlItem,
      catalogProfile,
      signalProfile,
    );

    expect(snapshot.explicit).toHaveLength(1);
    expect(snapshot.pairwise).toHaveLength(1);
    expect(snapshot.inferred?.affinity).toBe(85);
    expect(snapshot.resolved.overallExplicit).toBe("like");
    expect(snapshot.resolved.hasDirectPairwiseEvidence).toBe(true);
  });

  it("keeps an explicit exclusion authoritative even when inference is very high", () => {
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "item-a",
      "overall",
      "hard_limit",
      "2026-09-06T00:00:00.000Z",
    );

    const signalProfile = buildQuizInferenceSignalProfile([
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        100,
        100,
      ),
    ]);

    const snapshot = buildCatalogEvidenceSnapshot(
      receivingControlItem,
      catalogProfile,
      signalProfile,
    );

    expect(snapshot.inferred?.affinity).toBe(100);
    expect(snapshot.resolved.overallExplicit).toBe("hard_limit");
    expect(snapshot.resolved.rankingEligible).toBe(false);
  });

  it("changing quiz evidence does not mutate unrelated direct catalog evidence", () => {
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "item-a",
      "overall",
      "love",
      "2026-09-06T00:00:00.000Z",
    );
    const before = JSON.stringify(catalogProfile);

    const low = buildQuizInferenceSignalProfile([
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        10,
        100,
      ),
    ]);
    const high = buildQuizInferenceSignalProfile([
      quizEvidence(
        "quiz:dominance-submission:receiving_control",
        "dominance-submission",
        "receiving_control",
        100,
        100,
      ),
    ]);

    expect(
      buildCatalogEvidenceSnapshot(receivingControlItem, catalogProfile, low)
        .inferred?.affinity,
    ).toBe(10);
    expect(
      buildCatalogEvidenceSnapshot(receivingControlItem, catalogProfile, high)
        .inferred?.affinity,
    ).toBe(100);
    expect(JSON.stringify(catalogProfile)).toBe(before);
    expect(
      selectExplicitCatalogEvidence(catalogProfile, "item-a")[0]?.state,
    ).toBe("love");
  });
});

describe("catalog to signal projection contract", () => {
  it("projects semantic explicit evidence without inventing a numeric score", () => {
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "item-a",
      "overall",
      "love",
      "2026-09-06T00:00:00.000Z",
    );

    const [evidence] = selectExplicitCatalogEvidence(profile, "item-a");
    const projections = projectExplicitCatalogEvidenceToSignals(
      evidence,
      receivingControlItem,
    );

    expect(projections).toEqual([
      expect.objectContaining({
        signalId: "receiving_control",
        mappingWeight: 1,
        polarity: "positive",
        strength: "strong",
      }),
    ]);
    expect(projections[0]).not.toHaveProperty("affinity");
  });

  it("does not project Not Applicable into signal preference", () => {
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "item-a",
      "overall",
      "not_applicable",
      "2026-09-06T00:00:00.000Z",
    );

    const [evidence] = selectExplicitCatalogEvidence(profile, "item-a");

    expect(
      projectExplicitCatalogEvidenceToSignals(evidence, receivingControlItem),
    ).toEqual([]);
  });

  it("keeps pairwise left/right/equal evidence relative", () => {
    const catalog = [
      receivingControlItem,
      {
        id: "item-b",
        signalMappings: [{ signalId: "structure" as const, weight: 0.75 }],
      },
    ];

    const evidence: PairwiseCatalogEvidence = {
      kind: "catalog_pairwise",
      sourceType: "catalog_pairwise",
      evidenceId: "catalog-pairwise:cmp-1",
      comparisonId: "cmp-1",
      leftCatalogId: "item-a",
      rightCatalogId: "item-b",
      scope: { type: "overall" },
      result: "left",
      timestamp: "2026-09-06T00:00:00.000Z",
    };

    const projection = projectPairwiseCatalogEvidenceToSignals(
      evidence,
      catalog,
    );

    expect(projection).toEqual([
      expect.objectContaining({
        relation: "left_preferred",
        leftMappings: [
          { signalId: "receiving_control", weight: 1 },
        ],
        rightMappings: [{ signalId: "structure", weight: 0.75 }],
      }),
    ]);
    expect(projection[0]).not.toHaveProperty("polarity");
  });

  it("withholds Skip and Neither from signal projection until C5 semantics", () => {
    const base: PairwiseCatalogEvidence = {
      kind: "catalog_pairwise",
      sourceType: "catalog_pairwise",
      evidenceId: "catalog-pairwise:cmp-1",
      comparisonId: "cmp-1",
      leftCatalogId: "item-a",
      rightCatalogId: "item-b",
      scope: { type: "overall" },
      result: "skip",
      timestamp: "2026-09-06T00:00:00.000Z",
    };

    expect(
      projectPairwiseCatalogEvidenceToSignals(base, [
        receivingControlItem,
      ]),
    ).toEqual([]);
    expect(
      projectPairwiseCatalogEvidenceToSignals(
        { ...base, result: "neither" },
        [receivingControlItem],
      ),
    ).toEqual([]);
  });

  it("projects only independent direct catalog sources, never derived inference", () => {
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "item-a",
      "overall",
      "like",
      "2026-09-06T00:00:00.000Z",
    );

    const projections = projectDirectCatalogEvidenceToSignals(
      catalogProfile,
      [receivingControlItem],
    );

    expect(projections).toHaveLength(1);
    expect(
      projections.every(
        (projection) =>
          !projection.sourceEvidenceId.startsWith("catalog-inference:"),
      ),
    ).toBe(true);
  });
});

describe("current app integration", () => {
  it("can derive catalog inference from current stored quiz answers without persistence changes", () => {
    const storedProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: 1,
          answers: { "ds-001": 4 },
        },
      },
    };
    const catalogProfile = createEmptyCatalogProfileState();
    const catalogItem = {
      ...receivingControlItem,
      label: "Item A",
      categoryId: "test-category",
      categoryLabel: "Test",
      domain: "power-exchange",
      direction: "receiving",
      aliases: [],
      description: "",
      typicalRole: "Receiving",
      primaryMode: "",
      intensity: "",
      riskLevel: "",
    } as KinkCatalogItem;

    const snapshots = buildAllCatalogEvidenceSnapshots(
      storedProfile,
      catalogProfile,
      [catalogItem],
    );

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]?.catalogId).toBe("item-a");
    expect(snapshots[0]?.inferred).toEqual(
      expect.objectContaining({
        sourceType: "catalog_inference",
        affinity: 100,
      }),
    );
    expect(catalogProfile.preferences).toEqual({});
  });
});

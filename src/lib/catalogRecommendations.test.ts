import { describe, expect, it } from "vitest";
import type { KinkCatalogItem } from "../data/kinkCatalog.generated";
import type { SignalId } from "../data/signals";
import {
  createEmptyCatalogProfileState,
  setCatalogPreference,
} from "./catalogProfile";
import {
  buildCatalogRecommendationView,
} from "./catalogRecommendations";
import {
  buildCatalogResultView,
  type CatalogResultItem,
  type CatalogResultView,
} from "./catalogResults";
import {
  buildQuizInferenceSignalProfile,
  inferCatalogAffinity,
  projectDirectCatalogEvidenceToSignals,
  type QuizInferenceSignal,
} from "./profileEvidence";
import type { StoredProfile } from "./profileStorage";

function item(
  id: string,
  label: string,
  signalMappings: KinkCatalogItem["signalMappings"] = [],
): KinkCatalogItem {
  return {
    id,
    label,
    categoryId: "cat-a",
    categoryLabel: "Cat A",
    domain: "power-exchange",
    direction: "both",
    aliases: [],
    signalMappings,
    description: "",
    typicalRole: "",
    intensity: "",
    riskLevel: "",
  } as KinkCatalogItem;
}

function inferenceSignal(
  signalId: SignalId,
  affinity: number,
  coverage: number,
): QuizInferenceSignal {
  return {
    signalId,
    affinity,
    coverage,
    sourceEvidenceIds: [
      `quiz:dominance-submission:${signalId}`,
    ],
  };
}

function inferredResult(
  id: string,
  label: string,
  affinity: number,
  coverage: number,
  explicitState?: CatalogResultItem["explicitState"],
  meaningfulPairwiseComparisons = 0,
): CatalogResultItem {
  return {
    item: item(id, label),
    explicitState,
    inferred: {
      affinity,
      coverage,
      matchedSignals: [
        {
          signalId: "receiving_control",
          signalLabel: "Receiving Control",
          mappingWeight: 1,
          signalAffinity: affinity,
          signalCoverage: coverage,
          sourceQuizIds: ["dominance-submission"],
          sourceQuizLabels: ["D/s"],
        },
      ],
    },
    meaningfulPairwiseComparisons,
    excludedFromNewRanking:
      explicitState === "hard_limit" ||
      explicitState === "not_interested" ||
      explicitState === "not_applicable",
  };
}

function recommendationFixture(
  items: CatalogResultItem[],
): CatalogResultView {
  return {
    items,
    byCatalogId: new Map(
      items.map((result) => [result.item.id, result]),
    ),
    exclusions: {
      hardLimits: items.filter(
        (result) => result.explicitState === "hard_limit",
      ),
      notInterested: items.filter(
        (result) => result.explicitState === "not_interested",
      ),
      notApplicable: items.filter(
        (result) => result.explicitState === "not_applicable",
      ),
    },
  };
}

describe("C7 affinity matcher hardening", () => {
  it("returns no affinity for unmapped items", () => {
    expect(
      inferCatalogAffinity(
        { id: "unmapped", signalMappings: [] },
        new Map(),
      ),
    ).toBeUndefined();
  });

  it("ignores non-positive/invalid mappings and merges duplicate SignalIds", () => {
    const signalProfile = new Map<SignalId, QuizInferenceSignal>([
      [
        "receiving_control",
        inferenceSignal("receiving_control", 80, 100),
      ],
    ]);

    const inferred = inferCatalogAffinity(
      {
        id: "duplicate-mapping",
        signalMappings: [
          { signalId: "receiving_control", weight: 0.25 },
          { signalId: "receiving_control", weight: 0.75 },
          { signalId: "structure", weight: 0 },
          { signalId: "obedience", weight: -1 },
          { signalId: "service", weight: Number.NaN },
        ],
      },
      signalProfile,
    );

    expect(inferred?.affinity).toBe(80);
    expect(inferred?.coverage).toBe(100);
    expect(inferred?.matchedSignals).toEqual([
      expect.objectContaining({
        signalId: "receiving_control",
        mappingWeight: 1,
      }),
    ]);
  });

  it("keeps partial mapping coverage separate from affinity", () => {
    const signalProfile = new Map<SignalId, QuizInferenceSignal>([
      [
        "receiving_control",
        inferenceSignal("receiving_control", 80, 50),
      ],
    ]);

    const inferred = inferCatalogAffinity(
      {
        id: "partial",
        signalMappings: [
          { signalId: "receiving_control", weight: 1 },
          { signalId: "structure", weight: 1 },
        ],
      },
      signalProfile,
    );

    expect(inferred?.affinity).toBe(80);
    expect(inferred?.coverage).toBe(25);
  });

  it("clamps malformed signal affinity/coverage into valid percentages", () => {
    const signalProfile = new Map<SignalId, QuizInferenceSignal>([
      [
        "receiving_control",
        inferenceSignal("receiving_control", 140, 160),
      ],
      [
        "structure",
        inferenceSignal("structure", -25, 100),
      ],
    ]);

    const inferred = inferCatalogAffinity(
      {
        id: "clamped",
        signalMappings: [
          { signalId: "receiving_control", weight: 1 },
          { signalId: "structure", weight: 1 },
        ],
      },
      signalProfile,
    );

    expect(inferred?.affinity).toBe(50);
    expect(inferred?.coverage).toBe(100);
    expect(inferred?.matchedSignals).toEqual([
      expect.objectContaining({
        signalId: "receiving_control",
        signalAffinity: 100,
        signalCoverage: 100,
      }),
      expect.objectContaining({
        signalId: "structure",
        signalAffinity: 0,
        signalCoverage: 100,
      }),
    ]);
  });

  it("hardens repeated quiz-signal combination against out-of-range evidence", () => {
    const profile = buildQuizInferenceSignalProfile([
      {
        kind: "quiz_signal",
        sourceType: "quiz",
        evidenceId: "quiz:dominance-submission:receiving_control",
        quizId: "dominance-submission",
        sourceVersion: 1,
        signalId: "receiving_control",
        affinity: 150,
        coverage: 150,
      },
      {
        kind: "quiz_signal",
        sourceType: "quiz",
        evidenceId: "quiz:roles-headspaces:receiving_control",
        quizId: "roles-headspaces",
        sourceVersion: 1,
        signalId: "receiving_control",
        affinity: -50,
        coverage: 100,
      },
    ]).get("receiving_control");

    expect(profile?.affinity).toBe(50);
    expect(profile?.coverage).toBe(100);
  });
});

describe("C7 recommendation eligibility", () => {
  it("creates tentative inference-only recommendations without merging direct evidence", () => {
    const high = inferredResult("high", "High", 90, 70);
    const lower = inferredResult("lower", "Lower", 80, 100);
    const direct = inferredResult("direct", "Direct", 99, 100, "like");
    const ranked = inferredResult("ranked", "Ranked", 95, 100, undefined, 2);

    const view = buildCatalogRecommendationView(
      recommendationFixture([lower, direct, high, ranked]),
    );

    expect(view.inferenceOnly.map((entry) => entry.result.item.id)).toEqual([
      "high",
      "lower",
    ]);
    expect(
      view.inferenceOnly.every(
        (entry) => entry.recommendationLabel === "May be worth exploring",
      ),
    ).toBe(true);

    expect(
      view.inferredWithDirectEvidence.map(
        (entry) => entry.result.item.id,
      ),
    ).toEqual(["direct", "ranked"]);
    expect(view.inferenceOnly).toHaveLength(2);
  });

  it("suppresses every explicit exclusion state while retaining inferred evidence", () => {
    const hardLimit = inferredResult(
      "limit",
      "Limit",
      99,
      100,
      "hard_limit",
    );
    const notInterested = inferredResult(
      "no",
      "No",
      88,
      90,
      "not_interested",
    );
    const notApplicable = inferredResult(
      "na",
      "N/A",
      77,
      80,
      "not_applicable",
    );

    const view = buildCatalogRecommendationView(
      recommendationFixture([
        hardLimit,
        notInterested,
        notApplicable,
      ]),
    );

    expect(view.inferenceOnly).toEqual([]);
    expect(view.inferredWithDirectEvidence).toEqual([]);
    expect(
      view.suppressed.map((entry) => [
        entry.result.item.id,
        entry.suppressionState,
      ]),
    ).toEqual([
      ["limit", "hard_limit"],
      ["no", "not_interested"],
      ["na", "not_applicable"],
    ]);

    expect(view.suppressed[0]?.result.inferred).toBe(
      hardLimit.inferred,
    );
    expect(
      view.suppressed[0]?.result.inferred?.matchedSignals[0]
        ?.sourceQuizIds,
    ).toEqual(["dominance-submission"]);
  });

  it("omits items with no inferred evidence from recommendation output", () => {
    const noInference: CatalogResultItem = {
      item: item("plain", "Plain"),
      meaningfulPairwiseComparisons: 0,
      excludedFromNewRanking: false,
    };

    const view = buildCatalogRecommendationView(
      recommendationFixture([noInference]),
    );

    expect(view.inferenceOnly).toEqual([]);
    expect(view.inferredWithDirectEvidence).toEqual([]);
    expect(view.suppressed).toEqual([]);
  });

  it("sorts inference-only candidates by affinity, then coverage, then label", () => {
    const view = buildCatalogRecommendationView(
      recommendationFixture([
        inferredResult("b", "Beta", 80, 50),
        inferredResult("a", "Alpha", 80, 50),
        inferredResult("c", "Charlie", 80, 90),
        inferredResult("d", "Delta", 90, 20),
      ]),
    );

    expect(view.inferenceOnly.map((entry) => entry.result.item.id)).toEqual([
      "d",
      "c",
      "a",
      "b",
    ]);
  });

  it("keeps C6 explainability for a suppressed high-affinity Hard Limit", () => {
    const catalog = [
      item("limit", "Limit", [
        { signalId: "receiving_control", weight: 1 },
      ]),
    ];
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "limit",
      "overall",
      "hard_limit",
      "2026-09-06T00:00:00.000Z",
    );
    const storedProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: 1,
          answers: { "ds-001": 4 },
        },
      },
    };

    const resultView = buildCatalogResultView(
      storedProfile,
      catalogProfile,
      catalog,
    );
    const recommendationView =
      buildCatalogRecommendationView(resultView);

    expect(
      resultView.byCatalogId.get("limit")?.inferred?.affinity,
    ).toBe(100);
    expect(recommendationView.inferenceOnly).toEqual([]);
    expect(recommendationView.suppressed[0]).toEqual(
      expect.objectContaining({
        suppressionState: "hard_limit",
        affinity: 100,
      }),
    );
    expect(
      recommendationView.suppressed[0]?.result.inferred
        ?.matchedSignals[0]?.sourceQuizIds,
    ).toEqual(["dominance-submission"]);
  });
});

describe("C7 no-feedback regression", () => {
  it("recommendation/inference state cannot enter direct catalog-to-signal projection", () => {
    const catalog = [
      item("a", "A", [
        { signalId: "receiving_control", weight: 1 },
      ]),
    ];
    let catalogProfile = createEmptyCatalogProfileState();
    catalogProfile = setCatalogPreference(
      catalogProfile,
      "a",
      "overall",
      "like",
      "2026-09-06T00:00:00.000Z",
    );

    const before = projectDirectCatalogEvidenceToSignals(
      catalogProfile,
      catalog,
    );

    const recommendationView = buildCatalogRecommendationView(
      recommendationFixture([
        inferredResult("a", "A", 100, 100, "like"),
      ]),
    );

    const after = projectDirectCatalogEvidenceToSignals(
      catalogProfile,
      catalog,
    );

    expect(recommendationView.inferredWithDirectEvidence).toHaveLength(1);
    expect(after).toEqual(before);
    expect(
      after.every(
        (projection) =>
          !projection.sourceEvidenceId.startsWith("catalog-inference:"),
      ),
    ).toBe(true);
  });
});

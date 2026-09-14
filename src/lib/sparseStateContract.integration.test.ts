import { describe, expect, it } from "vitest";
import type { OverallFacetId } from "../data/overallFacets";
import { getQuiz } from "../data/quizzes";
import { buildHubComposition } from "../features/hub/hubComposition";
import {
  answerQuizQuestion,
  resolveQuizLifecycle,
  startQuizRetake,
} from "../features/quizzes/quizRuntime";
import type { CatalogPreferenceState } from "./catalogProfile";
import type { CatalogResultItem, CatalogResultView } from "./catalogResults";
import type { OverallFacetResult } from "./overallProfileFacets";
import { buildOverallRadarModel } from "./overallRadar";
import type { BoundarySummaryAssertion } from "./profileBoundaryState";
import { buildProfileHardLimits } from "./profileHardLimits";
import { resolveProfileDimension } from "./profileMaturity";
import { buildProfileTopInterests } from "./profileTopInterests";
import type { StoredProfile } from "./profileStorage";
import { resolveSparseState } from "./sparseState";

function facet(
  facetId: OverallFacetId,
  affinity: number | null,
  coverage: number,
): OverallFacetResult {
  return {
    facetId,
    label: facetId,
    shortLabel: facetId,
    description: facetId,
    affinity,
    coverage,
    components: [],
    sourceEvidenceIds: coverage > 0 ? [`test:${facetId}`] : [],
  };
}

function catalogItem(
  id: string,
  options: {
    explicitState?: CatalogPreferenceState;
    inferredAffinity?: number;
  } = {},
): CatalogResultItem {
  return {
    item: {
      id,
      label: id,
      categoryId: "test",
    } as CatalogResultItem["item"],
    explicitState: options.explicitState,
    inferred:
      options.inferredAffinity === undefined
        ? undefined
        : {
            affinity: options.inferredAffinity,
            coverage: 100,
            matchedSignals: [],
          },
    meaningfulPairwiseComparisons: 0,
    excludedFromNewRanking:
      options.explicitState === "hard_limit" ||
      options.explicitState === "not_interested" ||
      options.explicitState === "not_applicable",
  };
}

function catalogView(items: CatalogResultItem[]): CatalogResultView {
  return {
    items,
    byCatalogId: new Map(items.map((item) => [item.item.id, item])),
    exclusions: {
      hardLimits: items.filter((item) => item.explicitState === "hard_limit"),
      notInterested: items.filter(
        (item) => item.explicitState === "not_interested",
      ),
      notApplicable: items.filter(
        (item) => item.explicitState === "not_applicable",
      ),
    },
  };
}

function completeQuizProfile(value = 3): StoredProfile {
  const quiz = getQuiz("dominance-submission")!;
  return {
    schemaVersion: 2,
    quizzes: {
      [quiz.id]: {
        quizVersion: quiz.version,
        answers: Object.fromEntries(
          quiz.questionIds.map((questionId) => [questionId, value]),
        ),
        completedAt: "2026-09-14T12:00:00.000Z",
      },
    },
  };
}

describe("#200 cross-surface sparse-state contract", () => {
  it("keeps unknown distinct from an established zero through Profile presentation and JSON serialization", () => {
    const unknownFacet = facet("power_exchange", null, 0);
    const measuredLowFacet = facet("intensity_pain", 0, 80);

    const unknown = resolveProfileDimension(unknownFacet);
    const measuredLow = resolveProfileDimension(measuredLowFacet);
    const radar = buildOverallRadarModel(
      [unknownFacet, measuredLowFacet],
      [],
    );
    const serialized = JSON.parse(JSON.stringify(radar)) as typeof radar;

    expect(unknown.state).toBe("unknown");
    expect(unknown.affinity).toBeNull();
    expect(measuredLow.state).toBe("established");
    expect(measuredLow.affinity).toBe(0);

    expect(serialized.axes[0]).toMatchObject({
      affinity: null,
      state: "unknown",
    });
    expect(serialized.axes[1]).toMatchObject({
      affinity: 0,
      state: "known",
    });
  });

  it("keeps missing boundary data distinct from affirmative explicit-none", () => {
    const missing = buildProfileHardLimits(catalogView([]));
    const explicitNone: BoundarySummaryAssertion = {
      kind: "none",
      updatedAt: "2026-09-14T18:00:00.000Z",
    };
    const none = buildProfileHardLimits(catalogView([]), explicitNone);

    expect(missing.state.semanticState).toBe("unexplored");
    expect(missing.state.reason).toBe("no_evidence");
    expect(none.state.semanticState).toBe("valid_empty");
    expect(none.state.reason).toBe("explicit_none");
    expect(none.state.evidence.provenance).toBe("direct");
  });

  it("requires direct evidence before an inferred preference can become a personal Top Overall claim", () => {
    const top = buildProfileTopInterests(
      catalogView([
        catalogItem("inferred-only", { inferredAffinity: 100 }),
        catalogItem("direct", {
          explicitState: "curious",
          inferredAffinity: 10,
        }),
      ]),
    );

    expect(top.map((item) => item.catalogId)).toEqual(["direct"]);
  });

  it("preserves an established quiz result during a retake while making only the draft resumable on Hub", () => {
    const quiz = getQuiz("dominance-submission")!;
    const original = completeQuizProfile(4);
    const started = startQuizRetake(
      quiz,
      original,
      "2026-09-14T18:00:00.000Z",
    );
    const inProgress = answerQuizQuestion(
      quiz,
      started,
      quiz.questionIds[0],
      0,
      "2026-09-14T18:05:00.000Z",
    );
    const lifecycle = resolveQuizLifecycle(quiz, inProgress);
    const hub = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: lifecycle.state === "retake-in-progress",
      hasLatestPreference: false,
      randomizerReady: false,
    });

    expect(inProgress.quizzes[quiz.id]!.answers).toEqual(
      original.quizzes[quiz.id]!.answers,
    );
    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.resultState.semanticState).toBe("available");
      expect(lifecycle.attemptState?.semanticState).toBe("developing");
      expect(lifecycle.hasEstablishedResult).toBe(true);
    }
    expect(hub.modules).toContain("quiz-resume");
  });

  it("keeps user exclusion presentation-only without mutating the measured semantic result", () => {
    const resolved = resolveSparseState({
      evidence: {
        level: "sufficient",
        direct: true,
        inferred: false,
      },
      result: "value",
      excludedByUser: true,
    });

    expect(resolved.state).toBe("excluded_by_user");
    expect(resolved.semanticState).toBe("available");
    expect(resolved.evidence.provenance).toBe("direct");
  });

  it("omits optional Hub modules when their content is not eligible", () => {
    const hub = buildHubComposition({
      maturity: "established",
      hasResumableQuiz: false,
      hasLatestPreference: false,
      randomizerReady: false,
    });

    expect(hub.modules).toEqual(["reflection", "intent-doors"]);
    expect(hub.modules).not.toContain("quiz-resume");
    expect(hub.modules).not.toContain("latest-preference");
    expect(hub.modules).not.toContain("randomizer");
  });
});

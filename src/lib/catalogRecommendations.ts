import {
  catalogPreferenceLabels,
  type CatalogResultItem,
  type CatalogResultView,
} from "./catalogResults";
import type { CatalogPreferenceState } from "./catalogProfile";

export type RecommendationSuppressionState =
  | "hard_limit"
  | "not_interested"
  | "not_applicable";

export type CatalogRecommendationCandidate = {
  result: CatalogResultItem;
  affinity: number;
  coverage: number;
  recommendationLabel: "May be worth exploring";
};

export type CatalogInferredDirectMatch = {
  result: CatalogResultItem;
  affinity: number;
  coverage: number;
  directEvidenceLabel: string;
};

export type CatalogSuppressedRecommendation = {
  result: CatalogResultItem;
  affinity: number;
  coverage: number;
  suppressionState: RecommendationSuppressionState;
  suppressionLabel: string;
};

export type CatalogRecommendationView = {
  inferenceOnly: readonly CatalogRecommendationCandidate[];
  inferredWithDirectEvidence: readonly CatalogInferredDirectMatch[];
  suppressed: readonly CatalogSuppressedRecommendation[];
};

function isRecommendationSuppressionState(
  state: CatalogPreferenceState | undefined,
): state is RecommendationSuppressionState {
  return (
    state === "hard_limit" ||
    state === "not_interested" ||
    state === "not_applicable"
  );
}

function hasIndependentDirectEvidence(result: CatalogResultItem) {
  return (
    result.explicitState !== undefined ||
    result.meaningfulPairwiseComparisons > 0
  );
}

function compareInferenceStrength(
  a: Pick<CatalogRecommendationCandidate, "affinity" | "coverage" | "result">,
  b: Pick<CatalogRecommendationCandidate, "affinity" | "coverage" | "result">,
) {
  if (b.affinity !== a.affinity) return b.affinity - a.affinity;
  if (b.coverage !== a.coverage) return b.coverage - a.coverage;
  return a.result.item.label.localeCompare(b.result.item.label);
}

function directEvidenceLabel(result: CatalogResultItem) {
  const labels: string[] = [];

  if (result.explicitState) {
    labels.push(
      `Explicit: ${catalogPreferenceLabels[result.explicitState]}`,
    );
  }

  if (result.meaningfulPairwiseComparisons > 0) {
    labels.push(
      `${result.meaningfulPairwiseComparisons} direct ranking ${result.meaningfulPairwiseComparisons === 1 ? "comparison" : "comparisons"}`,
    );
  }

  return labels.join(" · ");
}

export function buildCatalogRecommendationView(
  resultView: CatalogResultView,
): CatalogRecommendationView {
  const inferenceOnly: CatalogRecommendationCandidate[] = [];
  const inferredWithDirectEvidence: CatalogInferredDirectMatch[] = [];
  const suppressed: CatalogSuppressedRecommendation[] = [];

  for (const result of resultView.items) {
    const inferred = result.inferred;
    if (!inferred) continue;

    if (isRecommendationSuppressionState(result.explicitState)) {
      suppressed.push({
        result,
        affinity: inferred.affinity,
        coverage: inferred.coverage,
        suppressionState: result.explicitState,
        suppressionLabel:
          `Suppressed by explicit ${catalogPreferenceLabels[result.explicitState]}`,
      });
      continue;
    }

    if (hasIndependentDirectEvidence(result)) {
      inferredWithDirectEvidence.push({
        result,
        affinity: inferred.affinity,
        coverage: inferred.coverage,
        directEvidenceLabel: directEvidenceLabel(result),
      });
      continue;
    }

    inferenceOnly.push({
      result,
      affinity: inferred.affinity,
      coverage: inferred.coverage,
      recommendationLabel: "May be worth exploring",
    });
  }

  inferenceOnly.sort(compareInferenceStrength);
  inferredWithDirectEvidence.sort(compareInferenceStrength);
  suppressed.sort(compareInferenceStrength);

  return {
    inferenceOnly,
    inferredWithDirectEvidence,
    suppressed,
  };
}

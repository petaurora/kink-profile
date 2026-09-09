import type { CatalogResultView } from "./catalogResults";

export type SceneProfileReadinessState =
  | "unprofiled"
  | "emerging"
  | "ready";

export type SceneProfileReadiness = {
  state: SceneProfileReadinessState;
  directEvidenceCount: number;
  inferredEvidenceCount: number;
};

const READY_DIRECT_EVIDENCE_COUNT = 5;

export function getSceneProfileReadiness(
  resultView: CatalogResultView,
): SceneProfileReadiness {
  let directEvidenceCount = 0;
  let inferredEvidenceCount = 0;

  for (const result of resultView.items) {
    if (
      result.explicitState !== undefined ||
      result.meaningfulPairwiseComparisons > 0 ||
      result.categoryRank !== undefined ||
      result.overallRank !== undefined
    ) {
      directEvidenceCount += 1;
    }

    if (result.inferred !== undefined) {
      inferredEvidenceCount += 1;
    }
  }

  return {
    state:
      directEvidenceCount === 0 && inferredEvidenceCount === 0
        ? "unprofiled"
        : directEvidenceCount < READY_DIRECT_EVIDENCE_COUNT
          ? "emerging"
          : "ready",
    directEvidenceCount,
    inferredEvidenceCount,
  };
}

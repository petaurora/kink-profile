import {
  type CatalogPreferenceState,
} from "./catalogProfile";
import type {
  CatalogRankContext,
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";

export type TopInterestEvidenceSource = "explicit" | "pairwise";

export type ProfileTopInterest = {
  catalogId: string;
  label: string;
  categoryId: string;
  aggregateScore: number;
  sourceCount: number;
  explicitState?: CatalogPreferenceState;
  overallRank?: CatalogRankContext;
  sources: readonly TopInterestEvidenceSource[];
};

const explicitPositiveScore: Partial<
  Record<CatalogPreferenceState, number>
> = {
  love: 100,
  like: 82,
  curious: 65,
};

const excludedExplicitStates = new Set<CatalogPreferenceState>([
  "hard_limit",
  "not_interested",
  "not_applicable",
]);

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function pairwisePlacementScores(items: readonly CatalogResultItem[]) {
  const ranked = items
    .filter(
      (
        item,
      ): item is CatalogResultItem & {
        overallRank: CatalogRankContext;
      } => item.overallRank !== undefined,
    )
    .slice()
    .sort(
      (left, right) =>
        left.overallRank.rank - right.overallRank.rank ||
        right.overallRank.confidence - left.overallRank.confidence ||
        left.item.label.localeCompare(right.item.label),
    );

  const scores = new Map<string, number>();
  const denominator = Math.max(1, ranked.length - 1);

  ranked.forEach((item, index) => {
    const percentile = ranked.length === 1 ? 1 : 1 - index / denominator;
    scores.set(item.item.id, round1(55 + percentile * 45));
  });

  return scores;
}

function buildCandidate(
  result: CatalogResultItem,
  pairwiseScore: number | undefined,
): ProfileTopInterest | null {
  if (
    result.explicitState !== undefined &&
    excludedExplicitStates.has(result.explicitState)
  ) {
    return null;
  }

  const explicitScore =
    result.explicitState === undefined
      ? undefined
      : explicitPositiveScore[result.explicitState];

  const hasExplicit = explicitScore !== undefined;
  const hasPairwise =
    pairwiseScore !== undefined && result.overallRank !== undefined;

  if (!hasExplicit && !hasPairwise) return null;

  let weightedTotal = 0;
  let totalWeight = 0;

  if (hasExplicit) {
    weightedTotal += explicitScore;
    totalWeight += 1;
  }

  if (hasPairwise) {
    const pairwiseWeight =
      0.65 + 0.35 * Math.max(0, Math.min(1, result.overallRank!.confidence));
    weightedTotal += pairwiseScore * pairwiseWeight;
    totalWeight += pairwiseWeight;
  }

  const sources: TopInterestEvidenceSource[] = [];
  if (hasExplicit) sources.push("explicit");
  if (hasPairwise) sources.push("pairwise");

  return {
    catalogId: result.item.id,
    label: result.item.label,
    categoryId: result.item.categoryId,
    aggregateScore: round1(weightedTotal / totalWeight),
    sourceCount: sources.length,
    explicitState: hasExplicit ? result.explicitState : undefined,
    overallRank: hasPairwise ? result.overallRank : undefined,
    sources,
  };
}

/**
 * Build the concrete profile-level Top Overall list from direct user evidence.
 *
 * This selector intentionally consumes only:
 * - positive explicit overall catalog states (Love / Like / Curious)
 * - active Overall This-or-That rank context
 *
 * Quiz-derived/inferred affinity is not read at all and therefore cannot place
 * an item into Top Overall by itself.
 *
 * Explicit state and pairwise rank remain independent source values. The
 * aggregateScore is presentation-only ordering metadata and is never written
 * back into either source.
 */
export function buildProfileTopInterests(
  resultView: CatalogResultView,
  limit = 10,
): ProfileTopInterest[] {
  const pairwiseScores = pairwisePlacementScores(resultView.items);

  return resultView.items
    .flatMap((result) => {
      const candidate = buildCandidate(
        result,
        pairwiseScores.get(result.item.id),
      );
      return candidate ? [candidate] : [];
    })
    .sort((left, right) => {
      if (right.aggregateScore !== left.aggregateScore) {
        return right.aggregateScore - left.aggregateScore;
      }

      if (right.sourceCount !== left.sourceCount) {
        return right.sourceCount - left.sourceCount;
      }

      const leftExplicit =
        left.explicitState === undefined
          ? 0
          : explicitPositiveScore[left.explicitState] ?? 0;
      const rightExplicit =
        right.explicitState === undefined
          ? 0
          : explicitPositiveScore[right.explicitState] ?? 0;
      if (rightExplicit !== leftExplicit) {
        return rightExplicit - leftExplicit;
      }

      const leftConfidence = left.overallRank?.confidence ?? 0;
      const rightConfidence = right.overallRank?.confidence ?? 0;
      if (rightConfidence !== leftConfidence) {
        return rightConfidence - leftConfidence;
      }

      const leftRank = left.overallRank?.rank ?? Number.POSITIVE_INFINITY;
      const rightRank = right.overallRank?.rank ?? Number.POSITIVE_INFINITY;
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, Math.max(0, limit));
}

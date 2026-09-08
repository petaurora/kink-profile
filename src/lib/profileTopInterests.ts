import {
  type CatalogPreferenceState,
} from "./catalogProfile";
import type {
  CatalogRankContext,
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";

export type TopInterestEvidenceSource = "explicit" | "pairwise";

export type ProfileTopInterestQuizFit = {
  affinity: number;
  coverage: number;
  multiplier: number;
};

export type ProfileTopInterest = {
  catalogId: string;
  label: string;
  categoryId: string;
  aggregateScore: number;
  directScore: number;
  sourceCount: number;
  explicitState?: CatalogPreferenceState;
  overallRank?: CatalogRankContext;
  quizFit?: ProfileTopInterestQuizFit;
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

// Presentation-only neutral priors for a direct-evidence channel that has not
// been measured for this item. Missing evidence must not behave like a perfect
// score: otherwise an unranked Love (100) outranks a Love whose real pairwise
// placement is anything below 100.
const neutralDirectScore = 50;
const explicitWeight = 1;
const minimumPairwiseWeight = 0.65;
const maximumQuizBoost = 0.1;
const minimumQuizBoostAtFullPairwiseConfidence = 0.03;

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function round4(value: number) {
  return Math.round((value + 1e-12) * 10_000) / 10_000;
}

function quizFitMultiplier(result: CatalogResultItem) {
  const inferred = result.inferred;
  if (!inferred || inferred.coverage <= 0) {
    return undefined;
  }

  const affinityStrength = Math.max(
    0,
    Math.min(1, inferred.affinity / 100),
  );
  const coverageStrength = Math.max(
    0,
    Math.min(1, inferred.coverage / 100),
  );

  // Quiz fit matters most when direct relative ranking has not been refined yet.
  // As Overall This-or-That confidence grows, the maximum quiz influence shrinks
  // from +10% toward +3%, so direct comparison evidence remains authoritative.
  const pairwiseConfidence = Math.max(
    0,
    Math.min(1, result.overallRank?.confidence ?? 0),
  );
  const maxBoost =
    maximumQuizBoost -
    (maximumQuizBoost - minimumQuizBoostAtFullPairwiseConfidence) *
      pairwiseConfidence;

  return {
    affinity: round1(inferred.affinity),
    coverage: round1(inferred.coverage),
    multiplier: round4(
      1 + maxBoost * affinityStrength * coverageStrength,
    ),
  };
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

  const pairwiseWeight = hasPairwise
    ? minimumPairwiseWeight +
      0.35 * Math.max(0, Math.min(1, result.overallRank!.confidence))
    : minimumPairwiseWeight;

  // Both direct channels always occupy an ordering slot. An unmeasured channel
  // contributes a neutral prior only to presentation ordering; it does not
  // become evidence, a stored preference, or a synthetic rank.
  const explicitOrderingScore = hasExplicit
    ? explicitScore
    : neutralDirectScore;
  const pairwiseOrderingScore = hasPairwise
    ? pairwiseScore
    : neutralDirectScore;

  const weightedTotal =
    explicitOrderingScore * explicitWeight +
    pairwiseOrderingScore * pairwiseWeight;
  const totalWeight = explicitWeight + pairwiseWeight;
  const directScore = round1(weightedTotal / totalWeight);
  const quizFit = quizFitMultiplier(result);
  const aggregateScore = round1(
    directScore * (quizFit?.multiplier ?? 1),
  );

  const sources: TopInterestEvidenceSource[] = [];
  if (hasExplicit) sources.push("explicit");
  if (hasPairwise) sources.push("pairwise");

  return {
    catalogId: result.item.id,
    label: result.item.label,
    categoryId: result.item.categoryId,
    aggregateScore,
    directScore,
    sourceCount: sources.length,
    explicitState: hasExplicit ? result.explicitState : undefined,
    overallRank: hasPairwise ? result.overallRank : undefined,
    quizFit,
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
 * Quiz-derived affinity cannot make an item eligible for Top Overall by itself.
 * Eligibility still requires positive explicit preference or active Overall
 * This-or-That evidence.
 *
 * Once an item is directly eligible, quiz-derived affinity may apply a small,
 * coverage-aware presentation multiplier. The boost is capped at +10% when
 * pairwise evidence is absent and shrinks toward +3% as Overall ranking
 * confidence approaches 100%, keeping direct comparisons authoritative.
 *
 * Explicit state and pairwise rank remain independent source values. Missing
 * direct evidence uses a neutral presentation prior instead of behaving like a
 * perfect score. The derived directScore, quiz multiplier, and aggregateScore
 * are presentation-only ordering metadata and are never written back into any
 * source.
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

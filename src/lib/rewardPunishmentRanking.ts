import {
  rewardPunishmentPrimitiveKey,
  type RewardPunishmentPrimitive,
} from "./rewardPunishmentLibrary";
import {
  getContextualUseState,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";

export type RewardPunishmentComparisonResult =
  | "left"
  | "right"
  | "equal"
  | "skip";

export type RewardPunishmentComparison = {
  id: string;
  context: RewardPunishmentContext;
  leftPrimitiveKey: string;
  rightPrimitiveKey: string;
  result: RewardPunishmentComparisonResult;
  timestamp: string;
};

export type RankedRewardPunishmentPrimitive = {
  primitive: RewardPunishmentPrimitive;
  rating: number;
  rank: number;
  comparisons: number;
  confidence: number;
};

export type RewardPunishmentRankingSnapshot = {
  context: RewardPunishmentContext;
  items: RankedRewardPunishmentPrimitive[];
  orderingComparisons: number;
  totalInteractions: number;
  confidence: number;
};

const DEFAULT_RATING = 1500;
const K_FACTOR = 32;

export function isRewardPunishmentOrderingResult(
  result: RewardPunishmentComparisonResult,
): result is "left" | "right" | "equal" {
  return result === "left" || result === "right" || result === "equal";
}

export function isRewardPunishmentRankingEligible(
  profile: RewardPunishmentProfileState,
  primitive: RewardPunishmentPrimitive,
  context: RewardPunishmentContext,
) {
  const suitability = getContextualUseState(
    profile,
    primitive.ref,
    context,
  ).suitability;
  return (
    suitability === "strong" ||
    suitability === "works" ||
    suitability === "depends"
  );
}

export function eligibleRewardPunishmentPrimitives(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  context: RewardPunishmentContext,
) {
  return primitives.filter((primitive) =>
    isRewardPunishmentRankingEligible(profile, primitive, context),
  );
}

function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

function scoreFor(
  result: RewardPunishmentComparisonResult,
  side: "left" | "right",
) {
  if (result === "equal") return 0.5;
  if (result === "left") return side === "left" ? 1 : 0;
  if (result === "right") return side === "right" ? 1 : 0;
  return null;
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("::");
}

export function calculateRewardPunishmentRanking(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  comparisons: readonly RewardPunishmentComparison[],
  context: RewardPunishmentContext,
): RewardPunishmentRankingSnapshot {
  const eligible = eligibleRewardPunishmentPrimitives(
    profile,
    primitives,
    context,
  );
  const eligibleByKey = new Map(
    eligible.map((primitive) => [
      rewardPunishmentPrimitiveKey(primitive.ref),
      primitive,
    ]),
  );
  const ratings = new Map(
    [...eligibleByKey.keys()].map((key) => [key, DEFAULT_RATING]),
  );
  const counts = new Map(
    [...eligibleByKey.keys()].map((key) => [key, 0]),
  );

  const relevant = comparisons
    .filter(
      (comparison) =>
        comparison.context === context &&
        eligibleByKey.has(comparison.leftPrimitiveKey) &&
        eligibleByKey.has(comparison.rightPrimitiveKey),
    )
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const ordering = relevant.filter((comparison) =>
    isRewardPunishmentOrderingResult(comparison.result),
  );

  for (const comparison of ordering) {
    counts.set(
      comparison.leftPrimitiveKey,
      (counts.get(comparison.leftPrimitiveKey) ?? 0) + 1,
    );
    counts.set(
      comparison.rightPrimitiveKey,
      (counts.get(comparison.rightPrimitiveKey) ?? 0) + 1,
    );

    const leftScore = scoreFor(comparison.result, "left");
    const rightScore = scoreFor(comparison.result, "right");
    if (leftScore === null || rightScore === null) continue;

    const leftRating =
      ratings.get(comparison.leftPrimitiveKey) ?? DEFAULT_RATING;
    const rightRating =
      ratings.get(comparison.rightPrimitiveKey) ?? DEFAULT_RATING;
    const leftExpected = expectedScore(leftRating, rightRating);
    const rightExpected = expectedScore(rightRating, leftRating);

    ratings.set(
      comparison.leftPrimitiveKey,
      leftRating + K_FACTOR * (leftScore - leftExpected),
    );
    ratings.set(
      comparison.rightPrimitiveKey,
      rightRating + K_FACTOR * (rightScore - rightExpected),
    );
  }

  const items = eligible
    .map((primitive) => {
      const key = rewardPunishmentPrimitiveKey(primitive.ref);
      const itemComparisons = counts.get(key) ?? 0;
      return {
        primitive,
        rating:
          Math.round((ratings.get(key) ?? DEFAULT_RATING) * 10) / 10,
        comparisons: itemComparisons,
        confidence: Math.min(1, itemComparisons / 8),
      };
    })
    .sort(
      (left, right) =>
        right.rating - left.rating ||
        right.comparisons - left.comparisons ||
        left.primitive.label.localeCompare(right.primitive.label),
    )
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const targetComparisons = Math.max(1, eligible.length * 4);
  return {
    context,
    items,
    orderingComparisons: ordering.length,
    totalInteractions: relevant.length,
    confidence: Math.min(1, ordering.length / targetComparisons),
  };
}

export function selectNextRewardPunishmentPair(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  comparisons: readonly RewardPunishmentComparison[],
  context: RewardPunishmentContext,
): [RewardPunishmentPrimitive, RewardPunishmentPrimitive] | null {
  const snapshot = calculateRewardPunishmentRanking(
    profile,
    primitives,
    comparisons,
    context,
  );
  if (snapshot.items.length < 2) return null;

  const seen = new Map<string, number>();
  for (const comparison of comparisons) {
    if (comparison.context !== context) continue;
    const key = pairKey(
      comparison.leftPrimitiveKey,
      comparison.rightPrimitiveKey,
    );
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  const candidates: Array<{
    left: RankedRewardPunishmentPrimitive;
    right: RankedRewardPunishmentPrimitive;
    score: number;
  }> = [];

  for (let leftIndex = 0; leftIndex < snapshot.items.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < snapshot.items.length;
      rightIndex += 1
    ) {
      const left = snapshot.items[leftIndex];
      const right = snapshot.items[rightIndex];
      const leftKey = rewardPunishmentPrimitiveKey(left.primitive.ref);
      const rightKey = rewardPunishmentPrimitiveKey(right.primitive.ref);
      const repeated = seen.get(pairKey(leftKey, rightKey)) ?? 0;
      const ratingDistance = Math.abs(left.rating - right.rating);
      const lowEvidence = left.comparisons + right.comparisons;
      const rankDistance = Math.abs(left.rank - right.rank);

      candidates.push({
        left,
        right,
        score:
          repeated * 1000 +
          ratingDistance * 0.8 +
          lowEvidence * 12 +
          rankDistance * 3,
      });
    }
  }

  candidates.sort(
    (left, right) =>
      left.score - right.score ||
      left.left.primitive.label.localeCompare(
        right.left.primitive.label,
      ),
  );
  const best = candidates[0];
  return best
    ? [best.left.primitive, best.right.primitive]
    : null;
}

export function rewardPunishmentRankingConfidenceLabel(
  confidence: number,
) {
  if (confidence >= 0.75) return "Highly refined";
  if (confidence >= 0.45) return "Pretty confident";
  if (confidence >= 0.2) return "Rough ranking";
  return "Just started";
}

export function historicalRewardPunishmentComparisonCount(
  comparisons: readonly RewardPunishmentComparison[],
  context: RewardPunishmentContext,
) {
  return comparisons.filter(
    (comparison) => comparison.context === context,
  ).length;
}

import type { KinkCatalogItem } from "../data/kinkCatalog.generated";

export type RankingScope =
  | { type: "category"; categoryId: string }
  | { type: "overall" };

export type ComparisonResult = "left" | "right" | "equal" | "neither" | "skip";

export type KinkComparison = {
  id: string;
  leftKinkId: string;
  rightKinkId: string;
  scope: RankingScope;
  result: ComparisonResult;
  timestamp: string;
};

export type RankedKink = KinkCatalogItem & {
  rating: number;
  rank: number;
  comparisons: number;
  confidence: number;
};

export type RankingSnapshot = {
  items: RankedKink[];
  confidence: number;
};

const DEFAULT_RATING = 1500;
const K_FACTOR = 32;

function sameScope(a: RankingScope, b: RankingScope) {
  if (a.type !== b.type) return false;
  return a.type === "overall" || (b.type === "category" && a.categoryId === b.categoryId);
}

function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function isOrderingResult(
  result: ComparisonResult,
): result is "left" | "right" | "equal" {
  return result === "left" || result === "right" || result === "equal";
}

function scoreFor(result: ComparisonResult, side: "left" | "right") {
  if (result === "equal") return 0.5;
  if (result === "left") return side === "left" ? 1 : 0;
  if (result === "right") return side === "right" ? 1 : 0;
  return null;
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("::");
}

export function calculateRanking(
  catalog: readonly KinkCatalogItem[],
  comparisons: readonly KinkComparison[],
  scope: RankingScope,
): RankingSnapshot {
  const eligible = catalog.filter((item) =>
    scope.type === "overall" ? true : item.categoryId === scope.categoryId,
  );
  const eligibleIds = new Set(eligible.map((item) => item.id));
  const ratings = new Map(eligible.map((item) => [item.id, DEFAULT_RATING]));
  const counts = new Map(eligible.map((item) => [item.id, 0]));

  const relevant = comparisons
    .filter(
      (comparison) =>
        sameScope(comparison.scope, scope) &&
        eligibleIds.has(comparison.leftKinkId) &&
        eligibleIds.has(comparison.rightKinkId),
    )
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const orderingComparisons = relevant.filter((comparison) =>
    isOrderingResult(comparison.result),
  );

  for (const comparison of orderingComparisons) {
    counts.set(
      comparison.leftKinkId,
      (counts.get(comparison.leftKinkId) ?? 0) + 1,
    );
    counts.set(
      comparison.rightKinkId,
      (counts.get(comparison.rightKinkId) ?? 0) + 1,
    );

    const leftScore = scoreFor(comparison.result, "left");
    const rightScore = scoreFor(comparison.result, "right");

    if (leftScore === null || rightScore === null) continue;

    const leftRating = ratings.get(comparison.leftKinkId) ?? DEFAULT_RATING;
    const rightRating = ratings.get(comparison.rightKinkId) ?? DEFAULT_RATING;
    const leftExpected = expectedScore(leftRating, rightRating);
    const rightExpected = expectedScore(rightRating, leftRating);

    ratings.set(
      comparison.leftKinkId,
      leftRating + K_FACTOR * (leftScore - leftExpected),
    );
    ratings.set(
      comparison.rightKinkId,
      rightRating + K_FACTOR * (rightScore - rightExpected),
    );
  }

  const items = eligible
    .map((item) => {
      const itemComparisons = counts.get(item.id) ?? 0;
      return {
        ...item,
        rating: Math.round((ratings.get(item.id) ?? DEFAULT_RATING) * 10) / 10,
        comparisons: itemComparisons,
        confidence: Math.min(1, itemComparisons / 8),
      };
    })
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        b.comparisons - a.comparisons ||
        a.label.localeCompare(b.label),
    )
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const totalComparisonTargets = Math.max(1, eligible.length * 4);
  const confidence = Math.min(
    1,
    orderingComparisons.length / totalComparisonTargets,
  );

  return { items, confidence };
}

export function selectNextPair(
  catalog: readonly KinkCatalogItem[],
  comparisons: readonly KinkComparison[],
  scope: RankingScope,
): [KinkCatalogItem, KinkCatalogItem] | null {
  const snapshot = calculateRanking(catalog, comparisons, scope);
  if (snapshot.items.length < 2) return null;

  const seen = new Map<string, number>();
  for (const comparison of comparisons) {
    if (!sameScope(comparison.scope, scope)) continue;
    const key = pairKey(comparison.leftKinkId, comparison.rightKinkId);
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  const candidates: Array<{
    left: RankedKink;
    right: RankedKink;
    score: number;
  }> = [];

  for (let i = 0; i < snapshot.items.length; i += 1) {
    for (let j = i + 1; j < snapshot.items.length; j += 1) {
      const left = snapshot.items[i];
      const right = snapshot.items[j];
      const repeated = seen.get(pairKey(left.id, right.id)) ?? 0;
      const ratingDistance = Math.abs(left.rating - right.rating);
      const lowEvidence = left.comparisons + right.comparisons;
      const rankDistance = Math.abs(left.rank - right.rank);

      const score =
        repeated * 1000 +
        ratingDistance * 0.8 +
        lowEvidence * 12 +
        rankDistance * 3;

      candidates.push({ left, right, score });
    }
  }

  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  if (!best) return null;

  return [best.left, best.right];
}

export function countOrderingComparisonsForScope(
  comparisons: readonly KinkComparison[],
  scope: RankingScope,
) {
  return comparisons.filter(
    (comparison) =>
      sameScope(comparison.scope, scope) &&
      isOrderingResult(comparison.result),
  ).length;
}

export function selectCategoryFinalists(
  catalog: readonly KinkCatalogItem[],
  comparisons: readonly KinkComparison[],
  finalistCount = 5,
) {
  const rankedCategoryIds = new Set(
    comparisons
      .filter(
        (comparison) =>
          comparison.scope.type === "category" &&
          isOrderingResult(comparison.result),
      )
      .map((comparison) =>
        comparison.scope.type === "category" ? comparison.scope.categoryId : "",
      )
      .filter(Boolean),
  );

  return [...rankedCategoryIds].flatMap((categoryId) =>
    calculateRanking(catalog, comparisons, {
      type: "category",
      categoryId,
    }).items
      .filter((item) => item.comparisons > 0)
      .slice(0, finalistCount),
  );
}

export function selectOverallCandidates(
  catalog: readonly KinkCatalogItem[],
  currentFinalists: readonly KinkCatalogItem[],
  comparisons: readonly KinkComparison[],
) {
  const candidateIds = new Set(currentFinalists.map((item) => item.id));

  for (const comparison of comparisons) {
    if (
      comparison.scope.type !== "overall" ||
      !isOrderingResult(comparison.result)
    ) {
      continue;
    }

    candidateIds.add(comparison.leftKinkId);
    candidateIds.add(comparison.rightKinkId);
  }

  return catalog.filter((item) => candidateIds.has(item.id));
}

export function confidenceLabel(confidence: number) {
  if (confidence >= 0.75) return "Highly refined";
  if (confidence >= 0.45) return "Pretty confident";
  if (confidence >= 0.2) return "Rough ranking";
  return "Just started";
}

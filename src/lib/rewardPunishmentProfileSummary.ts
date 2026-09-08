import {
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./rewardPunishmentLibrary";
import {
  getContextualUseState,
  type ContextSuitability,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import {
  buildInferredContextProposals,
  buildRewardPunishmentCategoryProfile,
} from "./rewardPunishmentInference";
import {
  calculateRewardPunishmentRanking,
  type RewardPunishmentComparison,
} from "./rewardPunishmentRanking";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import type { CatalogResultView } from "./catalogResults";

export const REWARD_PUNISHMENT_PROFILE_SUMMARY_VERSION = 1 as const;
export const REWARD_PUNISHMENT_PROFILE_RANKING_MIN_COMPARISONS = 3;
export const REWARD_PUNISHMENT_PROFILE_RANKING_MIN_COMPARED_ITEMS = 2;

export type RewardPunishmentProfileCategorySummary = {
  categoryId: string;
  label: string;
  affinity: number;
  coverage: number;
  evidenceCount: number;
};

export type RewardPunishmentProfileConfirmedItem = {
  primitiveKey: string;
  label: string;
  sourceType: "catalog" | "action";
  suitability: Extract<ContextSuitability, "strong" | "works" | "depends">;
  suitabilityLabel: string;
  categoryLabels: readonly string[];
  rank?: number;
  comparisons: number;
};

export type RewardPunishmentProfileSuggestion = {
  primitiveKey: string;
  label: string;
  sourceType: "catalog" | "action";
  band: "likely" | "possible";
  fit: number;
  confidence: number;
  categoryLabels: readonly string[];
  reason?: string;
};

export type RewardPunishmentProfileLane = {
  context: RewardPunishmentContext;
  directCount: number;
  positiveCount: number;
  rankingReady: boolean;
  rankingComparisons: number;
  heading: string;
  categories: readonly RewardPunishmentProfileCategorySummary[];
  confirmedItems: readonly RewardPunishmentProfileConfirmedItem[];
  suggestions: readonly RewardPunishmentProfileSuggestion[];
};

export type RewardPunishmentOverallProfileSummary = {
  version: typeof REWARD_PUNISHMENT_PROFILE_SUMMARY_VERSION;
  reward: RewardPunishmentProfileLane;
  punishment: RewardPunishmentProfileLane;
};

const categoryLabelById = new Map(
  rewardPunishmentCategories.map((category) => [
    category.id,
    category.label,
  ]),
);

function percent(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function positiveSuitability(
  suitability: ContextSuitability,
): suitability is Extract<
  ContextSuitability,
  "strong" | "works" | "depends"
> {
  return (
    suitability === "strong" ||
    suitability === "works" ||
    suitability === "depends"
  );
}

function suitabilityLabel(
  suitability: Extract<
    ContextSuitability,
    "strong" | "works" | "depends"
  >,
) {
  if (suitability === "strong") return "Strong";
  if (suitability === "works") return "Works";
  return "Depends";
}

function suitabilityStrength(suitability: ContextSuitability) {
  if (suitability === "strong") return 3;
  if (suitability === "works") return 2;
  if (suitability === "depends") return 1;
  return 0;
}

function categoryLabelsForPrimitive(
  primitive: RewardPunishmentPrimitive,
  limit = 2,
) {
  return primitive.contextCategories
    .slice()
    .sort(
      (left, right) =>
        right.weight - left.weight ||
        left.id.localeCompare(right.id),
    )
    .slice(0, limit)
    .map(
      (mapping) =>
        categoryLabelById.get(mapping.id) ?? mapping.id,
    );
}

function primitiveCategoryRelevance(
  primitive: RewardPunishmentPrimitive,
  categoryAffinityById: ReadonlyMap<
    string,
    { affinity: number; coverage: number }
  >,
) {
  let weighted = 0;
  let totalWeight = 0;

  for (const mapping of primitive.contextCategories) {
    const category = categoryAffinityById.get(mapping.id);
    if (!category || mapping.weight <= 0) continue;
    weighted +=
      category.affinity *
      (0.65 + category.coverage * 0.35) *
      mapping.weight;
    totalWeight += mapping.weight;
  }

  return totalWeight > 0 ? weighted / totalWeight : 0;
}

function buildLane(
  profile: RewardPunishmentProfileState,
  comparisons: readonly RewardPunishmentComparison[],
  context: RewardPunishmentContext,
  canonicalSignals: readonly CanonicalSignalResult[],
  catalogResultView: CatalogResultView,
  primitives: readonly RewardPunishmentPrimitive[],
): RewardPunishmentProfileLane {
  const categoryProfile = buildRewardPunishmentCategoryProfile(
    profile,
    context,
    primitives,
  );
  const categoryAffinityById = new Map(
    categoryProfile.map((category) => [
      category.categoryId,
      {
        affinity: category.affinity,
        coverage: category.coverage,
      },
    ]),
  );

  const categories = categoryProfile
    .filter(
      (category) =>
        category.evidenceCount > 0 && category.affinity >= 0.45,
    )
    .slice()
    .sort(
      (left, right) =>
        right.affinity * (0.65 + right.coverage * 0.35) -
          left.affinity * (0.65 + left.coverage * 0.35) ||
        right.evidenceCount - left.evidenceCount ||
        left.categoryId.localeCompare(right.categoryId),
    )
    .slice(0, 4)
    .map((category) => ({
      categoryId: category.categoryId,
      label:
        categoryLabelById.get(category.categoryId) ??
        category.categoryId,
      affinity: percent(category.affinity),
      coverage: percent(category.coverage),
      evidenceCount: category.evidenceCount,
    }));

  const ranking = calculateRewardPunishmentRanking(
    profile,
    primitives,
    comparisons,
    context,
  );
  const comparedItems = ranking.items.filter(
    (item) => item.comparisons > 0,
  );
  const rankingReady =
    ranking.orderingComparisons >=
      REWARD_PUNISHMENT_PROFILE_RANKING_MIN_COMPARISONS &&
    comparedItems.length >=
      REWARD_PUNISHMENT_PROFILE_RANKING_MIN_COMPARED_ITEMS;

  const rankByKey = new Map(
    ranking.items.map((item) => [
      rewardPunishmentPrimitiveKey(item.primitive.ref),
      item,
    ]),
  );

  let directCount = 0;
  const positive = primitives.flatMap((primitive) => {
    const state = getContextualUseState(
      profile,
      primitive.ref,
      context,
    );
    if (state.suitability !== "unset") directCount += 1;
    if (!positiveSuitability(state.suitability)) return [];

    const key = rewardPunishmentPrimitiveKey(primitive.ref);
    const ranked = rankByKey.get(key);
    return [
      {
        primitive,
        key,
        suitability: state.suitability,
        suitabilityStrength: suitabilityStrength(
          state.suitability,
        ),
        relevance: primitiveCategoryRelevance(
          primitive,
          categoryAffinityById,
        ),
        ranked,
      },
    ];
  });

  positive.sort((left, right) => {
    if (rankingReady) {
      const leftCompared = (left.ranked?.comparisons ?? 0) > 0;
      const rightCompared = (right.ranked?.comparisons ?? 0) > 0;
      if (leftCompared !== rightCompared) {
        return leftCompared ? -1 : 1;
      }
      if (leftCompared && rightCompared) {
        const rankDifference =
          (left.ranked?.rank ?? Number.MAX_SAFE_INTEGER) -
          (right.ranked?.rank ?? Number.MAX_SAFE_INTEGER);
        if (rankDifference !== 0) return rankDifference;
      }
    }

    return (
      right.suitabilityStrength - left.suitabilityStrength ||
      right.relevance - left.relevance ||
      left.primitive.label.localeCompare(right.primitive.label)
    );
  });

  const seenConfirmed = new Set<string>();
  const confirmedItems: RewardPunishmentProfileConfirmedItem[] =
    [];

  for (const item of positive) {
    if (seenConfirmed.has(item.key)) continue;
    seenConfirmed.add(item.key);

    confirmedItems.push({
      primitiveKey: item.key,
      label: item.primitive.label,
      sourceType: item.primitive.sourceType,
      suitability: item.suitability,
      suitabilityLabel: suitabilityLabel(item.suitability),
      categoryLabels: categoryLabelsForPrimitive(item.primitive),
      ...(rankingReady && (item.ranked?.comparisons ?? 0) > 0
        ? { rank: item.ranked?.rank }
        : {}),
      comparisons: item.ranked?.comparisons ?? 0,
    });

    if (confirmedItems.length >= 4) break;
  }

  const proposals = buildInferredContextProposals(
    profile,
    context,
    canonicalSignals,
    catalogResultView,
    primitives,
  );
  const primitiveByKey = new Map(
    primitives.map((primitive) => [
      rewardPunishmentPrimitiveKey(primitive.ref),
      primitive,
    ]),
  );
  const seenSuggestions = new Set<string>();
  const suggestions: RewardPunishmentProfileSuggestion[] = [];

  for (const proposal of proposals) {
    if (proposal.band === "weak") continue;
    const key = rewardPunishmentPrimitiveKey(proposal.ref);
    if (
      seenConfirmed.has(key) ||
      seenSuggestions.has(key)
    ) {
      continue;
    }

    const primitive = primitiveByKey.get(key);
    if (!primitive) continue;
    seenSuggestions.add(key);
    suggestions.push({
      primitiveKey: key,
      label: primitive.label,
      sourceType: primitive.sourceType,
      band: proposal.band,
      fit: percent(proposal.score),
      confidence: percent(proposal.confidence),
      categoryLabels: categoryLabelsForPrimitive(primitive),
      reason: proposal.reasons[0],
    });

    if (suggestions.length >= 3) break;
  }

  const contextLabel =
    context === "reward" ? "Rewards" : "Punishments";

  return {
    context,
    directCount,
    positiveCount: positive.length,
    rankingReady,
    rankingComparisons: ranking.orderingComparisons,
    heading: rankingReady
      ? `Top ${contextLabel}`
      : `Confirmed ${contextLabel.toLocaleLowerCase()}`,
    categories,
    confirmedItems,
    suggestions,
  };
}

export function buildRewardPunishmentOverallProfileSummary(
  profile: RewardPunishmentProfileState,
  comparisons: readonly RewardPunishmentComparison[],
  canonicalSignals: readonly CanonicalSignalResult[],
  catalogResultView: CatalogResultView,
  primitives: readonly RewardPunishmentPrimitive[] =
    rewardPunishmentPrimitives,
): RewardPunishmentOverallProfileSummary {
  return {
    version: REWARD_PUNISHMENT_PROFILE_SUMMARY_VERSION,
    reward: buildLane(
      profile,
      comparisons,
      "reward",
      canonicalSignals,
      catalogResultView,
      primitives,
    ),
    punishment: buildLane(
      profile,
      comparisons,
      "punishment",
      canonicalSignals,
      catalogResultView,
      primitives,
    ),
  };
}

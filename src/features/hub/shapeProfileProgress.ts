import { kinkCatalog, kinkCategories } from "../../data/kinkCatalog.generated";
import {
  getActiveKinkRankingComparisons,
  getCatalogPreference,
} from "../../lib/catalogProfile";
import {
  countOrderingComparisonsForScope,
  isOrderingResult,
} from "../../lib/kinkRanking";
import {
  calculateRewardPunishmentRanking,
} from "../../lib/rewardPunishmentRanking";
import {
  loadRewardPunishmentRankingState,
  type RewardPunishmentRankingState,
} from "../../lib/rewardPunishmentRankingStorage";
import { rewardPunishmentPrimitives } from "../../lib/rewardPunishmentLibrary";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import {
  KINK_CATEGORY_GUIDE_CHECKPOINT,
  type ShapeProfileProgress,
} from "./shapeProfileGuide";

type Snapshot = ReturnType<typeof loadCurrentProfileSnapshot>;

function percentage(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function buildShapeProfileProgress(
  snapshot: Snapshot,
  completedQuizCount: number,
  totalQuizCount: number,
  rankingState: RewardPunishmentRankingState = loadRewardPunishmentRankingState(),
): ShapeProfileProgress {
  const activeComparisons = getActiveKinkRankingComparisons(
    snapshot.catalogProfile,
  );

  const rankedCategoryCount = kinkCategories.filter((category) => {
    const choices = countOrderingComparisonsForScope(activeComparisons, {
      type: "category",
      categoryId: category.id,
    });
    return choices >= KINK_CATEGORY_GUIDE_CHECKPOINT;
  }).length;

  const overallRankingChoices = activeComparisons.filter(
    (comparison) =>
      comparison.scope.type === "overall" &&
      isOrderingResult(comparison.result),
  ).length;

  const kinkDefinedCount = Object.values(
    snapshot.catalogProfile.preferences,
  ).filter(
    (preference) => getCatalogPreference(preference, "overall") !== undefined,
  ).length;

  const rpPreferences = Object.values(
    snapshot.rewardPunishmentProfile.preferences,
  );
  const rpClassifiedCount = rpPreferences.filter(
    (preference) =>
      preference.reward.suitability !== "unset" ||
      preference.punishment.suitability !== "unset",
  ).length;

  const rewardRanking = calculateRewardPunishmentRanking(
    snapshot.rewardPunishmentProfile,
    rewardPunishmentPrimitives,
    rankingState.comparisons,
    "reward",
  );
  const punishmentRanking = calculateRewardPunishmentRanking(
    snapshot.rewardPunishmentProfile,
    rewardPunishmentPrimitives,
    rankingState.comparisons,
    "punishment",
  );

  return {
    completedQuizCount,
    totalQuizCount,
    rankedCategoryCount,
    totalCategoryCount: kinkCategories.length,
    overallRankingChoices,
    kinkDefinedPercent: percentage(kinkDefinedCount, kinkCatalog.length),
    rpClassifiedCount,
    rewardCandidateCount: rewardRanking.items.length,
    punishmentCandidateCount: punishmentRanking.items.length,
    rewardRankConfidence: rewardRanking.confidence,
    punishmentRankConfidence: punishmentRanking.confidence,
  };
}

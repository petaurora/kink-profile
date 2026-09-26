import { describe, expect, it } from "vitest";
import { catalogRoutePath } from "../catalog/catalogRouteState";
import {
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
  rankingRoute,
} from "../../app/routes";
import {
  buildShapeProfileJourney,
  KINK_CATEGORY_GUIDE_CHECKPOINT,
  KINK_DEFINITION_GUIDE_TARGET_PERCENT,
  KINK_OVERALL_GUIDE_CHECKPOINT,
  RP_RANK_GUIDE_CONFIDENCE_TARGET,
  type ShapeProfileProgress,
} from "./shapeProfileGuide";

const completeFoundation: ShapeProfileProgress = {
  completedQuizCount: 4,
  totalQuizCount: 4,
  rankedCategoryCount: 12,
  totalCategoryCount: 12,
  overallRankingChoices: KINK_OVERALL_GUIDE_CHECKPOINT,
  kinkDefinedPercent: KINK_DEFINITION_GUIDE_TARGET_PERCENT,
  rpClassifiedCount: 20,
  rewardCandidateCount: 2,
  punishmentCandidateCount: 2,
  rewardRankConfidence: RP_RANK_GUIDE_CONFIDENCE_TARGET,
  punishmentRankConfidence: RP_RANK_GUIDE_CONFIDENCE_TARGET,
};

describe("Shape Your Profile progressive guide", () => {
  it("starts with Quiz and keeps Kink/RP collapsed as future sections", () => {
    const journey = buildShapeProfileJourney({
      ...completeFoundation,
      completedQuizCount: 1,
    });

    expect(journey.sections.map((section) => section.state)).toEqual([
      "current",
      "upcoming",
      "upcoming",
    ]);
    expect(journey.sections[0].step?.title).toBe("Complete your quizzes");
  });

  it("moves through category rank, overall rank, then kink definition", () => {
    const categories = buildShapeProfileJourney({
      ...completeFoundation,
      rankedCategoryCount: 5,
    });
    expect(categories.sections[1].step?.title).toBe("Rank your categories");
    expect(categories.sections[1].step?.path).toBe(
      `${rankingRoute.path}?mode=category`,
    );

    const overall = buildShapeProfileJourney({
      ...completeFoundation,
      overallRankingChoices: KINK_OVERALL_GUIDE_CHECKPOINT - 1,
    });
    expect(overall.sections[1].step?.title).toBe(
      "Rank your overall favorites",
    );
    expect(overall.sections[1].step?.path).toBe(
      `${rankingRoute.path}?mode=overall`,
    );

    const define = buildShapeProfileJourney({
      ...completeFoundation,
      kinkDefinedPercent: KINK_DEFINITION_GUIDE_TARGET_PERCENT - 1,
    });
    expect(define.sections[1].step?.title).toBe("Define your kink profile");
    expect(define.sections[1].step?.path).toBe(catalogRoutePath());
  });

  it("does not suggest R/P rank until both contextual lanes have candidates", () => {
    const journey = buildShapeProfileJourney({
      ...completeFoundation,
      rewardCandidateCount: 2,
      punishmentCandidateCount: 1,
    });

    expect(journey.sections[2].step?.title).toBe("Sort what fits");
    expect(journey.sections[2].step?.path).toBe(
      `${catalogRewardsRoute.path}?view=sorter`,
    );
  });

  it("moves through reward rank and punishment rank, then completes the foundation", () => {
    const rewardRank = buildShapeProfileJourney({
      ...completeFoundation,
      rewardRankConfidence: RP_RANK_GUIDE_CONFIDENCE_TARGET - 0.01,
      punishmentRankConfidence: 0,
    });
    expect(rewardRank.sections[2].step?.title).toBe("Rank your rewards");
    expect(rewardRank.sections[2].step?.path).toBe(
      `${catalogRewardsRankingRoute.path}?context=reward`,
    );

    const punishmentRank = buildShapeProfileJourney({
      ...completeFoundation,
      punishmentRankConfidence: RP_RANK_GUIDE_CONFIDENCE_TARGET - 0.01,
    });
    expect(punishmentRank.sections[2].step?.title).toBe(
      "Rank your punishments",
    );
    expect(punishmentRank.sections[2].step?.path).toBe(
      `${catalogRewardsRankingRoute.path}?context=punishment`,
    );

    const complete = buildShapeProfileJourney(completeFoundation);
    expect(complete.complete).toBe(true);
    expect(complete.sections.map((section) => section.state)).toEqual([
      "complete",
      "complete",
      "complete",
    ]);
    expect(complete.sections[2].summary).toBe("Fit + rankings established");
    expect(complete.sections[2].step).toBeUndefined();
  });

  it("uses the existing 25-choice category checkpoint", () => {
    expect(KINK_CATEGORY_GUIDE_CHECKPOINT).toBe(25);
  });
});

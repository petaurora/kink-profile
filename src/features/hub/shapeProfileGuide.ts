import {
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
  quizHomeRoute,
  rankingRoute,
} from "../../app/routes";
import { catalogRoutePath } from "../catalog/catalogRouteState";

export const KINK_CATEGORY_GUIDE_CHECKPOINT = 25;
export const KINK_OVERALL_GUIDE_CHECKPOINT = 25;
export const KINK_DEFINITION_GUIDE_TARGET_PERCENT = 25;
export const RP_RANK_GUIDE_CONFIDENCE_TARGET = 0.2;
export const RP_RANK_MINIMUM_CANDIDATES = 2;

export type ShapeProfileSectionId = "quiz" | "kink" | "rp";
export type ShapeProfileSectionState = "current" | "complete" | "upcoming";

export type ShapeProfileProgress = {
  completedQuizCount: number;
  totalQuizCount: number;
  rankedCategoryCount: number;
  totalCategoryCount: number;
  overallRankingChoices: number;
  kinkDefinedPercent: number;
  rpClassifiedCount: number;
  rewardCandidateCount: number;
  punishmentCandidateCount: number;
  rewardRankConfidence: number;
  punishmentRankConfidence: number;
};

export type ShapeProfileCurrentStep = {
  title: string;
  detail: string;
  progress: number | null;
  progressLabel: string;
  path: string;
  actionLabel: string;
  trail?: string;
};

export type ShapeProfileSection = {
  id: ShapeProfileSectionId;
  label: string;
  state: ShapeProfileSectionState;
  summary: string;
  step?: ShapeProfileCurrentStep;
};

export type ShapeProfileJourney = {
  complete: boolean;
  sections: readonly ShapeProfileSection[];
};

function ratio(value: number, target: number) {
  if (target <= 0) return 1;
  return Math.min(1, Math.max(0, value / target));
}

function percent(value: number) {
  return Math.round(Math.min(1, Math.max(0, value)) * 100);
}

export function buildShapeProfileJourney(
  progress: ShapeProfileProgress,
): ShapeProfileJourney {
  const quizzesComplete =
    progress.totalQuizCount > 0 &&
    progress.completedQuizCount >= progress.totalQuizCount;
  const categoriesComplete =
    progress.totalCategoryCount > 0 &&
    progress.rankedCategoryCount >= progress.totalCategoryCount;
  const overallReady =
    progress.overallRankingChoices >= KINK_OVERALL_GUIDE_CHECKPOINT;
  const kinkDefinitionReady =
    progress.kinkDefinedPercent >= KINK_DEFINITION_GUIDE_TARGET_PERCENT;
  const kinkFoundationReady =
    categoriesComplete && overallReady && kinkDefinitionReady;

  const rpFitReady =
    progress.rewardCandidateCount >= RP_RANK_MINIMUM_CANDIDATES &&
    progress.punishmentCandidateCount >= RP_RANK_MINIMUM_CANDIDATES;
  const rewardRankReady =
    progress.rewardRankConfidence >= RP_RANK_GUIDE_CONFIDENCE_TARGET;
  const punishmentRankReady =
    progress.punishmentRankConfidence >= RP_RANK_GUIDE_CONFIDENCE_TARGET;

  let quizSection: ShapeProfileSection;
  let kinkSection: ShapeProfileSection;
  let rpSection: ShapeProfileSection;

  if (!quizzesComplete) {
    quizSection = {
      id: "quiz",
      label: "Quiz",
      state: "current",
      summary: `${progress.completedQuizCount}/${progress.totalQuizCount} complete`,
      step: {
        title: "Complete your quizzes",
        detail:
          "Start broad. These give the rest of the profile an initial shape to work from.",
        progress: ratio(progress.completedQuizCount, progress.totalQuizCount),
        progressLabel: `${progress.completedQuizCount} of ${progress.totalQuizCount} quizzes complete`,
        path: quizHomeRoute.path,
        actionLabel:
          progress.completedQuizCount > 0 ? "Continue quizzes" : "Start quizzes",
      },
    };
    kinkSection = {
      id: "kink",
      label: "Kink",
      state: "upcoming",
      summary: "Ranking comes next",
    };
    rpSection = {
      id: "rp",
      label: "Rewards & Punishments",
      state: "upcoming",
      summary: "Later",
    };
    return { complete: false, sections: [quizSection, kinkSection, rpSection] };
  }

  quizSection = {
    id: "quiz",
    label: "Quiz",
    state: "complete",
    summary: `${progress.completedQuizCount}/${progress.totalQuizCount} complete`,
  };

  if (!categoriesComplete) {
    kinkSection = {
      id: "kink",
      label: "Kink",
      state: "current",
      summary: "Rank categories",
      step: {
        title: "Rank your categories",
        detail:
          "Give every category a first ranking pass before comparing favorites across the whole catalog.",
        progress: ratio(progress.rankedCategoryCount, progress.totalCategoryCount),
        progressLabel: `${progress.rankedCategoryCount} of ${progress.totalCategoryCount} categories at the ${KINK_CATEGORY_GUIDE_CHECKPOINT}-choice checkpoint`,
        path: `${rankingRoute.path}?mode=category`,
        actionLabel: "Continue category ranking",
        trail: "Up next: overall ranking",
      },
    };
  } else if (!overallReady) {
    kinkSection = {
      id: "kink",
      label: "Kink",
      state: "current",
      summary: "Rank overall",
      step: {
        title: "Rank your overall favorites",
        detail:
          "Your category finalists are ready. Now compare them across categories.",
        progress: ratio(
          progress.overallRankingChoices,
          KINK_OVERALL_GUIDE_CHECKPOINT,
        ),
        progressLabel: `${Math.min(
          progress.overallRankingChoices,
          KINK_OVERALL_GUIDE_CHECKPOINT,
        )} of ${KINK_OVERALL_GUIDE_CHECKPOINT} first-pass choices`,
        path: `${rankingRoute.path}?mode=overall`,
        actionLabel: "Continue overall ranking",
        trail: "Categories ✓ · Up next: define",
      },
    };
  } else if (!kinkDefinitionReady) {
    kinkSection = {
      id: "kink",
      label: "Kink",
      state: "current",
      summary: "Browse & define",
      step: {
        title: "Define your kink profile",
        detail:
          "Add the preferences and boundaries ranking cannot infer. You can keep refining forever; 25% is just the handoff point for the next suggestion.",
        progress: ratio(
          progress.kinkDefinedPercent,
          KINK_DEFINITION_GUIDE_TARGET_PERCENT,
        ),
        progressLabel: `${progress.kinkDefinedPercent}% defined · R/P becomes suggested at ${KINK_DEFINITION_GUIDE_TARGET_PERCENT}%`,
        path: catalogRoutePath(),
        actionLabel: "Browse & define",
        trail: "Categories ✓ · Overall ✓",
      },
    };
  } else {
    kinkSection = {
      id: "kink",
      label: "Kink",
      state: "complete",
      summary: `Ranked · ${progress.kinkDefinedPercent}% defined`,
    };
  }

  if (!kinkFoundationReady) {
    rpSection = {
      id: "rp",
      label: "Rewards & Punishments",
      state: "upcoming",
      summary: "After your kink foundation",
    };
    return { complete: false, sections: [quizSection, kinkSection, rpSection] };
  }

  if (!rpFitReady) {
    const readyCandidates =
      Math.min(progress.rewardCandidateCount, RP_RANK_MINIMUM_CANDIDATES) +
      Math.min(progress.punishmentCandidateCount, RP_RANK_MINIMUM_CANDIDATES);
    rpSection = {
      id: "rp",
      label: "Rewards & Punishments",
      state: "current",
      summary: "Sort contextual fit",
      step: {
        title: "Sort what fits",
        detail:
          "Decide what works as a reward, punishment, both, or neither. Ranking needs at least two positive candidates in each lane.",
        progress: ratio(readyCandidates, RP_RANK_MINIMUM_CANDIDATES * 2),
        progressLabel: `${progress.rpClassifiedCount} classified · ${progress.rewardCandidateCount} reward / ${progress.punishmentCandidateCount} punishment candidates`,
        path: `${catalogRewardsRoute.path}?view=sorter`,
        actionLabel: "Continue sorting",
        trail: "Up next: contextual ranking",
      },
    };
  } else if (!rewardRankReady) {
    rpSection = {
      id: "rp",
      label: "Rewards & Punishments",
      state: "current",
      summary: "Rank rewards",
      step: {
        title: "Rank your rewards",
        detail:
          "Compare the reward candidates that survived sorting. A rough ranking is enough to move the guide forward.",
        progress: ratio(
          progress.rewardRankConfidence,
          RP_RANK_GUIDE_CONFIDENCE_TARGET,
        ),
        progressLabel: `${percent(progress.rewardRankConfidence)}% confidence · first target ${percent(RP_RANK_GUIDE_CONFIDENCE_TARGET)}%`,
        path: `${catalogRewardsRankingRoute.path}?context=reward`,
        actionLabel: "Rank rewards",
        trail: "Fit ✓ · Punishments next",
      },
    };
  } else if (!punishmentRankReady) {
    rpSection = {
      id: "rp",
      label: "Rewards & Punishments",
      state: "current",
      summary: "Rank punishments",
      step: {
        title: "Rank your punishments",
        detail:
          "Now build the separate punishment ordering from the candidates that fit that context.",
        progress: ratio(
          progress.punishmentRankConfidence,
          RP_RANK_GUIDE_CONFIDENCE_TARGET,
        ),
        progressLabel: `${percent(progress.punishmentRankConfidence)}% confidence · first target ${percent(RP_RANK_GUIDE_CONFIDENCE_TARGET)}%`,
        path: `${catalogRewardsRankingRoute.path}?context=punishment`,
        actionLabel: "Rank punishments",
        trail: "Fit ✓ · Rewards ✓",
      },
    };
  } else {
    rpSection = {
      id: "rp",
      label: "Rewards & Punishments",
      state: "complete",
      summary: "Fit + rankings established",
    };
  }

  return {
    complete: rpSection.state === "complete",
    sections: [quizSection, kinkSection, rpSection],
  };
}

import {
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
  catalogRoute,
  quizHomeRoute,
  rankingRoute,
} from "../../app/routes";

export type ShapeProfileStageId = "discover" | "refine" | "rewards";

export type ShapeProfileGuideStep = {
  id: string;
  number: number;
  title: string;
  detail: string;
  path: string;
};

export type ShapeProfileGuideStage = {
  id: ShapeProfileStageId;
  label: string;
  summary: string;
  steps: readonly ShapeProfileGuideStep[];
};

export const shapeProfileStages: readonly ShapeProfileGuideStage[] = [
  {
    id: "discover",
    label: "Discover",
    summary: "Start broad, then sharpen what rises to the top.",
    steps: [
      {
        id: "quizzes",
        number: 1,
        title: "Complete quizzes",
        detail: "Surface broad patterns, roles, and themes.",
        path: quizHomeRoute.path,
      },
      {
        id: "rank-categories",
        number: 2,
        title: "Rank each category",
        detail: "Compare favorites within the same kind of play.",
        path: `${rankingRoute.path}?mode=category`,
      },
      {
        id: "rank-overall",
        number: 3,
        title: "Rank overall",
        detail: "Bring the category finalists together.",
        path: `${rankingRoute.path}?mode=overall`,
      },
    ],
  },
  {
    id: "refine",
    label: "Refine",
    summary: "Add the specific details ranking cannot infer for you.",
    steps: [
      {
        id: "define-kinks",
        number: 4,
        title: "Browse & define",
        detail: "Set preferences, boundaries, and the details that matter.",
        path: catalogRoute.path,
      },
    ],
  },
  {
    id: "rewards",
    label: "Rewards & Punishments",
    summary: "Build the contextual model for what motivates and corrects.",
    steps: [
      {
        id: "review-rewards",
        number: 5,
        title: "Review what fits",
        detail: "Sort what works as a reward, punishment, both, or neither.",
        path: catalogRewardsRoute.path,
      },
      {
        id: "rank-rewards",
        number: 6,
        title: "Rank them",
        detail: "Compare the options that actually fit your dynamic.",
        path: catalogRewardsRankingRoute.path,
      },
      {
        id: "define-rewards",
        number: 7,
        title: "Browse & define details",
        detail: "Refine suitability, notes, and randomizer eligibility.",
        path: catalogRewardsRoute.path,
      },
    ],
  },
];

import {
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
  catalogRoute,
  quizHomeRoute,
  rankingRoute,
} from "../../app/routes";

export type ShapeProfileGroupId =
  | "quiz"
  | "kink-rank"
  | "kink-browse"
  | "rp-fit"
  | "rp-rank"
  | "rp-browse";

export type ShapeProfileGuideStep = {
  id: string;
  number: number;
  title: string;
  detail: string;
  path: string;
};

export type ShapeProfileGuideGroup = {
  id: ShapeProfileGroupId;
  label: string;
  steps: readonly ShapeProfileGuideStep[];
};

export const shapeProfileGroups: readonly ShapeProfileGuideGroup[] = [
  {
    id: "quiz",
    label: "Quiz",
    steps: [
      {
        id: "quizzes",
        number: 1,
        title: "Complete quizzes",
        detail: "Surface broad patterns, roles, and themes.",
        path: quizHomeRoute.path,
      },
    ],
  },
  {
    id: "kink-rank",
    label: "Kink Rank",
    steps: [
      {
        id: "rank-categories",
        number: 2,
        title: "Categories",
        detail: "Compare favorites within each kink category.",
        path: `${rankingRoute.path}?mode=category`,
      },
      {
        id: "rank-overall",
        number: 3,
        title: "Overall",
        detail: "Bring the category finalists together.",
        path: `${rankingRoute.path}?mode=overall`,
      },
    ],
  },
  {
    id: "kink-browse",
    label: "Kink Browse",
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
    id: "rp-fit",
    label: "R/P Fit",
    steps: [
      {
        id: "review-rp-fit",
        number: 5,
        title: "Sort fit",
        detail: "Decide what works as a reward, punishment, both, or neither.",
        path: `${catalogRewardsRoute.path}?view=sorter`,
      },
    ],
  },
  {
    id: "rp-rank",
    label: "R/P Rank",
    steps: [
      {
        id: "rank-rewards",
        number: 6,
        title: "Rewards",
        detail: "Compare eligible rewards against each other.",
        path: `${catalogRewardsRankingRoute.path}?context=reward`,
      },
      {
        id: "rank-punishments",
        number: 7,
        title: "Punishments",
        detail: "Compare eligible punishments against each other.",
        path: `${catalogRewardsRankingRoute.path}?context=punishment`,
      },
    ],
  },
  {
    id: "rp-browse",
    label: "R/P Browse",
    steps: [
      {
        id: "define-rp",
        number: 8,
        title: "Browse & define",
        detail: "Refine suitability, notes, and randomizer eligibility.",
        path: `${catalogRewardsRoute.path}?view=details`,
      },
    ],
  },
];

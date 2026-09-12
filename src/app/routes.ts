import type { QuizId } from "../data/quizzes";

export type AppRouteId =
  | "hub"
  | "profile"
  | "quiz-home"
  | "quiz"
  | "quiz-results"
  | "catalog"
  | "ranking"
  | "catalog-rewards"
  | "catalog-rewards-ranking"
  | "catalog-legacy"
  | "ranking-legacy"
  | "rewards"
  | "scene-builder"
  | "compare"
  | "curation"
  | "settings";

export const hubRoute = { id: "hub", path: "/" } as const;
export const profileRoute = { id: "profile", path: "/profile" } as const;
export const quizHomeRoute = { id: "quiz-home", path: "/quizzes" } as const;

export const catalogRoute = { id: "catalog", path: "/catalog/kinks" } as const;
export const rankingRoute = {
  id: "ranking",
  path: "/catalog/kinks/rank",
} as const;
export const catalogRewardsRoute = {
  id: "catalog-rewards",
  path: "/catalog/rewards",
} as const;
export const catalogRewardsRankingRoute = {
  id: "catalog-rewards-ranking",
  path: "/catalog/rewards/rank",
} as const;

export const legacyCatalogRoute = {
  id: "catalog-legacy",
  path: "/catalog",
} as const;
export const legacyRankingRoute = {
  id: "ranking-legacy",
  path: "/ranking",
} as const;

// Temporary compatibility surface for the pre-M19 Rewards route. Catalog-oriented
// entry points redirect into /catalog/rewards; ?workspace=tools remains available
// until M19.4 moves Randomizer / Recipes into their dedicated Tools workspace.
export const rewardsRoute = { id: "rewards", path: "/rewards" } as const;

export const sceneBuilderRoute = {
  id: "scene-builder",
  path: "/scene-builder",
} as const;
export const compareRoute = { id: "compare", path: "/compare" } as const;
export const curationRoute = { id: "curation", path: "/curation" } as const;
export const settingsRoute = { id: "settings", path: "/settings" } as const;
export const quizRoute = {
  id: "quiz",
  path: "/quizzes/:quizId",
} as const;
export const quizResultsRoute = {
  id: "quiz-results",
  path: "/quizzes/:quizId/results",
} as const;
export const unknownRouteFallbackPath = hubRoute.path;

export function quizRoutePath(quizId: QuizId) {
  return `/quizzes/${quizId}`;
}

export function quizResultsPath(quizId: QuizId) {
  return `/quizzes/${quizId}/results`;
}

export const siteHeaderRoutePaths = {
  hub: hubRoute.path,
  profile: profileRoute.path,
  ranking: rankingRoute.path,
  catalog: catalogRoute.path,
  "rewards-punishments": catalogRewardsRoute.path,
  "scene-builder": sceneBuilderRoute.path,
  "compare-profiles": compareRoute.path,
  "curation-workbench": curationRoute.path,
} as const;

export const appRoutePatterns = [
  hubRoute,
  profileRoute,
  quizHomeRoute,
  catalogRoute,
  rankingRoute,
  catalogRewardsRoute,
  catalogRewardsRankingRoute,
  legacyCatalogRoute,
  legacyRankingRoute,
  rewardsRoute,
  sceneBuilderRoute,
  compareRoute,
  curationRoute,
  settingsRoute,
  quizRoute,
  quizResultsRoute,
] as const;

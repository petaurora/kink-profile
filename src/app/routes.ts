import type { QuizId } from "../data/quizzes";

export type AppRouteId =
  | "hub"
  | "profile"
  | "quiz"
  | "quiz-results"
  | "catalog"
  | "ranking"
  | "rewards"
  | "scene-builder"
  | "compare"
  | "curation"
  | "settings"
  | "design-lab-navigation";

export const hubRoute = { id: "hub", path: "/" } as const;
export const profileRoute = { id: "profile", path: "/profile" } as const;
export const catalogRoute = { id: "catalog", path: "/catalog" } as const;
export const rankingRoute = { id: "ranking", path: "/ranking" } as const;
export const rewardsRoute = { id: "rewards", path: "/rewards" } as const;
export const sceneBuilderRoute = {
  id: "scene-builder",
  path: "/scene-builder",
} as const;
export const compareRoute = { id: "compare", path: "/compare" } as const;
export const curationRoute = { id: "curation", path: "/curation" } as const;
export const settingsRoute = { id: "settings", path: "/settings" } as const;
export const designLabNavigationRoute = {
  id: "design-lab-navigation",
  path: "/design-lab/navigation",
} as const;
export const quizRoute = {
  id: "quiz",
  path: "/quizzes/:quizId",
} as const;
export const quizResultsRoute = {
  id: "quiz-results",
  path: "/quizzes/:quizId/results",
} as const;

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
  "rewards-punishments": rewardsRoute.path,
  "scene-builder": sceneBuilderRoute.path,
  "compare-profiles": compareRoute.path,
  "curation-workbench": curationRoute.path,
} as const;

export const appRoutePatterns = [
  hubRoute,
  profileRoute,
  catalogRoute,
  rankingRoute,
  rewardsRoute,
  sceneBuilderRoute,
  compareRoute,
  curationRoute,
  settingsRoute,
  designLabNavigationRoute,
  quizRoute,
  quizResultsRoute,
] as const;

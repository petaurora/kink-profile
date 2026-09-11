import type { Screen } from "../App";
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
  | "settings";

export type LegacyScreenRoute = {
  id: AppRouteId;
  path: string;
  screen: Screen;
};

export const hubRoute = { id: "hub", path: "/" } as const;
export const profileRoute = { id: "profile", path: "/profile" } as const;
export const catalogRoute = { id: "catalog", path: "/catalog" } as const;
export const rankingRoute = { id: "ranking", path: "/ranking" } as const;
export const settingsRoute = { id: "settings", path: "/settings" } as const;
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
  hub: "/",
  profile: profileRoute.path,
  ranking: rankingRoute.path,
  catalog: catalogRoute.path,
  "rewards-punishments": "/rewards",
  "scene-builder": "/scene-builder",
  "compare-profiles": "/compare",
  "curation-workbench": "/curation",
} as const;

export const legacyScreenRoutes: readonly LegacyScreenRoute[] = [
  { id: "rewards", path: "/rewards", screen: "rewards-punishments" },
  { id: "scene-builder", path: "/scene-builder", screen: "scene-builder" },
  { id: "compare", path: "/compare", screen: "compare-profiles" },
  { id: "curation", path: "/curation", screen: "curation-workbench" },
] as const;

export const appRoutePatterns = [
  hubRoute,
  profileRoute,
  catalogRoute,
  rankingRoute,
  settingsRoute,
  quizRoute,
  quizResultsRoute,
  ...legacyScreenRoutes.map(({ id, path }) => ({ id, path })),
] as const;

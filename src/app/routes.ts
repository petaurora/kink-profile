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
  profile: "/profile",
  ranking: "/ranking",
  catalog: "/catalog",
  "rewards-punishments": "/rewards",
  "scene-builder": "/scene-builder",
  "compare-profiles": "/compare",
  "curation-workbench": "/curation",
} as const;

export const legacyScreenRoutes: readonly LegacyScreenRoute[] = [
  { id: "profile", path: "/profile", screen: "profile" },
  { id: "catalog", path: "/catalog", screen: "catalog" },
  { id: "ranking", path: "/ranking", screen: "ranking" },
  { id: "rewards", path: "/rewards", screen: "rewards-punishments" },
  { id: "scene-builder", path: "/scene-builder", screen: "scene-builder" },
  { id: "compare", path: "/compare", screen: "compare-profiles" },
  { id: "curation", path: "/curation", screen: "curation-workbench" },
] as const;

export const appRoutePatterns = [
  hubRoute,
  settingsRoute,
  quizRoute,
  quizResultsRoute,
  ...legacyScreenRoutes.map(({ id, path }) => ({ id, path })),
] as const;

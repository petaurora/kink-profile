import type { Screen } from "../App";

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

export type ReservedRoute = {
  id: AppRouteId;
  path: string;
  owner: "M18.3";
};

export const hubRoute = { id: "hub", path: "/" } as const;
export const settingsRoute = { id: "settings", path: "/settings" } as const;

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

// Quiz paths are part of the locked route contract, but quiz selection and
// progression still live inside the legacy App state machine until M18.3.
export const reservedRoutes: readonly ReservedRoute[] = [
  { id: "quiz", path: "/quizzes/:quizId", owner: "M18.3" },
  {
    id: "quiz-results",
    path: "/quizzes/:quizId/results",
    owner: "M18.3",
  },
] as const;

export const appRoutePatterns = [
  hubRoute,
  settingsRoute,
  ...legacyScreenRoutes.map(({ id, path }) => ({ id, path })),
  ...reservedRoutes.map(({ id, path }) => ({ id, path })),
] as const;

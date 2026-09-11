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
  owner: "M18.2" | "M18.3";
};

export const legacyScreenRoutes: readonly LegacyScreenRoute[] = [
  { id: "hub", path: "/", screen: "hub" },
  { id: "profile", path: "/profile", screen: "profile" },
  { id: "catalog", path: "/catalog", screen: "catalog" },
  { id: "ranking", path: "/ranking", screen: "ranking" },
  { id: "rewards", path: "/rewards", screen: "rewards-punishments" },
  { id: "scene-builder", path: "/scene-builder", screen: "scene-builder" },
  { id: "compare", path: "/compare", screen: "compare-profiles" },
  { id: "curation", path: "/curation", screen: "curation-workbench" },
] as const;

// These paths are part of the locked route contract, but their current workflows
// still depend on custom app-level state. Their owning M18 slices will make them
// direct-entry destinations rather than letting M18.1 silently invent behavior.
export const reservedRoutes: readonly ReservedRoute[] = [
  { id: "settings", path: "/settings", owner: "M18.2" },
  { id: "quiz", path: "/quizzes/:quizId", owner: "M18.3" },
  {
    id: "quiz-results",
    path: "/quizzes/:quizId/results",
    owner: "M18.3",
  },
] as const;

export const appRoutePatterns = [
  ...legacyScreenRoutes.map(({ id, path }) => ({ id, path })),
  ...reservedRoutes.map(({ id, path }) => ({ id, path })),
] as const;

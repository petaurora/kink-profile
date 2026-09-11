import { matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  appRoutePatterns,
  catalogRoute,
  compareRoute,
  curationRoute,
  designLabNavigationRoute,
  hubRoute,
  profileRoute,
  quizResultsPath,
  quizResultsRoute,
  quizRoute,
  quizRoutePath,
  rankingRoute,
  rewardsRoute,
  sceneBuilderRoute,
  settingsRoute,
  siteHeaderRoutePaths,
} from "./routes";

const routeTable = [
  ...appRoutePatterns.map(({ id, path }) => ({ id, path })),
  { id: "not-found", path: "*" },
];

function matchedRouteId(pathname: string) {
  return matchRoutes(routeTable, pathname)?.at(-1)?.route.id;
}

describe("application route contract", () => {
  it.each([
    ["/", "hub"],
    ["/profile", "profile"],
    ["/catalog", "catalog"],
    ["/ranking", "ranking"],
    ["/rewards", "rewards"],
    ["/scene-builder", "scene-builder"],
    ["/compare", "compare"],
    ["/curation", "curation"],
    ["/settings", "settings"],
    ["/design-lab/navigation", "design-lab-navigation"],
    ["/quizzes/dominance-submission", "quiz"],
    ["/quizzes/dominance-submission/results", "quiz-results"],
  ])("matches direct entry %s", (pathname, expectedId) => {
    expect(matchedRouteId(pathname)).toBe(expectedId);
  });

  it("falls through unknown routes safely", () => {
    expect(matchedRouteId("/this-does-not-exist")).toBe("not-found");
  });

  it("defines every top-level destination as a first-class route", () => {
    expect(hubRoute).toEqual({ id: "hub", path: "/" });
    expect(profileRoute).toEqual({ id: "profile", path: "/profile" });
    expect(catalogRoute).toEqual({ id: "catalog", path: "/catalog" });
    expect(rankingRoute).toEqual({ id: "ranking", path: "/ranking" });
    expect(rewardsRoute).toEqual({ id: "rewards", path: "/rewards" });
    expect(sceneBuilderRoute).toEqual({
      id: "scene-builder",
      path: "/scene-builder",
    });
    expect(compareRoute).toEqual({ id: "compare", path: "/compare" });
    expect(curationRoute).toEqual({ id: "curation", path: "/curation" });
    expect(settingsRoute).toEqual({ id: "settings", path: "/settings" });
    expect(designLabNavigationRoute).toEqual({
      id: "design-lab-navigation",
      path: "/design-lab/navigation",
    });
    expect(quizRoute).toEqual({ id: "quiz", path: "/quizzes/:quizId" });
    expect(quizResultsRoute).toEqual({
      id: "quiz-results",
      path: "/quizzes/:quizId/results",
    });
  });

  it("builds canonical quiz URLs from quiz IDs", () => {
    expect(quizRoutePath("dominance-submission")).toBe(
      "/quizzes/dominance-submission",
    );
    expect(quizResultsPath("dominance-submission")).toBe(
      "/quizzes/dominance-submission/results",
    );
  });

  it("routes every header destination through browser navigation", () => {
    expect(siteHeaderRoutePaths).toEqual({
      hub: "/",
      profile: "/profile",
      ranking: "/ranking",
      catalog: "/catalog",
      "rewards-punishments": "/rewards",
      "scene-builder": "/scene-builder",
      "compare-profiles": "/compare",
      "curation-workbench": "/curation",
    });
  });
});

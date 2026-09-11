import { matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  appRoutePatterns,
  hubRoute,
  legacyScreenRoutes,
  reservedRoutes,
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
    ["/quizzes/dominance-submission", "quiz"],
    ["/quizzes/dominance-submission/results", "quiz-results"],
  ])("matches direct entry %s", (pathname, expectedId) => {
    expect(matchedRouteId(pathname)).toBe(expectedId);
  });

  it("falls through unknown routes safely", () => {
    expect(matchedRouteId("/this-does-not-exist")).toBe("not-found");
  });

  it("promotes Hub and Settings to first-class routed pages", () => {
    expect(hubRoute).toEqual({ id: "hub", path: "/" });
    expect(settingsRoute).toEqual({ id: "settings", path: "/settings" });
  });

  it("keeps only not-yet-migrated features behind legacy screen routes", () => {
    expect(
      Object.fromEntries(
        legacyScreenRoutes.map(({ path, screen }) => [path, screen]),
      ),
    ).toEqual({
      "/profile": "profile",
      "/catalog": "catalog",
      "/ranking": "ranking",
      "/rewards": "rewards-punishments",
      "/scene-builder": "scene-builder",
      "/compare": "compare-profiles",
      "/curation": "curation-workbench",
    });
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

  it("keeps only quiz state assigned to the next migration slice", () => {
    expect(reservedRoutes).toEqual([
      { id: "quiz", path: "/quizzes/:quizId", owner: "M18.3" },
      {
        id: "quiz-results",
        path: "/quizzes/:quizId/results",
        owner: "M18.3",
      },
    ]);
  });
});

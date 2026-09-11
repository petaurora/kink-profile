import { matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  appRoutePatterns,
  legacyScreenRoutes,
  reservedRoutes,
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

  it("keeps legacy screen routes explicit during incremental migration", () => {
    expect(
      Object.fromEntries(
        legacyScreenRoutes.map(({ path, screen }) => [path, screen]),
      ),
    ).toEqual({
      "/": "hub",
      "/profile": "profile",
      "/catalog": "catalog",
      "/ranking": "ranking",
      "/rewards": "rewards-punishments",
      "/scene-builder": "scene-builder",
      "/compare": "compare-profiles",
      "/curation": "curation-workbench",
    });
  });

  it("keeps state-dependent routes assigned to their owning migration slice", () => {
    expect(reservedRoutes).toEqual([
      { id: "settings", path: "/settings", owner: "M18.2" },
      { id: "quiz", path: "/quizzes/:quizId", owner: "M18.3" },
      {
        id: "quiz-results",
        path: "/quizzes/:quizId/results",
        owner: "M18.3",
      },
    ]);
  });
});

import { createMemoryRouter, matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  appRoutePatterns,
  catalogRewardsRankingRoute,
  catalogRewardsRoute,
  catalogRoute,
  compareRoute,
  curationRoute,
  hubRoute,
  legacyCatalogRoute,
  legacyRankingRoute,
  profileRoute,
  quizHomeRoute,
  quizResultsPath,
  quizResultsRoute,
  quizRoute,
  quizRoutePath,
  rankingRoute,
  rewardsRoute,
  sceneBuilderRoute,
  settingsRoute,
  siteHeaderRoutePaths,
  unknownRouteFallbackPath,
} from "./routes";

const routeTable = [
  ...appRoutePatterns.map(({ id, path }) => ({ id, path })),
  { id: "not-found", path: "*" },
];

function matchedRouteId(pathname: string) {
  return matchRoutes(routeTable, pathname)?.at(-1)?.route.id;
}

function createRouteTestRouter(initialEntry: string) {
  return createMemoryRouter(routeTable, { initialEntries: [initialEntry] });
}

describe("application route contract", () => {
  it.each([
    ["/", "hub"],
    ["/profile", "profile"],
    ["/quizzes", "quiz-home"],
    ["/catalog/kinks", "catalog"],
    ["/catalog/kinks/rank", "ranking"],
    ["/catalog/rewards", "catalog-rewards"],
    ["/catalog/rewards/rank", "catalog-rewards-ranking"],
    ["/catalog", "catalog-legacy"],
    ["/ranking", "ranking-legacy"],
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

  it("recreates a direct route from URL state as refresh would", () => {
    const router = createRouteTestRouter("/catalog/kinks?category=impact");

    expect(router.state.location.pathname).toBe("/catalog/kinks");
    expect(router.state.location.search).toBe("?category=impact");

    router.dispose();
  });

  it("recreates Quiz Home from direct route state", () => {
    const router = createRouteTestRouter("/quizzes");

    expect(router.state.location.pathname).toBe("/quizzes");
    expect(router.state.location.search).toBe("");

    router.dispose();
  });

  it("preserves Back and Forward history across routed navigation", async () => {
    const router = createRouteTestRouter("/");

    await router.navigate("/profile");
    await router.navigate("/catalog/kinks/rank");
    expect(router.state.location.pathname).toBe("/catalog/kinks/rank");

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe("/profile");

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe("/");

    await router.navigate(1);
    expect(router.state.location.pathname).toBe("/profile");

    await router.navigate(1);
    expect(router.state.location.pathname).toBe("/catalog/kinks/rank");

    router.dispose();
  });

  it("preserves Catalog workspace history between Browse and Rank", async () => {
    const router = createRouteTestRouter("/catalog/kinks");

    await router.navigate("/catalog/kinks/rank");
    expect(router.state.location.pathname).toBe("/catalog/kinks/rank");

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe("/catalog/kinks");

    await router.navigate("/catalog/rewards");
    await router.navigate("/catalog/rewards/rank");
    expect(router.state.location.pathname).toBe("/catalog/rewards/rank");

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe("/catalog/rewards");

    router.dispose();
  });

  it("preserves Quiz Home in history before an individual quiz", async () => {
    const router = createRouteTestRouter("/");

    await router.navigate("/quizzes");
    await router.navigate("/quizzes/dominance-submission");
    expect(router.state.location.pathname).toBe(
      "/quizzes/dominance-submission",
    );

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe("/quizzes");

    router.dispose();
  });

  it("falls through unknown routes to the canonical hub fallback", () => {
    expect(matchedRouteId("/this-does-not-exist")).toBe("not-found");
    expect(unknownRouteFallbackPath).toBe("/");
  });

  it("defines Catalog workspaces and compatibility routes explicitly", () => {
    expect(catalogRoute).toEqual({ id: "catalog", path: "/catalog/kinks" });
    expect(rankingRoute).toEqual({
      id: "ranking",
      path: "/catalog/kinks/rank",
    });
    expect(catalogRewardsRoute).toEqual({
      id: "catalog-rewards",
      path: "/catalog/rewards",
    });
    expect(catalogRewardsRankingRoute).toEqual({
      id: "catalog-rewards-ranking",
      path: "/catalog/rewards/rank",
    });
    expect(legacyCatalogRoute).toEqual({
      id: "catalog-legacy",
      path: "/catalog",
    });
    expect(legacyRankingRoute).toEqual({
      id: "ranking-legacy",
      path: "/ranking",
    });
    expect(rewardsRoute).toEqual({ id: "rewards", path: "/rewards" });
  });

  it("defines the remaining top-level destinations as first-class routes", () => {
    expect(hubRoute).toEqual({ id: "hub", path: "/" });
    expect(profileRoute).toEqual({ id: "profile", path: "/profile" });
    expect(quizHomeRoute).toEqual({ id: "quiz-home", path: "/quizzes" });
    expect(sceneBuilderRoute).toEqual({
      id: "scene-builder",
      path: "/scene-builder",
    });
    expect(compareRoute).toEqual({ id: "compare", path: "/compare" });
    expect(curationRoute).toEqual({ id: "curation", path: "/curation" });
    expect(settingsRoute).toEqual({ id: "settings", path: "/settings" });
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

  it("routes legacy header destinations into Catalog workspaces", () => {
    expect(siteHeaderRoutePaths).toEqual({
      hub: "/",
      profile: "/profile",
      ranking: "/catalog/kinks/rank",
      catalog: "/catalog/kinks",
      "rewards-punishments": "/catalog/rewards",
      "scene-builder": "/scene-builder",
      "compare-profiles": "/compare",
      "curation-workbench": "/curation",
    });
  });
});

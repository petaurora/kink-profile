import { describe, expect, it } from "vitest";
import { desktopNavigationStateForLocation } from "./desktopNavigation";
import { primaryDestinationForLocation } from "./mobilePrimaryNavigation";

describe("primary navigation parity", () => {
  it.each([
    ["/", ""],
    ["/quizzes", ""],
    ["/quizzes/dominance-submission", ""],
    ["/quizzes/dominance-submission/results", ""],
    ["/profile", ""],
    ["/settings", ""],
    ["/catalog", ""],
    ["/ranking", ""],
    ["/catalog/kinks", ""],
    ["/catalog/kinks/rank", ""],
    ["/catalog/rewards", ""],
    ["/catalog/rewards/rank", ""],
    ["/rewards", ""],
    ["/rewards", "?workspace=catalog"],
    ["/rewards", "?workspace=tools"],
    ["/scene-builder", ""],
    ["/tools/rewards/randomizer", ""],
    ["/tools/rewards/recipes", ""],
    ["/compare", ""],
  ])("maps %s%s to the same primary destination", (pathname, search) => {
    expect(desktopNavigationStateForLocation(pathname, search).primary).toBe(
      primaryDestinationForLocation(pathname, search),
    );
  });

  it("keeps Curation outside both ordinary navigation systems", () => {
    expect(primaryDestinationForLocation("/curation")).toBeNull();
    expect(desktopNavigationStateForLocation("/curation")).toMatchObject({
      primary: null,
      visible: false,
    });
  });
});

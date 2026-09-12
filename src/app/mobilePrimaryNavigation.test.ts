import { describe, expect, it } from "vitest";
import {
  primaryDestinationForLocation,
  shouldShowMobilePrimaryNavigation,
} from "./mobilePrimaryNavigation";

describe("mobile primary navigation", () => {
  it.each([
    ["/", "", "hub"],
    ["/profile", "", "profile"],
    ["/settings", "", "profile"],
    ["/catalog", "", "catalog"],
    ["/ranking", "", "catalog"],
    ["/catalog/kinks", "", "catalog"],
    ["/catalog/kinks/rank", "", "catalog"],
    ["/catalog/rewards", "", "catalog"],
    ["/catalog/rewards/rank", "", "catalog"],
    ["/rewards", "", "catalog"],
    ["/rewards", "?workspace=catalog", "catalog"],
    ["/rewards", "?workspace=tools", "tools"],
    ["/tools/rewards/randomizer", "", "tools"],
    ["/tools/rewards/recipes", "", "tools"],
    ["/scene-builder", "", "tools"],
    ["/compare", "", "tools"],
    ["/quizzes", "", "quiz"],
    ["/quizzes/dominance-submission", "", "quiz"],
    ["/quizzes/dominance-submission/results", "", "quiz"],
  ])("maps %s%s to %s", (pathname, search, expected) => {
    expect(primaryDestinationForLocation(pathname, search)).toBe(expected);
  });

  it("leaves internal curation outside normal primary navigation", () => {
    expect(primaryDestinationForLocation("/curation")).toBeNull();
    expect(shouldShowMobilePrimaryNavigation("/curation")).toBe(false);
  });

  it("shows primary navigation on normal user routes", () => {
    expect(shouldShowMobilePrimaryNavigation("/profile")).toBe(true);
  });
});

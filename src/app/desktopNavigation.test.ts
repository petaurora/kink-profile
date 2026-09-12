import { describe, expect, it } from "vitest";
import { desktopNavigationStateForLocation } from "./desktopNavigation";

describe("desktop navigation state", () => {
  it.each([
    ["/", "", "hub", null, null],
    ["/quizzes", "", "quiz", null, null],
    ["/catalog/kinks", "", "catalog", "kinks", null],
    ["/catalog/kinks/rank", "", "catalog", "kinks", null],
    ["/catalog/rewards", "", "catalog", "rewards", null],
    ["/catalog/rewards/rank", "", "catalog", "rewards", null],
    ["/profile", "", "profile", null, null],
    ["/settings", "", "profile", null, null],
    ["/scene-builder", "", "tools", null, "scenes"],
    ["/tools/rewards/randomizer", "", "tools", null, "rewards"],
    ["/tools/rewards/recipes", "", "tools", null, "rewards"],
    ["/compare", "", "tools", null, "compare"],
  ])(
    "maps %s%s into desktop hierarchy",
    (pathname, search, primary, catalogWorkspace, toolsWorkspace) => {
      expect(desktopNavigationStateForLocation(pathname, search)).toMatchObject({
        primary,
        catalogWorkspace,
        toolsWorkspace,
      });
    },
  );

  it("treats Settings as Profile-owned while highlighting Settings itself", () => {
    expect(desktopNavigationStateForLocation("/settings")).toMatchObject({
      primary: "profile",
      settingsActive: true,
      visible: true,
    });
  });

  it("keeps internal Curation outside ordinary desktop navigation", () => {
    expect(desktopNavigationStateForLocation("/curation")).toMatchObject({
      primary: null,
      settingsActive: false,
      visible: false,
    });
  });
});

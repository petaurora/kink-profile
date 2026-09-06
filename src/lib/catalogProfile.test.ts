import { describe, expect, it } from "vitest";
import {
  clearCatalogPreference,
  createEmptyCatalogProfileState,
  filterEligibleCatalogItems,
  getCatalogPreference,
  isExcludedCatalogState,
  setCatalogPreference,
} from "./catalogProfile";
import { selectCategoryFinalists, type KinkComparison } from "./kinkRanking";

describe("catalog preference semantics", () => {
  it("treats unanswered as absence", () => {
    expect(getCatalogPreference(undefined, "overall")).toBeUndefined();
  });

  it("resolves directional overrides before overall", () => {
    const preference = {
      overall: "like" as const,
      receiving: "hard_limit" as const,
      giving: "love" as const,
      updatedAt: "2026-09-06T00:00:00.000Z",
    };

    expect(getCatalogPreference(preference, "overall")).toBe("like");
    expect(getCatalogPreference(preference, "receiving")).toBe("hard_limit");
    expect(getCatalogPreference(preference, "giving")).toBe("love");
  });

  it("falls back from a missing directional override to overall", () => {
    const preference = {
      overall: "curious" as const,
      updatedAt: "2026-09-06T00:00:00.000Z",
    };

    expect(getCatalogPreference(preference, "receiving")).toBe("curious");
    expect(getCatalogPreference(preference, "giving")).toBe("curious");
  });

  it("never synthesizes an overall state from directional values", () => {
    const preference = {
      receiving: "like" as const,
      giving: "love" as const,
      updatedAt: "2026-09-06T00:00:00.000Z",
    };

    expect(getCatalogPreference(preference, "overall")).toBeUndefined();
  });

  it("recognizes exactly the explicit exclusion states", () => {
    expect(isExcludedCatalogState("hard_limit")).toBe(true);
    expect(isExcludedCatalogState("not_interested")).toBe(true);
    expect(isExcludedCatalogState("not_applicable")).toBe(true);

    for (const state of ["love", "like", "curious", "unsure"] as const) {
      expect(isExcludedCatalogState(state)).toBe(false);
    }
    expect(isExcludedCatalogState(undefined)).toBe(false);
  });

  it("clears the final value by removing the preference record", () => {
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "rope-bondage",
      "overall",
      "like",
      "2026-09-06T00:00:00.000Z",
    );

    profile = clearCatalogPreference(
      profile,
      "rope-bondage",
      "overall",
      "2026-09-06T00:01:00.000Z",
    );

    expect(profile.preferences["rope-bondage"]).toBeUndefined();
  });

  it("keeps remaining directional state when clearing overall", () => {
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "rope-bondage",
      "receiving",
      "hard_limit",
      "2026-09-06T00:00:00.000Z",
    );
    profile = setCatalogPreference(
      profile,
      "rope-bondage",
      "overall",
      "like",
      "2026-09-06T00:01:00.000Z",
    );

    profile = clearCatalogPreference(
      profile,
      "rope-bondage",
      "overall",
      "2026-09-06T00:02:00.000Z",
    );

    expect(profile.preferences["rope-bondage"]?.overall).toBeUndefined();
    expect(profile.preferences["rope-bondage"]?.receiving).toBe("hard_limit");
  });
});

describe("catalog preference eligibility", () => {
  const catalog = [
    { id: "a", categoryId: "cat", label: "A" },
    { id: "b", categoryId: "cat", label: "B" },
    { id: "c", categoryId: "cat", label: "C" },
  ];

  it("filters excluded items and restores them when cleared", () => {
    let profile = createEmptyCatalogProfileState();
    profile = setCatalogPreference(
      profile,
      "b",
      "overall",
      "hard_limit",
      "2026-09-06T00:00:00.000Z",
    );

    expect(filterEligibleCatalogItems(catalog, profile.preferences).map((x) => x.id))
      .toEqual(["a", "c"]);

    profile = clearCatalogPreference(
      profile,
      "b",
      "overall",
      "2026-09-06T00:01:00.000Z",
    );

    expect(filterEligibleCatalogItems(catalog, profile.preferences).map((x) => x.id))
      .toEqual(["a", "b", "c"]);
  });

  it("keeps historical comparisons while excluding an item", () => {
    const comparison: KinkComparison = {
      id: "cmp-1",
      leftKinkId: "a",
      rightKinkId: "b",
      scope: { type: "category", categoryId: "cat" },
      result: "left",
      timestamp: "2026-09-06T00:00:00.000Z",
    };

    let profile = {
      ...createEmptyCatalogProfileState(),
      comparisons: [comparison],
    };
    profile = setCatalogPreference(
      profile,
      "b",
      "overall",
      "not_interested",
      "2026-09-06T00:01:00.000Z",
    );

    expect(profile.comparisons).toEqual([comparison]);
  });

  it("prevents excluded items from entering newly derived finalists", () => {
    const comparisons: KinkComparison[] = [
      {
        id: "cmp-1",
        leftKinkId: "a",
        rightKinkId: "b",
        scope: { type: "category", categoryId: "cat" },
        result: "left",
        timestamp: "2026-09-06T00:00:00.000Z",
      },
    ];

    let profile = {
      ...createEmptyCatalogProfileState(),
      comparisons,
    };
    profile = setCatalogPreference(
      profile,
      "b",
      "overall",
      "not_applicable",
      "2026-09-06T00:01:00.000Z",
    );

    const eligible = filterEligibleCatalogItems(catalog, profile.preferences);
    const finalists = selectCategoryFinalists(
      eligible as never[],
      profile.comparisons,
      5,
    );

    expect(finalists.map((item) => item.id)).not.toContain("b");
  });
});

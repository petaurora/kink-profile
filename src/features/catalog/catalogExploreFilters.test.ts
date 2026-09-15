import { describe, expect, it } from "vitest";
import {
  activeSecondaryExploreFilterCount,
  hasActiveExploreFilters,
  matchesExploreSearch,
} from "./catalogExploreFilters";

describe("Explore filter state", () => {
  it("treats the default state as unfiltered", () => {
    expect(
      hasActiveExploreFilters({
        query: "   ",
        categoryFilter: "all",
        preferenceFilter: "all",
      }),
    ).toBe(false);
  });

  it("detects search, category, and preference constraints", () => {
    expect(
      hasActiveExploreFilters({
        query: "rope",
        categoryFilter: "all",
        preferenceFilter: "all",
      }),
    ).toBe(true);
    expect(
      hasActiveExploreFilters({
        query: "",
        categoryFilter: "bondage",
        preferenceFilter: "all",
      }),
    ).toBe(true);
    expect(
      hasActiveExploreFilters({
        query: "",
        categoryFilter: "all",
        preferenceFilter: "hard_limit",
      }),
    ).toBe(true);
  });

  it("counts only the secondary filters that belong behind Filters", () => {
    expect(
      activeSecondaryExploreFilterCount({
        query: "rope",
        categoryFilter: "bondage",
        preferenceFilter: "like",
      }),
    ).toBe(2);
  });
});

describe("Explore search", () => {
  it("matches labels and aliases case-insensitively", () => {
    expect(matchesExploreSearch(["Rope bondage", "Shibari"], "shib")).toBe(
      true,
    );
    expect(matchesExploreSearch(["Rope bondage", "Shibari"], "ROPE")).toBe(
      true,
    );
    expect(matchesExploreSearch(["Rope bondage", "Shibari"], "praise")).toBe(
      false,
    );
  });
});

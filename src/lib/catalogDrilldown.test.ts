import { describe, expect, it } from "vitest";
import {
  allCatalogDrilldown,
  categoryDrilldown,
  normalizeCatalogDrilldown,
  preferenceDrilldown,
} from "./catalogDrilldown";

const validCategories = new Set(["service", "primal"]);

describe("M7.9 catalog drill-down targets", () => {
  it("opens an Interest Area as one focused category and returns to profile", () => {
    expect(categoryDrilldown("service")).toEqual({
      categoryId: "service",
      preferenceFilter: "all",
      returnTo: "profile",
    });
  });

  it("opens compact state shortcuts without inventing a category filter", () => {
    expect(preferenceDrilldown("curious")).toEqual({
      preferenceFilter: "curious",
      returnTo: "profile",
    });
    expect(preferenceDrilldown("unsure")).toEqual({
      preferenceFilter: "unsure",
      returnTo: "profile",
    });
    expect(preferenceDrilldown("hard_limit")).toEqual({
      preferenceFilter: "hard_limit",
      returnTo: "profile",
    });
  });

  it("opens the complete catalog from the profile without carrying old focus", () => {
    expect(allCatalogDrilldown()).toEqual({
      preferenceFilter: "all",
      returnTo: "profile",
    });
  });

  it("supports normal hub entry with hub return behavior", () => {
    expect(allCatalogDrilldown("hub")).toEqual({
      preferenceFilter: "all",
      returnTo: "hub",
    });
  });

  it("drops stale category ids but preserves the requested preference filter", () => {
    expect(
      normalizeCatalogDrilldown(
        {
          categoryId: "deleted-category",
          preferenceFilter: "curious",
          returnTo: "profile",
        },
        validCategories,
      ),
    ).toEqual({
      categoryId: undefined,
      preferenceFilter: "curious",
      returnTo: "profile",
    });
  });

  it("keeps a valid category and defaults an omitted preference filter to all", () => {
    expect(
      normalizeCatalogDrilldown(
        {
          categoryId: "primal",
          returnTo: "profile",
        },
        validCategories,
      ),
    ).toEqual({
      categoryId: "primal",
      preferenceFilter: "all",
      returnTo: "profile",
    });
  });
});

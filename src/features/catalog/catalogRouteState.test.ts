import { describe, expect, it } from "vitest";
import { kinkCategories } from "../../data/kinkCatalog.generated";
import { catalogPreferenceStates } from "../../lib/catalogProfile";
import type { CatalogPreferenceFilter } from "../../lib/catalogDrilldown";
import {
  catalogRoutePath,
  parseCatalogRouteFocus,
  shouldOpenCatalogBrowse,
} from "./catalogRouteState";

const categoryId = kinkCategories[0]?.id;
const catalogBase = "/catalog/kinks";

describe("catalog route state", () => {
  it("serializes deliberate Browse entry into the Kinks workspace URL", () => {
    expect(categoryId).toBeTruthy();
    expect(catalogRoutePath()).toBe(`${catalogBase}?view=browse`);
    expect(catalogRoutePath({ categoryId })).toBe(
      `${catalogBase}?view=browse&category=${encodeURIComponent(categoryId!)}`,
    );
    expect(catalogRoutePath({ preferenceFilter: "hard_limit" })).toBe(
      `${catalogBase}?view=browse&preference=hard_limit`,
    );
    expect(
      catalogRoutePath({ categoryId, preferenceFilter: "curious" }),
    ).toBe(
      `${catalogBase}?view=browse&category=${encodeURIComponent(categoryId!)}&preference=curious`,
    );
  });

  it("keeps invalid drill-down state in Browse without creating dead filters", () => {
    expect(catalogRoutePath({ categoryId: "not-a-category" })).toBe(
      `${catalogBase}?view=browse`,
    );
    expect(
      catalogRoutePath({
        preferenceFilter: "definitely-nope" as CatalogPreferenceFilter,
      }),
    ).toBe(`${catalogBase}?view=browse`);
  });

  it("treats plain Catalog entry as Rank while preserving intentional Browse entry", () => {
    expect(shouldOpenCatalogBrowse("")).toBe(false);
    expect(shouldOpenCatalogBrowse("?view=browse")).toBe(true);
    expect(
      shouldOpenCatalogBrowse(`?category=${encodeURIComponent(categoryId!)}`),
    ).toBe(true);
    expect(shouldOpenCatalogBrowse("?preference=hard_limit")).toBe(true);
    expect(shouldOpenCatalogBrowse("?other=ignored")).toBe(false);
  });

  it("round-trips every supported preference filter through URL state", () => {
    for (const preferenceFilter of [
      "unanswered",
      ...catalogPreferenceStates,
    ] as const) {
      const path = catalogRoutePath({ categoryId, preferenceFilter });
      const search = path.includes("?") ? path.slice(path.indexOf("?")) : "";

      expect(parseCatalogRouteFocus(search)).toEqual({
        categoryId,
        preferenceFilter,
      });
    }
  });

  it("parses valid direct-link filters", () => {
    expect(categoryId).toBeTruthy();
    expect(
      parseCatalogRouteFocus(
        `?category=${encodeURIComponent(categoryId!)}&preference=unsure`,
      ),
    ).toEqual({ categoryId, preferenceFilter: "unsure" });
  });

  it("normalizes invalid or unrelated query values safely", () => {
    expect(
      parseCatalogRouteFocus(
        "?category=nope&preference=definitely-nope&other=ignored",
      ),
    ).toEqual({ categoryId: undefined, preferenceFilter: "all" });
    expect(parseCatalogRouteFocus("?preference=all")).toEqual({
      categoryId: undefined,
      preferenceFilter: "all",
    });
  });
});

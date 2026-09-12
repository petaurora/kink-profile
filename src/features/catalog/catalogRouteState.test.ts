import { describe, expect, it } from "vitest";
import { kinkCategories } from "../../data/kinkCatalog.generated";
import { catalogPreferenceStates } from "../../lib/catalogProfile";
import type { CatalogPreferenceFilter } from "../../lib/catalogDrilldown";
import { catalogRoutePath, parseCatalogRouteFocus } from "./catalogRouteState";

const categoryId = kinkCategories[0]?.id;

describe("catalog route state", () => {
  it("serializes useful drill-down state into the URL", () => {
    expect(categoryId).toBeTruthy();
    expect(catalogRoutePath({ categoryId })).toBe(
      `/catalog?category=${encodeURIComponent(categoryId!)}`,
    );
    expect(catalogRoutePath({ preferenceFilter: "hard_limit" })).toBe(
      "/catalog?preference=hard_limit",
    );
    expect(
      catalogRoutePath({ categoryId, preferenceFilter: "curious" }),
    ).toBe(
      `/catalog?category=${encodeURIComponent(categoryId!)}&preference=curious`,
    );
  });

  it("omits invalid route state instead of creating dead links", () => {
    expect(catalogRoutePath({ categoryId: "not-a-category" })).toBe("/catalog");
    expect(
      catalogRoutePath({
        preferenceFilter: "definitely-nope" as CatalogPreferenceFilter,
      }),
    ).toBe("/catalog");
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

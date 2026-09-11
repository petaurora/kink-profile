import { describe, expect, it } from "vitest";
import { kinkCategories } from "../../data/kinkCatalog.generated";
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

  it("omits invalid category state instead of creating dead links", () => {
    expect(catalogRoutePath({ categoryId: "not-a-category" })).toBe("/catalog");
  });

  it("parses valid direct-link filters", () => {
    expect(categoryId).toBeTruthy();
    expect(
      parseCatalogRouteFocus(
        `?category=${encodeURIComponent(categoryId!)}&preference=unsure`,
      ),
    ).toEqual({ categoryId, preferenceFilter: "unsure" });
  });

  it("normalizes invalid query values safely", () => {
    expect(
      parseCatalogRouteFocus("?category=nope&preference=definitely-nope"),
    ).toEqual({ categoryId: undefined, preferenceFilter: "all" });
  });
});

import type { CatalogPreferenceState } from "./catalogProfile";

export type CatalogPreferenceFilter =
  | "all"
  | "unanswered"
  | CatalogPreferenceState;

export type CatalogDrilldownFocus = {
  categoryId?: string;
  preferenceFilter?: CatalogPreferenceFilter;
};

export type CatalogDrilldownTarget = CatalogDrilldownFocus & {
  returnTo: "hub" | "profile";
};

export function categoryDrilldown(
  categoryId: string,
): CatalogDrilldownTarget {
  return {
    categoryId,
    preferenceFilter: "all",
    returnTo: "profile",
  };
}

export function preferenceDrilldown(
  preferenceFilter: CatalogPreferenceFilter,
): CatalogDrilldownTarget {
  return {
    preferenceFilter,
    returnTo: "profile",
  };
}

export function allCatalogDrilldown(
  returnTo: CatalogDrilldownTarget["returnTo"] = "profile",
): CatalogDrilldownTarget {
  return {
    preferenceFilter: "all",
    returnTo,
  };
}

export function normalizeCatalogDrilldown(
  target: CatalogDrilldownTarget,
  validCategoryIds: ReadonlySet<string>,
): CatalogDrilldownTarget {
  const categoryId =
    target.categoryId && validCategoryIds.has(target.categoryId)
      ? target.categoryId
      : undefined;

  return {
    categoryId,
    preferenceFilter: target.preferenceFilter ?? "all",
    returnTo: target.returnTo,
  };
}

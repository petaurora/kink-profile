import type { CatalogPreferenceFilter } from "../../lib/catalogDrilldown";

export type ExploreFilterState = {
  query: string;
  categoryFilter: string;
  preferenceFilter: CatalogPreferenceFilter;
};

export function hasActiveExploreFilters({
  query,
  categoryFilter,
  preferenceFilter,
}: ExploreFilterState) {
  return (
    query.trim().length > 0 ||
    categoryFilter !== "all" ||
    preferenceFilter !== "all"
  );
}

export function activeSecondaryExploreFilterCount({
  categoryFilter,
  preferenceFilter,
}: ExploreFilterState) {
  return Number(categoryFilter !== "all") + Number(preferenceFilter !== "all");
}

export function matchesExploreSearch(
  values: readonly string[],
  query: string,
) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return values.some((value) =>
    value.toLocaleLowerCase().includes(normalized),
  );
}

import { kinkCategories } from "../../data/kinkCatalog.generated";
import { catalogPreferenceStates } from "../../lib/catalogProfile";
import type {
  CatalogDrilldownFocus,
  CatalogPreferenceFilter,
} from "../../lib/catalogDrilldown";

const categoryIds = new Set(kinkCategories.map((category) => category.id));
const preferenceFilters = new Set<CatalogPreferenceFilter>([
  "all",
  "unanswered",
  ...catalogPreferenceStates,
]);

export function parseCatalogRouteFocus(search: string): CatalogDrilldownFocus {
  const params = new URLSearchParams(search);
  const category = params.get("category") ?? undefined;
  const preference = params.get("preference") ?? undefined;

  return {
    categoryId: category && categoryIds.has(category) ? category : undefined,
    preferenceFilter:
      preference && preferenceFilters.has(preference as CatalogPreferenceFilter)
        ? (preference as CatalogPreferenceFilter)
        : "all",
  };
}

export function catalogRoutePath(focus: CatalogDrilldownFocus = {}) {
  const params = new URLSearchParams();

  if (focus.categoryId && categoryIds.has(focus.categoryId)) {
    params.set("category", focus.categoryId);
  }
  if (focus.preferenceFilter && focus.preferenceFilter !== "all") {
    params.set("preference", focus.preferenceFilter);
  }

  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}

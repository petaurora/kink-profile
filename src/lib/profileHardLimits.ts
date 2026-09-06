import type { CatalogResultItem, CatalogResultView } from "./catalogResults";

export type ProfileHardLimit = {
  catalogId: string;
  label: string;
};

export type ProfileHardLimitsModel = {
  all: readonly ProfileHardLimit[];
  featured: readonly ProfileHardLimit[];
  hiddenCount: number;
};

const featuredLimitCount = 6;

/**
 * Profile-level hard-limit summary.
 *
 * Only explicit overall Hard Limit state qualifies. Other exclusion/disinterest
 * states, inference, and pairwise rank are intentionally ignored.
 */
export function buildProfileHardLimits(
  resultView: CatalogResultView,
): ProfileHardLimitsModel {
  const all = resultView.exclusions.hardLimits
    .map(
      (result: CatalogResultItem): ProfileHardLimit => ({
        catalogId: result.item.id,
        label: result.item.label,
      }),
    )
    .sort((left, right) => left.label.localeCompare(right.label));

  const featured = all.slice(0, featuredLimitCount);

  return {
    all,
    featured,
    hiddenCount: Math.max(0, all.length - featured.length),
  };
}

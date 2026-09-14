import type { BoundarySummaryAssertion } from "./profileBoundaryState";
import type { CatalogResultItem, CatalogResultView } from "./catalogResults";
import {
  resolveSparseState,
  type SparseStateResolution,
} from "./sparseState";

export type ProfileHardLimit = {
  catalogId: string;
  label: string;
};

export type ProfileHardLimitsModel = {
  all: readonly ProfileHardLimit[];
  featured: readonly ProfileHardLimit[];
  hiddenCount: number;
  state: SparseStateResolution;
};

const featuredLimitCount = 6;

/**
 * Profile-level hard-limit summary.
 *
 * Only explicit overall Hard Limit state qualifies. Other exclusion/disinterest
 * states, inference, and pairwise rank are intentionally ignored.
 *
 * An empty collection is unknown unless a separate direct assertion explicitly
 * says the user currently has no overall Hard Limits.
 */
export function buildProfileHardLimits(
  resultView: CatalogResultView,
  assertion?: BoundarySummaryAssertion,
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
  const hasLimits = all.length > 0;
  const hasExplicitNone = !hasLimits && assertion?.kind === "none";

  const state = resolveSparseState<never>({
    evidence: hasLimits || hasExplicitNone
      ? { level: "sufficient", direct: true, inferred: false }
      : { level: "none", direct: false, inferred: false },
    result: hasLimits ? "value" : hasExplicitNone ? "valid_empty" : "missing",
    reason: hasExplicitNone ? "explicit_none" : undefined,
  });

  return {
    all,
    featured,
    hiddenCount: Math.max(0, all.length - featured.length),
    state,
  };
}

import type { OverallFacetResult } from "./overallProfileFacets";
import type { CanonicalSignalResult, SignalChannelResult } from "./normalizedProfileSignals";
import {
  resolveSparseState,
  type SparseStateResolution,
} from "./sparseState";

export const PROFILE_DIMENSION_ESTABLISHED_COVERAGE = 25;
export const PROFILE_HEADLINE_COVERAGE = 40;

export type ProfileMaturityKind = "unformed" | "emerging" | "established";
export type ProfileDimensionState = "unknown" | "provisional" | "established";

export type ProfileSparseReason =
  | "profile_dimension_unexplored"
  | "profile_dimension_provisional"
  | "profile_dimension_established";

export type ProfileDimensionResolution = {
  state: ProfileDimensionState;
  sparseState: SparseStateResolution<ProfileSparseReason>;
  affinity: number | null;
  coverage: number;
  headlineEligible: boolean;
};

export type ProfileMaturity = {
  kind: ProfileMaturityKind;
  label: "Unformed" | "Emerging" | "Established";
  description: string;
  evidencedDimensionCount: number;
  establishedDimensionCount: number;
};

function normalizedCoverage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function resolveProfileDimension(
  facet: Pick<OverallFacetResult, "affinity" | "coverage">,
): ProfileDimensionResolution {
  const coverage = normalizedCoverage(facet.coverage);

  if (coverage <= 0) {
    return {
      state: "unknown",
      sparseState: resolveSparseState<ProfileSparseReason>({
        evidence: { level: "none", direct: false, inferred: false },
        result: "missing",
        reason: "profile_dimension_unexplored",
      }),
      affinity: null,
      coverage: 0,
      headlineEligible: false,
    };
  }

  if (
    facet.affinity === null ||
    coverage < PROFILE_DIMENSION_ESTABLISHED_COVERAGE
  ) {
    return {
      state: "provisional",
      sparseState: resolveSparseState<ProfileSparseReason>({
        evidence: { level: "partial", direct: true, inferred: false },
        result: facet.affinity === null ? "missing" : "value",
        reason: "profile_dimension_provisional",
      }),
      affinity: facet.affinity,
      coverage,
      headlineEligible: false,
    };
  }

  return {
    state: "established",
    sparseState: resolveSparseState<ProfileSparseReason>({
      evidence: { level: "sufficient", direct: true, inferred: false },
      result: "value",
      reason: "profile_dimension_established",
    }),
    affinity: facet.affinity,
    coverage,
    headlineEligible: coverage >= PROFILE_HEADLINE_COVERAGE,
  };
}

function channelHasEvidence(channel: SignalChannelResult | undefined) {
  return Boolean(channel && (channel.coverage > 0 || channel.affinity !== null));
}

export function hasCanonicalProfileEvidence(
  canonicalSignals: readonly CanonicalSignalResult[],
) {
  return canonicalSignals.some(
    (signal) =>
      channelHasEvidence(signal.overall) ||
      channelHasEvidence(signal.receiving) ||
      channelHasEvidence(signal.giving),
  );
}

/**
 * Profile maturity is a posture, not a completion score.
 *
 * Unformed means no canonical evidence exists. Emerging means evidence exists
 * but the broad profile does not yet have enough established dimensions for a
 * stable landscape. Established means a meaningful breadth of dimensions has
 * established evidence; unknown dimensions may still remain and do not make the
 * profile incomplete.
 */
export function resolveProfileMaturity(
  canonicalSignals: readonly CanonicalSignalResult[],
  facets: readonly OverallFacetResult[],
): ProfileMaturity {
  const dimensions = facets.map(resolveProfileDimension);
  const evidencedDimensionCount = dimensions.filter(
    (dimension) => dimension.state !== "unknown",
  ).length;
  const establishedDimensionCount = dimensions.filter(
    (dimension) => dimension.state === "established",
  ).length;

  if (!hasCanonicalProfileEvidence(canonicalSignals)) {
    return {
      kind: "unformed",
      label: "Unformed",
      description:
        "There is not enough evidence yet to form a profile shape. Unknown areas remain unknown rather than becoming zeroes.",
      evidencedDimensionCount,
      establishedDimensionCount,
    };
  }

  const establishedBreadthFloor = Math.max(1, Math.ceil(facets.length / 3));
  if (establishedDimensionCount >= establishedBreadthFloor) {
    return {
      kind: "established",
      label: "Established",
      description:
        "Enough dimensions have stable evidence to describe the profile shape, while unexplored areas can still remain unknown.",
      evidencedDimensionCount,
      establishedDimensionCount,
    };
  }

  return {
    kind: "emerging",
    label: "Emerging",
    description:
      "A profile shape is forming, but some of the current dimensions are still provisional or unexplored.",
    evidencedDimensionCount,
    establishedDimensionCount,
  };
}

export function isProfileHeadlineEligible(
  facet: Pick<OverallFacetResult, "affinity" | "coverage">,
) {
  return resolveProfileDimension(facet).headlineEligible;
}

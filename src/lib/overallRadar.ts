import type { OverallFacetId } from "../data/overallFacets";
import type { OverallFacetResult } from "./overallProfileFacets";

export type OverallRadarAxisState = "known" | "limited" | "unknown";

export type OverallRadarAxis = {
  facetId: OverallFacetId;
  label: string;
  shortLabel: string;
  affinity: number | null;
  coverage: number;
  prominence: number | null;
  prominenceDelta: number | null;
  relativeEmphasis: number | null;
  state: OverallRadarAxisState;
};

export type OverallRadarTheme = {
  facetId: OverallFacetId;
  label: string;
};

export type OverallRadarModel = {
  axes: readonly OverallRadarAxis[];
  strongestThemes: readonly OverallRadarTheme[];
  knownAxisCount: number;
  hasCompleteShape: boolean;
  prominenceBaseline: number | null;
};

const limitedEvidenceThreshold = 25;
const relativeEmphasisMidpoint = 50;
const relativeEmphasisSensitivity = 1.5;
const relativeEmphasisFloor = 10;
const relativeEmphasisCeiling = 90;

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

/**
 * Evidence-adjusted visual prominence for an Overall Facet.
 *
 * Affinity answers "how strongly does known evidence align with this theme?"
 * Coverage answers "how much of this theme has meaningful evidence?"
 * Prominence combines both for the profile-shape visualization.
 */
export function calculateOverallFacetProminence(
  affinity: number | null,
  coverage: number,
) {
  if (affinity === null || coverage <= 0) return null;
  return round1(affinity * Math.sqrt(clamp01(coverage / 100)));
}

export function calculateProminenceBaseline(
  prominences: readonly (number | null)[],
) {
  const known = prominences.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  if (known.length === 0) return null;
  return round1(known.reduce((sum, value) => sum + value, 0) / known.length);
}

export function calculateRelativeRadarEmphasis(
  prominence: number | null,
  baseline: number | null,
) {
  if (prominence === null || baseline === null) return null;

  const value =
    relativeEmphasisMidpoint +
    (prominence - baseline) * relativeEmphasisSensitivity;

  return round1(
    Math.min(
      relativeEmphasisCeiling,
      Math.max(relativeEmphasisFloor, value),
    ),
  );
}

export function buildOverallRadarModel(
  facets: readonly OverallFacetResult[],
  strongestFacetIds: readonly OverallFacetId[],
): OverallRadarModel {
  const rawAxes = facets.map((facet) => {
    const unknown = facet.affinity === null || facet.coverage <= 0;
    const state: OverallRadarAxisState = unknown
      ? "unknown"
      : facet.coverage < limitedEvidenceThreshold
        ? "limited"
        : "known";
    const prominence = unknown
      ? null
      : calculateOverallFacetProminence(facet.affinity, facet.coverage);

    return {
      facetId: facet.facetId,
      label: facet.label,
      shortLabel: facet.shortLabel,
      affinity: unknown ? null : facet.affinity,
      coverage: facet.coverage,
      prominence,
      state,
    };
  });

  const prominenceBaseline = calculateProminenceBaseline(
    rawAxes.map((axis) => axis.prominence),
  );

  const axes = rawAxes.map(
    (axis): OverallRadarAxis => ({
      ...axis,
      prominenceDelta:
        axis.prominence === null || prominenceBaseline === null
          ? null
          : round1(axis.prominence - prominenceBaseline),
      relativeEmphasis: calculateRelativeRadarEmphasis(
        axis.prominence,
        prominenceBaseline,
      ),
    }),
  );

  const byId = new Map(axes.map((axis) => [axis.facetId, axis]));
  const strongestThemes = strongestFacetIds.flatMap((facetId) => {
    const axis = byId.get(facetId);
    if (!axis || axis.state === "unknown") return [];

    return [{ facetId, label: axis.label }];
  });

  const knownAxisCount = axes.filter((axis) => axis.state !== "unknown").length;

  return {
    axes,
    strongestThemes,
    knownAxisCount,
    hasCompleteShape: axes.length > 0 && knownAxisCount === axes.length,
    prominenceBaseline,
  };
}

export function getKnownRadarRuns(
  axes: readonly OverallRadarAxis[],
): readonly (readonly number[])[] {
  if (axes.length === 0) return [];

  const known = axes.map((axis) => axis.state !== "unknown");
  if (known.every(Boolean)) return [axes.map((_, index) => index)];
  if (!known.some(Boolean)) return [];

  const firstUnknown = known.findIndex((value) => !value);
  const rotatedIndexes = Array.from({ length: axes.length }, (_, offset) => {
    return (firstUnknown + 1 + offset) % axes.length;
  });

  const runs: number[][] = [];
  let current: number[] = [];

  for (const index of rotatedIndexes) {
    if (known[index]) {
      current.push(index);
      continue;
    }

    if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }

  if (current.length > 0) runs.push(current);

  return runs;
}

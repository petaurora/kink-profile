import type { OverallFacetId } from "../data/overallFacets";
import type { OverallFacetResult } from "./overallProfileFacets";

export type OverallRadarAxisState = "known" | "limited" | "unknown";

export type OverallRadarAxis = {
  facetId: OverallFacetId;
  label: string;
  shortLabel: string;
  affinity: number | null;
  coverage: number;
  state: OverallRadarAxisState;
  directional: boolean;
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
};

const limitedEvidenceThreshold = 25;

export function buildOverallRadarModel(
  facets: readonly OverallFacetResult[],
  strongestFacetIds: readonly OverallFacetId[],
): OverallRadarModel {
  const axes = facets.map((facet): OverallRadarAxis => {
    const unknown = facet.affinity === null || facet.coverage <= 0;
    const state: OverallRadarAxisState = unknown
      ? "unknown"
      : facet.coverage < limitedEvidenceThreshold
        ? "limited"
        : "known";

    return {
      facetId: facet.facetId,
      label: facet.label,
      shortLabel: facet.shortLabel,
      affinity: unknown ? null : facet.affinity,
      coverage: facet.coverage,
      state,
      directional: Boolean(facet.direction),
    };
  });

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

import {
  overallFacetDefinitions,
  type OverallFacetId,
} from "../data/overallFacets";
import type { SignalId } from "../data/signals";

export type SemanticSignalMapping = {
  signalId: SignalId;
  weight: number;
};

export type WeightedSemanticSignalGroup = {
  weight: number;
  signals: readonly SemanticSignalMapping[];
};

export type DerivedFacetAffinity = {
  facetId: OverallFacetId;
  label: string;
  shortLabel: string;
  affinity: number;
  matchedSignals: readonly {
    signalId: SignalId;
    sourceWeight: number;
    facetWeight: number;
    contribution: number;
  }[];
};

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Collapse multiple authored paths to the same SignalId without double-counting
 * the same semantic idea. Useful for category-level mappings that may have
 * receiving/giving variants in the source table.
 */
export function collapseSemanticSignalMappings(
  mappings: readonly SemanticSignalMapping[],
): SemanticSignalMapping[] {
  const bySignal = new Map<SignalId, number>();

  for (const mapping of mappings) {
    const weight = clampWeight(mapping.weight);
    if (weight <= 0) continue;
    bySignal.set(
      mapping.signalId,
      Math.max(bySignal.get(mapping.signalId) ?? 0, weight),
    );
  }

  return [...bySignal.entries()]
    .map(([signalId, weight]) => ({ signalId, weight }))
    .sort((left, right) => left.signalId.localeCompare(right.signalId));
}

/**
 * Blend multiple weighted semantic groups into a single signal profile.
 *
 * Example: an R/P action mapped 1.0 to Praise and 0.5 to Playful blends the
 * signal profiles of those two context categories in the same proportions.
 */
export function blendSemanticSignalGroups(
  groups: readonly WeightedSemanticSignalGroup[],
): SemanticSignalMapping[] {
  const validGroups = groups.filter(
    (group) => Number.isFinite(group.weight) && group.weight > 0,
  );
  const totalGroupWeight = validGroups.reduce(
    (sum, group) => sum + group.weight,
    0,
  );
  if (totalGroupWeight <= 0) return [];

  const contributions = new Map<SignalId, number>();

  for (const group of validGroups) {
    for (const signal of collapseSemanticSignalMappings(group.signals)) {
      contributions.set(
        signal.signalId,
        (contributions.get(signal.signalId) ?? 0) +
          group.weight * signal.weight,
      );
    }
  }

  return [...contributions.entries()]
    .map(([signalId, contribution]) => ({
      signalId,
      weight: clampWeight(contribution / totalGroupWeight),
    }))
    .filter((mapping) => mapping.weight > 0)
    .sort((left, right) => left.signalId.localeCompare(right.signalId));
}

/**
 * Project canonical SignalIds into the shared Overall Facet space.
 *
 * This is descriptive semantic affinity, not user preference evidence.
 * It must never write back into quiz answers, rankings, or profile state.
 */
export function deriveOverallFacetAffinities(
  mappings: readonly SemanticSignalMapping[],
): DerivedFacetAffinity[] {
  const signals = collapseSemanticSignalMappings(mappings);
  const totalSourceWeight = signals.reduce(
    (sum, mapping) => sum + mapping.weight,
    0,
  );

  if (totalSourceWeight <= 0) return [];

  return overallFacetDefinitions
    .map((facet) => {
      const matchedSignals = signals.flatMap((source) => {
        const facetSignal = facet.signals.find(
          (mapping) => mapping.signalId === source.signalId,
        );
        if (!facetSignal) return [];

        const contribution = source.weight * facetSignal.weight;
        return contribution > 0
          ? [
              {
                signalId: source.signalId,
                sourceWeight: source.weight,
                facetWeight: facetSignal.weight,
                contribution,
              },
            ]
          : [];
      });

      const affinity =
        matchedSignals.reduce(
          (sum, match) => sum + match.contribution,
          0,
        ) / totalSourceWeight;

      return {
        facetId: facet.id,
        label: facet.label,
        shortLabel: facet.shortLabel,
        affinity: Math.max(0, Math.min(1, affinity)),
        matchedSignals,
      };
    })
    .filter((facet) => facet.affinity > 0)
    .sort(
      (left, right) =>
        right.affinity - left.affinity ||
        left.label.localeCompare(right.label),
    );
}

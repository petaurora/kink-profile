import {
  overallFacetDefinitions,
  type OverallFacetDefinition,
  type OverallFacetId,
  type OverallFacetSignalRelationship,
} from "../data/overallFacets";
import type {
  CanonicalSignalId,
  SignalChannel,
} from "../data/canonicalSignals";
import {
  resolveSignalChannel,
  signalResultById,
  type CanonicalSignalResult,
} from "./normalizedProfileSignals";

export type OverallFacetComponentResult = {
  signalId: CanonicalSignalId;
  signalChannel: SignalChannel;
  configuredWeight: number;
  relationship: OverallFacetSignalRelationship;
  affinity: number;
  coverage: number;
  effectiveWeight: number;
  sourceEvidenceIds: readonly string[];
};

export type OverallFacetResult = {
  facetId: OverallFacetId;
  label: string;
  shortLabel: string;
  description: string;
  affinity: number | null;
  coverage: number;
  components: readonly OverallFacetComponentResult[];
  sourceEvidenceIds: readonly string[];
};

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function clampPercent(value: number) {
  return clamp01(value / 100) * 100;
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function scoreFacetComponents(
  definition: OverallFacetDefinition,
  canonicalSignals: readonly CanonicalSignalResult[],
) {
  const signalsById = signalResultById(canonicalSignals);

  return definition.signals.flatMap(
    (configured): OverallFacetComponentResult[] => {
      const channel = configured.channel ?? "overall";
      const signal = resolveSignalChannel(
        signalsById.get(configured.signalId),
        channel,
      );
      if (!signal || signal.affinity === null || signal.coverage <= 0) return [];

      const coverage = clampPercent(signal.coverage);
      return [
        {
          signalId: configured.signalId,
          signalChannel: channel,
          configuredWeight: configured.weight,
          relationship: configured.relationship ?? "supports",
          affinity: clampPercent(signal.affinity),
          coverage,
          effectiveWeight: configured.weight * (coverage / 100),
          sourceEvidenceIds: uniqueSorted(signal.sourceEvidenceIds),
        },
      ];
    },
  );
}

function compositionScore(
  definition: OverallFacetDefinition,
  components: readonly OverallFacetComponentResult[],
) {
  const configuredWeightTotal = definition.signals.reduce(
    (sum, signal) => sum + signal.weight,
    0,
  );
  const configuredSupportWeightTotal = definition.signals
    .filter((signal) => (signal.relationship ?? "supports") === "supports")
    .reduce((sum, signal) => sum + signal.weight, 0);
  const effectiveWeight = components.reduce(
    (sum, component) => sum + component.effectiveWeight,
    0,
  );
  const supporting = components.filter(
    (component) => component.relationship === "supports",
  );
  const opposing = components.filter(
    (component) => component.relationship === "opposes",
  );
  const effectiveSupportWeight = supporting.reduce(
    (sum, component) => sum + component.effectiveWeight,
    0,
  );

  const coverage =
    configuredWeightTotal > 0
      ? round1(
          clampPercent((effectiveWeight / configuredWeightTotal) * 100),
        )
      : 0;

  if (effectiveSupportWeight <= 0 || configuredSupportWeightTotal <= 0) {
    return { affinity: null, coverage };
  }

  const supportAffinity =
    supporting.reduce(
      (sum, component) =>
        sum + component.affinity * component.effectiveWeight,
      0,
    ) / effectiveSupportWeight;

  const opposingPenalty =
    opposing.reduce(
      (sum, component) =>
        sum + component.affinity * component.effectiveWeight,
      0,
    ) / configuredSupportWeightTotal;

  return {
    affinity: round1(clampPercent(supportAffinity - opposingPenalty)),
    coverage,
  };
}

/**
 * Compose canonical Signal + optional channel references into broad theme
 * facets. Facets remain non-directional; directional nuance lives entirely in
 * the Signal reference feeding them.
 */
export function scoreOverallFacets(
  canonicalSignals: readonly CanonicalSignalResult[],
  definitions: readonly OverallFacetDefinition[] = overallFacetDefinitions,
): OverallFacetResult[] {
  return definitions.map((definition) => {
    const components = scoreFacetComponents(definition, canonicalSignals);
    const score = compositionScore(definition, components);

    return {
      facetId: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      description: definition.description,
      affinity: score.affinity,
      coverage: score.coverage,
      components,
      sourceEvidenceIds: uniqueSorted(
        components.flatMap((component) => component.sourceEvidenceIds),
      ),
    };
  });
}

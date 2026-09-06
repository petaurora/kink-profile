import {
  overallFacetDefinitions,
  type OverallFacetDefinition,
  type OverallFacetDirection,
  type OverallFacetId,
} from "../data/overallFacets";
import type { SignalId } from "../data/signals";
import type { CanonicalSignalResult } from "./overallProfileSignals";

export type OverallFacetComponentResult = {
  signalId: SignalId;
  configuredWeight: number;
  direction?: OverallFacetDirection;
  affinity: number;
  coverage: number;
  effectiveWeight: number;
  sourceEvidenceIds: readonly string[];
};

export type OverallFacetDirectionalResult = {
  direction: OverallFacetDirection;
  affinity: number | null;
  coverage: number;
  contributingSignalIds: readonly SignalId[];
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
  direction?: {
    receiving: OverallFacetDirectionalResult;
    giving: OverallFacetDirectionalResult;
  };
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
  signalsById: ReadonlyMap<SignalId, CanonicalSignalResult>,
) {
  return definition.signals.flatMap(
    (configured): OverallFacetComponentResult[] => {
      const signal = signalsById.get(configured.signalId);
      if (!signal || signal.coverage <= 0) return [];

      const coverage = clampPercent(signal.coverage);
      return [
        {
          signalId: configured.signalId,
          configuredWeight: configured.weight,
          direction: configured.direction,
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
  components: readonly OverallFacetComponentResult[],
  configuredWeightTotal: number,
) {
  const effectiveWeight = components.reduce(
    (sum, component) => sum + component.effectiveWeight,
    0,
  );

  if (effectiveWeight <= 0 || configuredWeightTotal <= 0) {
    return { affinity: null, coverage: 0 };
  }

  const affinity =
    components.reduce(
      (sum, component) =>
        sum + component.affinity * component.effectiveWeight,
      0,
    ) / effectiveWeight;

  return {
    affinity: round1(clampPercent(affinity)),
    coverage: round1(
      clampPercent((effectiveWeight / configuredWeightTotal) * 100),
    ),
  };
}

function scoreDirection(
  definition: OverallFacetDefinition,
  components: readonly OverallFacetComponentResult[],
  direction: OverallFacetDirection,
): OverallFacetDirectionalResult {
  const configuredWeightTotal = definition.signals
    .filter((signal) => signal.direction === direction)
    .reduce((sum, signal) => sum + signal.weight, 0);
  const directionalComponents = components.filter(
    (component) => component.direction === direction,
  );
  const score = compositionScore(
    directionalComponents,
    configuredWeightTotal,
  );

  return {
    direction,
    affinity: score.affinity,
    coverage: score.coverage,
    contributingSignalIds: directionalComponents
      .map((component) => component.signalId)
      .sort(),
    sourceEvidenceIds: uniqueSorted(
      directionalComponents.flatMap(
        (component) => component.sourceEvidenceIds,
      ),
    ),
  };
}

/**
 * Compose canonical SignalIds into broad M7 facets.
 *
 * Missing signals reduce facet coverage; they never enter affinity as 0%.
 * Affinity is calculated only from known evidence, weighted by both the
 * configured semantic weight and that canonical signal's evidence coverage.
 */
export function scoreOverallFacets(
  canonicalSignals: readonly CanonicalSignalResult[],
  definitions: readonly OverallFacetDefinition[] = overallFacetDefinitions,
): OverallFacetResult[] {
  const signalsById = new Map(
    canonicalSignals.map((signal) => [signal.signalId, signal]),
  );

  return definitions.map((definition) => {
    const components = scoreFacetComponents(definition, signalsById);
    const configuredWeightTotal = definition.signals.reduce(
      (sum, signal) => sum + signal.weight,
      0,
    );
    const score = compositionScore(components, configuredWeightTotal);

    return {
      facetId: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      description: definition.description,
      affinity: score.affinity,
      coverage: score.coverage,
      components,
      direction: definition.directional
        ? {
            receiving: scoreDirection(
              definition,
              components,
              "receiving",
            ),
            giving: scoreDirection(definition, components, "giving"),
          }
        : undefined,
      sourceEvidenceIds: uniqueSorted(
        components.flatMap((component) => component.sourceEvidenceIds),
      ),
    };
  });
}

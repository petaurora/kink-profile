import {
  overallFacetDefinitions,
  type OverallFacetId,
} from "../data/overallFacets";
import {
  legacySignalConceptTargets,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
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
    canonicalSignalId: CanonicalSignalId;
    signalChannel: SignalChannel;
    sourceWeight: number;
    facetWeight: number;
    relationship: "supports" | "opposes";
    contribution: number;
  }[];
};

type CanonicalSemanticSignalMapping = {
  signalId: CanonicalSignalId;
  channel: SignalChannel;
  weight: number;
  legacySignalIds: readonly SignalId[];
};

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Collapse multiple authored paths to the same legacy SignalId without
 * double-counting the same semantic idea. Source tables intentionally remain
 * legacy-compatible during M16.4 so this helper keeps its existing contract.
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
 * Blend multiple weighted semantic groups into a single legacy-compatible
 * signal profile. Canonicalization happens only when projecting into facets.
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

function canonicalizeSemanticMappings(
  mappings: readonly SemanticSignalMapping[],
): CanonicalSemanticSignalMapping[] {
  const byCanonicalKey = new Map<
    string,
    {
      signalId: CanonicalSignalId;
      channel: SignalChannel;
      weight: number;
      legacySignalIds: Set<SignalId>;
    }
  >();

  for (const mapping of collapseSemanticSignalMappings(mappings)) {
    const target = legacySignalConceptTargets[mapping.signalId];
    const channel: SignalChannel = target.inherentChannel ?? "overall";
    const key = `${target.signalId}::${channel}`;
    const current = byCanonicalKey.get(key) ?? {
      signalId: target.signalId,
      channel,
      weight: 0,
      legacySignalIds: new Set<SignalId>(),
    };

    // Directional legacy IDs that collapse into the same canonical semantic
    // path are alternate descriptions, not independent evidence. Keep the
    // strongest authored weight instead of summing duplicates.
    current.weight = Math.max(current.weight, mapping.weight);
    current.legacySignalIds.add(mapping.signalId);
    byCanonicalKey.set(key, current);
  }

  return [...byCanonicalKey.values()].map((item) => ({
    signalId: item.signalId,
    channel: item.channel,
    weight: item.weight,
    legacySignalIds: [...item.legacySignalIds].sort(),
  }));
}

/**
 * Project legacy-compatible semantic Signal mappings into the canonical
 * Overall Facet space.
 *
 * This is descriptive semantic affinity, not user preference evidence. A
 * directional legacy Signal is allowed to match an Overall facet reference to
 * its canonical base concept; a facet that explicitly requests a channel only
 * matches that channel. This preserves M11/M16 authored data while preventing
 * the new facet vocabulary from silently dropping old semantic mappings.
 */
export function deriveOverallFacetAffinities(
  mappings: readonly SemanticSignalMapping[],
): DerivedFacetAffinity[] {
  const signals = canonicalizeSemanticMappings(mappings);
  const totalSourceWeight = signals.reduce(
    (sum, mapping) => sum + mapping.weight,
    0,
  );

  if (totalSourceWeight <= 0) return [];

  return overallFacetDefinitions
    .map((facet) => {
      const matchedSignals = signals.flatMap((source) => {
        const facetSignal = facet.signals.find(
          (mapping) =>
            mapping.signalId === source.signalId &&
            (!mapping.channel || mapping.channel === source.channel),
        );
        if (!facetSignal) return [];

        const relationship = facetSignal.relationship ?? "supports";
        const magnitude = source.weight * facetSignal.weight;
        const contribution =
          relationship === "opposes" ? -magnitude : magnitude;
        if (magnitude <= 0) return [];

        return [
          {
            // Keep one legacy representative for existing explainability/debug
            // consumers while exposing the canonical identity explicitly.
            signalId: source.legacySignalIds[0],
            canonicalSignalId: source.signalId,
            signalChannel: source.channel,
            sourceWeight: source.weight,
            facetWeight: facetSignal.weight,
            relationship,
            contribution,
          },
        ];
      });

      const affinity = Math.max(
        0,
        matchedSignals.reduce(
          (sum, match) => sum + match.contribution,
          0,
        ) / totalSourceWeight,
      );

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

import {
  overallFacetDefinitions,
  type OverallFacetId,
} from "../data/overallFacets";
import {
  legacySignalConceptTargets,
  signalSupportsChannel,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
import type { SignalId as LegacySignalId } from "../data/signals";

export type SemanticSignalId = LegacySignalId | CanonicalSignalId;

export type SemanticSignalMapping = {
  signalId: SemanticSignalId;
  channel?: SignalChannel;
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
    signalId: SemanticSignalId;
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
  sourceSignalIds: readonly SemanticSignalId[];
};

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function isLegacySignalId(value: SemanticSignalId): value is LegacySignalId {
  return value in legacySignalConceptTargets;
}

function semanticKey(mapping: Pick<SemanticSignalMapping, "signalId" | "channel">) {
  return `${mapping.signalId}::${mapping.channel ?? ""}`;
}

/**
 * Collapse multiple authored paths to the same semantic Signal ref without
 * double-counting the same idea. Legacy source tables remain valid while M16.4
 * can also pass canonical Signal + channel refs from migrated consumers.
 */
export function collapseSemanticSignalMappings(
  mappings: readonly SemanticSignalMapping[],
): SemanticSignalMapping[] {
  const bySignal = new Map<string, SemanticSignalMapping>();

  for (const mapping of mappings) {
    const weight = clampWeight(mapping.weight);
    if (weight <= 0) continue;
    const key = semanticKey(mapping);
    const current = bySignal.get(key);
    if (!current || weight > current.weight) {
      bySignal.set(key, {
        signalId: mapping.signalId,
        channel: mapping.channel,
        weight,
      });
    }
  }

  return [...bySignal.values()].sort((left, right) =>
    semanticKey(left).localeCompare(semanticKey(right)),
  );
}

/**
 * Blend multiple weighted semantic groups into a single signal profile.
 * Inputs may still be legacy IDs or may already be canonical Signal refs.
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

  const contributions = new Map<
    string,
    { signalId: SemanticSignalId; channel?: SignalChannel; contribution: number }
  >();

  for (const group of validGroups) {
    for (const signal of collapseSemanticSignalMappings(group.signals)) {
      const key = semanticKey(signal);
      const current = contributions.get(key);
      contributions.set(key, {
        signalId: signal.signalId,
        channel: signal.channel,
        contribution:
          (current?.contribution ?? 0) + group.weight * signal.weight,
      });
    }
  }

  return [...contributions.values()]
    .map(({ signalId, channel, contribution }) => ({
      signalId,
      channel,
      weight: clampWeight(contribution / totalGroupWeight),
    }))
    .filter((mapping) => mapping.weight > 0)
    .sort((left, right) => semanticKey(left).localeCompare(semanticKey(right)));
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
      sourceSignalIds: Set<SemanticSignalId>;
    }
  >();

  for (const mapping of collapseSemanticSignalMappings(mappings)) {
    const target = isLegacySignalId(mapping.signalId)
      ? legacySignalConceptTargets[mapping.signalId]
      : { signalId: mapping.signalId };
    const requested =
      mapping.channel ??
      (isLegacySignalId(mapping.signalId)
        ? legacySignalConceptTargets[mapping.signalId].inherentChannel
        : undefined) ??
      "overall";
    const channel: SignalChannel =
      requested !== "overall" &&
      !signalSupportsChannel(target.signalId, requested)
        ? "overall"
        : requested;
    const key = `${target.signalId}::${channel}`;
    const current = byCanonicalKey.get(key) ?? {
      signalId: target.signalId,
      channel,
      weight: 0,
      sourceSignalIds: new Set<SemanticSignalId>(),
    };

    // Alternate authored paths into the same canonical semantic ref are not
    // independent evidence. Keep the strongest semantic weight.
    current.weight = Math.max(current.weight, mapping.weight);
    current.sourceSignalIds.add(mapping.signalId);
    byCanonicalKey.set(key, current);
  }

  return [...byCanonicalKey.values()].map((item) => ({
    signalId: item.signalId,
    channel: item.channel,
    weight: item.weight,
    sourceSignalIds: [...item.sourceSignalIds].sort(),
  }));
}

/**
 * Project semantic Signal mappings into the canonical Overall Facet space.
 *
 * This is descriptive semantic affinity, not user preference evidence. A
 * directional source may match an Overall facet reference to the same concept;
 * a facet that explicitly requests a channel only matches that channel.
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
            signalId: source.sourceSignalIds[0] ?? source.signalId,
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

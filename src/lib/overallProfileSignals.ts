import {
  kinkCatalog,
  type KinkCatalogItem,
  type KinkCatalogSignalMapping,
} from "../data/kinkCatalog.generated";
import type { SignalId } from "../data/signals";
import type { CatalogProfileState } from "./catalogProfile";
import {
  buildQuizSignalEvidence,
  dedupeQuizSignalEvidence,
  projectDirectCatalogEvidenceToSignals,
  type DirectCatalogSignalProjection,
  type ExplicitCatalogSignalProjection,
  type PairwiseCatalogSignalProjection,
  type QuizSignalEvidence,
} from "./profileEvidence";
import type { StoredProfile } from "./profileStorage";

export type CanonicalSignalSourceType =
  | "quiz"
  | "catalog_explicit"
  | "catalog_pairwise";

export type CanonicalSignalContribution = {
  sourceType: CanonicalSignalSourceType;
  sourceId: string;
  signalId: SignalId;
  affinity: number;
  coverage: number;
  sourceEvidenceIds: readonly string[];
  detail?: string;
};

export type CanonicalSignalChannel = {
  sourceType: CanonicalSignalSourceType;
  affinity: number;
  coverage: number;
  reliability: number;
  effectiveWeight: number;
  contributions: readonly CanonicalSignalContribution[];
};

export type CanonicalSignalResult = {
  signalId: SignalId;
  affinity: number;
  coverage: number;
  channels: readonly CanonicalSignalChannel[];
  sourceEvidenceIds: readonly string[];
};

/**
 * A source channel gets one capped vote in the canonical signal rather than
 * one vote per row/comparison. This prevents catalog volume from overwhelming
 * quiz evidence simply because many catalog items map to the same SignalId.
 *
 * These values are evidence ceilings, not affinity multipliers:
 * - quiz: strongest direct signal measurement
 * - explicit catalog: strong independent direct preference evidence
 * - pairwise: useful but relative evidence, therefore deliberately lighter
 */
export const canonicalSignalSourceReliability: Readonly<
  Record<CanonicalSignalSourceType, number>
> = {
  quiz: 0.8,
  catalog_explicit: 0.65,
  catalog_pairwise: 0.5,
};

const receivingSignalIds = new Set<SignalId>([
  "receiving_control",
  "care_receiving",
  "pursuit_receiving",
  "receiving_restraint",
  "receiving_positioning",
  "receiving_constraint_control",
  "receiving_discipline",
  "pain_receiving",
  "receiving_intensity",
  "receiving_endurance",
  "receiving_challenge",
]);

const givingSignalIds = new Set<SignalId>([
  "giving_control",
  "care_giving",
  "pursuit_giving",
  "giving_restraint",
  "giving_positioning",
  "giving_constraint_control",
  "giving_discipline",
  "pain_giving",
  "giving_intensity",
  "giving_endurance",
  "giving_challenge",
]);

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

function signalDirection(signalId: SignalId) {
  if (receivingSignalIds.has(signalId)) return "receiving" as const;
  if (givingSignalIds.has(signalId)) return "giving" as const;
  return "neutral" as const;
}

function combineIndependentCoverage(
  contributions: readonly CanonicalSignalContribution[],
) {
  let uncovered = 1;

  for (const contribution of contributions) {
    uncovered *= 1 - clamp01(contribution.coverage / 100);
  }

  return round1((1 - uncovered) * 100);
}

function weightedContributionAffinity(
  contributions: readonly CanonicalSignalContribution[],
) {
  let weight = 0;
  let weightedAffinity = 0;

  for (const contribution of contributions) {
    const evidenceWeight = clamp01(contribution.coverage / 100);
    if (evidenceWeight <= 0) continue;

    weight += evidenceWeight;
    weightedAffinity += clampPercent(contribution.affinity) * evidenceWeight;
  }

  return weight > 0 ? round1(weightedAffinity / weight) : 0;
}

function summarizeChannel(
  sourceType: CanonicalSignalSourceType,
  contributions: readonly CanonicalSignalContribution[],
  coverageMode: "independent" | "pairwise" = "independent",
): CanonicalSignalChannel | undefined {
  const usable = contributions.filter((item) => item.coverage > 0);
  if (usable.length === 0) return undefined;

  const coverage =
    coverageMode === "pairwise"
      ? round1(
          Math.min(
            100,
            usable.reduce((sum, item) => sum + item.coverage, 0),
          ),
        )
      : combineIndependentCoverage(usable);
  const reliability = canonicalSignalSourceReliability[sourceType];

  return {
    sourceType,
    affinity: weightedContributionAffinity(usable),
    coverage,
    reliability,
    effectiveWeight: reliability * (coverage / 100),
    contributions: usable,
  };
}

function buildQuizContributions(
  evidence: readonly QuizSignalEvidence[],
): CanonicalSignalContribution[] {
  return dedupeQuizSignalEvidence(evidence).map((item) => ({
    sourceType: "quiz",
    sourceId: item.quizId,
    signalId: item.signalId,
    affinity: item.affinity,
    coverage: item.coverage,
    sourceEvidenceIds: [item.evidenceId],
    detail: `quiz v${item.sourceVersion}`,
  }));
}

function explicitProjectionAffinity(
  projection: ExplicitCatalogSignalProjection,
) {
  if (projection.polarity === "uncertain") return 50;
  if (projection.polarity === "negative") {
    return projection.strength === "strong" ? 0 : 20;
  }

  switch (projection.strength) {
    case "strong":
      return 100;
    case "moderate":
      return 80;
    case "exploratory":
      return 65;
    case "uncertain":
      return 50;
  }
}

function explicitProjectionCoverage(
  projection: ExplicitCatalogSignalProjection,
) {
  const semanticStrength =
    projection.strength === "strong"
      ? 1
      : projection.strength === "moderate"
        ? 0.75
        : projection.strength === "exploratory"
          ? 0.5
          : 0.25;

  return round1(semanticStrength * clamp01(projection.mappingWeight) * 100);
}

function chooseExplicitProjectionsForCatalogSignal(
  projections: readonly ExplicitCatalogSignalProjection[],
) {
  if (projections.length <= 1) return projections;

  const direction = signalDirection(projections[0].signalId);
  const overall = projections.find((item) => item.context === "overall");
  const receiving = projections.find((item) => item.context === "receiving");
  const giving = projections.find((item) => item.context === "giving");

  if (direction === "receiving") {
    return receiving ? [receiving] : overall ? [overall] : [];
  }

  if (direction === "giving") {
    return giving ? [giving] : overall ? [overall] : [];
  }

  if (overall) return [overall];

  // A neutral signal can still receive evidence from direction-only explicit
  // preferences, but the catalog item counts once rather than once per context.
  return [receiving, giving].filter(
    (item): item is ExplicitCatalogSignalProjection => item !== undefined,
  );
}

function buildExplicitContributions(
  projections: readonly ExplicitCatalogSignalProjection[],
): CanonicalSignalContribution[] {
  const grouped = new Map<string, ExplicitCatalogSignalProjection[]>();

  for (const projection of projections) {
    const key = `${projection.catalogId}::${projection.signalId}`;
    const current = grouped.get(key) ?? [];
    current.push(projection);
    grouped.set(key, current);
  }

  return [...grouped.values()].flatMap((group) => {
    const selected = chooseExplicitProjectionsForCatalogSignal(group);
    if (selected.length === 0) return [];

    const weighted = selected.map((projection) => ({
      projection,
      affinity: explicitProjectionAffinity(projection),
      coverage: explicitProjectionCoverage(projection),
    }));
    const totalWeight = weighted.reduce(
      (sum, item) => sum + item.coverage / 100,
      0,
    );
    if (totalWeight <= 0) return [];

    const affinity = round1(
      weighted.reduce(
        (sum, item) => sum + item.affinity * (item.coverage / 100),
        0,
      ) / totalWeight,
    );

    return [
      {
        sourceType: "catalog_explicit" as const,
        sourceId: selected[0].catalogId,
        signalId: selected[0].signalId,
        affinity,
        // Directional overrides for the same item are one independent source.
        coverage: Math.max(...weighted.map((item) => item.coverage)),
        sourceEvidenceIds: [
          ...new Set(selected.map((item) => item.sourceEvidenceId)),
        ].sort(),
        detail: selected.map((item) => item.context).sort().join(" / "),
      },
    ];
  });
}

function mappingWeightsBySignal(
  mappings: readonly KinkCatalogSignalMapping[],
) {
  const weights = new Map<SignalId, number>();

  for (const mapping of mappings) {
    weights.set(
      mapping.signalId,
      clamp01((weights.get(mapping.signalId) ?? 0) + mapping.weight),
    );
  }

  return weights;
}

function buildPairwiseContributions(
  projections: readonly PairwiseCatalogSignalProjection[],
): CanonicalSignalContribution[] {
  return projections.flatMap((projection) => {
    const left = mappingWeightsBySignal(projection.leftMappings);
    const right = mappingWeightsBySignal(projection.rightMappings);
    const signalIds = new Set<SignalId>([...left.keys(), ...right.keys()]);

    return [...signalIds].flatMap((signalId) => {
      const leftWeight = left.get(signalId) ?? 0;
      const rightWeight = right.get(signalId) ?? 0;

      // If both choices express the same signal, that comparison cannot tell us
      // whether the signal itself drove the preference.
      if ((leftWeight > 0) === (rightWeight > 0)) return [];

      const mappedSide = leftWeight > 0 ? "left" : "right";
      const mappingWeight = Math.max(leftWeight, rightWeight);
      const affinity =
        projection.relation === "equal"
          ? 50
          : (projection.relation === "left_preferred" &&
                mappedSide === "left") ||
              (projection.relation === "right_preferred" &&
                mappedSide === "right")
            ? 100
            : 0;

      return [
        {
          sourceType: "catalog_pairwise" as const,
          sourceId: projection.comparisonId,
          signalId,
          affinity,
          // Eight defining, signal-discriminating comparisons are enough to
          // fully establish the pairwise channel for one SignalId. Weaker
          // catalog mappings require proportionally more comparisons.
          coverage: round1((mappingWeight / 8) * 100),
          sourceEvidenceIds: [projection.sourceEvidenceId],
          detail: projection.relation,
        },
      ];
    });
  });
}

function groupContributionsBySignal(
  contributions: readonly CanonicalSignalContribution[],
) {
  const grouped = new Map<SignalId, CanonicalSignalContribution[]>();

  for (const contribution of contributions) {
    const current = grouped.get(contribution.signalId) ?? [];
    current.push(contribution);
    grouped.set(contribution.signalId, current);
  }

  return grouped;
}

export function aggregateCanonicalSignalEvidence(
  quizEvidence: readonly QuizSignalEvidence[],
  directCatalogProjections: readonly DirectCatalogSignalProjection[],
): CanonicalSignalResult[] {
  const quiz = buildQuizContributions(quizEvidence);
  const explicit = buildExplicitContributions(
    directCatalogProjections.filter(
      (item): item is ExplicitCatalogSignalProjection =>
        item.kind === "explicit_catalog_signal_projection",
    ),
  );
  const pairwise = buildPairwiseContributions(
    directCatalogProjections.filter(
      (item): item is PairwiseCatalogSignalProjection =>
        item.kind === "pairwise_catalog_signal_projection",
    ),
  );

  const quizBySignal = groupContributionsBySignal(quiz);
  const explicitBySignal = groupContributionsBySignal(explicit);
  const pairwiseBySignal = groupContributionsBySignal(pairwise);
  const signalIds = new Set<SignalId>([
    ...quizBySignal.keys(),
    ...explicitBySignal.keys(),
    ...pairwiseBySignal.keys(),
  ]);

  return [...signalIds]
    .map((signalId) => {
      const channels = [
        summarizeChannel("quiz", quizBySignal.get(signalId) ?? []),
        summarizeChannel(
          "catalog_explicit",
          explicitBySignal.get(signalId) ?? [],
        ),
        summarizeChannel(
          "catalog_pairwise",
          pairwiseBySignal.get(signalId) ?? [],
          "pairwise",
        ),
      ].filter((item): item is CanonicalSignalChannel => item !== undefined);

      const totalEffectiveWeight = channels.reduce(
        (sum, channel) => sum + channel.effectiveWeight,
        0,
      );
      const affinity =
        totalEffectiveWeight > 0
          ? round1(
              channels.reduce(
                (sum, channel) =>
                  sum + channel.affinity * channel.effectiveWeight,
                0,
              ) / totalEffectiveWeight,
            )
          : 0;

      let uncovered = 1;
      for (const channel of channels) {
        uncovered *= 1 - clamp01(channel.effectiveWeight);
      }

      return {
        signalId,
        affinity,
        coverage: round1((1 - uncovered) * 100),
        channels,
        sourceEvidenceIds: [
          ...new Set(
            channels.flatMap((channel) =>
              channel.contributions.flatMap(
                (contribution) => contribution.sourceEvidenceIds,
              ),
            ),
          ),
        ].sort(),
      };
    })
    .sort((a, b) => a.signalId.localeCompare(b.signalId));
}

export function buildCanonicalSignalProfile(
  storedProfile: StoredProfile,
  catalogProfile: CatalogProfileState,
  catalog: readonly KinkCatalogItem[] = kinkCatalog,
) {
  const quizEvidence = buildQuizSignalEvidence(storedProfile);
  const directCatalogProjections = projectDirectCatalogEvidenceToSignals(
    catalogProfile,
    catalog,
  );

  return aggregateCanonicalSignalEvidence(
    quizEvidence,
    directCatalogProjections,
  );
}

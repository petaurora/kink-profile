import {
  dynamicModes,
  givingRoleHeadspaceIds,
  receivingRoleHeadspaceIds,
  roleHeadspaces,
  type ComposedDefinition,
} from "../data/headspacesQuiz";
import type { OverallFacetId } from "../data/overallFacets";
import type { SignalId } from "../data/signals";
import type { OverallFacetResult } from "./overallProfileFacets";
import type { CanonicalSignalResult } from "./overallProfileSignals";

export type ProfileOrientationKey =
  | "receiving"
  | "giving"
  | "bidirectional"
  | "mixed"
  | "insufficient";

export type ProfileOrientation = {
  key: ProfileOrientationKey;
  label: string;
  receivingAffinity: number | null;
  receivingCoverage: number;
  givingAffinity: number | null;
  givingCoverage: number;
};

export type ProfileHeadlineTrait = {
  id: string;
  label: string;
  affinity: number;
  coverage: number;
  direction?: "receiving" | "giving";
};

export type ProfileHeaderModel = {
  summary: string;
  orientation: ProfileOrientation;
  strongestFacetIds: readonly OverallFacetId[];
  headspaces: readonly ProfileHeadlineTrait[];
  dynamicModes: readonly ProfileHeadlineTrait[];
};

const directionalFacetCoverageFloor = 12;
const directionalFacetLeanThreshold = 20;
const orientationLeanThreshold = 15;
const bidirectionalAffinityFloor = 60;

const headlineFacetCoverageFloor = 12;
const headlineFacetAffinityFloor = 45;
const composedTraitCoverageFloor = 20;
const composedTraitAffinityFloor = 55;

const receivingHeadspaceIds = new Set<string>(receivingRoleHeadspaceIds);
const givingHeadspaceIds = new Set<string>(givingRoleHeadspaceIds);

const facetSummaryPhrases: Readonly<Record<OverallFacetId, string>> = {
  power_exchange: "power exchange",
  structure_protocol: "structure and protocol",
  ownership_belonging: "ownership and belonging",
  service_devotion: "service and devotion",
  care_nurture: "care and nurture",
  play_resistance: "play and resistance",
  primal_instinctive: "primal and instinctive dynamics",
  restraint_physical_control: "restraint and physical control",
  intensity_pain: "intensity and pain",
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

function headlineStrength(affinity: number, coverage: number) {
  return affinity * Math.sqrt(clamp01(coverage / 100));
}

function aggregateDirectionalSide(
  facets: readonly OverallFacetResult[],
  direction: "receiving" | "giving",
) {
  const directionalFacets = facets.filter((facet) => facet.direction);
  const usable = directionalFacets.flatMap((facet) => {
    const result = facet.direction?.[direction];
    return result && result.affinity !== null && result.coverage > 0
      ? [result]
      : [];
  });

  const evidenceWeight = usable.reduce(
    (sum, result) => sum + result.coverage / 100,
    0,
  );
  const affinity =
    evidenceWeight > 0
      ? round1(
          usable.reduce(
            (sum, result) =>
              sum + (result.affinity ?? 0) * (result.coverage / 100),
            0,
          ) / evidenceWeight,
        )
      : null;

  const coverage =
    directionalFacets.length > 0
      ? round1(
          (usable.reduce((sum, result) => sum + result.coverage, 0) /
            directionalFacets.length),
        )
      : 0;

  return { affinity, coverage };
}

function countDirectionalLeans(facets: readonly OverallFacetResult[]) {
  let receiving = 0;
  let giving = 0;

  for (const facet of facets) {
    if (!facet.direction) continue;

    const left = facet.direction.receiving;
    const right = facet.direction.giving;
    if (
      left.affinity === null ||
      right.affinity === null ||
      left.coverage < directionalFacetCoverageFloor ||
      right.coverage < directionalFacetCoverageFloor
    ) {
      continue;
    }

    const difference = left.affinity - right.affinity;
    if (difference >= directionalFacetLeanThreshold) receiving += 1;
    if (difference <= -directionalFacetLeanThreshold) giving += 1;
  }

  return { receiving, giving };
}

export function deriveProfileOrientation(
  facets: readonly OverallFacetResult[],
): ProfileOrientation {
  const receiving = aggregateDirectionalSide(facets, "receiving");
  const giving = aggregateDirectionalSide(facets, "giving");
  const receivingKnown = receiving.coverage >= directionalFacetCoverageFloor;
  const givingKnown = giving.coverage >= directionalFacetCoverageFloor;

  let key: ProfileOrientationKey = "insufficient";

  if (receivingKnown || givingKnown) {
    if (receivingKnown && !givingKnown) {
      key =
        (receiving.affinity ?? 0) >= composedTraitAffinityFloor
          ? "receiving"
          : "mixed";
    } else if (!receivingKnown && givingKnown) {
      key =
        (giving.affinity ?? 0) >= composedTraitAffinityFloor
          ? "giving"
          : "mixed";
    } else {
      const receivingAffinity = receiving.affinity ?? 0;
      const givingAffinity = giving.affinity ?? 0;
      const difference = receivingAffinity - givingAffinity;
      const leans = countDirectionalLeans(facets);

      if (
        receivingAffinity >= bidirectionalAffinityFloor &&
        givingAffinity >= bidirectionalAffinityFloor &&
        Math.abs(difference) <= 20
      ) {
        key = "bidirectional";
      } else if (
        leans.receiving > 0 &&
        leans.giving > 0 &&
        Math.abs(difference) < 25
      ) {
        key = "mixed";
      } else if (
        difference >= orientationLeanThreshold &&
        receivingAffinity >= composedTraitAffinityFloor
      ) {
        key = "receiving";
      } else if (
        difference <= -orientationLeanThreshold &&
        givingAffinity >= composedTraitAffinityFloor
      ) {
        key = "giving";
      } else if (
        receivingAffinity >= composedTraitAffinityFloor &&
        givingAffinity >= composedTraitAffinityFloor
      ) {
        key = "bidirectional";
      } else {
        key = "mixed";
      }
    }
  }

  const labels: Record<ProfileOrientationKey, string> = {
    receiving: "Receiving / submissive",
    giving: "Giving / dominant",
    bidirectional: "Bidirectional",
    mixed: "Mixed / context-dependent",
    insufficient: "Still emerging",
  };

  return {
    key,
    label: labels[key],
    receivingAffinity: receiving.affinity,
    receivingCoverage: receiving.coverage,
    givingAffinity: giving.affinity,
    givingCoverage: giving.coverage,
  };
}

function scoreComposedDefinitions(
  canonicalSignals: readonly CanonicalSignalResult[],
  definitions: readonly ComposedDefinition[],
): ProfileHeadlineTrait[] {
  const bySignalId = new Map(
    canonicalSignals.map((signal) => [signal.signalId, signal]),
  );

  return definitions
    .map((definition) => {
      let totalWeight = 0;
      let evidenceWeight = 0;
      let weightedAffinity = 0;

      for (const [signalId, configuredWeight] of Object.entries(
        definition.weights,
      )) {
        if (!configuredWeight || configuredWeight <= 0) continue;

        totalWeight += configuredWeight;
        const signal = bySignalId.get(signalId as SignalId);
        if (!signal || signal.coverage <= 0) continue;

        const coveredWeight =
          configuredWeight * clamp01(signal.coverage / 100);
        evidenceWeight += coveredWeight;
        weightedAffinity +=
          clampPercent(signal.affinity) * coveredWeight;
      }

      const affinity =
        evidenceWeight > 0
          ? round1(weightedAffinity / evidenceWeight)
          : 0;
      const coverage =
        totalWeight > 0
          ? round1((evidenceWeight / totalWeight) * 100)
          : 0;

      return {
        id: definition.id,
        label: definition.label,
        affinity,
        coverage,
      };
    })
    .filter(
      (trait) =>
        trait.coverage >= composedTraitCoverageFloor &&
        trait.affinity >= composedTraitAffinityFloor,
    )
    .sort((a, b) => {
      const strength =
        headlineStrength(b.affinity, b.coverage) -
        headlineStrength(a.affinity, a.coverage);
      if (Math.abs(strength) > 0.001) return strength;
      if (b.affinity !== a.affinity) return b.affinity - a.affinity;
      return b.coverage - a.coverage;
    });
}

function deriveHeadspaces(
  canonicalSignals: readonly CanonicalSignalResult[],
): ProfileHeadlineTrait[] {
  return scoreComposedDefinitions(canonicalSignals, roleHeadspaces)
    .map((trait) => ({
      ...trait,
      direction: receivingHeadspaceIds.has(trait.id)
        ? ("receiving" as const)
        : givingHeadspaceIds.has(trait.id)
          ? ("giving" as const)
          : undefined,
    }))
    .slice(0, 3);
}

function deriveDynamicModes(
  canonicalSignals: readonly CanonicalSignalResult[],
): ProfileHeadlineTrait[] {
  return scoreComposedDefinitions(canonicalSignals, dynamicModes).slice(0, 3);
}

function selectHeadlineFacets(facets: readonly OverallFacetResult[]) {
  return facets
    .filter(
      (
        facet,
      ): facet is OverallFacetResult & {
        affinity: number;
      } =>
        facet.affinity !== null &&
        facet.coverage >= headlineFacetCoverageFloor &&
        facet.affinity >= headlineFacetAffinityFloor,
    )
    .slice()
    .sort((a, b) => {
      const strength =
        headlineStrength(b.affinity, b.coverage) -
        headlineStrength(a.affinity, a.coverage);
      if (Math.abs(strength) > 0.001) return strength;
      if (b.affinity !== a.affinity) return b.affinity - a.affinity;
      return b.coverage - a.coverage;
    })
    .slice(0, 3);
}

function joinNatural(values: readonly string[]) {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function buildSummary(
  orientation: ProfileOrientation,
  strongestFacets: readonly OverallFacetResult[],
) {
  const phrases = strongestFacets.map(
    (facet) => facetSummaryPhrases[facet.facetId],
  );
  const themes = joinNatural(phrases);

  const orientationIntro: Partial<
    Record<ProfileOrientationKey, string>
  > = {
    receiving: "Receiving/submissive energy is the clearest directional lean",
    giving: "Giving/dominant energy is the clearest directional lean",
    bidirectional:
      "The profile shows meaningful strength in both receiving and giving",
    mixed:
      "Giving and receiving shift depending on the part of the dynamic",
  };

  const intro = orientationIntro[orientation.key];

  if (intro && phrases.length > 0) {
    return `${intro}, with the strongest themes around ${themes}.`;
  }

  if (intro) {
    return `${intro}, while the broader themes are still emerging.`;
  }

  if (phrases.length === 1) {
    return `The clearest overall theme so far is ${themes}.`;
  }

  if (phrases.length > 1) {
    return `The clearest overall themes so far are ${themes}.`;
  }

  return "There is not enough evidence yet to describe the overall shape of this profile.";
}

export function buildProfileHeaderModel(
  canonicalSignals: readonly CanonicalSignalResult[],
  facets: readonly OverallFacetResult[],
): ProfileHeaderModel {
  const orientation = deriveProfileOrientation(facets);
  const strongestFacets = selectHeadlineFacets(facets);

  return {
    summary: buildSummary(orientation, strongestFacets),
    orientation,
    strongestFacetIds: strongestFacets.map((facet) => facet.facetId),
    headspaces: deriveHeadspaces(canonicalSignals),
    dynamicModes: deriveDynamicModes(canonicalSignals),
  };
}

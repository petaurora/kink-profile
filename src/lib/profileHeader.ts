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

function getPowerExchangeDirection(
  facets: readonly OverallFacetResult[],
) {
  return facets.find((facet) => facet.facetId === "power_exchange")?.direction;
}

export function deriveProfileOrientation(
  facets: readonly OverallFacetResult[],
): ProfileOrientation {
  const powerExchange = getPowerExchangeDirection(facets);
  const receiving = powerExchange?.receiving ?? {
    affinity: null,
    coverage: 0,
  };
  const giving = powerExchange?.giving ?? {
    affinity: null,
    coverage: 0,
  };
  const receivingKnown =
    receiving.affinity !== null &&
    receiving.coverage >= directionalFacetCoverageFloor;
  const givingKnown =
    giving.affinity !== null &&
    giving.coverage >= directionalFacetCoverageFloor;

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

      if (
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
        receivingAffinity >= bidirectionalAffinityFloor &&
        givingAffinity >= bidirectionalAffinityFloor
      ) {
        key = "bidirectional";
      } else {
        key = "mixed";
      }
    }
  }

  const labels: Record<ProfileOrientationKey, string> = {
    receiving: "Submissive",
    giving: "Dominant",
    bidirectional: "Dominant + submissive",
    mixed: "Context-dependent",
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
    receiving: "The profile leans submissive",
    giving: "The profile leans dominant",
    bidirectional:
      "The profile shows strong dominant and submissive tendencies",
    mixed:
      "The profile is context-dependent rather than strongly dominant or submissive",
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

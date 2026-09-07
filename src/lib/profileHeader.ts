import {
  dynamicModes,
  roleHeadspaces,
  type ComposedDefinition,
} from "../data/headspacesQuiz";
import type { OverallFacetId } from "../data/overallFacets";
import type { SignalId } from "../data/signals";
import type { OverallFacetResult } from "./overallProfileFacets";
import type { CanonicalSignalResult } from "./overallProfileSignals";

export type ProfileOrientationKey =
  | "submissive"
  | "dominant"
  | "bidirectional"
  | "mixed"
  | "insufficient";

export type ProfileOrientation = {
  key: ProfileOrientationKey;
  label: string;
  submissiveAffinity: number | null;
  submissiveCoverage: number;
  dominantAffinity: number | null;
  dominantCoverage: number;
};

export type ProfileHeadlineTrait = {
  id: string;
  label: string;
  affinity: number;
  coverage: number;
};

export type ProfileHeaderModel = {
  summary: string;
  orientation: ProfileOrientation;
  strongestFacetIds: readonly OverallFacetId[];
  headspaces: readonly ProfileHeadlineTrait[];
  dynamicModes: readonly ProfileHeadlineTrait[];
};

const authorityCoverageFloor = 12;
const orientationLeanThreshold = 15;
const bidirectionalAffinityFloor = 60;

const headlineFacetCoverageFloor = 12;
const headlineFacetAffinityFloor = 45;
const composedTraitCoverageFloor = 20;
const composedTraitAffinityFloor = 55;
const authorityAffinityFloor = 55;

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

type AuthoritySideSignal = {
  signalId: SignalId;
  weight: number;
};

const authorityQuizId = "dominance-submission";

const submissiveAuthoritySignals: readonly AuthoritySideSignal[] = [
  { signalId: "receiving_control", weight: 1 },
  { signalId: "responsibility_transfer", weight: 0.9 },
  { signalId: "obedience", weight: 0.65 },
];

const dominantAuthoritySignals: readonly AuthoritySideSignal[] = [
  { signalId: "giving_control", weight: 1 },
];

function authorityQuizSignal(
  canonicalSignals: readonly CanonicalSignalResult[],
  signalId: SignalId,
) {
  const signal = canonicalSignals.find((item) => item.signalId === signalId);
  const contributions =
    signal?.channels
      .find((channel) => channel.sourceType === "quiz")
      ?.contributions.filter(
        (contribution) => contribution.sourceId === authorityQuizId,
      ) ?? [];

  if (contributions.length === 0) {
    return { affinity: null as number | null, coverage: 0 };
  }

  const evidenceWeight = contributions.reduce(
    (sum, contribution) => sum + clamp01(contribution.coverage / 100),
    0,
  );
  if (evidenceWeight <= 0) {
    return { affinity: null as number | null, coverage: 0 };
  }

  const affinity = round1(
    contributions.reduce(
      (sum, contribution) =>
        sum +
        clampPercent(contribution.affinity) *
          clamp01(contribution.coverage / 100),
      0,
    ) / evidenceWeight,
  );

  let uncovered = 1;
  for (const contribution of contributions) {
    uncovered *= 1 - clamp01(contribution.coverage / 100);
  }

  return {
    affinity,
    coverage: round1((1 - uncovered) * 100),
  };
}

function scoreAuthoritySide(
  canonicalSignals: readonly CanonicalSignalResult[],
  definitions: readonly AuthoritySideSignal[],
) {
  let totalWeight = 0;
  let evidenceWeight = 0;
  let weightedAffinity = 0;

  for (const definition of definitions) {
    totalWeight += definition.weight;
    const signal = authorityQuizSignal(
      canonicalSignals,
      definition.signalId,
    );
    if (signal.affinity === null || signal.coverage <= 0) continue;

    const coveredWeight =
      definition.weight * clamp01(signal.coverage / 100);
    evidenceWeight += coveredWeight;
    weightedAffinity += signal.affinity * coveredWeight;
  }

  return {
    affinity:
      evidenceWeight > 0
        ? round1(weightedAffinity / evidenceWeight)
        : null,
    coverage:
      totalWeight > 0
        ? round1((evidenceWeight / totalWeight) * 100)
        : 0,
  };
}

export function deriveProfileOrientation(
  canonicalSignals: readonly CanonicalSignalResult[],
): ProfileOrientation {
  const submissive = scoreAuthoritySide(
    canonicalSignals,
    submissiveAuthoritySignals,
  );
  const dominant = scoreAuthoritySide(
    canonicalSignals,
    dominantAuthoritySignals,
  );
  const submissiveKnown =
    submissive.affinity !== null &&
    submissive.coverage >= authorityCoverageFloor;
  const dominantKnown =
    dominant.affinity !== null &&
    dominant.coverage >= authorityCoverageFloor;

  let key: ProfileOrientationKey = "insufficient";

  if (submissiveKnown || dominantKnown) {
    if (submissiveKnown && !dominantKnown) {
      key =
        (submissive.affinity ?? 0) >= authorityAffinityFloor
          ? "submissive"
          : "mixed";
    } else if (!submissiveKnown && dominantKnown) {
      key =
        (dominant.affinity ?? 0) >= authorityAffinityFloor
          ? "dominant"
          : "mixed";
    } else {
      const submissiveAffinity = submissive.affinity ?? 0;
      const dominantAffinity = dominant.affinity ?? 0;
      const difference = submissiveAffinity - dominantAffinity;

      if (
        difference >= orientationLeanThreshold &&
        submissiveAffinity >= authorityAffinityFloor
      ) {
        key = "submissive";
      } else if (
        difference <= -orientationLeanThreshold &&
        dominantAffinity >= authorityAffinityFloor
      ) {
        key = "dominant";
      } else if (
        submissiveAffinity >= bidirectionalAffinityFloor &&
        dominantAffinity >= bidirectionalAffinityFloor
      ) {
        key = "bidirectional";
      } else {
        key = "mixed";
      }
    }
  }

  const labels: Record<ProfileOrientationKey, string> = {
    submissive: "Submissive",
    dominant: "Dominant",
    bidirectional: "Dominant + submissive",
    mixed: "Context-dependent",
    insufficient: "Still emerging",
  };

  return {
    key,
    label: labels[key],
    submissiveAffinity: submissive.affinity,
    submissiveCoverage: submissive.coverage,
    dominantAffinity: dominant.affinity,
    dominantCoverage: dominant.coverage,
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
  return scoreComposedDefinitions(canonicalSignals, roleHeadspaces).slice(0, 3);
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
    submissive: "The profile leans submissive",
    dominant: "The profile leans dominant",
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
  const orientation = deriveProfileOrientation(canonicalSignals);
  const strongestFacets = selectHeadlineFacets(facets);

  return {
    summary: buildSummary(orientation, strongestFacets),
    orientation,
    strongestFacetIds: strongestFacets.map((facet) => facet.facetId),
    headspaces: deriveHeadspaces(canonicalSignals),
    dynamicModes: deriveDynamicModes(canonicalSignals),
  };
}

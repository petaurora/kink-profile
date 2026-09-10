import {
  dynamicModes,
  roleHeadspaces,
} from "../data/headspacesQuiz";
import {
  sharedInteractionMappings,
  type SharedInteractionAuthoritySemantics,
  type SharedInteractionConceptRef,
  type SharedInteractionMapping,
} from "../data/sharedInteractionMappings";
import { legacySignalConceptTargets } from "../data/canonicalSignals";
import {
  signalDefinitions,
  type SignalId,
} from "../data/signals";
import {
  getCatalogPreference,
  isExcludedCatalogState,
  type CatalogItemPreference,
  type CatalogPreferenceState,
  type CatalogProfileState,
} from "./catalogProfile";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import {
  buildProfileRoleDetails,
  type ProfileRoleDetailsModel,
  type ProfileRoleScore,
} from "./profileRoleDetails";

export type SharedItemState =
  | "mutual_positive"
  | "complementary"
  | "mutual_curious"
  | "one_positive_one_curious"
  | "different_context"
  | "excluded"
  | "unknown";

export type SharedCatalogEvidence = {
  overall?: CatalogPreferenceState;
  receiving?: CatalogPreferenceState;
  giving?: CatalogPreferenceState;
  meaningfulPairwiseComparisons: number;
};

export type SharedCatalogItemComparison = {
  catalogId: string;
  label: string;
  categoryId: string;
  state: SharedItemState;
  profileA: SharedCatalogEvidence;
  profileB: SharedCatalogEvidence;
  explanation: string;
};

export type SharedSemanticEvidence = {
  concept: SharedInteractionConceptRef;
  label: string;
  affinity: number;
  coverage: number;
  source: "canonical_signal" | "headspace" | "dynamic_mode";
};

export type SharedSemanticComplement = {
  mappingId: string;
  relationshipKind: SharedInteractionMapping["relationshipKind"];
  authoritySemantics: SharedInteractionAuthoritySemantics;
  strength: number;
  fitScore: number;
  profileA: SharedSemanticEvidence;
  profileB: SharedSemanticEvidence;
  explanation: string;
};

export type SharedProfileComparison = {
  catalogItems: readonly SharedCatalogItemComparison[];
  catalogByState: Readonly<Record<SharedItemState, readonly SharedCatalogItemComparison[]>>;
  semanticComplements: readonly SharedSemanticComplement[];
};

export type SharedProfileComparisonInput = {
  catalogResults: CatalogResultView;
  catalogProfile: CatalogProfileState;
  canonicalSignals: readonly CanonicalSignalResult[];
  roleDetails?: ProfileRoleDetailsModel;
};

const positiveStates = new Set<CatalogPreferenceState>(["love", "like"]);
const minimumSemanticAffinity = 60;
const minimumSemanticCoverage = 20;

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function isPositiveState(state: CatalogPreferenceState | undefined) {
  return state !== undefined && positiveStates.has(state);
}

function isCuriousState(state: CatalogPreferenceState | undefined) {
  return state === "curious";
}

function preferenceEvidence(
  preference: CatalogItemPreference | undefined,
  result: CatalogResultItem | undefined,
): SharedCatalogEvidence {
  return {
    overall: preference?.overall,
    receiving: preference?.receiving,
    giving: preference?.giving,
    meaningfulPairwiseComparisons:
      result?.meaningfulPairwiseComparisons ?? 0,
  };
}

function hasOverallExclusion(evidence: SharedCatalogEvidence) {
  return isExcludedCatalogState(evidence.overall);
}

function hasComplementaryDirectionalPreference(
  profileA: SharedCatalogEvidence,
  profileB: SharedCatalogEvidence,
) {
  // Overall preference is intentionally NOT used as a side fallback here.
  // "We both like this" is mutual interest, not evidence that one person
  // specifically wants to give while the other specifically wants to receive.
  return (
    (isPositiveState(profileA.giving) &&
      isPositiveState(profileB.receiving)) ||
    (isPositiveState(profileA.receiving) &&
      isPositiveState(profileB.giving))
  );
}

function positiveDirectionalContexts(evidence: SharedCatalogEvidence) {
  const contexts: Array<"receiving" | "giving"> = [];

  if (isPositiveState(evidence.receiving)) contexts.push("receiving");
  if (isPositiveState(evidence.giving)) contexts.push("giving");

  return contexts;
}

function classifyCatalogItem(
  profileA: SharedCatalogEvidence,
  profileB: SharedCatalogEvidence,
): SharedItemState {
  if (hasOverallExclusion(profileA) || hasOverallExclusion(profileB)) {
    return "excluded";
  }

  if (hasComplementaryDirectionalPreference(profileA, profileB)) {
    return "complementary";
  }

  if (
    isPositiveState(profileA.overall) &&
    isPositiveState(profileB.overall)
  ) {
    return "mutual_positive";
  }

  if (
    isCuriousState(profileA.overall) &&
    isCuriousState(profileB.overall)
  ) {
    return "mutual_curious";
  }

  if (
    (isPositiveState(profileA.overall) &&
      isCuriousState(profileB.overall)) ||
    (isCuriousState(profileA.overall) &&
      isPositiveState(profileB.overall))
  ) {
    return "one_positive_one_curious";
  }

  const aContexts = positiveDirectionalContexts(profileA);
  const bContexts = positiveDirectionalContexts(profileB);

  if (aContexts.length > 0 && bContexts.length > 0) {
    return "different_context";
  }

  return "unknown";
}

function catalogExplanation(
  state: SharedItemState,
  profileA: SharedCatalogEvidence,
  profileB: SharedCatalogEvidence,
) {
  switch (state) {
    case "mutual_positive":
      return "Both profiles directly marked this as a positive interest.";
    case "complementary":
      return "The profiles have directly compatible giving/receiving preferences for this activity.";
    case "mutual_curious":
      return "Both profiles marked this as something they are curious about.";
    case "one_positive_one_curious":
      return "One profile directly likes this while the other is curious about it.";
    case "different_context":
      return "Both profiles have positive directional interest, but their current preferred contexts do not form a direct giving/receiving pair.";
    case "excluded":
      if (hasOverallExclusion(profileA) && hasOverallExclusion(profileB)) {
        return "Both profiles explicitly exclude this from shared suggestions.";
      }
      return "One profile explicitly excludes this from shared suggestions.";
    case "unknown":
      if (
        profileA.meaningfulPairwiseComparisons > 0 ||
        profileB.meaningfulPairwiseComparisons > 0
      ) {
        return "There is relative ranking evidence, but not enough direct preference evidence to call this a shared fit.";
      }
      return "At least one profile has not established enough direct preference evidence yet.";
  }
}

function catalogResultMap(view: CatalogResultView) {
  return new Map(view.items.map((result) => [result.item.id, result]));
}

function buildCatalogComparisons(
  profileA: SharedProfileComparisonInput,
  profileB: SharedProfileComparisonInput,
): SharedCatalogItemComparison[] {
  const aResults = catalogResultMap(profileA.catalogResults);
  const bResults = catalogResultMap(profileB.catalogResults);
  const ids = new Set<string>([
    ...aResults.keys(),
    ...bResults.keys(),
    ...Object.keys(profileA.catalogProfile.preferences),
    ...Object.keys(profileB.catalogProfile.preferences),
  ]);

  return [...ids]
    .map((catalogId): SharedCatalogItemComparison => {
      const aResult = aResults.get(catalogId);
      const bResult = bResults.get(catalogId);
      const item = aResult?.item ?? bResult?.item;
      const aPreference = profileA.catalogProfile.preferences[catalogId];
      const bPreference = profileB.catalogProfile.preferences[catalogId];

      const aEvidence = preferenceEvidence(aPreference, aResult);
      const bEvidence = preferenceEvidence(bPreference, bResult);
      const state = classifyCatalogItem(aEvidence, bEvidence);

      return {
        catalogId,
        label: item?.label ?? catalogId,
        categoryId: item?.categoryId ?? "unknown",
        state,
        profileA: aEvidence,
        profileB: bEvidence,
        explanation: catalogExplanation(state, aEvidence, bEvidence),
      };
    })
    .sort((left, right) => {
      const labelCompare = left.label.localeCompare(right.label);
      return labelCompare !== 0
        ? labelCompare
        : left.catalogId.localeCompare(right.catalogId);
    });
}

function conceptKey(concept: SharedInteractionConceptRef) {
  return `${concept.kind}:${concept.id}`;
}

function roleScoreEvidence(
  concept: SharedInteractionConceptRef,
  score: ProfileRoleScore | undefined,
): SharedSemanticEvidence | undefined {
  if (!score) return undefined;
  if (
    score.affinity < minimumSemanticAffinity ||
    score.coverage < minimumSemanticCoverage
  ) {
    return undefined;
  }

  return {
    concept,
    label: score.label,
    affinity: clampPercent(score.affinity),
    coverage: clampPercent(score.coverage),
    source:
      concept.kind === "headspace" ? "headspace" : "dynamic_mode",
  };
}

function buildSemanticEvidenceMap(
  input: SharedProfileComparisonInput,
) {
  const evidence = new Map<string, SharedSemanticEvidence>();
  const legacyTargets = Object.entries(legacySignalConceptTargets) as Array<
    [SignalId, (typeof legacySignalConceptTargets)[SignalId]]
  >;

  for (const signal of input.canonicalSignals) {
    for (const [legacySignalId, target] of legacyTargets) {
      if (target.signalId !== signal.signalId) continue;

      const channel =
        target.inherentChannel === "receiving"
          ? signal.receiving
          : target.inherentChannel === "giving"
            ? signal.giving
            : signal.overall;
      if (
        !channel ||
        channel.affinity === null ||
        channel.affinity < minimumSemanticAffinity ||
        channel.coverage < minimumSemanticCoverage
      ) {
        continue;
      }

      const definition = signalDefinitions.find(
        (candidate) => candidate.id === legacySignalId,
      );
      const concept: SharedInteractionConceptRef = {
        kind: "signal",
        id: legacySignalId,
      };

      evidence.set(conceptKey(concept), {
        concept,
        label: definition?.label ?? legacySignalId,
        affinity: clampPercent(channel.affinity),
        coverage: clampPercent(channel.coverage),
        source: "canonical_signal",
      });
    }
  }

  const roleDetails =
    input.roleDetails ?? buildProfileRoleDetails(input.canonicalSignals);

  for (const score of roleDetails.headspaces) {
    const concept: SharedInteractionConceptRef = {
      kind: "headspace",
      id: score.id,
    };
    const resolved = roleScoreEvidence(concept, score);
    if (resolved) evidence.set(conceptKey(concept), resolved);
  }

  for (const score of roleDetails.dynamicModes) {
    const concept: SharedInteractionConceptRef = {
      kind: "dynamic_mode",
      id: score.id,
    };
    const resolved = roleScoreEvidence(concept, score);
    if (resolved) evidence.set(conceptKey(concept), resolved);
  }

  return evidence;
}

function semanticConceptLabel(concept: SharedInteractionConceptRef) {
  switch (concept.kind) {
    case "signal":
      return (
        signalDefinitions.find((definition) => definition.id === concept.id)
          ?.label ?? concept.id
      );
    case "dynamic_mode":
      return (
        dynamicModes.find((definition) => definition.id === concept.id)?.label ??
        concept.id
      );
    case "headspace":
      return (
        roleHeadspaces.find((definition) => definition.id === concept.id)
          ?.label ?? concept.id
      );
  }
}

function semanticFitScore(
  mapping: SharedInteractionMapping,
  profileA: SharedSemanticEvidence,
  profileB: SharedSemanticEvidence,
) {
  const aEvidenceStrength =
    (clampPercent(profileA.affinity) / 100) *
    (clampPercent(profileA.coverage) / 100);
  const bEvidenceStrength =
    (clampPercent(profileB.affinity) / 100) *
    (clampPercent(profileB.coverage) / 100);

  return round1(
    Math.min(aEvidenceStrength, bEvidenceStrength) *
      mapping.strength *
      100,
  );
}

function buildSemanticComplement(
  mapping: SharedInteractionMapping,
  profileA: SharedSemanticEvidence,
  profileB: SharedSemanticEvidence,
): SharedSemanticComplement {
  return {
    mappingId: mapping.id,
    relationshipKind: mapping.relationshipKind,
    authoritySemantics: mapping.authoritySemantics,
    strength: mapping.strength,
    fitScore: semanticFitScore(mapping, profileA, profileB),
    profileA,
    profileB,
    explanation: mapping.explanation,
  };
}

function buildSemanticComplements(
  profileA: SharedProfileComparisonInput,
  profileB: SharedProfileComparisonInput,
): SharedSemanticComplement[] {
  const aEvidence = buildSemanticEvidenceMap(profileA);
  const bEvidence = buildSemanticEvidenceMap(profileB);
  const matches: SharedSemanticComplement[] = [];

  for (const mapping of sharedInteractionMappings) {
    const aSource = aEvidence.get(conceptKey(mapping.source));
    const aTarget = aEvidence.get(conceptKey(mapping.target));
    const bSource = bEvidence.get(conceptKey(mapping.source));
    const bTarget = bEvidence.get(conceptKey(mapping.target));

    if (aSource && bTarget) {
      matches.push(buildSemanticComplement(mapping, aSource, bTarget));
    }

    if (
      mapping.directionality === "bidirectional" &&
      aTarget &&
      bSource
    ) {
      matches.push(buildSemanticComplement(mapping, aTarget, bSource));
    }
  }

  const deduped = new Map<string, SharedSemanticComplement>();

  for (const match of matches) {
    const key = [
      match.mappingId,
      conceptKey(match.profileA.concept),
      conceptKey(match.profileB.concept),
    ].join("|");

    const current = deduped.get(key);
    if (!current || match.fitScore > current.fitScore) {
      deduped.set(key, match);
    }
  }

  return [...deduped.values()].sort((left, right) => {
    if (right.fitScore !== left.fitScore) {
      return right.fitScore - left.fitScore;
    }

    const mappingCompare = left.mappingId.localeCompare(right.mappingId);
    if (mappingCompare !== 0) return mappingCompare;

    return semanticConceptLabel(left.profileA.concept).localeCompare(
      semanticConceptLabel(right.profileA.concept),
    );
  });
}

function groupCatalogByState(
  items: readonly SharedCatalogItemComparison[],
): Record<SharedItemState, readonly SharedCatalogItemComparison[]> {
  return {
    mutual_positive: items.filter((item) => item.state === "mutual_positive"),
    complementary: items.filter((item) => item.state === "complementary"),
    mutual_curious: items.filter((item) => item.state === "mutual_curious"),
    one_positive_one_curious: items.filter(
      (item) => item.state === "one_positive_one_curious",
    ),
    different_context: items.filter(
      (item) => item.state === "different_context",
    ),
    excluded: items.filter((item) => item.state === "excluded"),
    unknown: items.filter((item) => item.state === "unknown"),
  };
}

/**
 * Derive a relationship view from two independent profiles.
 *
 * This function is intentionally read-only:
 * - it never mutates either profile
 * - it never writes shared state back into individual evidence
 * - pairwise ranking alone never becomes an absolute positive preference
 * - complement mappings preserve their authority/activity/role semantics
 *
 * M14.6 current-session participant intent and M14.7 shared Scene Builder
 * filtering are later consumers of this derived model.
 */
export function buildSharedProfileComparison(
  profileA: SharedProfileComparisonInput,
  profileB: SharedProfileComparisonInput,
): SharedProfileComparison {
  const catalogItems = buildCatalogComparisons(profileA, profileB);

  return {
    catalogItems,
    catalogByState: groupCatalogByState(catalogItems),
    semanticComplements: buildSemanticComplements(profileA, profileB),
  };
}

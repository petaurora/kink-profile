import {
  dynamicModes,
  roleHeadspaces,
} from "../data/headspacesQuiz";
import { overallFacetDefinitions } from "../data/overallFacets";
import {
  getSceneTheme,
  type SceneThemeDefinition,
  type SceneThemeId,
} from "../data/sceneThemes";
import type { SignalId } from "../data/signals";
import type {
  CatalogPreferenceState,
} from "./catalogProfile";
import {
  getSceneSessionChoice,
  type SceneSessionChoice,
  type SceneSessionState,
} from "./sceneSession";
import type {
  CatalogRankContext,
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";

export type SceneExplorationMode = "familiar" | "mixed" | "explore";
export type SceneIntensityPreference =
  | "any"
  | "light"
  | "moderate"
  | "intense";

export type SceneCandidateProvenance =
  | "session"
  | "explicit"
  | "pairwise"
  | "explicit_and_pairwise"
  | "inference_only";

export type SceneThemeMatch = {
  themeId: SceneThemeId;
  label: string;
  fit: number;
};

export type SceneCandidateSharedContext = {
  state:
    | "mutual_positive"
    | "complementary"
    | "mutual_curious"
    | "one_positive_one_curious"
    | "different_context"
    | "unknown";
  explanation: string;
  profileASessionChoice?: SceneSessionChoice;
  profileBSessionChoice?: SceneSessionChoice;
};

export type SceneCandidate = {
  catalogId: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  direction: CatalogResultItem["item"]["direction"];
  intensity: string;
  riskLevel: string;
  explicitState?: CatalogPreferenceState;
  sessionChoice?: SceneSessionChoice;
  provenance: SceneCandidateProvenance;
  themeMatches: readonly SceneThemeMatch[];
  matchedThemeIds: readonly SceneThemeId[];
  bridge: boolean;
  score: number;
  automaticEligible: boolean;
  meaningfulPairwiseComparisons: number;
  overallRank?: CatalogRankContext;
  categoryRank?: CatalogRankContext;
  inferredAffinity?: number;
  inferredCoverage?: number;
  sharedContext?: SceneCandidateSharedContext;
};

export type SceneCandidateLane = {
  themeId: SceneThemeId;
  label: string;
  candidates: readonly SceneCandidate[];
};

export type SceneCandidateView = {
  selectedThemeIds: readonly SceneThemeId[];
  confirmed: readonly SceneCandidate[];
  suggestedToExplore: readonly SceneCandidate[];
  themeLanes: readonly SceneCandidateLane[];
  bridgeCandidates: readonly SceneCandidate[];
  coverageOrder: readonly SceneCandidate[];
};

export type SceneCandidateOptions = {
  exploration?: SceneExplorationMode;
  intensity?: SceneIntensityPreference;
  minimumThemeFit?: number;
  sessionState?: SceneSessionState;
};

const explicitStrength: Partial<Record<CatalogPreferenceState, number>> = {
  love: 1,
  like: 0.84,
  curious: 0.64,
};

const roleHeadspaceById = new Map(
  roleHeadspaces.map((definition) => [definition.id, definition]),
);
const dynamicModeById = new Map(
  dynamicModes.map((definition) => [definition.id, definition]),
);
const facetById = new Map(
  overallFacetDefinitions.map((definition) => [definition.id, definition]),
);

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function mergeSignalWeight(
  target: Map<SignalId, number>,
  signalId: SignalId,
  weight: number,
) {
  if (!Number.isFinite(weight) || weight <= 0) return;
  target.set(signalId, Math.max(target.get(signalId) ?? 0, clamp01(weight)));
}

function expandedThemeSignalWeights(theme: SceneThemeDefinition) {
  const weights = new Map<SignalId, number>();

  for (const mapping of theme.mappings) {
    if (mapping.kind === "signal") {
      mergeSignalWeight(weights, mapping.id, mapping.weight);
      continue;
    }

    if (mapping.kind === "headspace") {
      const definition = roleHeadspaceById.get(mapping.id);
      if (!definition) continue;

      for (const [signalId, signalWeight] of Object.entries(
        definition.weights,
      ) as Array<[SignalId, number | undefined]>) {
        mergeSignalWeight(
          weights,
          signalId,
          mapping.weight * (signalWeight ?? 0),
        );
      }
      continue;
    }

    if (mapping.kind === "dynamic_mode") {
      const definition = dynamicModeById.get(mapping.id);
      if (!definition) continue;

      for (const [signalId, signalWeight] of Object.entries(
        definition.weights,
      ) as Array<[SignalId, number | undefined]>) {
        mergeSignalWeight(
          weights,
          signalId,
          mapping.weight * (signalWeight ?? 0),
        );
      }
      continue;
    }

    if (mapping.kind === "facet") {
      const definition = facetById.get(mapping.id);
      if (!definition) continue;

      for (const signal of definition.signals) {
        mergeSignalWeight(
          weights,
          signal.signalId,
          mapping.weight * signal.weight,
        );
      }
    }
  }

  return weights;
}

function categoryThemeFit(
  item: CatalogResultItem,
  theme: SceneThemeDefinition,
) {
  return theme.mappings
    .filter((mapping) => mapping.kind === "catalog_category")
    .filter((mapping) => mapping.id === item.item.categoryId)
    .reduce((best, mapping) => Math.max(best, mapping.weight), 0);
}

function signalThemeFit(
  item: CatalogResultItem,
  theme: SceneThemeDefinition,
) {
  const themeSignalWeights = expandedThemeSignalWeights(theme);
  if (themeSignalWeights.size === 0 || item.item.signalMappings.length === 0) {
    return 0;
  }

  const itemSignalWeights = new Map(
    item.item.signalMappings.map((mapping) => [
      mapping.signalId,
      clamp01(mapping.weight),
    ]),
  );

  let totalThemeWeight = 0;
  let matchedWeight = 0;

  for (const [signalId, themeWeight] of themeSignalWeights) {
    totalThemeWeight += themeWeight;
    matchedWeight +=
      themeWeight * (itemSignalWeights.get(signalId) ?? 0);
  }

  return totalThemeWeight > 0
    ? clamp01(matchedWeight / totalThemeWeight)
    : 0;
}

export function calculateSceneThemeFit(
  item: CatalogResultItem,
  theme: SceneThemeDefinition,
) {
  return round1(
    Math.max(
      categoryThemeFit(item, theme),
      signalThemeFit(item, theme),
    ) * 100,
  );
}

function rankStrength(rank: CatalogRankContext | undefined) {
  if (!rank || rank.comparisons <= 0) return 0;

  const placement = 1 / (1 + Math.max(0, rank.rank - 1) * 0.18);
  return clamp01(placement * clamp01(rank.confidence));
}

function directEvidenceStrength(
  item: CatalogResultItem,
  exploration: SceneExplorationMode,
  sessionChoice: SceneSessionChoice | undefined,
) {
  const sessionStrength =
    sessionChoice === "yes_tonight"
      ? 1
      : sessionChoice === "maybe_tonight"
        ? 0.68
        : 0;

  const explicit = item.explicitState
    ? explicitStrength[item.explicitState] ?? 0
    : 0;

  if (sessionStrength <= 0 && item.explicitState === "unsure") {
    return 0;
  }

  if (
    sessionStrength <= 0 &&
    item.explicitState === "curious" &&
    exploration !== "explore"
  ) {
    return 0;
  }

  const pairwise =
    exploration !== "familiar" &&
    item.explicitState === undefined &&
    item.meaningfulPairwiseComparisons > 0
      ? Math.max(
          rankStrength(item.overallRank),
          rankStrength(item.categoryRank),
          Math.min(0.5, item.meaningfulPairwiseComparisons / 10),
        )
      : 0;

  return Math.max(sessionStrength, explicit, pairwise);
}

function provenanceFor(
  item: CatalogResultItem,
  sessionChoice: SceneSessionChoice | undefined,
): SceneCandidateProvenance {
  const hasExplicit = item.explicitState !== undefined;
  const hasPairwise = item.meaningfulPairwiseComparisons > 0;

  if (hasExplicit && hasPairwise) return "explicit_and_pairwise";
  if (hasExplicit) return "explicit";
  if (hasPairwise) return "pairwise";
  if (
    sessionChoice === "yes_tonight" ||
    sessionChoice === "maybe_tonight"
  ) {
    return "session";
  }
  return "inference_only";
}

function isHardExcluded(item: CatalogResultItem) {
  return (
    item.explicitState === "hard_limit" ||
    item.explicitState === "not_interested" ||
    item.explicitState === "not_applicable"
  );
}

export function matchesSceneIntensityPreference(
  intensity: string,
  preference: SceneIntensityPreference,
) {
  if (preference === "any") return true;

  const normalized = intensity.trim().toLocaleLowerCase();
  if (!normalized || normalized === "variable") return true;

  if (preference === "light") {
    return normalized === "low" || normalized === "low-moderate";
  }

  if (preference === "moderate") {
    return (
      normalized === "low-moderate" ||
      normalized === "moderate"
    );
  }

  return normalized === "moderate-high" || normalized === "high";
}

function themeMatchesFor(
  item: CatalogResultItem,
  themeIds: readonly SceneThemeId[],
  minimumThemeFit: number,
) {
  return themeIds.flatMap((themeId): SceneThemeMatch[] => {
    const theme = getSceneTheme(themeId);
    if (!theme) return [];

    const fit = calculateSceneThemeFit(item, theme);
    if (fit < minimumThemeFit) return [];

    return [
      {
        themeId,
        label: theme.label,
        fit,
      },
    ];
  });
}

function compareCandidates(left: SceneCandidate, right: SceneCandidate) {
  if (right.score !== left.score) return right.score - left.score;

  const rightBestFit = Math.max(...right.themeMatches.map((match) => match.fit));
  const leftBestFit = Math.max(...left.themeMatches.map((match) => match.fit));
  if (rightBestFit !== leftBestFit) return rightBestFit - leftBestFit;

  return (
    left.label.localeCompare(right.label) ||
    left.catalogId.localeCompare(right.catalogId)
  );
}

function toCandidate(
  item: CatalogResultItem,
  themeMatches: readonly SceneThemeMatch[],
  exploration: SceneExplorationMode,
  sessionChoice: SceneSessionChoice | undefined,
): SceneCandidate | undefined {
  const provenance = provenanceFor(item, sessionChoice);
  const bestThemeFit = Math.max(...themeMatches.map((match) => match.fit)) / 100;
  const averageThemeFit =
    themeMatches.reduce((sum, match) => sum + match.fit, 0) /
    themeMatches.length /
    100;
  const directStrength = directEvidenceStrength(
    item,
    exploration,
    sessionChoice,
  );
  const rankingStrength = Math.max(
    rankStrength(item.overallRank),
    rankStrength(item.categoryRank),
  );

  const inferenceStrength = item.inferred
    ? clamp01(
        (item.inferred.affinity / 100) *
          (0.5 + (item.inferred.coverage / 100) * 0.5),
      )
    : 0;

  const automaticEligible =
    provenance !== "inference_only" &&
    directStrength > 0 &&
    (
      sessionChoice === "yes_tonight" ||
      sessionChoice === "maybe_tonight" ||
      item.explicitState !== "curious" ||
      exploration === "explore"
    );

  if (!automaticEligible && provenance !== "inference_only") {
    return undefined;
  }

  if (provenance === "inference_only" && !item.inferred) {
    return undefined;
  }

  const evidenceStrength =
    provenance === "inference_only" ? inferenceStrength : directStrength;

  const score = round1(
    100 *
      (
        bestThemeFit * 0.45 +
        averageThemeFit * 0.15 +
        evidenceStrength * 0.25 +
        rankingStrength * 0.1 +
        inferenceStrength * 0.05
      ),
  );

  return {
    catalogId: item.item.id,
    label: item.item.label,
    categoryId: item.item.categoryId,
    categoryLabel: item.item.categoryLabel,
    direction: item.item.direction,
    intensity: item.item.intensity,
    riskLevel: item.item.riskLevel,
    explicitState: item.explicitState,
    sessionChoice,
    provenance,
    themeMatches,
    matchedThemeIds: themeMatches.map((match) => match.themeId),
    bridge: themeMatches.length > 1,
    score,
    automaticEligible,
    meaningfulPairwiseComparisons: item.meaningfulPairwiseComparisons,
    overallRank: item.overallRank,
    categoryRank: item.categoryRank,
    inferredAffinity: item.inferred?.affinity,
    inferredCoverage: item.inferred?.coverage,
  };
}

function buildCoverageOrder(
  candidates: readonly SceneCandidate[],
  selectedThemeIds: readonly SceneThemeId[],
) {
  const uncovered = new Set(selectedThemeIds);
  const remaining = [...candidates];
  const ordered: SceneCandidate[] = [];

  while (uncovered.size > 0 && remaining.length > 0) {
    remaining.sort((left, right) => {
      const leftMatches = left.themeMatches.filter((match) =>
        uncovered.has(match.themeId),
      );
      const rightMatches = right.themeMatches.filter((match) =>
        uncovered.has(match.themeId),
      );

      if (rightMatches.length !== leftMatches.length) {
        return rightMatches.length - leftMatches.length;
      }

      const leftCoverage = leftMatches.reduce(
        (sum, match) => sum + match.fit,
        0,
      );
      const rightCoverage = rightMatches.reduce(
        (sum, match) => sum + match.fit,
        0,
      );

      if (rightCoverage !== leftCoverage) {
        return rightCoverage - leftCoverage;
      }

      return compareCandidates(left, right);
    });

    const next = remaining.shift();
    if (!next) break;

    const newlyCovered = next.matchedThemeIds.filter((themeId) =>
      uncovered.has(themeId),
    );
    if (newlyCovered.length === 0) break;

    ordered.push(next);
    for (const themeId of newlyCovered) uncovered.delete(themeId);
  }

  return [
    ...ordered,
    ...remaining.sort(compareCandidates),
  ];
}

/**
 * M13.2 pure candidate derivation.
 *
 * This reads the existing M6/M7 result view and never writes back into profile
 * state. Inference-only items are isolated in Suggested to explore and are
 * never automatic candidates.
 */
export function buildSceneCandidateView(
  resultView: CatalogResultView,
  selectedThemeIds: readonly SceneThemeId[],
  options: SceneCandidateOptions = {},
): SceneCandidateView {
  const exploration = options.exploration ?? "mixed";
  const intensity = options.intensity ?? "any";
  const sessionState = options.sessionState;
  const minimumThemeFit = Math.max(
    1,
    Math.min(100, options.minimumThemeFit ?? 18),
  );
  const selectedThemes = [
    ...new Set(selectedThemeIds),
  ].filter((themeId) => getSceneTheme(themeId) !== undefined);

  if (selectedThemes.length === 0) {
    return {
      selectedThemeIds: [],
      confirmed: [],
      suggestedToExplore: [],
      themeLanes: [],
      bridgeCandidates: [],
      coverageOrder: [],
    };
  }

  const confirmed: SceneCandidate[] = [];
  const suggestedToExplore: SceneCandidate[] = [];

  for (const item of resultView.items) {
    if (isHardExcluded(item)) continue;

    const sessionChoice = getSceneSessionChoice(
      sessionState,
      item.item.id,
    );
    if (sessionChoice === "not_tonight") continue;
    if (!matchesSceneIntensityPreference(item.item.intensity, intensity)) {
      continue;
    }

    const themeMatches = themeMatchesFor(
      item,
      selectedThemes,
      minimumThemeFit,
    );
    if (themeMatches.length === 0) continue;

    const candidate = toCandidate(
      item,
      themeMatches,
      exploration,
      sessionChoice,
    );
    if (!candidate) continue;

    if (candidate.provenance === "inference_only") {
      suggestedToExplore.push(candidate);
    } else if (candidate.automaticEligible) {
      confirmed.push(candidate);
    }
  }

  confirmed.sort(compareCandidates);
  suggestedToExplore.sort(compareCandidates);

  const themeLanes = selectedThemes.map((themeId): SceneCandidateLane => {
    const theme = getSceneTheme(themeId);

    return {
      themeId,
      label: theme?.label ?? themeId,
      candidates: confirmed
        .filter((candidate) => candidate.matchedThemeIds.includes(themeId))
        .sort((left, right) => {
          const leftFit =
            left.themeMatches.find((match) => match.themeId === themeId)?.fit ??
            0;
          const rightFit =
            right.themeMatches.find((match) => match.themeId === themeId)?.fit ??
            0;

          return rightFit - leftFit || compareCandidates(left, right);
        }),
    };
  });

  const bridgeCandidates = confirmed
    .filter((candidate) => candidate.bridge)
    .sort((left, right) => {
      if (right.matchedThemeIds.length !== left.matchedThemeIds.length) {
        return right.matchedThemeIds.length - left.matchedThemeIds.length;
      }

      return compareCandidates(left, right);
    });

  return {
    selectedThemeIds: selectedThemes,
    confirmed,
    suggestedToExplore,
    themeLanes,
    bridgeCandidates,
    coverageOrder: buildCoverageOrder(confirmed, selectedThemes),
  };
}

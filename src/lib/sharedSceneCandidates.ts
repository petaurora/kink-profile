import {
  dynamicModes,
  roleHeadspaces,
} from "../data/headspacesQuiz";
import {
  sceneThemeDefinitions,
  type SceneThemeId,
} from "../data/sceneThemes";
import type {
  SharedInteractionConceptRef,
} from "../data/sharedInteractionMappings";
import {
  calculateSceneThemeFit,
  matchesSceneIntensityPreference,
  type SceneCandidate,
  type SceneCandidateLane,
  type SceneCandidateView,
  type SceneExplorationMode,
  type SceneIntensityPreference,
  type SceneThemeMatch,
} from "./sceneCandidates";
import {
  getSceneSessionChoice,
  type SceneSessionChoice,
  type SceneSessionState,
} from "./sceneSession";
import type {
  CatalogResultItem,
  CatalogResultView,
} from "./catalogResults";
import type {
  SharedCatalogEvidence,
  SharedCatalogItemComparison,
  SharedItemState,
  SharedProfileComparison,
} from "./sharedProfileComparison";
import type {
  SharedParticipantIntent,
} from "./sharedParticipantIntent";

export type SharedSceneCandidateOptions = {
  exploration?: SceneExplorationMode;
  intensity?: SceneIntensityPreference;
  minimumThemeFit?: number;
  profileASessionState?: SceneSessionState;
  profileBSessionState?: SceneSessionState;
};

const positiveStates = new Set(["love", "like"]);

function isPositiveEvidence(evidence: SharedCatalogEvidence) {
  return (
    positiveStates.has(evidence.overall ?? "") ||
    positiveStates.has(evidence.receiving ?? "") ||
    positiveStates.has(evidence.giving ?? "")
  );
}

function isCuriousEvidence(evidence: SharedCatalogEvidence) {
  return evidence.overall === "curious";
}

function sessionSupports(choice: SceneSessionChoice | undefined) {
  return choice === "yes_tonight" || choice === "maybe_tonight";
}

function participantSupports(
  evidence: SharedCatalogEvidence,
  choice: SceneSessionChoice | undefined,
  exploration: SceneExplorationMode,
) {
  if (sessionSupports(choice)) return true;
  if (isPositiveEvidence(evidence)) return true;
  return exploration === "explore" && isCuriousEvidence(evidence);
}

function directSharedEligibility(
  item: SharedCatalogItemComparison,
  profileASessionChoice: SceneSessionChoice | undefined,
  profileBSessionChoice: SceneSessionChoice | undefined,
  exploration: SceneExplorationMode,
) {
  if (
    profileASessionChoice === "not_tonight" ||
    profileBSessionChoice === "not_tonight"
  ) {
    return false;
  }

  if (item.state === "excluded") return false;

  if (item.state === "mutual_positive" || item.state === "complementary") {
    return true;
  }

  const aSupports = participantSupports(
    item.profileA,
    profileASessionChoice,
    exploration,
  );
  const bSupports = participantSupports(
    item.profileB,
    profileBSessionChoice,
    exploration,
  );

  if (aSupports && bSupports) return true;

  return (
    exploration === "explore" &&
    (
      item.state === "mutual_curious" ||
      item.state === "one_positive_one_curious"
    )
  );
}

function sharedSuggestionEligible(
  item: SharedCatalogItemComparison,
  profileASessionChoice: SceneSessionChoice | undefined,
  profileBSessionChoice: SceneSessionChoice | undefined,
) {
  if (
    profileASessionChoice === "not_tonight" ||
    profileBSessionChoice === "not_tonight" ||
    item.state === "excluded"
  ) {
    return false;
  }

  return (
    item.state === "mutual_curious" ||
    item.state === "one_positive_one_curious" ||
    item.state === "different_context"
  );
}

function sharedStateStrength(state: SharedItemState) {
  switch (state) {
    case "complementary":
      return 1;
    case "mutual_positive":
      return 0.96;
    case "one_positive_one_curious":
      return 0.76;
    case "mutual_curious":
      return 0.68;
    case "different_context":
      return 0.58;
    case "unknown":
      return 0.35;
    case "excluded":
      return 0;
  }
}

function compareCandidates(left: SceneCandidate, right: SceneCandidate) {
  if (right.score !== left.score) return right.score - left.score;

  const leftBestFit = Math.max(
    0,
    ...left.themeMatches.map((match) => match.fit),
  );
  const rightBestFit = Math.max(
    0,
    ...right.themeMatches.map((match) => match.fit),
  );

  if (rightBestFit !== leftBestFit) return rightBestFit - leftBestFit;

  return (
    left.label.localeCompare(right.label) ||
    left.catalogId.localeCompare(right.catalogId)
  );
}

function themeMatchesFor(
  item: CatalogResultItem,
  themeIds: readonly SceneThemeId[],
  minimumThemeFit: number,
): readonly SceneThemeMatch[] {
  return themeIds.flatMap((themeId): SceneThemeMatch[] => {
    const theme = sceneThemeDefinitions.find(
      (candidate) => candidate.id === themeId,
    );
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

function candidateFor(
  result: CatalogResultItem,
  comparison: SharedCatalogItemComparison,
  themeMatches: readonly SceneThemeMatch[],
  automaticEligible: boolean,
  profileASessionChoice: SceneSessionChoice | undefined,
  profileBSessionChoice: SceneSessionChoice | undefined,
): SceneCandidate {
  const bestThemeFit =
    Math.max(...themeMatches.map((match) => match.fit)) / 100;
  const averageThemeFit =
    themeMatches.reduce((sum, match) => sum + match.fit, 0) /
    themeMatches.length /
    100;
  const stateStrength = sharedStateStrength(comparison.state);
  const sessionBoost =
    sessionSupports(profileASessionChoice) &&
    sessionSupports(profileBSessionChoice)
      ? 0.08
      : sessionSupports(profileASessionChoice) ||
          sessionSupports(profileBSessionChoice)
        ? 0.03
        : 0;

  const score =
    Math.round(
      10 *
        100 *
        Math.min(
          1,
          bestThemeFit * 0.52 +
            averageThemeFit * 0.18 +
            stateStrength * 0.3 +
            sessionBoost,
        ),
    ) / 10;

  return {
    catalogId: result.item.id,
    label: result.item.label,
    categoryId: result.item.categoryId,
    categoryLabel: result.item.categoryLabel,
    direction: result.item.direction,
    intensity: result.item.intensity,
    riskLevel: result.item.riskLevel,
    provenance:
      sessionSupports(profileASessionChoice) ||
      sessionSupports(profileBSessionChoice)
        ? "session"
        : "explicit",
    themeMatches,
    matchedThemeIds: themeMatches.map((match) => match.themeId),
    bridge: themeMatches.length > 1,
    score,
    automaticEligible,
    meaningfulPairwiseComparisons: Math.max(
      comparison.profileA.meaningfulPairwiseComparisons,
      comparison.profileB.meaningfulPairwiseComparisons,
    ),
    sharedContext: {
      state:
        comparison.state === "excluded"
          ? "unknown"
          : comparison.state,
      explanation: comparison.explanation,
      profileASessionChoice,
      profileBSessionChoice,
    },
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

  return [...ordered, ...remaining.sort(compareCandidates)];
}

function buildThemeLanes(
  candidates: readonly SceneCandidate[],
  selectedThemeIds: readonly SceneThemeId[],
): readonly SceneCandidateLane[] {
  return selectedThemeIds.map((themeId) => ({
    themeId,
    label:
      sceneThemeDefinitions.find((theme) => theme.id === themeId)?.label ??
      themeId,
    candidates: candidates
      .filter((candidate) => candidate.matchedThemeIds.includes(themeId))
      .sort(compareCandidates),
  }));
}

function resultForId(
  profileA: CatalogResultView,
  profileB: CatalogResultView,
  catalogId: string,
) {
  return (
    profileA.byCatalogId.get(catalogId) ??
    profileB.byCatalogId.get(catalogId)
  );
}

export function buildSharedSceneCandidateView(
  profileA: CatalogResultView,
  profileB: CatalogResultView,
  comparison: SharedProfileComparison,
  selectedThemeIds: readonly SceneThemeId[],
  options: SharedSceneCandidateOptions = {},
): SceneCandidateView {
  const exploration = options.exploration ?? "mixed";
  const intensity = options.intensity ?? "any";
  const minimumThemeFit = Math.max(
    1,
    Math.min(100, options.minimumThemeFit ?? 18),
  );
  const selectedThemes = [...new Set(selectedThemeIds)].filter((themeId) =>
    sceneThemeDefinitions.some((theme) => theme.id === themeId),
  );

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

  for (const sharedItem of comparison.catalogItems) {
    if (sharedItem.state === "excluded") continue;

    const result = resultForId(
      profileA,
      profileB,
      sharedItem.catalogId,
    );
    if (!result) continue;

    const profileASessionChoice = getSceneSessionChoice(
      options.profileASessionState,
      sharedItem.catalogId,
    );
    const profileBSessionChoice = getSceneSessionChoice(
      options.profileBSessionState,
      sharedItem.catalogId,
    );

    if (
      profileASessionChoice === "not_tonight" ||
      profileBSessionChoice === "not_tonight"
    ) {
      continue;
    }

    if (
      !matchesSceneIntensityPreference(
        result.item.intensity,
        intensity,
      )
    ) {
      continue;
    }

    const themeMatches = themeMatchesFor(
      result,
      selectedThemes,
      minimumThemeFit,
    );
    if (themeMatches.length === 0) continue;

    const automaticEligible = directSharedEligibility(
      sharedItem,
      profileASessionChoice,
      profileBSessionChoice,
      exploration,
    );

    if (automaticEligible) {
      confirmed.push(
        candidateFor(
          result,
          sharedItem,
          themeMatches,
          true,
          profileASessionChoice,
          profileBSessionChoice,
        ),
      );
      continue;
    }

    if (
      sharedSuggestionEligible(
        sharedItem,
        profileASessionChoice,
        profileBSessionChoice,
      )
    ) {
      suggestedToExplore.push(
        candidateFor(
          result,
          sharedItem,
          themeMatches,
          false,
          profileASessionChoice,
          profileBSessionChoice,
        ),
      );
    }
  }

  confirmed.sort(compareCandidates);
  suggestedToExplore.sort(compareCandidates);

  return {
    selectedThemeIds: selectedThemes,
    confirmed,
    suggestedToExplore,
    themeLanes: buildThemeLanes(confirmed, selectedThemes),
    bridgeCandidates: confirmed
      .filter((candidate) => candidate.bridge)
      .sort(compareCandidates),
    coverageOrder: buildCoverageOrder(confirmed, selectedThemes),
  };
}

function conceptSignalWeights(concept: SharedInteractionConceptRef) {
  if (concept.kind === "signal") {
    return new Map([[concept.id, 1]]);
  }

  const definition =
    concept.kind === "headspace"
      ? roleHeadspaces.find((candidate) => candidate.id === concept.id)
      : dynamicModes.find((candidate) => candidate.id === concept.id);

  return new Map(
    Object.entries(definition?.weights ?? {}).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && entry[1] > 0,
    ),
  );
}

export function getSceneThemeIdsForSharedIntentConcept(
  concept: SharedInteractionConceptRef,
): readonly SceneThemeId[] {
  const conceptSignals = conceptSignalWeights(concept);

  return sceneThemeDefinitions
    .filter((theme) => {
      let bestFit = 0;

      for (const mapping of theme.mappings) {
        if (
          mapping.kind === concept.kind &&
          mapping.id === concept.id
        ) {
          bestFit = Math.max(bestFit, mapping.weight);
          continue;
        }

        if (mapping.kind !== "signal") continue;

        const conceptWeight = conceptSignals.get(mapping.id) ?? 0;
        bestFit = Math.max(
          bestFit,
          conceptWeight * mapping.weight,
        );
      }

      return bestFit >= 0.25;
    })
    .map((theme) => theme.id);
}

export function getSceneThemeIdsForSharedParticipantIntents(
  profileAIntent: SharedParticipantIntent,
  profileBIntent: SharedParticipantIntent,
): readonly SceneThemeId[] {
  const ids = new Set<SceneThemeId>();

  for (const concept of [
    ...profileAIntent.selectedConcepts,
    ...profileBIntent.selectedConcepts,
  ]) {
    for (const themeId of getSceneThemeIdsForSharedIntentConcept(concept)) {
      ids.add(themeId);
    }
  }

  return [...ids];
}

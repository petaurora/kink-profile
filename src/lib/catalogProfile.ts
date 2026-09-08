import {
  KINK_RANKING_ALGORITHM_VERSION,
  type KinkComparison,
  type RankingRun,
} from "./kinkRanking";

export const catalogPreferenceStates = [
  "love",
  "like",
  "curious",
  "unsure",
  "not_interested",
  "hard_limit",
  "not_applicable",
] as const;

export type CatalogPreferenceState = (typeof catalogPreferenceStates)[number];
export type CatalogPreferenceContext = "overall" | "receiving" | "giving";

export type CatalogItemPreference = {
  overall?: CatalogPreferenceState;
  receiving?: CatalogPreferenceState;
  giving?: CatalogPreferenceState;
  updatedAt: string;
};

export const INITIAL_KINK_RANKING_RUN_ID = "ranking-run-initial";

export type KinkRankingHistory = {
  activeRunId: string;
  runs: Record<string, RankingRun>;
};

export type CatalogProfileState = {
  schemaVersion: 1;
  preferences: Record<string, CatalogItemPreference>;
  comparisons: KinkComparison[];
  /**
   * Added by M12.1 without changing the outer catalog schema so old profile
   * backups remain importable. loadCatalogProfile() always normalizes this.
   */
  rankingHistory?: KinkRankingHistory;
};

export function createInitialKinkRankingHistory(
  startedAt = new Date().toISOString(),
  runId = INITIAL_KINK_RANKING_RUN_ID,
): KinkRankingHistory {
  return {
    activeRunId: runId,
    runs: {
      [runId]: {
        id: runId,
        startedAt,
        status: "active",
        algorithmVersion: KINK_RANKING_ALGORITHM_VERSION,
      },
    },
  };
}

function earliestComparisonTimestamp(comparisons: readonly KinkComparison[]) {
  return comparisons
    .map((comparison) => comparison.timestamp)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))[0];
}

export function normalizeCatalogRankingHistory(
  profile: CatalogProfileState,
  fallbackStartedAt = new Date().toISOString(),
): CatalogProfileState {
  const history =
    profile.rankingHistory ??
    createInitialKinkRankingHistory(
      earliestComparisonTimestamp(profile.comparisons) ?? fallbackStartedAt,
    );

  const activeRunId = history.activeRunId;
  const knownRunIds = new Set(Object.keys(history.runs));

  const comparisons = profile.comparisons.map((comparison) => {
    if (comparison.runId && knownRunIds.has(comparison.runId)) {
      return comparison;
    }

    return {
      ...comparison,
      runId: activeRunId,
    };
  });

  return {
    ...profile,
    comparisons,
    rankingHistory: history,
  };
}

export function getActiveKinkRankingRunId(profile: CatalogProfileState) {
  return (
    profile.rankingHistory?.activeRunId ??
    INITIAL_KINK_RANKING_RUN_ID
  );
}

export function getActiveKinkRankingComparisons(
  profile: CatalogProfileState,
): KinkComparison[] {
  const activeRunId = getActiveKinkRankingRunId(profile);

  return profile.comparisons.filter(
    (comparison) =>
      (comparison.runId ?? activeRunId) === activeRunId,
  );
}

export function createEmptyCatalogProfileState(
  startedAt = new Date().toISOString(),
): CatalogProfileState {
  return {
    schemaVersion: 1,
    preferences: {},
    comparisons: [],
    rankingHistory: createInitialKinkRankingHistory(startedAt),
  };
}

export function getCatalogPreference(
  preference: CatalogItemPreference | undefined,
  context: CatalogPreferenceContext,
): CatalogPreferenceState | undefined {
  if (!preference) return undefined;
  if (context === "receiving") return preference.receiving ?? preference.overall;
  if (context === "giving") return preference.giving ?? preference.overall;
  return preference.overall;
}

export function isCatalogPreferenceState(
  value: unknown,
): value is CatalogPreferenceState {
  return (
    typeof value === "string" &&
    (catalogPreferenceStates as readonly string[]).includes(value)
  );
}

export function isExcludedCatalogState(
  state: CatalogPreferenceState | undefined,
) {
  return (
    state === "hard_limit" ||
    state === "not_interested" ||
    state === "not_applicable"
  );
}

export function isCatalogItemEligible(
  preferences: CatalogProfileState["preferences"],
  catalogId: string,
) {
  return !isExcludedCatalogState(
    getCatalogPreference(preferences[catalogId], "overall"),
  );
}

export function filterEligibleCatalogItems<T extends { id: string }>(
  catalog: readonly T[],
  preferences: CatalogProfileState["preferences"],
): T[] {
  return catalog.filter((item) => isCatalogItemEligible(preferences, item.id));
}

export function setCatalogPreference(
  profile: CatalogProfileState,
  catalogId: string,
  context: CatalogPreferenceContext,
  state: CatalogPreferenceState,
  updatedAt = new Date().toISOString(),
): CatalogProfileState {
  const current = profile.preferences[catalogId];
  const nextPreference: CatalogItemPreference = {
    ...current,
    [context]: state,
    updatedAt,
  };

  return {
    ...profile,
    preferences: {
      ...profile.preferences,
      [catalogId]: nextPreference,
    },
  };
}

export function clearCatalogPreference(
  profile: CatalogProfileState,
  catalogId: string,
  context: CatalogPreferenceContext,
  updatedAt = new Date().toISOString(),
): CatalogProfileState {
  const current = profile.preferences[catalogId];
  if (!current || current[context] === undefined) return profile;

  const nextPreference: CatalogItemPreference = {
    ...current,
    updatedAt,
  };
  delete nextPreference[context];

  const hasState =
    nextPreference.overall !== undefined ||
    nextPreference.receiving !== undefined ||
    nextPreference.giving !== undefined;

  if (hasState) {
    return {
      ...profile,
      preferences: {
        ...profile.preferences,
        [catalogId]: nextPreference,
      },
    };
  }

  const nextPreferences = { ...profile.preferences };
  delete nextPreferences[catalogId];

  return {
    ...profile,
    preferences: nextPreferences,
  };
}

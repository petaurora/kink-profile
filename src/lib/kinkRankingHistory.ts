import type { KinkCatalogItem } from "../data/kinkCatalog.generated";
import {
  getActiveKinkRankingComparisons,
  getActiveKinkRankingRunId,
  type CatalogProfileState,
} from "./catalogProfile";
import {
  KINK_RANKING_ALGORITHM_VERSION,
  calculateRanking,
  countOrderingComparisonsForScope,
  selectCategoryFinalists,
  selectOverallCandidates,
  type RankingRunSnapshots,
  type RankingScope,
  type RankingScopeSnapshot,
} from "./kinkRanking";

function captureScopeSnapshot(
  catalog: readonly KinkCatalogItem[],
  comparisons: ReturnType<typeof getActiveKinkRankingComparisons>,
  scope: RankingScope,
  capturedAt: string,
): RankingScopeSnapshot | undefined {
  if (countOrderingComparisonsForScope(comparisons, scope) === 0) {
    return undefined;
  }

  const snapshot = calculateRanking(catalog, comparisons, scope);
  const items = snapshot.items
    .filter((item) => item.comparisons > 0)
    .map((item) => ({
      catalogId: item.id,
      rank: item.rank,
      comparisons: item.comparisons,
      confidence: item.confidence,
    }));

  if (items.length === 0) return undefined;

  return {
    capturedAt,
    confidence: snapshot.confidence,
    items,
  };
}

export function captureActiveKinkRankingSnapshots(
  profile: CatalogProfileState,
  eligibleCatalog: readonly KinkCatalogItem[],
  capturedAt = new Date().toISOString(),
): RankingRunSnapshots {
  const comparisons = getActiveKinkRankingComparisons(profile);
  const categories: RankingRunSnapshots["categories"] = {};

  const categoryIds = [
    ...new Set(
      comparisons.flatMap((comparison) =>
        comparison.scope.type === "category"
          ? [comparison.scope.categoryId]
          : [],
      ),
    ),
  ];

  for (const categoryId of categoryIds) {
    const scope: RankingScope = { type: "category", categoryId };
    const snapshot = captureScopeSnapshot(
      eligibleCatalog,
      comparisons,
      scope,
      capturedAt,
    );

    if (snapshot) {
      categories[categoryId] = snapshot;
    }
  }

  const finalists = selectCategoryFinalists(
    eligibleCatalog,
    comparisons,
    5,
  );
  const overallCandidates = selectOverallCandidates(
    eligibleCatalog,
    finalists,
    comparisons,
  );
  const overall = captureScopeSnapshot(
    overallCandidates,
    comparisons,
    { type: "overall" },
    capturedAt,
  );

  return {
    categories,
    ...(overall ? { overall } : {}),
  };
}

export function startNewKinkRankingRun(
  profile: CatalogProfileState,
  eligibleCatalog: readonly KinkCatalogItem[],
  newRunId: string,
  startedAt = new Date().toISOString(),
): CatalogProfileState {
  const activeRunId = getActiveKinkRankingRunId(profile);
  const history = profile.rankingHistory;

  if (!history || !history.runs[activeRunId]) {
    throw new Error("Cannot start a new ranking run without an active run.");
  }

  if (!newRunId || history.runs[newRunId]) {
    throw new Error("The new ranking run must have a unique ID.");
  }

  const snapshots = captureActiveKinkRankingSnapshots(
    profile,
    eligibleCatalog,
    startedAt,
  );

  const currentRun = history.runs[activeRunId];

  return {
    ...profile,
    rankingHistory: {
      activeRunId: newRunId,
      runs: {
        ...history.runs,
        [activeRunId]: {
          ...currentRun,
          status: "archived",
          archivedAt: startedAt,
          snapshots,
        },
        [newRunId]: {
          id: newRunId,
          startedAt,
          status: "active",
          algorithmVersion: KINK_RANKING_ALGORITHM_VERSION,
        },
      },
    },
  };
}

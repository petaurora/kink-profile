import type { CatalogProfileState } from "./catalogProfile";
import type {
  RankedKink,
  RankingRun,
  RankingScope,
  RankingScopeSnapshot,
} from "./kinkRanking";

export type RankingMovement =
  | {
      kind: "up" | "down";
      places: number;
      previousRank: number;
      previousCapturedAt: string;
      previousRunId: string;
    }
  | {
      kind: "same";
      places: 0;
      previousRank: number;
      previousCapturedAt: string;
      previousRunId: string;
    }
  | {
      kind: "new";
      previousRank: null;
      previousCapturedAt: string;
      previousRunId: string;
    };

export type PreviousComparableSnapshot = {
  run: RankingRun;
  snapshot: RankingScopeSnapshot;
};

function snapshotForScope(
  run: RankingRun,
  scope: RankingScope,
): RankingScopeSnapshot | undefined {
  if (!run.snapshots) return undefined;
  return scope.type === "overall"
    ? run.snapshots.overall
    : run.snapshots.categories[scope.categoryId];
}

export function getPreviousComparableRankingSnapshot(
  profile: CatalogProfileState,
  scope: RankingScope,
): PreviousComparableSnapshot | null {
  const history = profile.rankingHistory;
  if (!history) return null;

  const archived = Object.values(history.runs)
    .filter(
      (run) =>
        run.status === "archived" &&
        run.id !== history.activeRunId &&
        typeof run.archivedAt === "string",
    )
    .sort((a, b) =>
      (b.archivedAt ?? b.startedAt).localeCompare(
        a.archivedAt ?? a.startedAt,
      ),
    );

  for (const run of archived) {
    const snapshot = snapshotForScope(run, scope);
    if (snapshot) {
      return { run, snapshot };
    }
  }

  return null;
}

export function calculateRankingMovement(
  item: Pick<RankedKink, "id" | "rank" | "comparisons">,
  previous: PreviousComparableSnapshot | null,
): RankingMovement | null {
  if (!previous || item.comparisons <= 0) return null;

  const previousItem = previous.snapshot.items.find(
    (entry) => entry.catalogId === item.id,
  );

  if (!previousItem) {
    return {
      kind: "new",
      previousRank: null,
      previousCapturedAt: previous.snapshot.capturedAt,
      previousRunId: previous.run.id,
    };
  }

  const delta = previousItem.rank - item.rank;

  if (delta === 0) {
    return {
      kind: "same",
      places: 0,
      previousRank: previousItem.rank,
      previousCapturedAt: previous.snapshot.capturedAt,
      previousRunId: previous.run.id,
    };
  }

  return {
    kind: delta > 0 ? "up" : "down",
    places: Math.abs(delta),
    previousRank: previousItem.rank,
    previousCapturedAt: previous.snapshot.capturedAt,
    previousRunId: previous.run.id,
  };
}

export function rankingMovementLabel(movement: RankingMovement) {
  if (movement.kind === "new") {
    return "New this run; not ranked in the previous comparable run";
  }

  if (movement.kind === "same") {
    return `Unchanged, previously rank ${movement.previousRank}`;
  }

  const direction = movement.kind === "up" ? "Up" : "Down";
  return `${direction} ${movement.places} place${movement.places === 1 ? "" : "s"}, previously rank ${movement.previousRank}`;
}


export type ViewRelativeRankingItem = Pick<
  RankedKink,
  "id" | "comparisons"
>;

export function calculateViewRelativeRankingMovements(
  currentView: readonly ViewRelativeRankingItem[],
  previous: PreviousComparableSnapshot | null,
): ReadonlyMap<string, RankingMovement> {
  const movements = new Map<string, RankingMovement>();
  if (!previous) return movements;

  const currentIds = new Set(currentView.map((item) => item.id));
  const previousVisibleRanks = new Map(
    previous.snapshot.items
      .filter((item) => currentIds.has(item.catalogId))
      .slice()
      .sort(
        (left, right) =>
          left.rank - right.rank ||
          left.catalogId.localeCompare(right.catalogId),
      )
      .map((item, index) => [item.catalogId, index + 1] as const),
  );

  currentView.forEach((item, index) => {
    if (item.comparisons <= 0) return;

    const currentViewRank = index + 1;
    const previousViewRank = previousVisibleRanks.get(item.id);

    if (previousViewRank === undefined) {
      movements.set(item.id, {
        kind: "new",
        previousRank: null,
        previousCapturedAt: previous.snapshot.capturedAt,
        previousRunId: previous.run.id,
      });
      return;
    }

    const delta = previousViewRank - currentViewRank;
    if (delta === 0) {
      movements.set(item.id, {
        kind: "same",
        places: 0,
        previousRank: previousViewRank,
        previousCapturedAt: previous.snapshot.capturedAt,
        previousRunId: previous.run.id,
      });
      return;
    }

    movements.set(item.id, {
      kind: delta > 0 ? "up" : "down",
      places: Math.abs(delta),
      previousRank: previousViewRank,
      previousCapturedAt: previous.snapshot.capturedAt,
      previousRunId: previous.run.id,
    });
  });

  return movements;
}

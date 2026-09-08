import { kinkCatalogIdReplacements } from "../data/kinkCatalog.generated";
import {
  createEmptyCatalogProfileState,
  isCatalogPreferenceState,
  normalizeCatalogRankingHistory,
  type CatalogItemPreference,
  type CatalogProfileState,
  type KinkRankingHistory,
} from "./catalogProfile";
import type {
  ComparisonResult,
  KinkComparison,
  RankingRun,
  RankingRunSnapshots,
  RankingScope,
  RankingScopeSnapshot,
} from "./kinkRanking";
import { LEGACY_KINK_RANKING_STORAGE_KEY } from "./kinkRankingStorage";

export const CATALOG_PROFILE_STORAGE_KEY = "pet-profile-catalog-v1";

export { LEGACY_KINK_RANKING_STORAGE_KEY };

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

const comparisonResults = new Set<ComparisonResult>([
  "left",
  "right",
  "equal",
  "neither",
  "skip",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseScope(value: unknown): RankingScope | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;
  if (value.type === "overall") return { type: "overall" };
  if (value.type === "category" && typeof value.categoryId === "string") {
    return { type: "category", categoryId: value.categoryId };
  }
  return null;
}

function canonicalizeCatalogId(
  id: string,
  replacements: Readonly<Record<string, string>>,
) {
  let current = id;
  const seen = new Set<string>();

  while (replacements[current] && !seen.has(current)) {
    seen.add(current);
    current = replacements[current];
  }

  return current;
}

function parseComparison(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
): KinkComparison | null {
  if (!isRecord(value)) return null;

  const scope = parseScope(value.scope);
  const result = value.result;

  if (
    typeof value.id !== "string" ||
    typeof value.leftKinkId !== "string" ||
    typeof value.rightKinkId !== "string" ||
    typeof value.timestamp !== "string" ||
    !scope ||
    typeof result !== "string" ||
    !comparisonResults.has(result as ComparisonResult)
  ) {
    return null;
  }

  const runId =
    typeof value.runId === "string" && value.runId.length > 0
      ? value.runId
      : undefined;

  return {
    id: value.id,
    ...(runId ? { runId } : {}),
    leftKinkId: canonicalizeCatalogId(value.leftKinkId, replacements),
    rightKinkId: canonicalizeCatalogId(value.rightKinkId, replacements),
    scope,
    result: result as ComparisonResult,
    timestamp: value.timestamp,
  };
}

function parsePreference(value: unknown): CatalogItemPreference | null {
  if (!isRecord(value) || typeof value.updatedAt !== "string") return null;

  const preference: CatalogItemPreference = {
    updatedAt: value.updatedAt,
  };

  for (const context of ["overall", "receiving", "giving"] as const) {
    const state = value[context];
    if (state === undefined) continue;
    if (!isCatalogPreferenceState(state)) return null;
    preference[context] = state;
  }

  if (
    preference.overall === undefined &&
    preference.receiving === undefined &&
    preference.giving === undefined
  ) {
    return null;
  }

  return preference;
}

function parsePreferences(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
) {
  if (!isRecord(value)) return null;

  const preferences: CatalogProfileState["preferences"] = {};

  for (const [catalogId, rawPreference] of Object.entries(value)) {
    const preference = parsePreference(rawPreference);
    if (!preference) continue;
    preferences[canonicalizeCatalogId(catalogId, replacements)] = preference;
  }

  return preferences;
}

function parseComparisons(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
) {
  if (!Array.isArray(value)) return null;

  return value.flatMap((comparison) => {
    const parsed = parseComparison(comparison, replacements);
    return parsed ? [parsed] : [];
  });
}

function parseSnapshotItem(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
) {
  if (!isRecord(value)) return null;
  if (
    typeof value.catalogId !== "string" ||
    typeof value.rank !== "number" ||
    !Number.isInteger(value.rank) ||
    value.rank < 1 ||
    typeof value.comparisons !== "number" ||
    !Number.isInteger(value.comparisons) ||
    value.comparisons < 0 ||
    typeof value.confidence !== "number" ||
    !Number.isFinite(value.confidence)
  ) {
    return null;
  }

  return {
    catalogId: canonicalizeCatalogId(value.catalogId, replacements),
    rank: value.rank,
    comparisons: value.comparisons,
    confidence: value.confidence,
  };
}

function parseScopeSnapshot(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
): RankingScopeSnapshot | null {
  if (
    !isRecord(value) ||
    typeof value.capturedAt !== "string" ||
    typeof value.confidence !== "number" ||
    !Number.isFinite(value.confidence) ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items = value.items.map((item) => parseSnapshotItem(item, replacements));
  if (items.some((item) => item === null)) return null;

  return {
    capturedAt: value.capturedAt,
    confidence: value.confidence,
    items: items.filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

function parseRunSnapshots(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
): RankingRunSnapshots | null {
  if (!isRecord(value) || !isRecord(value.categories)) return null;

  const categories: RankingRunSnapshots["categories"] = {};
  for (const [categoryId, rawSnapshot] of Object.entries(value.categories)) {
    const snapshot = parseScopeSnapshot(rawSnapshot, replacements);
    if (!snapshot) return null;
    categories[categoryId] = snapshot;
  }

  const overall =
    value.overall === undefined
      ? undefined
      : parseScopeSnapshot(value.overall, replacements);
  if (value.overall !== undefined && !overall) return null;

  return {
    categories,
    ...(overall ? { overall } : {}),
  };
}

function parseRankingRun(
  value: unknown,
  replacements: Readonly<Record<string, string>>,
): RankingRun | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.startedAt !== "string" ||
    (value.status !== "active" && value.status !== "archived") ||
    typeof value.algorithmVersion !== "number" ||
    !Number.isInteger(value.algorithmVersion) ||
    value.algorithmVersion < 1
  ) {
    return null;
  }

  if (
    value.archivedAt !== undefined &&
    typeof value.archivedAt !== "string"
  ) {
    return null;
  }

  const snapshots =
    value.snapshots === undefined
      ? undefined
      : parseRunSnapshots(value.snapshots, replacements);
  if (value.snapshots !== undefined && !snapshots) return null;

  return {
    id: value.id,
    startedAt: value.startedAt,
    status: value.status,
    algorithmVersion: value.algorithmVersion,
    ...(typeof value.archivedAt === "string"
      ? { archivedAt: value.archivedAt }
      : {}),
    ...(snapshots ? { snapshots } : {}),
  };
}

export function parseKinkRankingHistory(
  value: unknown,
  replacements: Readonly<Record<string, string>> = kinkCatalogIdReplacements,
): KinkRankingHistory | null {
  if (
    !isRecord(value) ||
    typeof value.activeRunId !== "string" ||
    value.activeRunId.length === 0 ||
    !isRecord(value.runs)
  ) {
    return null;
  }

  const runs: Record<string, RankingRun> = {};
  for (const [runId, rawRun] of Object.entries(value.runs)) {
    const run = parseRankingRun(rawRun, replacements);
    if (!run || run.id !== runId) return null;
    runs[runId] = run;
  }

  const activeRun = runs[value.activeRunId];
  if (!activeRun || activeRun.status !== "active") return null;

  return {
    activeRunId: value.activeRunId,
    runs,
  };
}

function parseNewProfile(
  raw: string,
  replacements: Readonly<Record<string, string>>,
): CatalogProfileState | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      !Array.isArray(parsed.comparisons) ||
      !isRecord(parsed.preferences)
    ) {
      return null;
    }

    const preferences = parsePreferences(parsed.preferences, replacements);
    const comparisons = parseComparisons(parsed.comparisons, replacements);
    if (!preferences || !comparisons) return null;

    const rankingHistory =
      parsed.rankingHistory === undefined
        ? undefined
        : parseKinkRankingHistory(parsed.rankingHistory, replacements) ?? undefined;

    return normalizeCatalogRankingHistory(
      {
        schemaVersion: 1,
        preferences,
        comparisons,
        ...(rankingHistory ? { rankingHistory } : {}),
      },
      new Date().toISOString(),
    );
  } catch {
    return null;
  }
}

function parseLegacyRanking(
  raw: string,
  replacements: Readonly<Record<string, string>>,
): KinkComparison[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      !Array.isArray(parsed.comparisons)
    ) {
      return null;
    }

    return parseComparisons(parsed.comparisons, replacements);
  } catch {
    return null;
  }
}

function browserStorage(): StorageLike {
  return localStorage;
}

export function loadCatalogProfile(
  storage: StorageLike = browserStorage(),
  replacements: Readonly<Record<string, string>> = kinkCatalogIdReplacements,
): CatalogProfileState {
  const currentRaw = storage.getItem(CATALOG_PROFILE_STORAGE_KEY);

  if (currentRaw !== null) {
    const profile = parseNewProfile(currentRaw, replacements);
    if (!profile) return createEmptyCatalogProfileState();

    const normalizedRaw = JSON.stringify(profile);
    if (normalizedRaw !== currentRaw) {
      storage.setItem(CATALOG_PROFILE_STORAGE_KEY, normalizedRaw);
    }

    return profile;
  }

  const legacyRaw = storage.getItem(LEGACY_KINK_RANKING_STORAGE_KEY);
  if (legacyRaw === null) return createEmptyCatalogProfileState();

  const comparisons = parseLegacyRanking(legacyRaw, replacements);
  if (!comparisons) return createEmptyCatalogProfileState();

  const migrated = normalizeCatalogRankingHistory({
    schemaVersion: 1,
    preferences: {},
    comparisons,
  });

  storage.setItem(CATALOG_PROFILE_STORAGE_KEY, JSON.stringify(migrated));
  return migrated;
}

export function saveCatalogProfile(
  profile: CatalogProfileState,
  storage: StorageLike = browserStorage(),
) {
  storage.setItem(
    CATALOG_PROFILE_STORAGE_KEY,
    JSON.stringify(normalizeCatalogRankingHistory(profile)),
  );
}

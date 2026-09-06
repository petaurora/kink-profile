import { kinkCatalogIdReplacements } from "../data/kinkCatalog.generated";
import {
  createEmptyCatalogProfileState,
  isCatalogPreferenceState,
  type CatalogItemPreference,
  type CatalogProfileState,
} from "./catalogProfile";
import type {
  ComparisonResult,
  KinkComparison,
  RankingScope,
} from "./kinkRanking";

export const CATALOG_PROFILE_STORAGE_KEY = "pet-profile-catalog-v1";
export const LEGACY_KINK_RANKING_STORAGE_KEY = "pet-profile-kink-ranking-v1";

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

  return {
    id: value.id,
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

    return {
      schemaVersion: 1,
      preferences,
      comparisons,
    };
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
    return (
      parseNewProfile(currentRaw, replacements) ??
      createEmptyCatalogProfileState()
    );
  }

  const legacyRaw = storage.getItem(LEGACY_KINK_RANKING_STORAGE_KEY);
  if (legacyRaw === null) return createEmptyCatalogProfileState();

  const comparisons = parseLegacyRanking(legacyRaw, replacements);
  if (!comparisons) return createEmptyCatalogProfileState();

  const migrated: CatalogProfileState = {
    schemaVersion: 1,
    preferences: {},
    comparisons,
  };

  storage.setItem(CATALOG_PROFILE_STORAGE_KEY, JSON.stringify(migrated));
  return migrated;
}

export function saveCatalogProfile(
  profile: CatalogProfileState,
  storage: StorageLike = browserStorage(),
) {
  storage.setItem(CATALOG_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

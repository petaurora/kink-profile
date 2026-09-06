import type { KinkComparison } from "./kinkRanking";

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

export type CatalogProfileState = {
  schemaVersion: 1;
  preferences: Record<string, CatalogItemPreference>;
  comparisons: KinkComparison[];
};

export function createEmptyCatalogProfileState(): CatalogProfileState {
  return {
    schemaVersion: 1,
    preferences: {},
    comparisons: [],
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

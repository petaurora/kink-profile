import { describe, expect, it } from "vitest";
import { quizzes } from "../data/quizzes";
import {
  CATALOG_PROFILE_STORAGE_KEY,
  LEGACY_KINK_RANKING_STORAGE_KEY,
  loadCatalogProfile,
  saveCatalogProfile,
} from "./catalogProfileStorage";
import {
  DEFAULT_PROFILE_DISPLAY_NAME,
  loadProfileSettings,
  saveProfileSettings,
} from "./profileSettings";
import {
  createEmptyProfile,
  loadProfile,
  saveProfile,
  type StorageLike,
} from "./profileStorage";
import {
  createResetEverythingSelection,
  resetProfileData,
} from "./profileReset";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function seededStorage() {
  const storage = new MemoryStorage();
  const profile = createEmptyProfile();

  profile.quizzes["dominance-submission"] = {
    quizVersion: 1,
    answers: { "ds-1": 4, "ds-2": 3 },
  };
  profile.quizzes["roles-headspaces"] = {
    quizVersion: 3,
    answers: { "hs-1": 2 },
  };
  saveProfile(profile, storage);

  saveCatalogProfile(
    {
      schemaVersion: 1,
      preferences: {
        rope: {
          overall: "love",
          updatedAt: "2026-09-06T00:00:00.000Z",
        },
      },
      comparisons: [
        {
          id: "cmp-1",
          leftKinkId: "rope",
          rightKinkId: "cuffs",
          scope: { type: "overall" },
          result: "left",
          timestamp: "2026-09-06T00:00:00.000Z",
        },
      ],
    },
    storage,
  );

  saveProfileSettings(
    {
      schemaVersion: 1,
      displayName: "babygirl",
    },
    storage,
  );

  return storage;
}

describe("selective profile reset", () => {
  it("resets one quiz while preserving every other source", () => {
    const storage = seededStorage();

    resetProfileData(
      {
        quizIds: ["dominance-submission"],
        catalogPreferences: false,
        rankingComparisons: false,
        profileSettings: false,
      },
      storage,
    );

    const profile = loadProfile(storage);
    expect(profile.quizzes["dominance-submission"]).toBeUndefined();
    expect(profile.quizzes["roles-headspaces"]?.answers).toEqual({ "hs-1": 2 });
    expect(loadCatalogProfile(storage).preferences.rope?.overall).toBe("love");
    expect(loadCatalogProfile(storage).comparisons).toHaveLength(1);
    expect(loadProfileSettings(storage).displayName).toBe("babygirl");
  });

  it("resets explicit catalog preferences without touching rankings", () => {
    const storage = seededStorage();

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: true,
        rankingComparisons: false,
        profileSettings: false,
      },
      storage,
    );

    const catalog = loadCatalogProfile(storage);
    expect(catalog.preferences).toEqual({});
    expect(catalog.comparisons).toHaveLength(1);
    expect(loadProfile(storage).quizzes["dominance-submission"]).toBeDefined();
  });

  it("resets ranking comparisons without touching explicit preferences", () => {
    const storage = seededStorage();

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: true,
        profileSettings: false,
      },
      storage,
    );

    const catalog = loadCatalogProfile(storage);
    expect(catalog.preferences.rope?.overall).toBe("love");
    expect(catalog.comparisons).toEqual([]);
  });

  it("resets profile settings without touching profile evidence", () => {
    const storage = seededStorage();

    const result = resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: false,
        profileSettings: true,
      },
      storage,
    );

    expect(result.settings.displayName).toBe(DEFAULT_PROFILE_DISPLAY_NAME);
    expect(loadProfileSettings(storage).displayName).toBe(DEFAULT_PROFILE_DISPLAY_NAME);
    expect(loadProfile(storage).quizzes["dominance-submission"]).toBeDefined();
    expect(loadCatalogProfile(storage).preferences.rope?.overall).toBe("love");
  });

  it("reset everything clears every canonical source and blocks legacy ranking resurrection", () => {
    const storage = seededStorage();

    storage.values.set(
      LEGACY_KINK_RANKING_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        comparisons: [
          {
            id: "legacy",
            leftKinkId: "rope",
            rightKinkId: "cuffs",
            scope: { type: "overall" },
            result: "left",
            timestamp: "2026-09-01T00:00:00.000Z",
          },
        ],
      }),
    );

    resetProfileData(createResetEverythingSelection(), storage);

    expect(loadProfile(storage).quizzes).toEqual({});
    const catalog = loadCatalogProfile(storage);
    expect(catalog.preferences).toEqual({});
    expect(catalog.comparisons).toEqual([]);
    expect(catalog.rankingHistory?.activeRunId).toBe("ranking-run-initial");
    expect(Object.values(catalog.rankingHistory?.runs ?? {})).toHaveLength(1);
    expect(loadProfileSettings(storage).displayName).toBe(DEFAULT_PROFILE_DISPLAY_NAME);
    expect(storage.getItem(CATALOG_PROFILE_STORAGE_KEY)).not.toBeNull();
  });

  it("reset everything includes every registered quiz", () => {
    const selection = createResetEverythingSelection();
    expect(new Set(selection.quizIds)).toEqual(new Set(quizzes.map((quiz) => quiz.id)));
  });
});

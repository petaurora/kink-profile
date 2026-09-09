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
import {
  createEmptyRewardPunishmentAuthoritativeState,
  loadRewardPunishmentAuthoritativeState,
  saveRewardPunishmentAuthoritativeState,
} from "./rewardPunishmentLifecycle";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import {
  createEmptySceneLibraryState,
  createSavedScene,
  upsertSavedScene,
} from "./sceneLibrary";
import {
  loadSceneLibraryState,
  saveSceneLibraryState,
} from "./sceneLibraryStorage";
import { createEmptySceneComposition } from "./sceneComposition";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function seedM11(storage: MemoryStorage) {
  const [first, second] = rewardPunishmentPrimitives;
  const state = createEmptyRewardPunishmentAuthoritativeState();
  const firstKey = rewardPunishmentPrimitiveKey(first.ref);
  state.profile.preferences[firstKey] = {
    ref: first.ref,
    reward: { suitability: "works", randomEligible: true },
    punishment: { suitability: "no", randomEligible: false },
    updatedAt: "2026-09-06T00:00:00.000Z",
  };
  state.ranking.comparisons.push({
    id: "rp-cmp",
    context: "reward",
    leftPrimitiveKey: firstKey,
    rightPrimitiveKey: rewardPunishmentPrimitiveKey(second.ref),
    result: "left",
    timestamp: "2026-09-06T00:00:00.000Z",
  });
  state.recipes.recipes.push({
    id: "recipe-1",
    kind: "reward",
    name: "Recipe",
    components: [{ kind: "primitive", ref: first.ref }],
    randomEligible: true,
    createdAt: "2026-09-06T00:00:00.000Z",
    updatedAt: "2026-09-06T00:00:00.000Z",
  });
  saveRewardPunishmentAuthoritativeState(state, storage);
  return state;
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

  seedM11(storage);

  const scene = createSavedScene(
    createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "quick",
      exploration: "familiar",
    }),
    "Saved scene",
    { id: "scene-1" },
  );
  saveSceneLibraryState(
    upsertSavedScene(
      createEmptySceneLibraryState(),
      scene,
    ),
    storage,
  );

  return storage;
}

const keepM11 = {
  rewardsPunishments: false,
  savedScenes: false,
};

describe("selective profile reset", () => {
  it("resets one quiz while preserving every other source including M11", () => {
    const storage = seededStorage();
    const beforeM11 =
      loadRewardPunishmentAuthoritativeState(storage);

    resetProfileData(
      {
        quizIds: ["dominance-submission"],
        catalogPreferences: false,
        rankingComparisons: false,
        ...keepM11,
        profileSettings: false,
      },
      storage,
    );

    expect(
      loadProfile(storage).quizzes["dominance-submission"],
    ).toBeUndefined();
    expect(
      loadProfile(storage).quizzes["roles-headspaces"]?.answers,
    ).toEqual({ "hs-1": 2 });
    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(beforeM11);
  });

  it("resets catalog preferences without touching M6 rankings or M11", () => {
    const storage = seededStorage();
    const beforeM11 =
      loadRewardPunishmentAuthoritativeState(storage);

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: true,
        rankingComparisons: false,
        ...keepM11,
        profileSettings: false,
      },
      storage,
    );

    expect(loadCatalogProfile(storage).preferences).toEqual({});
    expect(loadCatalogProfile(storage).comparisons).toHaveLength(1);
    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(beforeM11);
  });

  it("resets M6 ranking comparisons without touching M11 contextual ranking", () => {
    const storage = seededStorage();
    const beforeM11 =
      loadRewardPunishmentAuthoritativeState(storage);

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: true,
        ...keepM11,
        profileSettings: false,
      },
      storage,
    );

    expect(loadCatalogProfile(storage).comparisons).toEqual([]);
    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(beforeM11);
  });

  it("resets Rewards & Punishments as one independent scope", () => {
    const storage = seededStorage();

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: false,
        rewardsPunishments: true,
        savedScenes: false,
        profileSettings: false,
      },
      storage,
    );

    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(createEmptyRewardPunishmentAuthoritativeState());
    expect(
      loadProfile(storage).quizzes["dominance-submission"],
    ).toBeDefined();
    expect(
      loadCatalogProfile(storage).preferences.rope?.overall,
    ).toBe("love");
    expect(loadProfileSettings(storage).displayName).toBe(
      "babygirl",
    );
  });

  it("resets saved scenes as an independent scope", () => {
    const storage = seededStorage();
    const beforeM11 =
      loadRewardPunishmentAuthoritativeState(storage);

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: false,
        rewardsPunishments: false,
        savedScenes: true,
        profileSettings: false,
      },
      storage,
    );

    expect(loadSceneLibraryState(storage)).toEqual(
      createEmptySceneLibraryState(),
    );
    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(beforeM11);
    expect(
      loadProfile(storage).quizzes["dominance-submission"],
    ).toBeDefined();
    expect(
      loadCatalogProfile(storage).preferences.rope?.overall,
    ).toBe("love");
  });

  it("resets profile settings without touching profile evidence or M11", () => {
    const storage = seededStorage();
    const beforeM11 =
      loadRewardPunishmentAuthoritativeState(storage);

    const result = resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: false,
        ...keepM11,
        profileSettings: true,
      },
      storage,
    );

    expect(result.settings.displayName).toBe(
      DEFAULT_PROFILE_DISPLAY_NAME,
    );
    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(beforeM11);
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

    resetProfileData(
      createResetEverythingSelection(),
      storage,
    );

    expect(loadProfile(storage).quizzes).toEqual({});
    const catalog = loadCatalogProfile(storage);
    expect(catalog.preferences).toEqual({});
    expect(catalog.comparisons).toEqual([]);
    expect(catalog.rankingHistory?.activeRunId).toBe(
      "ranking-run-initial",
    );
    expect(
      loadRewardPunishmentAuthoritativeState(storage),
    ).toEqual(createEmptyRewardPunishmentAuthoritativeState());
    expect(loadSceneLibraryState(storage)).toEqual(
      createEmptySceneLibraryState(),
    );
    expect(loadProfileSettings(storage).displayName).toBe(
      DEFAULT_PROFILE_DISPLAY_NAME,
    );
    expect(
      storage.getItem(CATALOG_PROFILE_STORAGE_KEY),
    ).not.toBeNull();
  });

  it("reset everything includes every registered quiz, M11, and saved scenes", () => {
    const selection = createResetEverythingSelection();
    expect(new Set(selection.quizIds)).toEqual(
      new Set(quizzes.map((quiz) => quiz.id)),
    );
    expect(selection.rewardsPunishments).toBe(true);
    expect(selection.savedScenes).toBe(true);
  });


  it("preserves M12 history for non-ranking resets and deletes it only with explicit ranking reset", () => {
    const storage = seededStorage();
    const catalog = loadCatalogProfile(storage);
    catalog.rankingHistory = {
      activeRunId: "run-current",
      runs: {
        "run-old": {
          id: "run-old",
          startedAt: "2026-09-01T00:00:00.000Z",
          archivedAt: "2026-09-05T00:00:00.000Z",
          status: "archived",
          algorithmVersion: 1,
          snapshots: {
            categories: {},
            overall: {
              capturedAt: "2026-09-05T00:00:00.000Z",
              confidence: 0.5,
              items: [
                {
                  catalogId: "rope",
                  rank: 1,
                  comparisons: 4,
                  confidence: 0.5,
                },
              ],
            },
          },
        },
        "run-current": {
          id: "run-current",
          startedAt: "2026-09-05T00:00:00.000Z",
          status: "active",
          algorithmVersion: 1,
        },
      },
    };
    catalog.comparisons = catalog.comparisons.map((comparison) => ({
      ...comparison,
      runId: "run-current",
    }));
    saveCatalogProfile(catalog, storage);

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: true,
        rankingComparisons: false,
        ...keepM11,
        profileSettings: false,
      },
      storage,
    );

    expect(loadCatalogProfile(storage).rankingHistory?.runs["run-old"]).toBeDefined();

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: true,
        ...keepM11,
        profileSettings: false,
      },
      storage,
    );

    const resetCatalog = loadCatalogProfile(storage);
    expect(resetCatalog.comparisons).toEqual([]);
    expect(Object.keys(resetCatalog.rankingHistory?.runs ?? {})).toEqual([
      "ranking-run-initial",
    ]);
  });

});

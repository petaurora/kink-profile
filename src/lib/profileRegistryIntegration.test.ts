import { describe, expect, it } from "vitest";
import {
  createEmptyCatalogProfileState,
} from "./catalogProfile";
import { saveCatalogProfile } from "./catalogProfileStorage";
import {
  createEmptyProfile,
  saveProfile,
  type StorageLike,
} from "./profileStorage";
import { saveProfileSettings } from "./profileSettings";
import {
  createEmptyRewardPunishmentAuthoritativeState,
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
import { createEmptySceneComposition } from "./sceneComposition";
import { saveSceneLibraryState } from "./sceneLibraryStorage";
import { createProfileBackup } from "./profileBackup";
import {
  ensureProfileRegistry,
  getActiveProfileStorage,
  type ProfileRegistryStorageLike,
} from "./profileRegistry";

class MemoryStorage
  implements StorageLike, ProfileRegistryStorageLike
{
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function seedCompleteLegacyProfile(storage: MemoryStorage) {
  const quizzes = createEmptyProfile();
  quizzes.quizzes["roles-headspaces"] = {
    quizVersion: 3,
    answers: {
      "hs-1": 4,
      "hs-2": 2,
    },
    completedAt: "2026-09-08T20:00:00.000Z",
  };
  saveProfile(quizzes, storage);

  const catalog = createEmptyCatalogProfileState();
  catalog.preferences["rope-bondage"] = {
    overall: "love",
    receiving: "love",
    updatedAt: "2026-09-08T20:05:00.000Z",
  };
  catalog.comparisons.push({
    id: "comparison-1",
    leftKinkId: "rope-bondage",
    rightKinkId: "hand-spanking",
    scope: { type: "overall" },
    result: "left",
    timestamp: "2026-09-08T20:06:00.000Z",
  });
  saveCatalogProfile(catalog, storage);

  saveProfileSettings(
    {
      schemaVersion: 1,
      displayName: "babygirl",
    },
    storage,
  );

  const m11 = createEmptyRewardPunishmentAuthoritativeState();
  const primitive = rewardPunishmentPrimitives[0];
  const primitiveKey = rewardPunishmentPrimitiveKey(
    primitive.ref,
  );
  m11.profile.preferences[primitiveKey] = {
    ref: primitive.ref,
    reward: {
      suitability: "works",
      randomEligible: true,
    },
    punishment: {
      suitability: "no",
      randomEligible: false,
    },
    updatedAt: "2026-09-08T20:07:00.000Z",
  };
  saveRewardPunishmentAuthoritativeState(m11, storage);

  const scene = createSavedScene(
    createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "quick",
      exploration: "familiar",
    }),
    "Migration scene",
    {
      id: "migration-scene",
      now: "2026-09-08T20:08:00.000Z",
    },
  );
  saveSceneLibraryState(
    upsertSavedScene(
      createEmptySceneLibraryState(),
      scene,
    ),
    storage,
  );
}

describe("M14.1 single-profile migration", () => {
  it("preserves the complete independently exportable profile across namespacing", () => {
    const storage = new MemoryStorage();
    seedCompleteLegacyProfile(storage);

    const before = createProfileBackup(
      storage,
      "2026-09-09T14:00:00.000Z",
    );

    ensureProfileRegistry(storage, {
      profileId: "profile-migration-test",
      now: "2026-09-09T14:00:00.000Z",
    });

    const after = createProfileBackup(
      getActiveProfileStorage(storage),
      "2026-09-09T14:00:00.000Z",
    );

    expect(after).toEqual(before);
    expect(after.profile.settings.displayName).toBe("babygirl");
    expect(
      after.profile.quizzes.quizzes["roles-headspaces"]?.answers,
    ).toEqual({
      "hs-1": 4,
      "hs-2": 2,
    });
    expect(
      after.profile.catalog.preferences["rope-bondage"]?.overall,
    ).toBe("love");
    expect(
      Object.keys(
        after.profile.rewardsPunishments.profile.preferences,
      ),
    ).toHaveLength(1);
    expect(after.profile.scenes.scenes).toHaveLength(1);
    expect(after.profile.scenes.scenes[0].name).toBe(
      "Migration scene",
    );
  });
});

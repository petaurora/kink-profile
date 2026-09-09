import { describe, expect, it } from "vitest";
import {
  loadCatalogProfile,
  saveCatalogProfile,
} from "./catalogProfileStorage";
import {
  createProfileBackup,
  serializeProfileBackup,
  type ProfileBackupV1,
  type ProfileBackupV2,
} from "./profileBackup";
import {
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
  parseProfileBackupJson,
  restoreProfileBackup,
  validateProfileBackup,
} from "./profileImport";
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
  writeCount = 0;
  failOnWriteNumber: number | null = null;

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.writeCount += 1;
    if (this.failOnWriteNumber === this.writeCount) {
      throw new Error("simulated storage failure");
    }
    this.values.set(key, value);
  }
}

function seedM11(storage: MemoryStorage, suffix = "source") {
  const [first, second] = rewardPunishmentPrimitives;
  const state = createEmptyRewardPunishmentAuthoritativeState();
  const firstKey = rewardPunishmentPrimitiveKey(first.ref);
  const secondKey = rewardPunishmentPrimitiveKey(second.ref);

  state.profile.preferences[firstKey] = {
    ref: first.ref,
    reward: { suitability: "works", randomEligible: true },
    punishment: { suitability: "no", randomEligible: false },
    updatedAt: "2026-09-06T20:00:00.000Z",
  };
  state.ranking.comparisons.push({
    id: `rp-${suffix}`,
    context: "reward",
    leftPrimitiveKey: firstKey,
    rightPrimitiveKey: secondKey,
    result: "left",
    timestamp: "2026-09-06T20:00:00.000Z",
  });
  state.recipes.recipes.push({
    id: `recipe-${suffix}`,
    kind: "reward",
    name: `Recipe ${suffix}`,
    components: [{ kind: "primitive", ref: first.ref }],
    randomEligible: true,
    createdAt: "2026-09-06T20:00:00.000Z",
    updatedAt: "2026-09-06T20:00:00.000Z",
  });
  saveRewardPunishmentAuthoritativeState(state, storage);
  return state;
}

function seedProfile(
  storage: MemoryStorage,
  displayName = "babygirl",
) {
  const quizzes = createEmptyProfile();
  quizzes.quizzes["dominance-submission"] = {
    quizVersion: 1,
    answers: {
      "ds-1": 4,
      "ds-2": 3,
    },
    completedAt: "2026-09-06T20:00:00.000Z",
  };
  saveProfile(quizzes, storage);

  saveCatalogProfile(
    {
      schemaVersion: 1,
      preferences: {
        rope: {
          overall: "love",
          updatedAt: "2026-09-06T20:00:00.000Z",
        },
      },
      comparisons: [
        {
          id: "cmp-1",
          leftKinkId: "rope",
          rightKinkId: "cuffs",
          scope: { type: "overall" },
          result: "left",
          timestamp: "2026-09-06T20:00:00.000Z",
        },
      ],
    },
    storage,
  );

  saveProfileSettings(
    {
      schemaVersion: 1,
      displayName,
    },
    storage,
  );

  seedM11(storage, displayName);

  const scene = createSavedScene(
    createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "quick",
      exploration: "familiar",
    }),
    `Scene ${displayName}`,
    {
      id: `scene-${displayName}`,
      now: "2026-09-06T20:00:00.000Z",
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

describe("profile backup import", () => {
  it("accepts the current exported backup format", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const backup = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    const result = parseProfileBackupJson(
      serializeProfileBackup(backup),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.backup).toEqual(backup);
  });

  it("accepts legacy v1 backups and treats missing M11/scenes as empty on full restore", () => {
    const source = new MemoryStorage();
    seedProfile(source, "legacy-source");
    const current = createProfileBackup(
      source,
      "2026-09-06T22:00:00.000Z",
    );
    const legacy: ProfileBackupV1 = {
      format: current.format,
      version: 1,
      exportedAt: current.exportedAt,
      profile: {
        settings: current.profile.settings,
        quizzes: current.profile.quizzes,
        catalog: current.profile.catalog,
      },
    };

    const parsed = validateProfileBackup(legacy);
    expect(parsed.ok).toBe(true);

    const destination = new MemoryStorage();
    seedProfile(destination, "has-m11");
    restoreProfileBackup(legacy, destination);

    expect(loadRewardPunishmentAuthoritativeState(destination)).toEqual(
      createEmptyRewardPunishmentAuthoritativeState(),
    );
    expect(loadSceneLibraryState(destination)).toEqual(
      createEmptySceneLibraryState(),
    );
  });

  it("accepts legacy v2 backups, restores M11, and treats missing scenes as empty", () => {
    const source = new MemoryStorage();
    seedProfile(source, "legacy-v2");
    const current = createProfileBackup(
      source,
      "2026-09-06T22:00:00.000Z",
    );
    const legacy: ProfileBackupV2 = {
      format: current.format,
      version: 2,
      exportedAt: current.exportedAt,
      profile: {
        settings: current.profile.settings,
        quizzes: current.profile.quizzes,
        catalog: current.profile.catalog,
        rewardsPunishments: current.profile.rewardsPunishments,
      },
    };

    expect(validateProfileBackup(legacy).ok).toBe(true);

    const destination = new MemoryStorage();
    seedProfile(destination, "destination");
    restoreProfileBackup(legacy, destination);

    expect(loadRewardPunishmentAuthoritativeState(destination)).toEqual(
      legacy.profile.rewardsPunishments,
    );
    expect(loadSceneLibraryState(destination)).toEqual(
      createEmptySceneLibraryState(),
    );
  });

  it("rejects malformed JSON without touching current data", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const before = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    const result = parseProfileBackupJson("{nope");

    expect(result).toEqual({
      ok: false,
      error: "That file is not valid JSON.",
    });
    expect(
      createProfileBackup(
        storage,
        "2026-09-06T22:00:00.000Z",
      ).profile,
    ).toEqual(before.profile);
  });

  it("rejects the wrong format identifier", () => {
    expect(
      validateProfileBackup({
        format: "other-profile",
        version: 2,
        exportedAt: "2026-09-06T22:00:00.000Z",
        profile: {},
      }),
    ).toEqual({
      ok: false,
      error: "This file is not a kink-profile backup.",
    });
  });

  it("rejects unsupported backup versions", () => {
    expect(
      validateProfileBackup({
        format: "kink-profile",
        version: 4,
        exportedAt: "2026-09-06T22:00:00.000Z",
        profile: {},
      }),
    ).toEqual({
      ok: false,
      error:
        "Backup format v4 is not supported by this app version.",
    });
  });

  it("rejects invalid M11 nested data before restore", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const backup = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    const key = Object.keys(
      backup.profile.rewardsPunishments.profile.preferences,
    )[0]!;
    backup.profile.rewardsPunishments.profile.preferences[
      key
    ].reward = {
      suitability: "never",
      randomEligible: true,
    };

    expect(validateProfileBackup(backup)).toEqual({
      ok: false,
      error:
        "The Rewards & Punishments data is invalid or unsupported.",
    });
  });

  it("rejects invalid saved scene data before restore", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const backup = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    backup.profile.scenes = {
      schemaVersion: 1,
      scenes: [
        {
          ...backup.profile.scenes.scenes[0],
          name: "",
        },
      ],
    };

    expect(validateProfileBackup(backup)).toEqual({
      ok: false,
      error:
        "The saved Scenes data is invalid or unsupported.",
    });
  });

  it("replaces every authoritative source including M11 and saved scenes", () => {
    const source = new MemoryStorage();
    seedProfile(source, "source");
    const backup = createProfileBackup(
      source,
      "2026-09-06T22:00:00.000Z",
    );

    const destination = new MemoryStorage();
    seedProfile(destination, "destination");
    const destinationProfile = loadProfile(destination);
    destinationProfile.quizzes["roles-headspaces"] = {
      quizVersion: 3,
      answers: { "hs-1": 1 },
    };
    saveProfile(destinationProfile, destination);

    restoreProfileBackup(backup, destination);

    expect(loadProfileSettings(destination)).toEqual(
      backup.profile.settings,
    );
    expect(loadProfile(destination)).toEqual(
      backup.profile.quizzes,
    );
    expect(loadCatalogProfile(destination)).toEqual(
      backup.profile.catalog,
    );
    expect(
      loadRewardPunishmentAuthoritativeState(destination),
    ).toEqual(backup.profile.rewardsPunishments);
    expect(loadSceneLibraryState(destination)).toEqual(
      backup.profile.scenes,
    );
  });

  it("supports export -> replace -> import round-trip equivalence including M11", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const original = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    seedProfile(storage, "mutated");
    const mutated = loadProfile(storage);
    mutated.quizzes = {};
    saveProfile(mutated, storage);
    saveCatalogProfile(
      {
        schemaVersion: 1,
        preferences: {},
        comparisons: [],
      },
      storage,
    );
    saveRewardPunishmentAuthoritativeState(
      createEmptyRewardPunishmentAuthoritativeState(),
      storage,
    );

    restoreProfileBackup(original, storage);

    const restored = createProfileBackup(
      storage,
      "2026-09-07T01:00:00.000Z",
    );
    expect(restored.profile).toEqual(original.profile);
  });

  it("rolls back all prior sources when a failure occurs midway through M11 writes", () => {
    const destination = new MemoryStorage();
    seedProfile(destination, "keep-me");
    const before = createProfileBackup(
      destination,
      "2026-09-06T22:00:00.000Z",
    );

    const source = new MemoryStorage();
    seedProfile(source, "replace-me");
    const incoming = createProfileBackup(
      source,
      "2026-09-06T23:00:00.000Z",
    );

    destination.failOnWriteNumber =
      destination.writeCount + 5;

    expect(() =>
      restoreProfileBackup(incoming, destination),
    ).toThrow("The restore failed: simulated storage failure");

    const after = createProfileBackup(
      destination,
      "2026-09-07T00:00:00.000Z",
    );
    expect(after.profile).toEqual(before.profile);
  });


  it("restores M12 active/archived run identity and historical snapshots exactly", () => {
    const source = new MemoryStorage();
    seedProfile(source, "history-source");

    saveCatalogProfile(
      {
        schemaVersion: 1,
        preferences: {},
        comparisons: [
          {
            id: "history-old",
            runId: "run-old",
            leftKinkId: "rope",
            rightKinkId: "cuffs",
            scope: { type: "overall" },
            result: "left",
            timestamp: "2026-09-01T00:00:00.000Z",
          },
          {
            id: "history-active",
            runId: "run-current",
            leftKinkId: "rope",
            rightKinkId: "cuffs",
            scope: { type: "overall" },
            result: "right",
            timestamp: "2026-09-08T00:00:00.000Z",
          },
        ],
        rankingHistory: {
          activeRunId: "run-current",
          runs: {
            "run-old": {
              id: "run-old",
              startedAt: "2026-09-01T00:00:00.000Z",
              archivedAt: "2026-09-07T00:00:00.000Z",
              status: "archived",
              algorithmVersion: 1,
              snapshots: {
                categories: {},
                overall: {
                  capturedAt: "2026-09-07T00:00:00.000Z",
                  confidence: 0.6,
                  items: [
                    {
                      catalogId: "rope",
                      rank: 3,
                      comparisons: 6,
                      confidence: 0.75,
                    },
                  ],
                },
              },
            },
            "run-current": {
              id: "run-current",
              startedAt: "2026-09-07T00:00:00.000Z",
              status: "active",
              algorithmVersion: 1,
            },
          },
        },
      },
      source,
    );

    const backup = createProfileBackup(
      source,
      "2026-09-08T21:30:00.000Z",
    );
    const parsed = parseProfileBackupJson(
      serializeProfileBackup(backup),
    );
    expect(parsed.ok).toBe(true);

    const destination = new MemoryStorage();
    seedProfile(destination, "destination");

    if (!parsed.ok) throw new Error("expected valid backup");
    restoreProfileBackup(parsed.backup, destination);

    expect(loadCatalogProfile(destination)).toEqual(
      backup.profile.catalog,
    );
    expect(
      loadCatalogProfile(destination).rankingHistory?.runs["run-old"].snapshots?.overall?.items[0],
    ).toMatchObject({
      catalogId: "rope",
      rank: 3,
      comparisons: 6,
    });
  });

});

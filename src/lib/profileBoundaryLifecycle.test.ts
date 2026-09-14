import { describe, expect, it } from "vitest";
import { saveCatalogProfile } from "./catalogProfileStorage";
import {
  affirmNoLimits,
  createEmptyProfileBoundaryState,
  loadProfileBoundaryState,
  saveProfileBoundaryState,
} from "./profileBoundaryState";
import {
  createProfileBackup,
  serializeProfileBackup,
} from "./profileBackup";
import {
  parseProfileBackupJson,
  restoreProfileBackup,
  validateProfileBackup,
} from "./profileImport";
import { resetProfileData } from "./profileReset";
import type { StorageLike } from "./profileStorage";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const noLimits = affirmNoLimits(
  createEmptyProfileBoundaryState(),
  "2026-09-14T20:00:00.000Z",
);

describe("profile boundary lifecycle", () => {
  it("round-trips an affirmative no-Hard-Limits assertion through backup and restore", () => {
    const source = new MemoryStorage();
    saveProfileBoundaryState(noLimits, source);

    const backup = createProfileBackup(
      source,
      "2026-09-14T20:01:00.000Z",
    );
    expect(backup.profile.boundaries).toEqual(noLimits);

    const parsed = parseProfileBackupJson(serializeProfileBackup(backup));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const destination = new MemoryStorage();
    restoreProfileBackup(parsed.backup, destination);

    expect(loadProfileBoundaryState(destination)).toEqual(noLimits);
  });

  it("normalizes older v3 backups without boundary state to unknown", () => {
    const storage = new MemoryStorage();
    const backup = createProfileBackup(
      storage,
      "2026-09-14T20:01:00.000Z",
    );
    delete backup.profile.boundaries;

    const result = validateProfileBackup(backup);
    expect(result.ok).toBe(true);
    if (!result.ok || result.backup.version !== 3) return;

    expect(result.backup.profile.boundaries).toEqual(
      createEmptyProfileBoundaryState(),
    );
  });

  it("never preserves explicit none when a concrete Hard Limit exists", () => {
    const storage = new MemoryStorage();
    saveProfileBoundaryState(noLimits, storage);
    saveCatalogProfile(
      {
        schemaVersion: 1,
        preferences: {
          rope: {
            overall: "hard_limit",
            updatedAt: "2026-09-14T20:00:00.000Z",
          },
        },
        comparisons: [],
      },
      storage,
    );

    const result = validateProfileBackup(
      createProfileBackup(storage, "2026-09-14T20:01:00.000Z"),
    );
    expect(result.ok).toBe(true);
    if (!result.ok || result.backup.version !== 3) return;

    expect(result.backup.profile.boundaries).toEqual(
      createEmptyProfileBoundaryState(),
    );

    const destination = new MemoryStorage();
    restoreProfileBackup(result.backup, destination);
    expect(loadProfileBoundaryState(destination)).toEqual(
      createEmptyProfileBoundaryState(),
    );
  });

  it("clears the boundary summary with explicit catalog preferences but not ranking-only reset", () => {
    const storage = new MemoryStorage();
    saveProfileBoundaryState(noLimits, storage);

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: false,
        rankingComparisons: true,
        rewardsPunishments: false,
        savedScenes: false,
        profileSettings: false,
      },
      storage,
    );
    expect(loadProfileBoundaryState(storage)).toEqual(noLimits);

    resetProfileData(
      {
        quizIds: [],
        catalogPreferences: true,
        rankingComparisons: false,
        rewardsPunishments: false,
        savedScenes: false,
        profileSettings: false,
      },
      storage,
    );
    expect(loadProfileBoundaryState(storage)).toEqual(
      createEmptyProfileBoundaryState(),
    );
  });
});

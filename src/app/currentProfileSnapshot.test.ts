import { describe, expect, it } from "vitest";
import { saveCatalogProfile } from "../lib/catalogProfileStorage";
import { createProfileBackup } from "../lib/profileBackup";
import { restoreProfileBackup } from "../lib/profileImport";
import { saveProfileSettings } from "../lib/profileSettings";
import {
  createEmptyProfile,
  saveProfile,
  type StorageLike,
} from "../lib/profileStorage";
import { loadCurrentProfileSnapshot } from "./currentProfileSnapshot";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("current profile snapshot hydration", () => {
  it("hydrates fresh route state from a restored private backup", () => {
    const source = new MemoryStorage();
    const profile = createEmptyProfile();
    profile.quizzes["dominance-submission"] = {
      quizVersion: 1,
      answers: {
        "ds-1": 4,
        "ds-2": 2,
      },
      completedAt: "2026-09-11T20:00:00.000Z",
    };
    saveProfile(profile, source);

    saveCatalogProfile(
      {
        schemaVersion: 1,
        preferences: {
          rope: {
            overall: "love",
            updatedAt: "2026-09-11T20:00:00.000Z",
          },
        },
        comparisons: [],
      },
      source,
    );

    saveProfileSettings(
      {
        schemaVersion: 1,
        displayName: "Restored Pet",
      },
      source,
    );

    const backup = createProfileBackup(
      source,
      "2026-09-11T21:00:00.000Z",
    );

    const restoredStorage = new MemoryStorage();
    restoreProfileBackup(backup, restoredStorage);

    const directEntry = loadCurrentProfileSnapshot(restoredStorage);
    const refreshedEntry = loadCurrentProfileSnapshot(restoredStorage);

    expect(directEntry.profile).toEqual(backup.profile.quizzes);
    expect(directEntry.catalogProfile).toEqual(backup.profile.catalog);
    expect(refreshedEntry.profile).toEqual(directEntry.profile);
    expect(refreshedEntry.catalogProfile).toEqual(directEntry.catalogProfile);
    expect(refreshedEntry.catalogResultView).toEqual(
      directEntry.catalogResultView,
    );
    expect(refreshedEntry.canonicalSignals).toEqual(
      directEntry.canonicalSignals,
    );
  });
});

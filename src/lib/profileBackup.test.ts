import { describe, expect, it } from "vitest";
import { saveCatalogProfile } from "./catalogProfileStorage";
import {
  saveProfileSettings,
} from "./profileSettings";
import {
  createEmptyProfile,
  saveProfile,
  type StorageLike,
} from "./profileStorage";
import {
  PROFILE_BACKUP_FORMAT,
  PROFILE_BACKUP_VERSION,
  createProfileBackup,
  createProfileBackupFilename,
  getProfileBackupSummary,
  serializeProfileBackup,
} from "./profileBackup";

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

  const quizzes = createEmptyProfile();
  quizzes.quizzes["dominance-submission"] = {
    quizVersion: 1,
    answers: {
      "ds-1": 4,
      "ds-2": 3,
    },
    completedAt: "2026-09-06T20:00:00.000Z",
  };
  quizzes.quizzes["roles-headspaces"] = {
    quizVersion: 3,
    answers: {
      "hs-1": 2,
    },
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
        cuffs: {
          receiving: "curious",
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
      displayName: "babygirl",
    },
    storage,
  );

  return storage;
}

describe("profile backup export", () => {
  it("exports a stable versioned envelope containing every authoritative store", () => {
    const storage = seededStorage();

    const backup = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    expect(backup.format).toBe(PROFILE_BACKUP_FORMAT);
    expect(backup.version).toBe(PROFILE_BACKUP_VERSION);
    expect(backup.exportedAt).toBe("2026-09-06T22:00:00.000Z");

    expect(backup.profile.settings).toEqual({
      schemaVersion: 1,
      displayName: "babygirl",
    });
    expect(backup.profile.quizzes.schemaVersion).toBe(2);
    expect(backup.profile.quizzes.quizzes["dominance-submission"]?.answers).toEqual({
      "ds-1": 4,
      "ds-2": 3,
    });
    expect(backup.profile.catalog.schemaVersion).toBe(1);
    expect(backup.profile.catalog.preferences.rope?.overall).toBe("love");
    expect(backup.profile.catalog.comparisons).toHaveLength(1);
  });

  it("does not export derived M7 profile output or browser storage keys", () => {
    const backup = createProfileBackup(
      seededStorage(),
      "2026-09-06T22:00:00.000Z",
    );
    const serialized = serializeProfileBackup(backup);

    expect(serialized).not.toContain("pet-profile-v2");
    expect(serialized).not.toContain("pet-profile-catalog-v1");
    expect(serialized).not.toContain("overallFacets");
    expect(serialized).not.toContain("canonicalSignals");
  });

  it("reports useful backup counts from authoritative data", () => {
    const backup = createProfileBackup(
      seededStorage(),
      "2026-09-06T22:00:00.000Z",
    );

    expect(getProfileBackupSummary(backup)).toEqual({
      displayName: "babygirl",
      quizSectionsWithData: 2,
      quizAnswerCount: 3,
      catalogPreferenceCount: 2,
      rankingComparisonCount: 1,
    });
  });

  it("serializes to parseable pretty JSON with a trailing newline", () => {
    const backup = createProfileBackup(
      seededStorage(),
      "2026-09-06T22:00:00.000Z",
    );
    const serialized = serializeProfileBackup(backup);

    expect(JSON.parse(serialized)).toEqual(backup);
    expect(serialized.endsWith("\n")).toBe(true);
    expect(serialized).toContain("\n  \"format\": \"kink-profile\"");
  });

  it("builds a safe human-readable filename from profile name and date", () => {
    const backup = createProfileBackup(
      seededStorage(),
      "2026-09-06T22:00:00.000Z",
    );

    expect(createProfileBackupFilename(backup)).toBe(
      "babygirl-kink-profile-2026-09-06.json",
    );

    backup.profile.settings.displayName = "  Kitty / Pet ♥  ";
    expect(createProfileBackupFilename(backup)).toBe(
      "kitty-pet-kink-profile-2026-09-06.json",
    );
  });
});

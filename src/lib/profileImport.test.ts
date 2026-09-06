import { describe, expect, it } from "vitest";
import { saveCatalogProfile } from "./catalogProfileStorage";
import {
  createProfileBackup,
  serializeProfileBackup,
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
import { loadCatalogProfile } from "./catalogProfileStorage";

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

function seedProfile(storage: MemoryStorage, displayName = "babygirl") {
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
}

describe("profile backup import", () => {
  it("accepts the current exported backup format", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);

    const backup = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    );

    const result = parseProfileBackupJson(serializeProfileBackup(backup));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.backup).toEqual(backup);
    }
  });

  it("rejects malformed JSON without touching current data", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const before = createProfileBackup(storage, "2026-09-06T22:00:00.000Z");

    const result = parseProfileBackupJson("{nope");

    expect(result).toEqual({
      ok: false,
      error: "That file is not valid JSON.",
    });
    expect(createProfileBackup(storage, "2026-09-06T22:00:00.000Z").profile)
      .toEqual(before.profile);
  });

  it("rejects the wrong format identifier", () => {
    expect(
      validateProfileBackup({
        format: "other-profile",
        version: 1,
        exportedAt: "2026-09-06T22:00:00.000Z",
        profile: {},
      }),
    ).toEqual({
      ok: false,
      error: "This file is not a kink-profile backup.",
    });
  });

  it("rejects unsupported backup versions", () => {
    const result = validateProfileBackup({
      format: "kink-profile",
      version: 2,
      exportedAt: "2026-09-06T22:00:00.000Z",
      profile: {},
    });

    expect(result).toEqual({
      ok: false,
      error: "Backup format v2 is not supported by this app version.",
    });
  });

  it("rejects invalid authoritative nested data before restore", () => {
    const storage = new MemoryStorage();
    seedProfile(storage);
    const backup = createProfileBackup(
      storage,
      "2026-09-06T22:00:00.000Z",
    ) as unknown as {
      profile: {
        catalog: {
          preferences: Record<string, { overall: string; updatedAt: string }>;
        };
      };
    };

    backup.profile.catalog.preferences.rope = {
      overall: "definitely-not-valid",
      updatedAt: "2026-09-06T20:00:00.000Z",
    };

    const result = validateProfileBackup(backup);
    expect(result).toEqual({
      ok: false,
      error: "The catalog or This-or-That data is invalid or unsupported.",
    });
  });

  it("replaces every authoritative source with the imported backup", () => {
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

    expect(loadProfileSettings(destination)).toEqual(backup.profile.settings);
    expect(loadProfile(destination)).toEqual(backup.profile.quizzes);
    expect(loadCatalogProfile(destination)).toEqual(backup.profile.catalog);
  });

  it("supports export -> replace -> import round-trip equivalence", () => {
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

    restoreProfileBackup(original, storage);

    const restored = createProfileBackup(
      storage,
      "2026-09-07T01:00:00.000Z",
    );
    expect(restored.profile).toEqual(original.profile);
  });

  it("rolls back the prior profile if a replacement write fails", () => {
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

    destination.failOnWriteNumber = destination.writeCount + 2;

    expect(() => restoreProfileBackup(incoming, destination)).toThrow(
      "The restore failed: simulated storage failure",
    );

    const after = createProfileBackup(
      destination,
      "2026-09-07T00:00:00.000Z",
    );
    expect(after.profile).toEqual(before.profile);
  });
});

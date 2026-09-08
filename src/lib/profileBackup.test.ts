import { describe, expect, it } from "vitest";
import { saveCatalogProfile } from "./catalogProfileStorage";
import { saveProfileSettings } from "./profileSettings";
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
import {
  createEmptyRewardPunishmentAuthoritativeState,
  saveRewardPunishmentAuthoritativeState,
} from "./rewardPunishmentLifecycle";
import {
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";

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
  const secondKey = rewardPunishmentPrimitiveKey(second.ref);

  state.profile.preferences[firstKey] = {
    ref: first.ref,
    reward: {
      suitability: "works",
      randomEligible: true,
      note: "Reward note",
    },
    punishment: {
      suitability: "no",
      randomEligible: false,
    },
    updatedAt: "2026-09-06T20:00:00.000Z",
  };
  state.ranking.comparisons.push({
    id: "rp-cmp-1",
    context: "reward",
    leftPrimitiveKey: firstKey,
    rightPrimitiveKey: secondKey,
    result: "left",
    timestamp: "2026-09-06T20:00:00.000Z",
  });
  state.recipes.recipes.push({
    id: "recipe-1",
    kind: "reward",
    name: "Good night",
    components: [
      { kind: "primitive", ref: first.ref },
      { kind: "custom", id: "custom-1", label: "Check in" },
    ],
    notes: "Recipe note",
    tags: ["care"],
    randomEligible: true,
    createdAt: "2026-09-06T20:00:00.000Z",
    updatedAt: "2026-09-06T20:00:00.000Z",
  });

  saveRewardPunishmentAuthoritativeState(state, storage);
  return state;
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

  seedM11(storage);
  return storage;
}

describe("profile backup export", () => {
  it("exports backup v2 containing every authoritative store including M11", () => {
    const backup = createProfileBackup(
      seededStorage(),
      "2026-09-06T22:00:00.000Z",
    );

    expect(backup.format).toBe(PROFILE_BACKUP_FORMAT);
    expect(backup.version).toBe(PROFILE_BACKUP_VERSION);
    expect(backup.exportedAt).toBe("2026-09-06T22:00:00.000Z");
    expect(backup.profile.settings.displayName).toBe("babygirl");
    expect(backup.profile.quizzes.schemaVersion).toBe(2);
    expect(backup.profile.catalog.schemaVersion).toBe(1);
    expect(backup.profile.catalog.comparisons).toHaveLength(1);

    expect(
      Object.keys(
        backup.profile.rewardsPunishments.profile.preferences,
      ),
    ).toHaveLength(1);
    expect(
      backup.profile.rewardsPunishments.ranking.comparisons,
    ).toHaveLength(1);
    expect(
      backup.profile.rewardsPunishments.recipes.recipes,
    ).toHaveLength(1);
  });

  it("backs up authoritative M11 state but not recomputable inference/category output or browser storage keys", () => {
    const serialized = serializeProfileBackup(
      createProfileBackup(
        seededStorage(),
        "2026-09-06T22:00:00.000Z",
      ),
    );

    expect(serialized).not.toContain("pet-profile-v2");
    expect(serialized).not.toContain("pet-profile-catalog-v1");
    expect(serialized).not.toContain(
      "pet-profile-rewards-punishments-v1",
    );
    expect(serialized).not.toContain("overallFacets");
    expect(serialized).not.toContain("canonicalSignals");
    expect(serialized).not.toContain("categoryContributions");
    expect(serialized).not.toContain("inferenceVersion");
  });

  it("reports useful backup counts including M11", () => {
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
      rewardPunishmentPreferenceCount: 1,
      rewardPunishmentComparisonCount: 1,
      rewardPunishmentRecipeCount: 1,
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
    expect(serialized).toContain(
      '\n  "format": "kink-profile"',
    );
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

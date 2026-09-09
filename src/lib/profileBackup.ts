import type { CatalogProfileState } from "./catalogProfile";
import { loadCatalogProfile } from "./catalogProfileStorage";
import {
  loadProfileSettings,
  type ProfileSettings,
} from "./profileSettings";
import {
  loadProfile,
  type StoredProfile,
  type StorageLike,
} from "./profileStorage";
import {
  loadRewardPunishmentAuthoritativeState,
  type RewardPunishmentAuthoritativeState,
} from "./rewardPunishmentLifecycle";
import {
  loadSceneLibraryState,
} from "./sceneLibraryStorage";
import type { SceneLibraryState } from "./sceneLibrary";
import { getActiveProfileStorage } from "./profileRegistry";

export const PROFILE_BACKUP_FORMAT = "kink-profile" as const;
export const PROFILE_BACKUP_VERSION = 3 as const;

export type ProfileBackupV1 = {
  format: typeof PROFILE_BACKUP_FORMAT;
  version: 1;
  exportedAt: string;
  profile: {
    settings: ProfileSettings;
    quizzes: StoredProfile;
    catalog: CatalogProfileState;
  };
};

export type ProfileBackupV2 = {
  format: typeof PROFILE_BACKUP_FORMAT;
  version: 2;
  exportedAt: string;
  profile: {
    settings: ProfileSettings;
    quizzes: StoredProfile;
    catalog: CatalogProfileState;
    rewardsPunishments: RewardPunishmentAuthoritativeState;
  };
};

export type ProfileBackupV3 = {
  format: typeof PROFILE_BACKUP_FORMAT;
  version: typeof PROFILE_BACKUP_VERSION;
  exportedAt: string;
  profile: {
    settings: ProfileSettings;
    quizzes: StoredProfile;
    catalog: CatalogProfileState;
    rewardsPunishments: RewardPunishmentAuthoritativeState;
    scenes: SceneLibraryState;
  };
};

export type ProfileBackup =
  | ProfileBackupV1
  | ProfileBackupV2
  | ProfileBackupV3;

export type ProfileBackupSummary = {
  displayName: string;
  quizSectionsWithData: number;
  quizAnswerCount: number;
  catalogPreferenceCount: number;
  rankingComparisonCount: number;
  rewardPunishmentPreferenceCount: number;
  rewardPunishmentComparisonCount: number;
  rewardPunishmentRecipeCount: number;
  savedSceneCount: number;
};

function browserStorage(): StorageLike {
  return getActiveProfileStorage(localStorage);
}

export function isProfileBackupV2(
  backup: ProfileBackup,
): backup is ProfileBackupV2 {
  return backup.version === 2;
}

export function isProfileBackupV3(
  backup: ProfileBackup,
): backup is ProfileBackupV3 {
  return backup.version === 3;
}

export function hasRewardPunishmentBackupData(
  backup: ProfileBackup,
): backup is ProfileBackupV2 | ProfileBackupV3 {
  return backup.version >= 2;
}

export function createProfileBackup(
  storage: StorageLike = browserStorage(),
  exportedAt = new Date().toISOString(),
): ProfileBackupV3 {
  return {
    format: PROFILE_BACKUP_FORMAT,
    version: PROFILE_BACKUP_VERSION,
    exportedAt,
    profile: {
      settings: loadProfileSettings(storage),
      quizzes: loadProfile(storage),
      catalog: loadCatalogProfile(storage),
      rewardsPunishments:
        loadRewardPunishmentAuthoritativeState(storage),
      scenes: loadSceneLibraryState(storage),
    },
  };
}

export function getProfileBackupSummary(
  backup: ProfileBackup,
): ProfileBackupSummary {
  const quizEntries = Object.values(backup.profile.quizzes.quizzes);
  const m11 = hasRewardPunishmentBackupData(backup)
    ? backup.profile.rewardsPunishments
    : undefined;
  const scenes = isProfileBackupV3(backup)
    ? backup.profile.scenes
    : undefined;

  return {
    displayName: backup.profile.settings.displayName,
    quizSectionsWithData: quizEntries.filter(
      (progress) =>
        progress !== undefined &&
        (Object.keys(progress.answers).length > 0 ||
          progress.completedAt !== undefined),
    ).length,
    quizAnswerCount: quizEntries.reduce(
      (total, progress) =>
        total + (progress ? Object.keys(progress.answers).length : 0),
      0,
    ),
    catalogPreferenceCount: Object.keys(
      backup.profile.catalog.preferences,
    ).length,
    rankingComparisonCount: backup.profile.catalog.comparisons.length,
    rewardPunishmentPreferenceCount: m11
      ? Object.keys(m11.profile.preferences).length
      : 0,
    rewardPunishmentComparisonCount:
      m11?.ranking.comparisons.length ?? 0,
    rewardPunishmentRecipeCount: m11?.recipes.recipes.length ?? 0,
    savedSceneCount: scenes?.scenes.length ?? 0,
  };
}

export function serializeProfileBackup(backup: ProfileBackup) {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

function slugifyProfileName(displayName: string) {
  const slug = displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "profile";
}

export function createProfileBackupFilename(backup: ProfileBackup) {
  const date =
    /^\d{4}-\d{2}-\d{2}/.exec(backup.exportedAt)?.[0] ??
    "backup";
  return `${slugifyProfileName(
    backup.profile.settings.displayName,
  )}-kink-profile-${date}.json`;
}

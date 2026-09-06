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

export const PROFILE_BACKUP_FORMAT = "kink-profile" as const;
export const PROFILE_BACKUP_VERSION = 1 as const;

export type ProfileBackupV1 = {
  format: typeof PROFILE_BACKUP_FORMAT;
  version: typeof PROFILE_BACKUP_VERSION;
  exportedAt: string;
  profile: {
    settings: ProfileSettings;
    quizzes: StoredProfile;
    catalog: CatalogProfileState;
  };
};

export type ProfileBackupSummary = {
  displayName: string;
  quizSectionsWithData: number;
  quizAnswerCount: number;
  catalogPreferenceCount: number;
  rankingComparisonCount: number;
};

function browserStorage(): StorageLike {
  return localStorage;
}

export function createProfileBackup(
  storage: StorageLike = browserStorage(),
  exportedAt = new Date().toISOString(),
): ProfileBackupV1 {
  return {
    format: PROFILE_BACKUP_FORMAT,
    version: PROFILE_BACKUP_VERSION,
    exportedAt,
    profile: {
      settings: loadProfileSettings(storage),
      quizzes: loadProfile(storage),
      catalog: loadCatalogProfile(storage),
    },
  };
}

export function getProfileBackupSummary(
  backup: ProfileBackupV1,
): ProfileBackupSummary {
  const quizEntries = Object.values(backup.profile.quizzes.quizzes);

  return {
    displayName: backup.profile.settings.displayName,
    quizSectionsWithData: quizEntries.filter(
      (progress) =>
        progress !== undefined &&
        (Object.keys(progress.answers).length > 0 || progress.completedAt !== undefined),
    ).length,
    quizAnswerCount: quizEntries.reduce(
      (total, progress) =>
        total + (progress ? Object.keys(progress.answers).length : 0),
      0,
    ),
    catalogPreferenceCount: Object.keys(backup.profile.catalog.preferences).length,
    rankingComparisonCount: backup.profile.catalog.comparisons.length,
  };
}

export function serializeProfileBackup(backup: ProfileBackupV1) {
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

export function createProfileBackupFilename(backup: ProfileBackupV1) {
  const date = /^\d{4}-\d{2}-\d{2}/.exec(backup.exportedAt)?.[0] ?? "backup";
  return `${slugifyProfileName(backup.profile.settings.displayName)}-kink-profile-${date}.json`;
}

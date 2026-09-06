import { quizzes, type QuizId } from "../data/quizzes";
import {
  isCatalogPreferenceState,
  type CatalogItemPreference,
  type CatalogProfileState,
} from "./catalogProfile";
import { loadCatalogProfile, saveCatalogProfile } from "./catalogProfileStorage";
import type { ComparisonResult, KinkComparison, RankingScope } from "./kinkRanking";
import {
  PROFILE_BACKUP_FORMAT,
  PROFILE_BACKUP_VERSION,
  type ProfileBackupV1,
} from "./profileBackup";
import {
  MAX_PROFILE_DISPLAY_NAME_LENGTH,
  PROFILE_SETTINGS_SCHEMA_VERSION,
  loadProfileSettings,
  normalizeProfileDisplayName,
  saveProfileSettings,
  type ProfileSettings,
} from "./profileSettings";
import {
  loadProfile,
  saveProfile,
  type QuizProgress,
  type StorageLike,
  type StoredProfile,
} from "./profileStorage";

export type ProfileBackupParseResult =
  | { ok: true; backup: ProfileBackupV1 }
  | { ok: false; error: string };

const comparisonResults = new Set<ComparisonResult>([
  "left",
  "right",
  "equal",
  "neither",
  "skip",
]);

const knownQuizIds = new Set<QuizId>(quizzes.map((quiz) => quiz.id));

function browserStorage(): StorageLike {
  return localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseSettings(value: unknown): ProfileSettings | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== PROFILE_SETTINGS_SCHEMA_VERSION) return null;
  if (typeof value.displayName !== "string") return null;

  const normalizedName = normalizeProfileDisplayName(value.displayName);
  if (
    normalizedName.length === 0 ||
    value.displayName.length > MAX_PROFILE_DISPLAY_NAME_LENGTH
  ) {
    return null;
  }

  return {
    schemaVersion: PROFILE_SETTINGS_SCHEMA_VERSION,
    displayName: normalizedName,
  };
}

function parseQuizProgress(value: unknown): QuizProgress | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.quizVersion !== "number" ||
    !Number.isInteger(value.quizVersion) ||
    value.quizVersion < 1
  ) {
    return null;
  }
  if (!isRecord(value.answers)) return null;

  const answers: Record<string, number> = {};
  for (const [questionId, answer] of Object.entries(value.answers)) {
    if (typeof answer !== "number" || !Number.isFinite(answer)) return null;
    answers[questionId] = answer;
  }

  if (
    value.completedAt !== undefined &&
    !isValidDateString(value.completedAt)
  ) {
    return null;
  }

  return {
    quizVersion: value.quizVersion,
    answers,
    ...(typeof value.completedAt === "string"
      ? { completedAt: value.completedAt }
      : {}),
  };
}

function parseStoredProfile(value: unknown): StoredProfile | null {
  if (!isRecord(value) || value.schemaVersion !== 2 || !isRecord(value.quizzes)) {
    return null;
  }

  const parsedQuizzes: StoredProfile["quizzes"] = {};

  for (const [quizId, progress] of Object.entries(value.quizzes)) {
    if (!knownQuizIds.has(quizId as QuizId)) return null;
    const parsedProgress = parseQuizProgress(progress);
    if (!parsedProgress) return null;
    parsedQuizzes[quizId as QuizId] = parsedProgress;
  }

  return {
    schemaVersion: 2,
    quizzes: parsedQuizzes,
  };
}

function parsePreference(value: unknown): CatalogItemPreference | null {
  if (!isRecord(value) || !isValidDateString(value.updatedAt)) return null;

  const preference: CatalogItemPreference = {
    updatedAt: value.updatedAt,
  };

  for (const context of ["overall", "receiving", "giving"] as const) {
    const state = value[context];
    if (state === undefined) continue;
    if (!isCatalogPreferenceState(state)) return null;
    preference[context] = state;
  }

  if (
    preference.overall === undefined &&
    preference.receiving === undefined &&
    preference.giving === undefined
  ) {
    return null;
  }

  return preference;
}

function parseScope(value: unknown): RankingScope | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;
  if (value.type === "overall") return { type: "overall" };
  if (
    value.type === "category" &&
    typeof value.categoryId === "string" &&
    value.categoryId.length > 0
  ) {
    return {
      type: "category",
      categoryId: value.categoryId,
    };
  }
  return null;
}

function parseComparison(value: unknown): KinkComparison | null {
  if (!isRecord(value)) return null;

  const scope = parseScope(value.scope);
  const result = value.result;

  if (
    typeof value.id !== "string" ||
    typeof value.leftKinkId !== "string" ||
    typeof value.rightKinkId !== "string" ||
    !scope ||
    typeof result !== "string" ||
    !comparisonResults.has(result as ComparisonResult) ||
    !isValidDateString(value.timestamp)
  ) {
    return null;
  }

  return {
    id: value.id,
    leftKinkId: value.leftKinkId,
    rightKinkId: value.rightKinkId,
    scope,
    result: result as ComparisonResult,
    timestamp: value.timestamp,
  };
}

function parseCatalogProfile(value: unknown): CatalogProfileState | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isRecord(value.preferences) ||
    !Array.isArray(value.comparisons)
  ) {
    return null;
  }

  const preferences: CatalogProfileState["preferences"] = {};
  for (const [catalogId, rawPreference] of Object.entries(value.preferences)) {
    const preference = parsePreference(rawPreference);
    if (!preference) return null;
    preferences[catalogId] = preference;
  }

  const comparisons: KinkComparison[] = [];
  for (const rawComparison of value.comparisons) {
    const comparison = parseComparison(rawComparison);
    if (!comparison) return null;
    comparisons.push(comparison);
  }

  return {
    schemaVersion: 1,
    preferences,
    comparisons,
  };
}

export function validateProfileBackup(value: unknown): ProfileBackupParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "This file is not a profile backup object." };
  }

  if (value.format !== PROFILE_BACKUP_FORMAT) {
    return {
      ok: false,
      error: "This file is not a kink-profile backup.",
    };
  }

  if (value.version !== PROFILE_BACKUP_VERSION) {
    return {
      ok: false,
      error: `Backup format v${String(value.version)} is not supported by this app version.`,
    };
  }

  if (!isValidDateString(value.exportedAt)) {
    return {
      ok: false,
      error: "The backup export date is missing or invalid.",
    };
  }

  if (!isRecord(value.profile)) {
    return {
      ok: false,
      error: "The backup profile payload is missing.",
    };
  }

  const settings = parseSettings(value.profile.settings);
  if (!settings) {
    return {
      ok: false,
      error: "The profile settings section is invalid or unsupported.",
    };
  }

  const storedProfile = parseStoredProfile(value.profile.quizzes);
  if (!storedProfile) {
    return {
      ok: false,
      error: "The quiz data section is invalid or unsupported.",
    };
  }

  const catalogProfile = parseCatalogProfile(value.profile.catalog);
  if (!catalogProfile) {
    return {
      ok: false,
      error: "The catalog or This-or-That data is invalid or unsupported.",
    };
  }

  return {
    ok: true,
    backup: {
      format: PROFILE_BACKUP_FORMAT,
      version: PROFILE_BACKUP_VERSION,
      exportedAt: value.exportedAt,
      profile: {
        settings,
        quizzes: storedProfile,
        catalog: catalogProfile,
      },
    },
  };
}

export function parseProfileBackupJson(text: string): ProfileBackupParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: "That file is not valid JSON.",
    };
  }

  return validateProfileBackup(parsed);
}

export function restoreProfileBackup(
  backup: ProfileBackupV1,
  storage: StorageLike = browserStorage(),
) {
  const previous = {
    settings: loadProfileSettings(storage),
    quizzes: loadProfile(storage),
    catalog: loadCatalogProfile(storage),
  };

  try {
    saveProfile(backup.profile.quizzes, storage);
    saveCatalogProfile(backup.profile.catalog, storage);
    saveProfileSettings(backup.profile.settings, storage);
  } catch (error) {
    try {
      saveProfile(previous.quizzes, storage);
      saveCatalogProfile(previous.catalog, storage);
      saveProfileSettings(previous.settings, storage);
    } catch {
      throw new Error(
        "The restore failed and the previous profile could not be fully rolled back.",
      );
    }

    throw new Error(
      error instanceof Error
        ? `The restore failed: ${error.message}`
        : "The restore failed while writing local profile data.",
    );
  }

  return backup;
}

import { quizzes, type QuizId } from "../data/quizzes";
import {
  loadCatalogProfile,
  saveCatalogProfile,
} from "./catalogProfileStorage";
import {
  createDefaultProfileSettings,
  loadProfileSettings,
  saveProfileSettings,
  type ProfileSettings,
} from "./profileSettings";
import {
  loadProfile,
  saveProfile,
  type StoredProfile,
  type StorageLike,
} from "./profileStorage";
import {
  createInitialKinkRankingHistory,
  type CatalogProfileState,
} from "./catalogProfile";

export type ProfileResetSelection = {
  quizIds: QuizId[];
  catalogPreferences: boolean;
  rankingComparisons: boolean;
  profileSettings: boolean;
};

export type ProfileResetResult = {
  profile: StoredProfile;
  catalogProfile: CatalogProfileState;
  settings: ProfileSettings;
};

export type ProfileResetImpact = {
  selectedQuizCount: number;
  selectedQuizAnswerCount: number;
  catalogPreferenceCount: number;
  rankingComparisonCount: number;
  resetsProfileSettings: boolean;
};

function browserStorage(): StorageLike {
  return localStorage;
}

export function createEmptyResetSelection(): ProfileResetSelection {
  return {
    quizIds: [],
    catalogPreferences: false,
    rankingComparisons: false,
    profileSettings: false,
  };
}

export function createResetEverythingSelection(): ProfileResetSelection {
  return {
    quizIds: quizzes.map((quiz) => quiz.id),
    catalogPreferences: true,
    rankingComparisons: true,
    profileSettings: true,
  };
}

export function hasResetSelection(selection: ProfileResetSelection) {
  return (
    selection.quizIds.length > 0 ||
    selection.catalogPreferences ||
    selection.rankingComparisons ||
    selection.profileSettings
  );
}

export function isResetEverythingSelection(selection: ProfileResetSelection) {
  return (
    quizzes.every((quiz) => selection.quizIds.includes(quiz.id)) &&
    selection.catalogPreferences &&
    selection.rankingComparisons &&
    selection.profileSettings
  );
}

export function getProfileResetImpact(
  selection: ProfileResetSelection,
  storage: StorageLike = browserStorage(),
): ProfileResetImpact {
  const profile = loadProfile(storage);
  const catalogProfile = loadCatalogProfile(storage);

  return {
    selectedQuizCount: selection.quizIds.filter(
      (quizId) => profile.quizzes[quizId] !== undefined,
    ).length,
    selectedQuizAnswerCount: selection.quizIds.reduce(
      (total, quizId) =>
        total + Object.keys(profile.quizzes[quizId]?.answers ?? {}).length,
      0,
    ),
    catalogPreferenceCount: selection.catalogPreferences
      ? Object.keys(catalogProfile.preferences).length
      : 0,
    rankingComparisonCount: selection.rankingComparisons
      ? catalogProfile.comparisons.length
      : 0,
    resetsProfileSettings: selection.profileSettings,
  };
}

export function resetProfileData(
  selection: ProfileResetSelection,
  storage: StorageLike = browserStorage(),
): ProfileResetResult {
  const currentProfile = loadProfile(storage);
  const currentCatalogProfile = loadCatalogProfile(storage);
  const currentSettings = loadProfileSettings(storage);

  const nextQuizzes = { ...currentProfile.quizzes };
  for (const quizId of selection.quizIds) {
    delete nextQuizzes[quizId];
  }

  const nextProfile: StoredProfile = {
    ...currentProfile,
    quizzes: nextQuizzes,
  };

  const nextCatalogProfile: CatalogProfileState = {
    ...currentCatalogProfile,
    preferences: selection.catalogPreferences
      ? {}
      : currentCatalogProfile.preferences,
    comparisons: selection.rankingComparisons
      ? []
      : currentCatalogProfile.comparisons,
    rankingHistory: selection.rankingComparisons
      ? createInitialKinkRankingHistory()
      : currentCatalogProfile.rankingHistory,
  };

  const nextSettings = selection.profileSettings
    ? createDefaultProfileSettings()
    : currentSettings;

  if (selection.quizIds.length > 0) {
    saveProfile(nextProfile, storage);
  }

  if (selection.catalogPreferences || selection.rankingComparisons) {
    // Persist the canonical empty/partial catalog store rather than removing it.
    // Otherwise the retained legacy ranking key could migrate old comparisons back in.
    saveCatalogProfile(nextCatalogProfile, storage);
  }

  if (selection.profileSettings) {
    saveProfileSettings(nextSettings, storage);
  }

  return {
    profile: nextProfile,
    catalogProfile: nextCatalogProfile,
    settings: nextSettings,
  };
}

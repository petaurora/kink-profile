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
import {
  createEmptyRewardPunishmentAuthoritativeState,
  loadRewardPunishmentAuthoritativeState,
  saveRewardPunishmentAuthoritativeState,
  type RewardPunishmentAuthoritativeState,
} from "./rewardPunishmentLifecycle";
import {
  createEmptySceneLibraryState,
  type SceneLibraryState,
} from "./sceneLibrary";
import {
  loadSceneLibraryState,
  saveSceneLibraryState,
} from "./sceneLibraryStorage";
import { getActiveProfileStorage } from "./profileRegistry";

export type ProfileResetSelection = {
  quizIds: QuizId[];
  catalogPreferences: boolean;
  rankingComparisons: boolean;
  rewardsPunishments: boolean;
  savedScenes: boolean;
  profileSettings: boolean;
};

export type ProfileResetResult = {
  profile: StoredProfile;
  catalogProfile: CatalogProfileState;
  rewardsPunishments: RewardPunishmentAuthoritativeState;
  scenes: SceneLibraryState;
  settings: ProfileSettings;
};

export type ProfileResetImpact = {
  selectedQuizCount: number;
  selectedQuizAnswerCount: number;
  catalogPreferenceCount: number;
  rankingComparisonCount: number;
  rewardPunishmentPreferenceCount: number;
  rewardPunishmentComparisonCount: number;
  rewardPunishmentRecipeCount: number;
  savedSceneCount: number;
  resetsProfileSettings: boolean;
};

function browserStorage(): StorageLike {
  return getActiveProfileStorage(localStorage);
}

export function createEmptyResetSelection(): ProfileResetSelection {
  return {
    quizIds: [],
    catalogPreferences: false,
    rankingComparisons: false,
    rewardsPunishments: false,
    savedScenes: false,
    profileSettings: false,
  };
}

export function createResetEverythingSelection(): ProfileResetSelection {
  return {
    quizIds: quizzes.map((quiz) => quiz.id),
    catalogPreferences: true,
    rankingComparisons: true,
    rewardsPunishments: true,
    savedScenes: true,
    profileSettings: true,
  };
}

export function hasResetSelection(selection: ProfileResetSelection) {
  return (
    selection.quizIds.length > 0 ||
    selection.catalogPreferences ||
    selection.rankingComparisons ||
    selection.rewardsPunishments ||
    selection.savedScenes ||
    selection.profileSettings
  );
}

export function isResetEverythingSelection(
  selection: ProfileResetSelection,
) {
  return (
    quizzes.every((quiz) =>
      selection.quizIds.includes(quiz.id),
    ) &&
    selection.catalogPreferences &&
    selection.rankingComparisons &&
    selection.rewardsPunishments &&
    selection.savedScenes &&
    selection.profileSettings
  );
}

export function getProfileResetImpact(
  selection: ProfileResetSelection,
  storage: StorageLike = browserStorage(),
): ProfileResetImpact {
  const profile = loadProfile(storage);
  const catalogProfile = loadCatalogProfile(storage);
  const rewardsPunishments =
    loadRewardPunishmentAuthoritativeState(storage);
  const scenes = loadSceneLibraryState(storage);

  return {
    selectedQuizCount: selection.quizIds.filter(
      (quizId) => profile.quizzes[quizId] !== undefined,
    ).length,
    selectedQuizAnswerCount: selection.quizIds.reduce(
      (total, quizId) =>
        total +
        Object.keys(
          profile.quizzes[quizId]?.answers ?? {},
        ).length,
      0,
    ),
    catalogPreferenceCount: selection.catalogPreferences
      ? Object.keys(catalogProfile.preferences).length
      : 0,
    rankingComparisonCount: selection.rankingComparisons
      ? catalogProfile.comparisons.length
      : 0,
    rewardPunishmentPreferenceCount:
      selection.rewardsPunishments
        ? Object.keys(
            rewardsPunishments.profile.preferences,
          ).length
        : 0,
    rewardPunishmentComparisonCount:
      selection.rewardsPunishments
        ? rewardsPunishments.ranking.comparisons.length
        : 0,
    rewardPunishmentRecipeCount:
      selection.rewardsPunishments
        ? rewardsPunishments.recipes.recipes.length
        : 0,
    savedSceneCount: selection.savedScenes
      ? scenes.scenes.length
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
  const currentRewardsPunishments =
    loadRewardPunishmentAuthoritativeState(storage);
  const currentScenes = loadSceneLibraryState(storage);
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

  const nextRewardsPunishments =
    selection.rewardsPunishments
      ? createEmptyRewardPunishmentAuthoritativeState()
      : currentRewardsPunishments;

  const nextScenes = selection.savedScenes
    ? createEmptySceneLibraryState()
    : currentScenes;

  const nextSettings = selection.profileSettings
    ? createDefaultProfileSettings()
    : currentSettings;

  if (selection.quizIds.length > 0) {
    saveProfile(nextProfile, storage);
  }

  if (
    selection.catalogPreferences ||
    selection.rankingComparisons
  ) {
    saveCatalogProfile(nextCatalogProfile, storage);
  }

  if (selection.rewardsPunishments) {
    saveRewardPunishmentAuthoritativeState(
      nextRewardsPunishments,
      storage,
    );
  }

  if (selection.savedScenes) {
    saveSceneLibraryState(nextScenes, storage);
  }

  if (selection.profileSettings) {
    saveProfileSettings(nextSettings, storage);
  }

  return {
    profile: nextProfile,
    catalogProfile: nextCatalogProfile,
    rewardsPunishments: nextRewardsPunishments,
    scenes: nextScenes,
    settings: nextSettings,
  };
}

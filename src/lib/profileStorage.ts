import type { QuizId } from "../data/quizzes";
import { getActiveProfileStorage } from "./profileRegistry";

export type AnswerMap = Record<string, number>;

export type QuizProgress = {
  quizVersion: number;
  answers: AnswerMap;
  completedAt?: string;
};

export type StoredProfile = {
  schemaVersion: 2;
  quizzes: Partial<Record<QuizId, QuizProgress>>;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const PROFILE_STORAGE_KEY = "pet-profile-v2";
const LEGACY_STORAGE_KEY = "pet-profile-quiz-v1";

export function createEmptyProfile(): StoredProfile {
  return {
    schemaVersion: 2,
    quizzes: {},
  };
}

function browserStorage(): StorageLike {
  return getActiveProfileStorage(localStorage);
}

export function loadProfile(
  storage: StorageLike = browserStorage(),
): StoredProfile {
  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as StoredProfile;
      if (parsed.schemaVersion === 2 && parsed.quizzes) {
        return parsed;
      }
    }

    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as { answers?: AnswerMap };
      const answers = legacy.answers ?? {};

      if (Object.keys(answers).length > 0) {
        return {
          schemaVersion: 2,
          quizzes: {
            "starter-profile": {
              quizVersion: 1,
              answers,
            },
          },
        };
      }
    }
  } catch {
    // Corrupt local data should never prevent the app from loading.
  }

  return createEmptyProfile();
}

export function saveProfile(
  profile: StoredProfile,
  storage: StorageLike = browserStorage(),
) {
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

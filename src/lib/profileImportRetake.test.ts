import { describe, expect, it } from "vitest";
import { getQuiz } from "../data/quizzes";
import { resolveQuizLifecycle } from "../features/quizzes/quizRuntime";
import {
  createProfileBackup,
  serializeProfileBackup,
} from "./profileBackup";
import {
  parseProfileBackupJson,
  restoreProfileBackup,
} from "./profileImport";
import {
  loadProfile,
  saveProfile,
  type StorageLike,
  type StoredProfile,
} from "./profileStorage";

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function profileWithRetake(): StoredProfile {
  const quiz = getQuiz("dominance-submission")!;
  return {
    schemaVersion: 2,
    quizzes: {
      [quiz.id]: {
        quizVersion: quiz.version,
        answers: Object.fromEntries(
          quiz.questionIds.map((questionId) => [questionId, 4]),
        ),
        completedAt: "2026-09-14T18:00:00.000Z",
        retake: {
          quizVersion: quiz.version,
          answers: {
            [quiz.questionIds[0]]: 0,
          },
          startedAt: "2026-09-14T19:00:00.000Z",
        },
      },
    },
  };
}

describe("profile backup retake preservation", () => {
  it("keeps the authoritative completed result and incomplete retake draft through export, parse, and restore", () => {
    const quiz = getQuiz("dominance-submission")!;
    const source = new MemoryStorage();
    const original = profileWithRetake();
    saveProfile(original, source);

    const backup = createProfileBackup(
      source,
      "2026-09-14T19:05:00.000Z",
    );
    const parsed = parseProfileBackupJson(
      serializeProfileBackup(backup),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.backup.profile.quizzes.quizzes[quiz.id]?.retake).toEqual(
      original.quizzes[quiz.id]?.retake,
    );

    const destination = new MemoryStorage();
    restoreProfileBackup(parsed.backup, destination);
    const restored = loadProfile(destination);
    const progress = restored.quizzes[quiz.id]!;
    const lifecycle = resolveQuizLifecycle(quiz, restored);

    expect(progress.answers).toEqual(original.quizzes[quiz.id]!.answers);
    expect(progress.completedAt).toBe(
      original.quizzes[quiz.id]!.completedAt,
    );
    expect(progress.retake).toEqual(original.quizzes[quiz.id]!.retake);

    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.state).toBe("retake-in-progress");
      expect(lifecycle.resultState.semanticState).toBe("available");
      expect(lifecycle.attemptState?.semanticState).toBe("developing");
      expect(lifecycle.hasEstablishedResult).toBe(true);
    }
  });

  it("rejects malformed retake drafts instead of silently dropping them", () => {
    const source = new MemoryStorage();
    saveProfile(profileWithRetake(), source);
    const backup = createProfileBackup(
      source,
      "2026-09-14T19:05:00.000Z",
    );
    const quiz = getQuiz("dominance-submission")!;
    const progress = backup.profile.quizzes.quizzes[quiz.id]!;

    progress.retake = {
      ...progress.retake!,
      startedAt: "not-a-date",
    };

    const parsed = parseProfileBackupJson(
      serializeProfileBackup(backup),
    );

    expect(parsed).toEqual({
      ok: false,
      error: "The quiz data section is invalid or unsupported.",
    });
  });
});

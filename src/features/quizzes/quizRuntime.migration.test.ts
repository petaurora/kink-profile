import { describe, expect, it } from "vitest";
import { getQuiz } from "../../data/quizzes";
import type { StoredProfile } from "../../lib/profileStorage";
import {
  answerQuizQuestion,
  canViewQuizResults,
  getQuizState,
  startQuizRetake,
} from "./quizRuntime";

describe("quiz bank version migration", () => {
  it("keeps an older completed B&D result established and drops legacy answers after a v2 retake", () => {
    const quiz = getQuiz("bondage-discipline")!;
    expect(quiz.version).toBe(2);

    const legacyProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "bondage-discipline": {
          quizVersion: 1,
          answers: {
            "bd-001": 3,
            "bd-007": 4,
            "bd-018": 2,
          },
          completedAt: "2026-09-14T12:00:00.000Z",
        },
      },
    };

    expect(getQuizState(quiz, legacyProfile)).toBe("complete");
    expect(canViewQuizResults(quiz, legacyProfile)).toBe(true);

    let profile = startQuizRetake(
      quiz,
      legacyProfile,
      "2026-09-15T12:00:00.000Z",
    );
    expect(profile.quizzes[quiz.id]?.retake?.answers).toEqual({});

    for (const questionId of quiz.questionIds) {
      profile = answerQuizQuestion(
        quiz,
        profile,
        questionId,
        3,
        "2026-09-15T12:30:00.000Z",
      );
    }

    const progress = profile.quizzes[quiz.id]!;
    expect(progress.quizVersion).toBe(2);
    expect(progress.retake).toBeUndefined();
    expect(Object.keys(progress.answers).sort()).toEqual(
      [...quiz.questionIds].sort(),
    );
    expect(progress.answers["bd-007"]).toBeUndefined();
    expect(progress.answers["bd-018"]).toBeUndefined();
    expect(canViewQuizResults(quiz, profile)).toBe(true);
  });
});

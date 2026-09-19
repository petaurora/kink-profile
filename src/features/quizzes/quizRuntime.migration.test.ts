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

  it("keeps an older completed D/s result established and drops legacy answers after a v2 retake", () => {
    const quiz = getQuiz("dominance-submission")!;
    expect(quiz.version).toBe(2);

    const legacyProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: 1,
          answers: {
            "ds-001": 3,
            "ds-017": 4,
            "ds-018": 2,
          },
          completedAt: "2026-09-17T12:00:00.000Z",
        },
      },
    };

    expect(getQuizState(quiz, legacyProfile)).toBe("complete");
    expect(canViewQuizResults(quiz, legacyProfile)).toBe(true);

    let profile = startQuizRetake(
      quiz,
      legacyProfile,
      "2026-09-18T12:00:00.000Z",
    );
    expect(profile.quizzes[quiz.id]?.retake?.answers).toEqual({});

    for (const questionId of quiz.questionIds) {
      profile = answerQuizQuestion(
        quiz,
        profile,
        questionId,
        3,
        "2026-09-18T12:30:00.000Z",
      );
    }

    const progress = profile.quizzes[quiz.id]!;
    expect(progress.quizVersion).toBe(2);
    expect(progress.retake).toBeUndefined();
    expect(Object.keys(progress.answers).sort()).toEqual(
      [...quiz.questionIds].sort(),
    );
    expect(progress.answers["ds-017"]).toBeUndefined();
    expect(progress.answers["ds-018"]).toBeUndefined();
    expect(canViewQuizResults(quiz, profile)).toBe(true);
  });
  it("keeps an older completed S/M result established and drops legacy answers after a v2 retake", () => {
    const quiz = getQuiz("sadism-masochism")!;
    expect(quiz.version).toBe(2);

    const legacyProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "sadism-masochism": {
          quizVersion: 1,
          answers: {
            "sm-001": 3,
            "sm-004": 4,
            "sm-024": 2,
          },
          completedAt: "2026-09-18T12:00:00.000Z",
        },
      },
    };

    expect(getQuizState(quiz, legacyProfile)).toBe("complete");
    expect(canViewQuizResults(quiz, legacyProfile)).toBe(true);

    let profile = startQuizRetake(
      quiz,
      legacyProfile,
      "2026-09-19T01:00:00.000Z",
    );
    expect(profile.quizzes[quiz.id]?.retake?.answers).toEqual({});

    for (const questionId of quiz.questionIds) {
      profile = answerQuizQuestion(
        quiz,
        profile,
        questionId,
        3,
        "2026-09-19T01:30:00.000Z",
      );
    }

    const progress = profile.quizzes[quiz.id]!;
    expect(progress.quizVersion).toBe(2);
    expect(progress.retake).toBeUndefined();
    expect(Object.keys(progress.answers).sort()).toEqual(
      [...quiz.questionIds].sort(),
    );
    expect(progress.answers["sm-004"]).toBeUndefined();
    expect(progress.answers["sm-024"]).toBeUndefined();
    expect(canViewQuizResults(quiz, profile)).toBe(true);
  });
  it("keeps an older completed Roles & Headspaces result established and drops legacy answers after a v6 retake", () => {
    const quiz = getQuiz("roles-headspaces")!;
    expect(quiz.version).toBe(6);

    const legacyProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "roles-headspaces": {
          quizVersion: 5,
          answers: {
            "hs-001": 3,
            "hs-006": 4,
            "hs-024": 2,
          },
          completedAt: "2026-09-18T12:00:00.000Z",
        },
      },
    };

    expect(getQuizState(quiz, legacyProfile)).toBe("complete");
    expect(canViewQuizResults(quiz, legacyProfile)).toBe(true);

    let profile = startQuizRetake(
      quiz,
      legacyProfile,
      "2026-09-19T02:30:00.000Z",
    );
    expect(profile.quizzes[quiz.id]?.retake?.answers).toEqual({});

    for (const questionId of quiz.questionIds) {
      profile = answerQuizQuestion(
        quiz,
        profile,
        questionId,
        3,
        "2026-09-19T03:00:00.000Z",
      );
    }

    const progress = profile.quizzes[quiz.id]!;
    expect(progress.quizVersion).toBe(6);
    expect(progress.retake).toBeUndefined();
    expect(Object.keys(progress.answers).sort()).toEqual(
      [...quiz.questionIds].sort(),
    );
    expect(progress.answers["hs-006"]).toBeUndefined();
    expect(progress.answers["hs-024"]).toBeUndefined();
    expect(canViewQuizResults(quiz, profile)).toBe(true);
  });
});

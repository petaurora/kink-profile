import { describe, expect, it } from "vitest";
import { getQuiz, quizzes, retiredQuizIds } from "../../data/quizzes";
import type { StoredProfile } from "../../lib/profileStorage";
import {
  canViewQuizResults,
  getQuizState,
  initialQuestionIndex,
  resolveAvailableQuiz,
} from "./quizRuntime";

const emptyProfile: StoredProfile = {
  schemaVersion: 2,
  quizzes: {},
};

describe("quiz route runtime", () => {
  it("resolves every available quiz and refuses retired or unknown IDs", () => {
    for (const quiz of quizzes) {
      if (quiz.availability === "available") {
        expect(resolveAvailableQuiz(quiz.id)).toBe(quiz);
      } else {
        expect(resolveAvailableQuiz(quiz.id)).toBeUndefined();
      }
    }

    for (const retiredQuizId of retiredQuizIds) {
      expect(resolveAvailableQuiz(retiredQuizId)).toBeUndefined();
    }

    expect(resolveAvailableQuiz("not-a-quiz")).toBeUndefined();
    expect(resolveAvailableQuiz(undefined)).toBeUndefined();
  });

  it("hydrates a new quiz at the first question", () => {
    const quiz = getQuiz("dominance-submission")!;
    expect(initialQuestionIndex(quiz, emptyProfile)).toBe(0);
    expect(getQuizState(quiz, emptyProfile)).toBe("not-started");
    expect(canViewQuizResults(quiz, emptyProfile)).toBe(false);
  });

  it("resumes at the first unanswered question and blocks direct results", () => {
    const quiz = getQuiz("dominance-submission")!;
    const [firstQuestionId, secondQuestionId] = quiz.questionIds;
    const profile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: quiz.version,
          answers: {
            [firstQuestionId]: 4,
          },
        },
      },
    };

    expect(secondQuestionId).toBeTruthy();
    expect(initialQuestionIndex(quiz, profile)).toBe(1);
    expect(getQuizState(quiz, profile)).toBe("in-progress");
    expect(canViewQuizResults(quiz, profile)).toBe(false);
  });

  it("allows direct results only when all current questions are answered", () => {
    const quiz = getQuiz("dominance-submission")!;
    const answers = Object.fromEntries(
      quiz.questionIds.map((questionId) => [questionId, 3]),
    );
    const profile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: quiz.version,
          answers,
          completedAt: "2026-09-11T00:00:00.000Z",
        },
      },
    };

    expect(getQuizState(quiz, profile)).toBe("complete");
    expect(canViewQuizResults(quiz, profile)).toBe(true);
    expect(initialQuestionIndex(quiz, profile)).toBe(0);
  });

  it("does not trust completedAt when current answers are incomplete", () => {
    const quiz = getQuiz("dominance-submission")!;
    const [firstQuestionId] = quiz.questionIds;
    const profile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: quiz.version,
          answers: { [firstQuestionId]: 4 },
          completedAt: "2026-09-11T00:00:00.000Z",
        },
      },
    };

    expect(getQuizState(quiz, profile)).toBe("in-progress");
    expect(canViewQuizResults(quiz, profile)).toBe(false);
  });

  it("never exposes results for unavailable or empty quiz definitions", () => {
    const quiz = getQuiz("dominance-submission")!;
    const completeProfile: StoredProfile = {
      schemaVersion: 2,
      quizzes: {
        "dominance-submission": {
          quizVersion: quiz.version,
          answers: Object.fromEntries(
            quiz.questionIds.map((questionId) => [questionId, 3]),
          ),
        },
      },
    };

    expect(
      canViewQuizResults(
        { ...quiz, availability: "coming-soon" },
        completeProfile,
      ),
    ).toBe(false);
    expect(
      canViewQuizResults({ ...quiz, questionIds: [] }, completeProfile),
    ).toBe(false);
  });
});

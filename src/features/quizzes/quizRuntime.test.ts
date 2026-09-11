import { describe, expect, it } from "vitest";
import { getQuiz } from "../../data/quizzes";
import type { StoredProfile } from "../../lib/profileStorage";
import {
  getQuizState,
  initialQuestionIndex,
  resolveAvailableQuiz,
} from "./quizRuntime";

const emptyProfile: StoredProfile = {
  schemaVersion: 2,
  quizzes: {},
};

describe("quiz route runtime", () => {
  it("resolves only available quiz IDs", () => {
    expect(resolveAvailableQuiz("dominance-submission")?.id).toBe(
      "dominance-submission",
    );
    expect(resolveAvailableQuiz("starter-profile")).toBeUndefined();
    expect(resolveAvailableQuiz("not-a-quiz")).toBeUndefined();
    expect(resolveAvailableQuiz(undefined)).toBeUndefined();
  });

  it("hydrates a new quiz at the first question", () => {
    const quiz = getQuiz("dominance-submission")!;
    expect(initialQuestionIndex(quiz, emptyProfile)).toBe(0);
    expect(getQuizState(quiz, emptyProfile)).toBe("not-started");
  });

  it("resumes at the first unanswered question", () => {
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
  });

  it("recognizes completed stored quiz state and reopens edits at question one", () => {
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
    expect(initialQuestionIndex(quiz, profile)).toBe(0);
  });
});

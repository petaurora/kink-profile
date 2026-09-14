import { describe, expect, it } from "vitest";
import { getQuiz, quizzes, retiredQuizIds } from "../../data/quizzes";
import type { StoredProfile } from "../../lib/profileStorage";
import {
  answerQuizQuestion,
  canViewQuizResults,
  getQuizDataIssue,
  getQuizState,
  initialQuestionIndex,
  resolveAvailableQuiz,
  resolveQuizDimensionState,
  resolveQuizLifecycle,
  startQuizRetake,
} from "./quizRuntime";

const emptyProfile: StoredProfile = {
  schemaVersion: 2,
  quizzes: {},
};

function completeProfile(
  quizId: "dominance-submission" = "dominance-submission",
  value = 3,
): StoredProfile {
  const quiz = getQuiz(quizId)!;
  return {
    schemaVersion: 2,
    quizzes: {
      [quizId]: {
        quizVersion: quiz.version,
        answers: Object.fromEntries(
          quiz.questionIds.map((questionId) => [questionId, value]),
        ),
        completedAt: "2026-09-11T00:00:00.000Z",
      },
    },
  };
}

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

  it("models a never-started quiz as unexplored without exposing results", () => {
    const quiz = getQuiz("dominance-submission")!;
    const lifecycle = resolveQuizLifecycle(quiz, emptyProfile);

    expect(initialQuestionIndex(quiz, emptyProfile)).toBe(0);
    expect(getQuizState(quiz, emptyProfile)).toBe("not-started");
    expect(canViewQuizResults(quiz, emptyProfile)).toBe(false);
    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.resultState.state).toBe("unexplored");
      expect(lifecycle.resultState.reason).toBe("quiz_not_started");
    }
  });

  it("resumes incomplete first attempts as developing and blocks results", () => {
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
    const lifecycle = resolveQuizLifecycle(quiz, profile);

    expect(secondQuestionId).toBeTruthy();
    expect(initialQuestionIndex(quiz, profile)).toBe(1);
    expect(getQuizState(quiz, profile)).toBe("in-progress");
    expect(canViewQuizResults(quiz, profile)).toBe(false);
    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.resultState.state).toBe("developing");
      expect(lifecycle.resultState.reason).toBe("quiz_in_progress");
    }
  });

  it("allows direct results when all current questions are answered", () => {
    const quiz = getQuiz("dominance-submission")!;
    const profile = completeProfile();
    const lifecycle = resolveQuizLifecycle(quiz, profile);

    expect(getQuizState(quiz, profile)).toBe("complete");
    expect(canViewQuizResults(quiz, profile)).toBe(true);
    expect(initialQuestionIndex(quiz, profile)).toBe(0);
    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.resultState.state).toBe("available");
      expect(lifecycle.hasEstablishedResult).toBe(true);
    }
  });

  it("treats a balanced/diffuse completed answer set as a valid result", () => {
    const quiz = getQuiz("dominance-submission")!;
    const profile = completeProfile("dominance-submission", 2);
    const lifecycle = resolveQuizLifecycle(quiz, profile);

    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.state).toBe("complete");
      expect(lifecycle.resultState.state).toBe("available");
    }
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

  it("keeps an established result authoritative while a retake is incomplete", () => {
    const quiz = getQuiz("dominance-submission")!;
    const original = completeProfile();
    const originalAnswers = original.quizzes[quiz.id]!.answers;
    const started = startQuizRetake(
      quiz,
      original,
      "2026-09-14T12:00:00.000Z",
    );
    const firstQuestionId = quiz.questionIds[0];
    const inProgress = answerQuizQuestion(
      quiz,
      started,
      firstQuestionId,
      0,
      "2026-09-14T12:05:00.000Z",
    );
    const lifecycle = resolveQuizLifecycle(quiz, inProgress);

    expect(inProgress.quizzes[quiz.id]!.answers).toEqual(originalAnswers);
    expect(inProgress.quizzes[quiz.id]!.retake?.answers).toEqual({
      [firstQuestionId]: 0,
    });
    expect(canViewQuizResults(quiz, inProgress)).toBe(true);
    expect(getQuizState(quiz, inProgress)).toBe("retake-in-progress");
    expect(initialQuestionIndex(quiz, inProgress)).toBe(1);

    expect(lifecycle.kind).toBe("resolved");
    if (lifecycle.kind === "resolved") {
      expect(lifecycle.resultState.state).toBe("available");
      expect(lifecycle.attemptState?.state).toBe("developing");
      expect(lifecycle.hasEstablishedResult).toBe(true);
    }
  });

  it("promotes a completed retake atomically and removes the draft", () => {
    const quiz = getQuiz("dominance-submission")!;
    let profile = startQuizRetake(
      quiz,
      completeProfile(),
      "2026-09-14T12:00:00.000Z",
    );

    for (const questionId of quiz.questionIds) {
      profile = answerQuizQuestion(
        quiz,
        profile,
        questionId,
        1,
        "2026-09-14T12:30:00.000Z",
      );
    }

    const progress = profile.quizzes[quiz.id]!;
    expect(progress.retake).toBeUndefined();
    expect(progress.completedAt).toBe("2026-09-14T12:30:00.000Z");
    expect(Object.values(progress.answers)).toEqual(
      Array(quiz.questionIds.length).fill(1),
    );
    expect(getQuizState(quiz, profile)).toBe("complete");
    expect(canViewQuizResults(quiz, profile)).toBe(true);
  });

  it("does not silently edit an established result without an explicit retake", () => {
    const quiz = getQuiz("dominance-submission")!;
    const profile = completeProfile();
    const next = answerQuizQuestion(
      quiz,
      profile,
      quiz.questionIds[0],
      0,
    );

    expect(next).toBe(profile);
  });

  it("keeps unmeasured, developing, and measured-low dimensions distinct", () => {
    expect(resolveQuizDimensionState(0).state).toBe("unexplored");
    expect(resolveQuizDimensionState(undefined).state).toBe("unexplored");
    expect(resolveQuizDimensionState(45).state).toBe("developing");

    // Affinity is deliberately not an input: full evidence can support a real 0.
    expect(resolveQuizDimensionState(100).state).toBe("available");
  });

  it("reports broken question data as an error contract, not an empty result", () => {
    const quiz = getQuiz("dominance-submission")!;
    const emptyQuestionQuiz = { ...quiz, questionIds: [] };
    const missingQuestionQuiz = {
      ...quiz,
      questionIds: [...quiz.questionIds, "missing-question-id"],
    };

    expect(getQuizDataIssue(emptyQuestionQuiz)).toEqual({
      kind: "empty-question-bank",
    });
    expect(getQuizDataIssue(missingQuestionQuiz)).toEqual({
      kind: "missing-questions",
      missingQuestionIds: ["missing-question-id"],
    });

    const emptyLifecycle = resolveQuizLifecycle(emptyQuestionQuiz, emptyProfile);
    expect(emptyLifecycle.kind).toBe("error");
    expect(emptyLifecycle.state).toBe("error");
    expect(canViewQuizResults(emptyQuestionQuiz, emptyProfile)).toBe(false);
  });

  it("never exposes results for unavailable quiz definitions", () => {
    const quiz = getQuiz("dominance-submission")!;
    const profile = completeProfile();

    expect(
      canViewQuizResults(
        { ...quiz, availability: "coming-soon" },
        profile,
      ),
    ).toBe(false);
  });
});

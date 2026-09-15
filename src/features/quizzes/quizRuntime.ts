import type { QuizQuestion } from "../../data/quizQuestions";
import { quizQuestions } from "../../data/quizQuestions";
import { quizzes, type QuizDefinition } from "../../data/quizzes";
import type {
  AnswerMap,
  QuizProgress,
  StoredProfile,
} from "../../lib/profileStorage";
import {
  resolveSparseState,
  type SparseEvidence,
  type SparseStateResolution,
} from "../../lib/sparseState";

export type QuizState =
  | "not-started"
  | "in-progress"
  | "retake-in-progress"
  | "complete"
  | "coming-soon"
  | "error";

export type QuizSparseReason =
  | "quiz_not_started"
  | "quiz_in_progress"
  | "quiz_retake_in_progress"
  | "quiz_complete"
  | "quiz_coming_soon"
  | "quiz_dimension_unmeasured"
  | "quiz_dimension_developing";

export type QuizDataIssue =
  | { kind: "empty-question-bank" }
  | { kind: "missing-questions"; missingQuestionIds: readonly string[] };

export type QuizLifecycle =
  | {
      kind: "error";
      state: "error";
      dataIssue: QuizDataIssue;
      answeredCount: number;
      totalQuestions: number;
      hasEstablishedResult: false;
    }
  | {
      kind: "resolved";
      state: Exclude<QuizState, "error">;
      resultState: SparseStateResolution<QuizSparseReason>;
      attemptState?: SparseStateResolution<QuizSparseReason>;
      answeredCount: number;
      totalQuestions: number;
      hasEstablishedResult: boolean;
    };

export function resolveAvailableQuiz(quizId: string | undefined) {
  return quizzes.find(
    (quiz) => quiz.id === quizId && quiz.availability === "available",
  );
}

export function getQuestionsForQuiz(quiz: QuizDefinition): QuizQuestion[] {
  const ids = new Set(quiz.questionIds);
  return quizQuestions.filter((question) => ids.has(question.id));
}

export function getQuizDataIssue(
  quiz: QuizDefinition,
): QuizDataIssue | undefined {
  if (quiz.availability !== "available") return undefined;
  if (quiz.questionIds.length === 0) return { kind: "empty-question-bank" };

  const resolvedIds = new Set(getQuestionsForQuiz(quiz).map((question) => question.id));
  const missingQuestionIds = quiz.questionIds.filter(
    (questionId) => !resolvedIds.has(questionId),
  );

  return missingQuestionIds.length > 0
    ? { kind: "missing-questions", missingQuestionIds }
    : undefined;
}

export function getAnsweredCount(
  quiz: QuizDefinition,
  answers: AnswerMap,
) {
  return quiz.questionIds.filter(
    (questionId) => answers[questionId] !== undefined,
  ).length;
}

function evidenceForAnswers(
  quiz: QuizDefinition,
  answers: AnswerMap,
): SparseEvidence {
  const answeredCount = getAnsweredCount(quiz, answers);
  if (answeredCount === 0 || quiz.questionIds.length === 0) {
    return { level: "none", direct: false, inferred: false };
  }

  return {
    level:
      answeredCount >= quiz.questionIds.length ? "sufficient" : "partial",
    direct: true,
    inferred: false,
  };
}

export function getQuizAttemptAnswers(
  quiz: QuizDefinition,
  profile: StoredProfile,
): AnswerMap {
  const progress = profile.quizzes[quiz.id];
  return progress?.retake?.answers ?? progress?.answers ?? {};
}

export function hasEstablishedQuizResult(
  quiz: QuizDefinition,
  profile: StoredProfile,
) {
  if (quiz.availability !== "available" || getQuizDataIssue(quiz)) {
    return false;
  }

  const progress = profile.quizzes[quiz.id];
  const answers = progress?.answers ?? {};
  const currentBankComplete =
    quiz.questionIds.length > 0 &&
    getAnsweredCount(quiz, answers) >= quiz.questionIds.length;

  if (currentBankComplete) return true;

  // A completed result from an older quiz version remains an established
  // historical result after the active question bank changes. The user can
  // explicitly retake the new version; once that retake completes, its fresh
  // answer map replaces the old one and obsolete question answers disappear.
  return Boolean(
    progress?.completedAt &&
      progress.quizVersion < quiz.version &&
      Object.keys(answers).length > 0,
  );
}

export function canViewQuizResults(
  quiz: QuizDefinition,
  profile: StoredProfile,
) {
  return hasEstablishedQuizResult(quiz, profile);
}

export function resolveQuizLifecycle(
  quiz: QuizDefinition,
  profile: StoredProfile,
): QuizLifecycle {
  const progress = profile.quizzes[quiz.id];
  const stableAnswers = progress?.answers ?? {};
  const totalQuestions = quiz.questionIds.length;
  const stableAnsweredCount = getAnsweredCount(quiz, stableAnswers);

  if (quiz.availability === "coming-soon") {
    return {
      kind: "resolved",
      state: "coming-soon",
      resultState: resolveSparseState<QuizSparseReason>({
        evidence: { level: "none", direct: false, inferred: false },
        result: "missing",
        unavailable: true,
        reason: "quiz_coming_soon",
      }),
      answeredCount: 0,
      totalQuestions,
      hasEstablishedResult: false,
    };
  }

  const dataIssue = getQuizDataIssue(quiz);
  if (dataIssue) {
    return {
      kind: "error",
      state: "error",
      dataIssue,
      answeredCount: 0,
      totalQuestions,
      hasEstablishedResult: false,
    };
  }

  const hasEstablishedResult = hasEstablishedQuizResult(quiz, profile);

  if (progress?.retake && hasEstablishedResult) {
    const attemptAnswers = progress.retake.answers;
    return {
      kind: "resolved",
      state: "retake-in-progress",
      resultState: resolveSparseState<QuizSparseReason>({
        evidence: evidenceForAnswers(quiz, stableAnswers),
        result: "value",
        reason: "quiz_complete",
      }),
      attemptState: resolveSparseState<QuizSparseReason>({
        evidence: evidenceForAnswers(quiz, attemptAnswers),
        result: "missing",
        reason: "quiz_retake_in_progress",
      }),
      answeredCount: getAnsweredCount(quiz, attemptAnswers),
      totalQuestions,
      hasEstablishedResult: true,
    };
  }

  if (hasEstablishedResult) {
    return {
      kind: "resolved",
      state: "complete",
      resultState: resolveSparseState<QuizSparseReason>({
        evidence: evidenceForAnswers(quiz, stableAnswers),
        result: "value",
        reason: "quiz_complete",
      }),
      answeredCount: stableAnsweredCount,
      totalQuestions,
      hasEstablishedResult: true,
    };
  }

  if (stableAnsweredCount === 0) {
    return {
      kind: "resolved",
      state: "not-started",
      resultState: resolveSparseState<QuizSparseReason>({
        evidence: { level: "none", direct: false, inferred: false },
        result: "missing",
        reason: "quiz_not_started",
      }),
      answeredCount: 0,
      totalQuestions,
      hasEstablishedResult: false,
    };
  }

  return {
    kind: "resolved",
    state: "in-progress",
    resultState: resolveSparseState<QuizSparseReason>({
      evidence: evidenceForAnswers(quiz, stableAnswers),
      result: "missing",
      reason: "quiz_in_progress",
    }),
    answeredCount: stableAnsweredCount,
    totalQuestions,
    hasEstablishedResult: false,
  };
}

export function getQuizState(
  quiz: QuizDefinition,
  profile: StoredProfile,
): QuizState {
  return resolveQuizLifecycle(quiz, profile).state;
}

export function initialQuestionIndex(
  quiz: QuizDefinition,
  profile: StoredProfile,
) {
  const answers = getQuizAttemptAnswers(quiz, profile);
  const questions = getQuestionsForQuiz(quiz);
  const firstUnanswered = questions.findIndex(
    (question) => answers[question.id] === undefined,
  );

  return firstUnanswered === -1 ? 0 : firstUnanswered;
}

export function startQuizRetake(
  quiz: QuizDefinition,
  profile: StoredProfile,
  startedAt = new Date().toISOString(),
): StoredProfile {
  if (!hasEstablishedQuizResult(quiz, profile)) return profile;

  const progress = profile.quizzes[quiz.id];
  if (!progress || progress.retake) return profile;

  return {
    ...profile,
    quizzes: {
      ...profile.quizzes,
      [quiz.id]: {
        ...progress,
        retake: {
          quizVersion: quiz.version,
          answers: {},
          startedAt,
        },
      },
    },
  };
}

export function answerQuizQuestion(
  quiz: QuizDefinition,
  profile: StoredProfile,
  questionId: string,
  value: number,
  completedAt = new Date().toISOString(),
): StoredProfile {
  if (
    quiz.availability !== "available" ||
    getQuizDataIssue(quiz) ||
    !quiz.questionIds.includes(questionId)
  ) {
    return profile;
  }

  const progress = profile.quizzes[quiz.id];

  if (progress?.retake) {
    const nextAnswers = { ...progress.retake.answers, [questionId]: value };
    const isComplete = getAnsweredCount(quiz, nextAnswers) >= quiz.questionIds.length;

    return {
      ...profile,
      quizzes: {
        ...profile.quizzes,
        [quiz.id]: isComplete
          ? {
              quizVersion: progress.retake.quizVersion,
              answers: nextAnswers,
              completedAt,
            }
          : {
              ...progress,
              retake: {
                ...progress.retake,
                answers: nextAnswers,
              },
            },
      },
    };
  }

  // Established results are immutable until the user explicitly starts a retake.
  if (hasEstablishedQuizResult(quiz, profile)) return profile;

  const nextAnswers = { ...(progress?.answers ?? {}), [questionId]: value };
  const isComplete = getAnsweredCount(quiz, nextAnswers) >= quiz.questionIds.length;
  const nextProgress: QuizProgress = {
    quizVersion: quiz.version,
    answers: nextAnswers,
    ...(isComplete ? { completedAt } : {}),
  };

  return {
    ...profile,
    quizzes: {
      ...profile.quizzes,
      [quiz.id]: nextProgress,
    },
  };
}

export function resolveQuizDimensionState(
  coverage: number | undefined,
): SparseStateResolution<QuizSparseReason> {
  const normalizedCoverage =
    typeof coverage === "number" && Number.isFinite(coverage)
      ? Math.min(100, Math.max(0, coverage))
      : 0;

  if (normalizedCoverage <= 0) {
    return resolveSparseState<QuizSparseReason>({
      evidence: { level: "none", direct: false, inferred: false },
      result: "missing",
      reason: "quiz_dimension_unmeasured",
    });
  }

  if (normalizedCoverage < 100) {
    return resolveSparseState<QuizSparseReason>({
      evidence: { level: "partial", direct: true, inferred: false },
      result: "value",
      reason: "quiz_dimension_developing",
    });
  }

  return resolveSparseState<QuizSparseReason>({
    evidence: { level: "sufficient", direct: true, inferred: false },
    result: "value",
  });
}

export function stateLabel(state: QuizState) {
  switch (state) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    case "retake-in-progress":
      return "Retake in progress";
    case "coming-soon":
      return "Coming soon";
    case "error":
      return "Unavailable";
    default:
      return "Not started";
  }
}

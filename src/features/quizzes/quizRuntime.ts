import type { QuizQuestion } from "../../data/quizQuestions";
import { quizQuestions } from "../../data/quizQuestions";
import { quizzes, type QuizDefinition } from "../../data/quizzes";
import type { AnswerMap, StoredProfile } from "../../lib/profileStorage";

export type QuizState =
  | "not-started"
  | "in-progress"
  | "complete"
  | "coming-soon";

export function resolveAvailableQuiz(quizId: string | undefined) {
  return quizzes.find(
    (quiz) => quiz.id === quizId && quiz.availability === "available",
  );
}

export function getQuestionsForQuiz(quiz: QuizDefinition): QuizQuestion[] {
  const ids = new Set(quiz.questionIds);
  return quizQuestions.filter((question) => ids.has(question.id));
}

export function getAnsweredCount(
  quiz: QuizDefinition,
  answers: AnswerMap,
) {
  return quiz.questionIds.filter(
    (questionId) => answers[questionId] !== undefined,
  ).length;
}

export function canViewQuizResults(
  quiz: QuizDefinition,
  profile: StoredProfile,
) {
  if (quiz.availability !== "available" || quiz.questionIds.length === 0) {
    return false;
  }

  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  return getAnsweredCount(quiz, answers) >= quiz.questionIds.length;
}

export function getQuizState(
  quiz: QuizDefinition,
  profile: StoredProfile,
): QuizState {
  if (quiz.availability === "coming-soon") return "coming-soon";

  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(quiz, answers);

  if (answeredCount === 0) return "not-started";
  if (
    quiz.questionIds.length > 0 &&
    answeredCount >= quiz.questionIds.length
  ) {
    return "complete";
  }

  return "in-progress";
}

export function initialQuestionIndex(
  quiz: QuizDefinition,
  profile: StoredProfile,
) {
  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const questions = getQuestionsForQuiz(quiz);
  const firstUnanswered = questions.findIndex(
    (question) => answers[question.id] === undefined,
  );

  return firstUnanswered === -1 ? 0 : firstUnanswered;
}

export function stateLabel(state: QuizState) {
  switch (state) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    case "coming-soon":
      return "Coming soon";
    default:
      return "Not started";
  }
}

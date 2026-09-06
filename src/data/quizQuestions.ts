import { questions as starterQuestions, type Question as StarterQuestion } from "./questions";
import { dsQuestions } from "./dsQuiz";
import { headspaceQuestions } from "./headspacesQuiz";
import { bondageDisciplineQuestions } from "./bondageDisciplineQuiz";
import { sadismMasochismQuestions } from "./sadismMasochismQuiz";
import type { WeightedQuestion } from "./signals";

export type LegacyQuizQuestion = StarterQuestion & { kind: "legacy" };
export type WeightedQuizQuestion = WeightedQuestion & { kind: "weighted" };
export type QuizQuestion = LegacyQuizQuestion | WeightedQuizQuestion;

export const quizQuestions: QuizQuestion[] = [
  ...starterQuestions.map((question) => ({ ...question, kind: "legacy" as const })),
  ...dsQuestions.map((question) => ({ ...question, kind: "weighted" as const })),
  ...headspaceQuestions.map((question) => ({ ...question, kind: "weighted" as const })),
  ...bondageDisciplineQuestions.map((question) => ({
    ...question,
    kind: "weighted" as const,
  })),
  ...sadismMasochismQuestions.map((question) => ({
    ...question,
    kind: "weighted" as const,
  })),
];

export function isWeightedQuestion(
  question: QuizQuestion,
): question is WeightedQuizQuestion {
  return question.kind === "weighted";
}

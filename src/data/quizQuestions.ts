import { dsQuestions, legacyDsQuestions } from "./dsQuiz";
import { headspaceQuestions } from "./headspacesQuiz";
import {
  bondageDisciplineQuestions,
  legacyBondageDisciplineQuestions,
} from "./bondageDisciplineQuiz";
import {
  legacySadismMasochismQuestions,
  sadismMasochismQuestions,
} from "./sadismMasochismQuiz";
import type { WeightedQuestion } from "./signals";

export type WeightedQuizQuestion = WeightedQuestion & { kind: "weighted" };
export type QuizQuestion = WeightedQuizQuestion;

export const quizQuestions: QuizQuestion[] = [
  ...dsQuestions.map((question) => ({ ...question, kind: "weighted" as const })),
  ...legacyDsQuestions.map((question) => ({ ...question, kind: "weighted" as const })),
  ...headspaceQuestions.map((question) => ({ ...question, kind: "weighted" as const })),
  ...bondageDisciplineQuestions.map((question) => ({
    ...question,
    kind: "weighted" as const,
  })),
  ...legacyBondageDisciplineQuestions.map((question) => ({
    ...question,
    kind: "weighted" as const,
  })),
  ...sadismMasochismQuestions.map((question) => ({
    ...question,
    kind: "weighted" as const,
  })),
  ...legacySadismMasochismQuestions.map((question) => ({
    ...question,
    kind: "weighted" as const,
  })),
];

export function isWeightedQuestion(
  question: QuizQuestion,
): question is WeightedQuizQuestion {
  return question.kind === "weighted";
}

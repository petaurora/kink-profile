import type { QuizDefinition } from "../../data/quizzes";
import type { QuizQuestion } from "../../data/quizQuestions";
import { isWeightedQuestion } from "../../data/quizQuestions";
import type { AnswerMap } from "../../lib/profileStorage";
import { dsSignals } from "../../data/dsQuiz";
import { bondageDisciplineSignalIds } from "../../data/bondageDisciplineQuiz";
import { sadismMasochismSignalIds } from "../../data/sadismMasochismQuiz";
import { headspaceSignalIds, roleHeadspaces } from "../../data/headspacesQuiz";
import { getSignals } from "../../data/signals";
import { scoreDsSignals, scoreHeadspaces, scoreSignals } from "../../lib/scoring";

export type QuizSignalScore = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  percentage: number;
  coverage: number;
};

export function scoreQuizAnswers(quiz: QuizDefinition, questions: QuizQuestion[], answers: AnswerMap): QuizSignalScore[] {
  const weighted = questions.filter(isWeightedQuestion);
  if (quiz.id === "roles-headspaces") {
    return scoreHeadspaces(
      scoreSignals(weighted, answers, getSignals(headspaceSignalIds)),
      roleHeadspaces,
    ).sort((a, b) => b.percentage - a.percentage);
  }
  if (quiz.id === "bondage-discipline") {
    return scoreSignals(weighted, answers, getSignals(bondageDisciplineSignalIds))
      .sort((a, b) => b.percentage - a.percentage);
  }
  if (quiz.id === "sadism-masochism") {
    return scoreSignals(weighted, answers, getSignals(sadismMasochismSignalIds))
      .sort((a, b) => b.percentage - a.percentage);
  }
  if (quiz.id === "dominance-submission") {
    return scoreDsSignals(weighted, answers, dsSignals)
      .sort((a, b) => b.percentage - a.percentage);
  }
  return [];
}

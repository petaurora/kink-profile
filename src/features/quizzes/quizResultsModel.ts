import type { QuizDefinition } from "../../data/quizzes";
import type { QuizQuestion } from "../../data/quizQuestions";
import { isWeightedQuestion } from "../../data/quizQuestions";
import type { AnswerMap } from "../../lib/profileStorage";
import { dsSignals } from "../../data/dsQuiz";
import { bondageDisciplineSignalIds, bondageRadarSignalIds, disciplineRadarSignalIds } from "../../data/bondageDisciplineQuiz";
import { givingSmRadarSignalIds, receivingSmRadarSignalIds, sadismMasochismSignalIds } from "../../data/sadismMasochismQuiz";
import { headspaceSignalIds, partnerPositionedRoleHeadspaceIds, roleHeadspaces, selfPositionedRoleHeadspaceIds } from "../../data/headspacesQuiz";
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

export type QuizRadarView = {
  id: string;
  label: string;
  title: string;
  scores: QuizSignalScore[];
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

export function quizRadarViews(quiz: QuizDefinition, scores: QuizSignalScore[]): QuizRadarView[] {
  const select = (ids: readonly string[]) =>
    ids.map(id => scores.find(score => score.id === id))
      .filter((score): score is QuizSignalScore => score !== undefined);
  if (quiz.id === "roles-headspaces") return [
    { id: "self", label: "Self-positioned", title: "Headspace radar", scores: select(selfPositionedRoleHeadspaceIds) },
    { id: "partner", label: "Partner-positioned", title: "Partner-positioned headspaces", scores: select(partnerPositionedRoleHeadspaceIds) },
  ];
  if (quiz.id === "bondage-discipline") return [
    { id: "physical", label: "Physical control", title: "Restraint radar", scores: select(bondageRadarSignalIds) },
    { id: "structural", label: "Structural control", title: "Discipline radar", scores: select(disciplineRadarSignalIds) },
  ];
  if (quiz.id === "sadism-masochism") return [
    { id: "receiving", label: "Receiving", title: "Receiving radar", scores: select(receivingSmRadarSignalIds) },
    { id: "giving", label: "Giving", title: "Giving radar", scores: select(givingSmRadarSignalIds) },
  ];
  return [{ id: "shape", label: "Preference shape", title: "Radar profile", scores: select(dsSignals.map(s => s.id)) }];
}

import type { QuizDefinition } from "../../data/quizzes";
import { dsSignals } from "../../data/dsQuiz";
import { bondageRadarSignalIds, disciplineRadarSignalIds } from "../../data/bondageDisciplineQuiz";
import { givingSmRadarSignalIds, receivingSmRadarSignalIds } from "../../data/sadismMasochismQuiz";
import { partnerPositionedRoleHeadspaceIds, selfPositionedRoleHeadspaceIds } from "../../data/headspacesQuiz";

import type { QuizSignalScore } from "../../services/domain/quizScoring";
export { scoreQuizAnswers, type QuizSignalScore } from "../../services/domain/quizScoring";

export type QuizRadarView = {
  id: string;
  label: string;
  title: string;
  scores: QuizSignalScore[];
};

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

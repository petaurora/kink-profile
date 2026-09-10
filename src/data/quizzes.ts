import { dsQuestionIds } from "./dsQuiz";
import { headspaceQuestionIds } from "./headspacesQuiz";
import { bondageDisciplineQuestionIds } from "./bondageDisciplineQuiz";
import { sadismMasochismQuestionIds } from "./sadismMasochismQuiz";

export type RetiredQuizId = "starter-profile";

export type QuizId =
  | RetiredQuizId
  | "bondage-discipline"
  | "dominance-submission"
  | "sadism-masochism"
  | "roles-headspaces";

export type QuizDefinition = {
  id: QuizId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  version: number;
  availability: "available" | "coming-soon";
  questionIds: string[];
  contributesToOverall: boolean;
};

export const retiredQuizIds: readonly RetiredQuizId[] = ["starter-profile"];

export const quizzes: QuizDefinition[] = [
  {
    id: "bondage-discipline",
    title: "Bondage & Discipline",
    shortTitle: "B&D",
    eyebrow: "Core section",
    description:
      "Explore receiving and giving restraint, positioning, physical constraint, discipline, accountability, ritual, structure, anticipation, and challenge — without treating discipline as pain.",
    icon: "adjustments-heart",
    estimatedMinutes: 9,
    version: 1,
    availability: "available",
    questionIds: bondageDisciplineQuestionIds,
    contributesToOverall: true,
  },
  {
    id: "dominance-submission",
    title: "Dominance & Submission",
    shortTitle: "D/s",
    eyebrow: "Core section",
    description:
      "Explore authority, control, service, obedience, autonomy, responsibility transfer, and the shape of power exchange.",
    icon: "transfer",
    estimatedMinutes: 6,
    version: 1,
    availability: "available",
    questionIds: dsQuestionIds,
    contributesToOverall: true,
  },
  {
    id: "sadism-masochism",
    title: "Sadism & Masochism",
    shortTitle: "S/M",
    eyebrow: "Core section",
    description:
      "Explore giving and receiving intensity, pain, endurance, challenge, anticipation, and emotional intensity.",
    icon: "bolt",
    estimatedMinutes: 9,
    version: 1,
    availability: "available",
    questionIds: sadismMasochismQuestionIds,
    contributesToOverall: true,
  },
  {
    id: "roles-headspaces",
    title: "Roles & Headspaces",
    shortTitle: "Headspaces",
    eyebrow: "Core section",
    description:
      "Explore roles and headspaces like Pet, Slave, Little, Middle, Brat, Prey, Predator, Caregiver, Owner / Handler, and Object — plus underlying modes like Devotion, Service, and Training / Shaping.",
    icon: "masks-theater",
    estimatedMinutes: 11,
    version: 4,
    availability: "available",
    questionIds: headspaceQuestionIds,
    contributesToOverall: true,
  },
];

export const supportedQuizIds: readonly QuizId[] = [
  ...retiredQuizIds,
  ...quizzes.map((quiz) => quiz.id),
];

export function getQuiz(id: QuizId) {
  return quizzes.find((quiz) => quiz.id === id);
}

import type { QuizDefinition } from "../data/quizzes";
import type { QuizQuestion } from "../data/quizQuestions";
import type { AnswerMap } from "../lib/profileStorage";
import type { QuizLifecycle } from "./domain/quizRuntime";
import type { QuizSignalScore } from "./domain/quizScoring";
import type { RequestOptions } from "./contracts";

/** A service-resolved view. Components never submit an entire profile or calculate scores. */
export type QuizRecord = {
  definition: QuizDefinition;
  questions: Pick<QuizQuestion, "id" | "prompt">[];
  lifecycle: QuizLifecycle;
  attemptAnswers: AnswerMap;
  resumeIndex: number;
  scores: QuizSignalScore[];
};
export type QuizSnapshot = { quizzes: QuizRecord[] };
export interface QuizService {
  getSnapshot(options?: RequestOptions): Promise<QuizSnapshot>;
  answerQuestion(quizId: string, questionId: string, value: number, options?: RequestOptions): Promise<QuizSnapshot>;
  startRetake(quizId: string, options?: RequestOptions): Promise<QuizSnapshot>;
}

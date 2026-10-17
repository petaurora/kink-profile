import { quizzes } from "../../data/quizzes";
import { answerOptions } from "../../data/quizScale";
import { loadProfile, saveProfile, type StoredProfile } from "../../lib/profileStorage";
import { answerQuizQuestion, getQuestionsForQuiz, getQuizDataIssue, getQuizAttemptAnswers,
  initialQuestionIndex, resolveAvailableQuiz, resolveQuizLifecycle, startQuizRetake } from "../domain/quizRuntime";
import { scoreQuizAnswers } from "../domain/quizScoring";
import { ServiceError, type RequestOptions } from "../contracts";
import type { QuizService, QuizSnapshot } from "../quizContracts";

/** Browser-local adapter: same keys and retake semantics as production. No captured stale profile. */
export function createLocalQuizService({ read = loadProfile, write = saveProfile }:
  { read?: () => StoredProfile; write?: (profile: StoredProfile) => void } = {}): QuizService {
  function check(options?: RequestOptions) { options?.signal?.throwIfAborted(); }
  function snapshot(profile: StoredProfile): QuizSnapshot {
    return structuredClone({ quizzes: quizzes.filter(quiz => quiz.contributesToOverall).map(definition => {
      const questions = getQuestionsForQuiz(definition);
      return {
        definition, questions:questions.map(({id,prompt})=>({id,prompt})), lifecycle: resolveQuizLifecycle(definition, profile),
        attemptAnswers: getQuizAttemptAnswers(definition, profile), resumeIndex: initialQuestionIndex(definition, profile),
        scores: scoreQuizAnswers(definition, questions, profile.quizzes[definition.id]?.answers ?? {}),
      };
    }) });
  }
  function requireQuiz(id: string) {
    const quiz = resolveAvailableQuiz(id);
    if (!quiz || getQuizDataIssue(quiz)) throw new ServiceError("invalid-target", "This quiz is unavailable.");
    return quiz;
  }
  return {
    async getSnapshot(options) { check(options); return snapshot(read()); },
    async answerQuestion(quizId, questionId, value, options) {
      check(options);
      const quiz = requireQuiz(quizId);
      if (!quiz.questionIds.includes(questionId)) throw new ServiceError("invalid-target", "This question does not belong to the quiz.");
      if (!answerOptions.some(option => option.value === value)) throw new ServiceError("invalid-value", "Unknown quiz answer.");
      const previous = read();
      const next = answerQuizQuestion(quiz, previous, questionId, value);
      // Domain validation/score projection must succeed before committing a write.
      const result = snapshot(next);
      check(options);
      if (next !== previous) write(next);
      return result;
    },
    async startRetake(id, options) {
      check(options);
      const previous = read();
      const next = startQuizRetake(requireQuiz(id), previous);
      const result = snapshot(next);
      check(options);
      if (next !== previous) write(next);
      return result;
    },
  };
}

import type { AnswerMap } from "./profileStorage";
import type {
  SignalDefinition,
  SignalId,
  WeightedQuestion,
} from "../data/signals";
import type { DsQuestion, DsSignal } from "../data/dsQuiz";
import type { ComposedDefinition } from "../data/headspacesQuiz";

export type SignalScore = SignalDefinition & {
  percentage: number;
  coverage: number;
};

export type ComposedScore = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  percentage: number;
  coverage: number;
};

export function scoreSignals(
  questions: WeightedQuestion[],
  answers: AnswerMap,
  signals: SignalDefinition[],
): SignalScore[] {
  return signals.map((signal) => {
    let expectedWeight = 0;
    let answeredWeight = 0;
    let weightedTotal = 0;

    for (const question of questions) {
      const weight = question.weights[signal.id as SignalId] ?? 0;
      if (weight <= 0) continue;

      expectedWeight += weight;

      const answer = answers[question.id];
      if (answer === undefined) continue;

      answeredWeight += weight;
      weightedTotal += (answer / 4) * weight;
    }

    return {
      ...signal,
      percentage:
        answeredWeight > 0 ? Math.round((weightedTotal / answeredWeight) * 100) : 0,
      coverage:
        expectedWeight > 0 ? Math.round((answeredWeight / expectedWeight) * 100) : 0,
    };
  });
}

export function scoreDsSignals(
  questions: DsQuestion[],
  answers: AnswerMap,
  signals: DsSignal[],
): SignalScore[] {
  return scoreSignals(questions, answers, signals);
}

export function scoreHeadspaces(
  signalScores: SignalScore[],
  definitions: ComposedDefinition[],
): ComposedScore[] {
  const byId = new Map(signalScores.map((signal) => [signal.id, signal]));

  return definitions
    .map((headspace) => {
      let totalWeight = 0;
      let evidenceWeight = 0;
      let weightedTotal = 0;

      for (const [signalId, weight] of Object.entries(headspace.weights)) {
        if (!weight || weight <= 0) continue;

        totalWeight += weight;
        const signal = byId.get(signalId as SignalId);
        if (!signal || signal.coverage <= 0) continue;

        const coverageFactor = signal.coverage / 100;
        const coveredWeight = weight * coverageFactor;
        evidenceWeight += coveredWeight;
        weightedTotal += (signal.percentage / 100) * coveredWeight;
      }

      return {
        id: headspace.id,
        label: headspace.label,
        shortLabel: headspace.shortLabel,
        description: headspace.description,
        percentage:
          evidenceWeight > 0 ? Math.round((weightedTotal / evidenceWeight) * 100) : 0,
        coverage:
          totalWeight > 0 ? Math.round((evidenceWeight / totalWeight) * 100) : 0,
      };
    })
    .filter((score) => score.coverage > 0);
}

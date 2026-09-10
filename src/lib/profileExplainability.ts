import {
  overallFacetDefinitions,
  type OverallFacetId,
} from "../data/overallFacets";
import {
  canonicalQuizSignalRef,
  canonicalSignalDefinitions,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
import {
  isWeightedQuestion,
  quizQuestions,
} from "../data/quizQuestions";
import {
  getQuiz,
  quizzes,
  type QuizDefinition,
  type QuizId,
} from "../data/quizzes";
import type { SignalId as LegacySignalId } from "../data/signals";
import type { OverallFacetResult } from "./overallProfileFacets";
import {
  resolveSignalChannel,
  signalResultById,
  type CanonicalSignalResult,
  type CanonicalSignalSourceType,
} from "./overallProfileSignals";
import type { StoredProfile } from "./profileStorage";

export type ProfileEvidenceState =
  | "unknown"
  | "limited"
  | "growing"
  | "established";

export type ProfileExplainabilitySignal = {
  signalId: CanonicalSignalId;
  signalChannel: SignalChannel;
  label: string;
  affinity: number;
  coverage: number;
};

export type ProfileExplainabilitySource = {
  id: string;
  sourceType: CanonicalSignalSourceType;
  label: string;
  detail: string;
  affinity: number;
  evidence: number;
};

export type ProfileExplainabilityAction =
  | {
      type: "quiz";
      quizId: QuizId;
      label: string;
    }
  | {
      type: "catalog";
      label: string;
    };

export type ProfileFacetExplanation = {
  facetId: OverallFacetId;
  label: string;
  description: string;
  affinity: number | null;
  coverage: number;
  evidenceState: ProfileEvidenceState;
  evidenceLabel: string;
  evidenceMessage: string;
  contributingSignals: readonly ProfileExplainabilitySignal[];
  sources: readonly ProfileExplainabilitySource[];
  hasSourceConflict: boolean;
  conflictMessage?: string;
  nextStep?: ProfileExplainabilityAction;
};

export type ProfileExplainabilityModel = {
  facets: readonly ProfileFacetExplanation[];
  exploredQuizCount: number;
  totalQuizCount: number;
};

type MutableSourceSummary = {
  id: string;
  sourceType: CanonicalSignalSourceType;
  label: string;
  detail: string;
  weightedAffinity: number;
  evidenceWeight: number;
  configuredWeight: number;
  sourceIds: Set<string>;
};

const signalDefinitionById = new Map(
  canonicalSignalDefinitions.map((signal) => [signal.id, signal]),
);
const facetDefinitionById = new Map(
  overallFacetDefinitions.map((facet) => [facet.id, facet]),
);
const questionById = new Map(
  quizQuestions.map((question) => [question.id, question]),
);

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function clampPercent(value: number) {
  return clamp01(value / 100) * 100;
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function evidenceState(coverage: number): ProfileEvidenceState {
  if (coverage <= 0) return "unknown";
  if (coverage < 25) return "limited";
  if (coverage < 55) return "growing";
  return "established";
}

function evidenceCopy(state: ProfileEvidenceState) {
  switch (state) {
    case "unknown":
      return {
        label: "Not explored yet",
        message:
          "There is not enough evidence yet to describe this theme. Nothing here is being treated as zero interest.",
      };
    case "limited":
      return {
        label: "Limited evidence",
        message:
          "A real signal is showing up, but it is based on a smaller slice of evidence so far.",
      };
    case "growing":
      return {
        label: "Growing evidence",
        message:
          "Several pieces of evidence contribute here. More exploration could still move the result.",
      };
    case "established":
      return {
        label: "Well supported",
        message:
          "This result is supported across a substantial share of the evidence available for this theme.",
      };
  }
}

function quizState(
  quiz: QuizDefinition,
  storedProfile: StoredProfile,
): "not-started" | "in-progress" | "complete" {
  const answers = storedProfile.quizzes[quiz.id]?.answers ?? {};
  const answered = quiz.questionIds.filter(
    (questionId) => answers[questionId] !== undefined,
  ).length;

  if (answered === 0) return "not-started";
  if (quiz.questionIds.length > 0 && answered >= quiz.questionIds.length) {
    return "complete";
  }
  return "in-progress";
}

function quizSignalIds(quiz: QuizDefinition) {
  const result = new Set<CanonicalSignalId>();

  for (const questionId of quiz.questionIds) {
    const question = questionById.get(questionId);
    if (!question || !isWeightedQuestion(question)) continue;

    for (const signalId of Object.keys(question.weights) as LegacySignalId[]) {
      result.add(canonicalQuizSignalRef(question.id, signalId).signalId);
    }
  }

  return result;
}

const overallQuizSignalIds = new Map(
  quizzes
    .filter((quiz) => quiz.contributesToOverall)
    .map((quiz) => [quiz.id, quizSignalIds(quiz)]),
);

function relevantUnfinishedQuiz(
  facetId: OverallFacetId,
  storedProfile: StoredProfile,
) {
  const definition = facetDefinitionById.get(facetId);
  if (!definition) return undefined;

  const facetSignals = new Set(definition.signals.map((item) => item.signalId));

  const candidates = quizzes
    .filter((quiz) => quiz.contributesToOverall)
    .filter((quiz) => {
      const quizSignals = overallQuizSignalIds.get(quiz.id);
      return (
        quizSignals !== undefined &&
        [...quizSignals].some((signalId) => facetSignals.has(signalId))
      );
    })
    .map((quiz) => ({
      quiz,
      state: quizState(quiz, storedProfile),
    }))
    .filter((item) => item.state !== "complete")
    .sort((left, right) => {
      if (left.state !== right.state) {
        return left.state === "in-progress" ? -1 : 1;
      }
      return left.quiz.title.localeCompare(right.quiz.title);
    });

  return candidates[0];
}

function sourceDisplay(
  sourceType: CanonicalSignalSourceType,
  sourceId: string,
  contributionCount: number,
  detailValues: readonly string[],
) {
  if (sourceType === "quiz") {
    const quiz = getQuiz(sourceId as QuizId);
    const versionDetail = detailValues.find((detail) =>
      /quiz v\d+/i.test(detail),
    );

    return {
      label: quiz?.title ?? "Quiz",
      detail: versionDetail
        ? versionDetail.replace(/^quiz\s+/i, "")
        : quiz
          ? `v${quiz.version}`
          : "Quiz evidence",
    };
  }

  if (sourceType === "catalog_explicit") {
    return {
      label: "Catalog preferences",
      detail: `${contributionCount} directly marked ${
        contributionCount === 1 ? "item" : "items"
      }`,
    };
  }

  return {
    label: "This or That",
    detail: `${contributionCount} meaningful ${
      contributionCount === 1 ? "comparison" : "comparisons"
    }`,
  };
}

function buildSources(
  facet: OverallFacetResult,
  canonicalSignals: readonly CanonicalSignalResult[],
): ProfileExplainabilitySource[] {
  const signalById = signalResultById(canonicalSignals);
  const sourceGroups = new Map<string, MutableSourceSummary>();
  const sourceDetails = new Map<string, Set<string>>();
  const contributionCounts = new Map<string, Set<string>>();

  for (const component of facet.components) {
    const canonical = signalById.get(component.signalId);
    const signal = resolveSignalChannel(canonical, component.signalChannel);
    if (!signal) continue;

    for (const source of signal.sources) {
      if (source.sourceType === "quiz") {
        for (const contribution of source.contributions) {
          const key = `quiz:${contribution.sourceId}`;
          const coveredWeight =
            component.configuredWeight *
            clamp01(contribution.coverage / 100);
          if (coveredWeight <= 0) continue;

          const current =
            sourceGroups.get(key) ??
            {
              id: key,
              sourceType: "quiz" as const,
              label: "",
              detail: "",
              weightedAffinity: 0,
              evidenceWeight: 0,
              configuredWeight: 0,
              sourceIds: new Set<string>(),
            };

          current.weightedAffinity +=
            clampPercent(contribution.affinity) * coveredWeight;
          current.evidenceWeight += coveredWeight;
          current.configuredWeight += component.configuredWeight;
          current.sourceIds.add(contribution.sourceId);
          sourceGroups.set(key, current);

          const details = sourceDetails.get(key) ?? new Set<string>();
          if (contribution.detail) details.add(contribution.detail);
          sourceDetails.set(key, details);

          const ids = contributionCounts.get(key) ?? new Set<string>();
          ids.add(contribution.sourceId);
          contributionCounts.set(key, ids);
        }

        continue;
      }

      const key = source.sourceType;
      const coveredWeight =
        component.configuredWeight *
        clamp01(source.coverage / 100);
      if (coveredWeight <= 0) continue;

      const current =
        sourceGroups.get(key) ??
        {
          id: key,
          sourceType: source.sourceType,
          label: "",
          detail: "",
          weightedAffinity: 0,
          evidenceWeight: 0,
          configuredWeight: 0,
          sourceIds: new Set<string>(),
        };

      current.weightedAffinity +=
        clampPercent(source.affinity) * coveredWeight;
      current.evidenceWeight += coveredWeight;
      current.configuredWeight += component.configuredWeight;
      for (const contribution of source.contributions) {
        current.sourceIds.add(contribution.sourceId);

        const details = sourceDetails.get(key) ?? new Set<string>();
        if (contribution.detail) details.add(contribution.detail);
        sourceDetails.set(key, details);
      }
      sourceGroups.set(key, current);

      const ids = contributionCounts.get(key) ?? new Set<string>();
      for (const contribution of source.contributions) {
        ids.add(contribution.sourceId);
      }
      contributionCounts.set(key, ids);
    }
  }

  return [...sourceGroups.values()]
    .flatMap((group): ProfileExplainabilitySource[] => {
      if (group.evidenceWeight <= 0) return [];

      const count = contributionCounts.get(group.id)?.size ?? 0;
      const display = sourceDisplay(
        group.sourceType,
        group.sourceType === "quiz"
          ? group.id.replace(/^quiz:/, "")
          : group.id,
        count,
        [...(sourceDetails.get(group.id) ?? [])],
      );

      return [
        {
          id: group.id,
          sourceType: group.sourceType,
          label: display.label,
          detail: display.detail,
          affinity: round1(group.weightedAffinity / group.evidenceWeight),
          evidence: round1(
            Math.min(
              100,
              (group.evidenceWeight /
                Math.max(group.configuredWeight, 0.0001)) *
                100,
            ),
          ),
        },
      ];
    })
    .sort((left, right) => {
      if (right.evidence !== left.evidence) {
        return right.evidence - left.evidence;
      }
      return left.label.localeCompare(right.label);
    });
}

function sourceConflict(
  sources: readonly ProfileExplainabilitySource[],
) {
  const usable = sources.filter((source) => source.evidence >= 15);
  if (usable.length < 2) return false;

  const affinities = usable.map((source) => source.affinity);
  return Math.max(...affinities) - Math.min(...affinities) >= 30;
}

function buildNextStep(
  facetId: OverallFacetId,
  state: ProfileEvidenceState,
  storedProfile: StoredProfile,
): ProfileExplainabilityAction | undefined {
  if (state === "established") return undefined;

  const relevant = relevantUnfinishedQuiz(facetId, storedProfile);
  if (relevant) {
    return {
      type: "quiz",
      quizId: relevant.quiz.id,
      label:
        relevant.state === "in-progress"
          ? `Continue ${relevant.quiz.shortTitle}`
          : `Explore ${relevant.quiz.shortTitle}`,
    };
  }

  if (state === "unknown" || state === "limited") {
    return {
      type: "catalog",
      label: "Explore the catalog",
    };
  }

  return undefined;
}

function signalDisplayLabel(
  signalId: CanonicalSignalId,
  signalChannel: SignalChannel,
) {
  const definition = signalDefinitionById.get(signalId);
  if (!definition) return signalId;
  if (signalChannel === "overall") return definition.label;
  return definition.channels[signalChannel]?.label ?? definition.label;
}

export function buildProfileExplainability(
  canonicalSignals: readonly CanonicalSignalResult[],
  facets: readonly OverallFacetResult[],
  storedProfile: StoredProfile,
): ProfileExplainabilityModel {
  const explanations = facets.map((facet): ProfileFacetExplanation => {
    const state = evidenceState(facet.coverage);
    const copy = evidenceCopy(state);
    const sources = buildSources(facet, canonicalSignals);
    const conflict = sourceConflict(sources);

    const contributingSignals = facet.components
      .slice()
      .sort((left, right) => {
        if (right.effectiveWeight !== left.effectiveWeight) {
          return right.effectiveWeight - left.effectiveWeight;
        }
        return right.affinity - left.affinity;
      })
      .slice(0, 5)
      .map((component) => ({
        signalId: component.signalId,
        signalChannel: component.signalChannel,
        label: signalDisplayLabel(
          component.signalId,
          component.signalChannel,
        ),
        affinity: round1(component.affinity),
        coverage: round1(component.coverage),
      }));

    return {
      facetId: facet.facetId,
      label: facet.label,
      description: facet.description,
      affinity: facet.affinity,
      coverage: round1(facet.coverage),
      evidenceState: state,
      evidenceLabel: copy.label,
      evidenceMessage: copy.message,
      contributingSignals,
      sources,
      hasSourceConflict: conflict,
      conflictMessage: conflict
        ? "Different evidence sources are pulling this theme in noticeably different directions, so the combined result may shift as you refine it."
        : undefined,
      nextStep: buildNextStep(facet.facetId, state, storedProfile),
    };
  });

  const coreQuizzes = quizzes.filter(
    (quiz) => quiz.contributesToOverall,
  );
  const exploredQuizCount = coreQuizzes.filter(
    (quiz) => quizState(quiz, storedProfile) === "complete",
  ).length;

  return {
    facets: explanations,
    exploredQuizCount,
    totalQuizCount: coreQuizzes.length,
  };
}

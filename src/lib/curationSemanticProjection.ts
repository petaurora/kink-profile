import {
  kinkCatalog,
  kinkCategories,
} from "../data/kinkCatalog.generated";
import {
  dynamicModes,
  roleHeadspaces,
} from "../data/headspacesQuiz";
import {
  overallFacetDefinitions,
} from "../data/overallFacets";
import { quizQuestions } from "../data/quizQuestions";
import { quizzes } from "../data/quizzes";
import { signalDefinitions, type SignalId } from "../data/signals";
import type { CurationPrimitiveType } from "../data/curationInventory";
import {
  deriveRewardPunishmentContextSignalMappings,
  rewardPunishmentActions,
  rewardPunishmentCategories,
} from "./rewardPunishmentLibrary";
import {
  blendSemanticSignalGroups,
  collapseSemanticSignalMappings,
  deriveOverallFacetAffinities,
  type DerivedFacetAffinity,
  type SemanticSignalMapping,
} from "./semanticFacetAffinity";

function recordToMappings(
  weights: Partial<Record<SignalId, number>>,
): SemanticSignalMapping[] {
  return Object.entries(weights)
    .filter(
      (entry): entry is [SignalId, number] =>
        entry[1] !== undefined && Number.isFinite(entry[1]),
    )
    .map(([signalId, weight]) => ({ signalId, weight }));
}

export function getCurationPrimitiveSignalMappings(
  entityType: CurationPrimitiveType,
  entityId: string,
): SemanticSignalMapping[] {
  switch (entityType) {
    case "catalog-item": {
      const item = kinkCatalog.find((candidate) => candidate.id === entityId);
      return item ? [...item.signalMappings] : [];
    }

    case "catalog-category": {
      const category = kinkCategories.find(
        (candidate) => candidate.id === entityId,
      );
      return category
        ? collapseSemanticSignalMappings(category.signalMappings)
        : [];
    }

    case "reward-punishment-action": {
      const action = rewardPunishmentActions.find(
        (candidate) => candidate.id === entityId,
      );
      return action
        ? deriveRewardPunishmentContextSignalMappings(
            action.contextCategories,
          )
        : [];
    }

    case "reward-punishment-category": {
      const category = rewardPunishmentCategories.find(
        (candidate) => candidate.id === entityId,
      );
      return category ? [...category.signalMappings] : [];
    }

    case "quiz-question": {
      const question = quizQuestions.find(
        (candidate) => candidate.id === entityId,
      );
      return question ? recordToMappings(question.weights) : [];
    }

    case "quiz-definition": {
      const quiz = quizzes.find((candidate) => candidate.id === entityId);
      if (!quiz) return [];

      const groups = quiz.questionIds.flatMap((questionId) => {
        const question = quizQuestions.find(
          (candidate) => candidate.id === questionId,
        );
        return question
          ? [{ weight: 1, signals: recordToMappings(question.weights) }]
          : [];
      });

      return blendSemanticSignalGroups(groups);
    }

    case "signal": {
      return signalDefinitions.some((signal) => signal.id === entityId)
        ? [{ signalId: entityId as SignalId, weight: 1 }]
        : [];
    }

    case "dynamic-mode": {
      const mode = dynamicModes.find((candidate) => candidate.id === entityId);
      return mode ? recordToMappings(mode.weights) : [];
    }

    case "role-headspace": {
      const role = roleHeadspaces.find((candidate) => candidate.id === entityId);
      return role ? recordToMappings(role.weights) : [];
    }

    case "overall-facet": {
      const facet = overallFacetDefinitions.find(
        (candidate) => candidate.id === entityId,
      );
      return facet
        ? facet.signals.map((signal) => ({
            signalId: signal.signalId,
            channel: signal.channel,
            weight: signal.weight,
          }))
        : [];
    }
  }
}

export function getCurationPrimitiveFacetAffinities(
  entityType: CurationPrimitiveType,
  entityId: string,
): DerivedFacetAffinity[] {
  if (entityType === "overall-facet") {
    const facet = overallFacetDefinitions.find(
      (candidate) => candidate.id === entityId,
    );
    return facet
      ? [
          {
            facetId: facet.id,
            label: facet.label,
            shortLabel: facet.shortLabel,
            affinity: 1,
            matchedSignals: [],
          },
        ]
      : [];
  }

  return deriveOverallFacetAffinities(
    getCurationPrimitiveSignalMappings(entityType, entityId),
  );
}

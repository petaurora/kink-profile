import { kinkCatalog } from "../data/kinkCatalog.generated";
import {
  blendSemanticSignalGroups,
  deriveOverallFacetAffinities,
  type SemanticSignalMapping,
} from "./semanticFacetAffinity";
import {
  rewardPunishmentActions,
  rewardPunishmentCatalogCategoryMappings,
  rewardPunishmentCatalogSourceOrigins,
  rewardPunishmentCategories,
  rewardPunishmentTaxonomyVersion,
  type RewardPunishmentContextCategoryMapping,
  type RewardPunishmentSourceOrigin,
} from "../data/rewardPunishmentLibrary.generated";

export {
  rewardPunishmentActions,
  rewardPunishmentCategories,
  rewardPunishmentTaxonomyVersion,
};

export type RewardPunishmentActionId =
  (typeof rewardPunishmentActions)[number]["id"];

export type RewardPunishmentCategoryId =
  (typeof rewardPunishmentCategories)[number]["id"];

export type RewardPunishmentPrimitiveRef =
  | { kind: "catalog"; id: string }
  | { kind: "action"; id: RewardPunishmentActionId };

export type RewardPunishmentPrimitive = {
  ref: RewardPunishmentPrimitiveRef;
  label: string;
  sourceType: "catalog" | "action";
  contextCategories: readonly RewardPunishmentContextCategoryMapping[];
  signalMappings: readonly SemanticSignalMapping[];
  sourceOrigins: readonly RewardPunishmentSourceOrigin[];
};

const catalogCategoryMappings =
  rewardPunishmentCatalogCategoryMappings as Readonly<
    Record<string, readonly RewardPunishmentContextCategoryMapping[]>
  >;

const catalogSourceOrigins =
  rewardPunishmentCatalogSourceOrigins as Readonly<
    Record<string, readonly RewardPunishmentSourceOrigin[]>
  >;

const categoryById = new Map(
  rewardPunishmentCategories.map((category) => [category.id, category]),
);

export function getRewardPunishmentCategorySignalMappings(
  categoryId: RewardPunishmentCategoryId,
): readonly SemanticSignalMapping[] {
  return categoryById.get(categoryId)?.signalMappings ?? [];
}

export function deriveRewardPunishmentContextSignalMappings(
  contextCategories: readonly RewardPunishmentContextCategoryMapping[],
): SemanticSignalMapping[] {
  return blendSemanticSignalGroups(
    contextCategories.map((mapping) => ({
      weight: mapping.weight,
      signals: getRewardPunishmentCategorySignalMappings(mapping.id),
    })),
  );
}

export function getRewardPunishmentCategoryFacetAffinities(
  categoryId: RewardPunishmentCategoryId,
) {
  return deriveOverallFacetAffinities(
    getRewardPunishmentCategorySignalMappings(categoryId),
  );
}

export function rewardPunishmentPrimitiveKey(
  ref: RewardPunishmentPrimitiveRef,
): string {
  return ref.kind + ":" + ref.id;
}

export const rewardPunishmentPrimitives: readonly RewardPunishmentPrimitive[] = [
  ...kinkCatalog.map((item) => ({
    ref: { kind: "catalog" as const, id: item.id },
    label: item.label,
    sourceType: "catalog" as const,
    contextCategories: catalogCategoryMappings[item.categoryId] ?? [],
    signalMappings: item.signalMappings,
    sourceOrigins: catalogSourceOrigins[item.id] ?? [],
  })),
  ...rewardPunishmentActions.map((action) => ({
    ref: { kind: "action" as const, id: action.id },
    label: action.label,
    sourceType: "action" as const,
    contextCategories: action.contextCategories,
    signalMappings: deriveRewardPunishmentContextSignalMappings(
      action.contextCategories,
    ),
    sourceOrigins: action.sourceOrigins,
  })),
];

export function getRewardPunishmentAction(id: string) {
  return rewardPunishmentActions.find((action) => action.id === id);
}

export function getRewardPunishmentPrimitiveFacetAffinities(
  primitive: RewardPunishmentPrimitive,
) {
  return deriveOverallFacetAffinities(primitive.signalMappings);
}

export function getRewardPunishmentPrimitive(
  ref: RewardPunishmentPrimitiveRef,
) {
  const key = rewardPunishmentPrimitiveKey(ref);
  return rewardPunishmentPrimitives.find(
    (primitive) => rewardPunishmentPrimitiveKey(primitive.ref) === key,
  );
}

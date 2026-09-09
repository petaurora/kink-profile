import type { CatalogResultView } from "./catalogResults";
import {
  getRewardPunishmentPrimitive,
} from "./rewardPunishmentLibrary";
import {
  getContextualUseState,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import {
  validateRewardPunishmentRecipe,
  type RewardPunishmentRecipe,
} from "./rewardPunishmentRecipes";
import type { SavedScene } from "./sceneLibrary";

export type SavedSceneReviewIssueCode =
  | "catalog_missing"
  | "catalog_excluded"
  | "m11_primitive_missing"
  | "m11_context_unconfirmed"
  | "m11_recipe_missing"
  | "m11_recipe_context_changed"
  | "m11_recipe_needs_review";

export type SavedSceneReviewIssue = {
  componentId: string;
  code: SavedSceneReviewIssueCode;
  label: string;
  message: string;
};

export type SavedSceneReview = {
  status: "ready" | "needs_review";
  issues: SavedSceneReviewIssue[];
};

const durableCatalogExclusions = new Set([
  "hard_limit",
  "not_interested",
  "not_applicable",
]);

function reviewCatalogComponent(
  componentId: string,
  catalogId: string,
  catalogResultView: CatalogResultView,
): SavedSceneReviewIssue[] {
  const result = catalogResultView.byCatalogId.get(catalogId);
  if (!result) {
    return [
      {
        componentId,
        code: "catalog_missing",
        label: catalogId,
        message: "This catalog item no longer exists in the current library.",
      },
    ];
  }

  if (
    result.explicitState &&
    durableCatalogExclusions.has(result.explicitState)
  ) {
    return [
      {
        componentId,
        code: "catalog_excluded",
        label: result.item.label,
        message: `${result.item.label} is now marked ${result.explicitState.replaceAll("_", " ")}.`,
      },
    ];
  }

  return [];
}

function reviewRewardPunishmentComponent(
  componentId: string,
  source: Extract<
    SavedScene["components"][number]["source"],
    { kind: "reward_punishment" }
  >,
  profile: RewardPunishmentProfileState,
  recipes: readonly RewardPunishmentRecipe[],
): SavedSceneReviewIssue[] {
  if (source.entry.kind === "primitive") {
    const primitive = getRewardPunishmentPrimitive(source.entry.ref);
    if (!primitive) {
      return [
        {
          componentId,
          code: "m11_primitive_missing",
          label: source.entry.ref.id,
          message: "This Rewards & Punishments item no longer exists.",
        },
      ];
    }

    const state = getContextualUseState(
      profile,
      source.entry.ref,
      source.context,
    );
    if (state.suitability !== "strong" && state.suitability !== "works") {
      return [
        {
          componentId,
          code: "m11_context_unconfirmed",
          label: primitive.label,
          message: `${primitive.label} is no longer confirmed as a ${source.context}.`,
        },
      ];
    }

    return [];
  }

  const recipeId = source.entry.recipeId;
  const recipe = recipes.find(
    (candidate) => candidate.id === recipeId,
  );
  if (!recipe) {
    return [
      {
        componentId,
        code: "m11_recipe_missing",
        label: recipeId,
        message: "This saved Rewards & Punishments recipe no longer exists.",
      },
    ];
  }

  if (recipe.kind !== source.context) {
    return [
      {
        componentId,
        code: "m11_recipe_context_changed",
        label: recipe.name,
        message: `${recipe.name} is no longer a ${source.context} recipe.`,
      },
    ];
  }

  const validation = validateRewardPunishmentRecipe(recipe, profile);
  if (!validation.canSave || validation.needsReview) {
    return [
      {
        componentId,
        code: "m11_recipe_needs_review",
        label: recipe.name,
        message: `${recipe.name} needs review in Rewards & Punishments.`,
      },
    ];
  }

  return [];
}

export function reviewSavedScene(
  scene: SavedScene,
  {
    catalogResultView,
    rewardPunishmentProfile,
    rewardPunishmentRecipes,
  }: {
    catalogResultView: CatalogResultView;
    rewardPunishmentProfile: RewardPunishmentProfileState;
    rewardPunishmentRecipes: readonly RewardPunishmentRecipe[];
  },
): SavedSceneReview {
  const issues = scene.components.flatMap((component) =>
    component.source.kind === "catalog"
      ? reviewCatalogComponent(
          component.id,
          component.source.catalogId,
          catalogResultView,
        )
      : reviewRewardPunishmentComponent(
          component.id,
          component.source,
          rewardPunishmentProfile,
          rewardPunishmentRecipes,
        ),
  );

  return {
    status: issues.length > 0 ? "needs_review" : "ready",
    issues,
  };
}

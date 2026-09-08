import {
  getRewardPunishmentPrimitive,
  type RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";
import {
  getContextualUseState,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";

export type RewardPunishmentRecipeId = string;
export type RewardPunishmentRecipeKind = RewardPunishmentContext;

export type RewardPunishmentRecipePrimitiveComponent = {
  kind: "primitive";
  ref: RewardPunishmentPrimitiveRef;
};

export type RewardPunishmentRecipeCustomComponent = {
  kind: "custom";
  id: string;
  label: string;
};

export type RewardPunishmentRecipeComponent =
  | RewardPunishmentRecipePrimitiveComponent
  | RewardPunishmentRecipeCustomComponent;

export type RewardPunishmentRecipe = {
  id: RewardPunishmentRecipeId;
  kind: RewardPunishmentRecipeKind;
  name: string;
  components: RewardPunishmentRecipeComponent[];
  notes?: string;
  tags?: string[];
  randomEligible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RewardPunishmentRecipeState = {
  schemaVersion: 1;
  recipes: RewardPunishmentRecipe[];
};

export type RewardPunishmentRecipeIssueSeverity =
  | "invalid"
  | "review"
  | "warning";

export type RewardPunishmentRecipeIssueCode =
  | "missing_name"
  | "empty_components"
  | "empty_custom_component"
  | "duplicate_custom_component_id"
  | "stale_primitive"
  | "context_never"
  | "context_no";

export type RewardPunishmentRecipeIssue = {
  code: RewardPunishmentRecipeIssueCode;
  severity: RewardPunishmentRecipeIssueSeverity;
  componentIndex?: number;
  message: string;
};

export type RewardPunishmentRecipeValidation = {
  issues: RewardPunishmentRecipeIssue[];
  canSave: boolean;
  needsReview: boolean;
  canRandomize: boolean;
};

export function createEmptyRewardPunishmentRecipeState(): RewardPunishmentRecipeState {
  return {
    schemaVersion: 1,
    recipes: [],
  };
}

export function normalizeRecipeTags(tags: readonly string[] | undefined) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of tags ?? []) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(value);
  }

  return normalized;
}

export function normalizeRewardPunishmentRecipe(
  recipe: RewardPunishmentRecipe,
): RewardPunishmentRecipe {
  const notes = recipe.notes?.trim();
  const tags = normalizeRecipeTags(recipe.tags);

  return {
    ...recipe,
    name: recipe.name.trim(),
    components: recipe.components.map((component) =>
      component.kind === "custom"
        ? { ...component, label: component.label.trim() }
        : component,
    ),
    ...(notes ? { notes } : { notes: undefined }),
    ...(tags.length > 0 ? { tags } : { tags: undefined }),
  };
}

export function validateRewardPunishmentRecipe(
  recipe: RewardPunishmentRecipe,
  profile: RewardPunishmentProfileState,
): RewardPunishmentRecipeValidation {
  const normalized = normalizeRewardPunishmentRecipe(recipe);
  const issues: RewardPunishmentRecipeIssue[] = [];

  if (!normalized.name) {
    issues.push({
      code: "missing_name",
      severity: "invalid",
      message: "Give this recipe a name before saving.",
    });
  }

  if (normalized.components.length === 0) {
    issues.push({
      code: "empty_components",
      severity: "invalid",
      message: "Add at least one component before saving.",
    });
  }

  const customIds = new Set<string>();

  normalized.components.forEach((component, componentIndex) => {
    if (component.kind === "custom") {
      if (!component.label) {
        issues.push({
          code: "empty_custom_component",
          severity: "invalid",
          componentIndex,
          message: "Custom components need a label.",
        });
      }

      if (customIds.has(component.id)) {
        issues.push({
          code: "duplicate_custom_component_id",
          severity: "invalid",
          componentIndex,
          message: "Custom component IDs must be unique inside a recipe.",
        });
      }
      customIds.add(component.id);
      return;
    }

    const primitive = getRewardPunishmentPrimitive(component.ref);
    if (!primitive) {
      issues.push({
        code: "stale_primitive",
        severity: "review",
        componentIndex,
        message: "This component no longer exists in the current primitive library.",
      });
      return;
    }

    const state = getContextualUseState(
      profile,
      component.ref,
      normalized.kind,
    );

    if (state.suitability === "never") {
      issues.push({
        code: "context_never",
        severity: "review",
        componentIndex,
        message: `${primitive.label} is currently marked Never for this recipe context.`,
      });
    } else if (state.suitability === "no") {
      issues.push({
        code: "context_no",
        severity: "warning",
        componentIndex,
        message: `${primitive.label} is currently marked No / not a fit for this context.`,
      });
    }
  });

  const canSave = !issues.some((issue) => issue.severity === "invalid");
  const needsReview = issues.some((issue) => issue.severity === "review");

  return {
    issues,
    canSave,
    needsReview,
    canRandomize:
      canSave && !needsReview && normalized.randomEligible,
  };
}

export function reconcileRewardPunishmentRecipe(
  recipe: RewardPunishmentRecipe,
  profile: RewardPunishmentProfileState,
) {
  const validation = validateRewardPunishmentRecipe(recipe, profile);
  if (!validation.needsReview || !recipe.randomEligible) {
    return recipe;
  }

  return {
    ...recipe,
    randomEligible: false,
    updatedAt: new Date().toISOString(),
  };
}

export function reconcileRewardPunishmentRecipeState(
  state: RewardPunishmentRecipeState,
  profile: RewardPunishmentProfileState,
  updatedAt = new Date().toISOString(),
): RewardPunishmentRecipeState {
  let changed = false;
  const recipes = state.recipes.map((recipe) => {
    const validation = validateRewardPunishmentRecipe(recipe, profile);
    if (!validation.needsReview || !recipe.randomEligible) {
      return recipe;
    }

    changed = true;
    return {
      ...recipe,
      randomEligible: false,
      updatedAt,
    };
  });

  return changed ? { ...state, recipes } : state;
}

export function upsertRewardPunishmentRecipe(
  state: RewardPunishmentRecipeState,
  recipe: RewardPunishmentRecipe,
) {
  const normalized = normalizeRewardPunishmentRecipe(recipe);
  const index = state.recipes.findIndex(
    (candidate) => candidate.id === normalized.id,
  );

  if (index < 0) {
    return {
      ...state,
      recipes: [...state.recipes, normalized],
    };
  }

  const recipes = state.recipes.slice();
  recipes[index] = normalized;
  return { ...state, recipes };
}

export function deleteRewardPunishmentRecipe(
  state: RewardPunishmentRecipeState,
  recipeId: RewardPunishmentRecipeId,
) {
  const recipes = state.recipes.filter((recipe) => recipe.id !== recipeId);
  return recipes.length === state.recipes.length
    ? state
    : { ...state, recipes };
}

export function duplicateRewardPunishmentRecipe(
  recipe: RewardPunishmentRecipe,
  {
    id,
    now = new Date().toISOString(),
  }: {
    id: RewardPunishmentRecipeId;
    now?: string;
  },
): RewardPunishmentRecipe {
  return {
    ...recipe,
    id,
    name: recipe.name.trim()
      ? `${recipe.name.trim()} copy`
      : "Recipe copy",
    components: recipe.components.map((component) =>
      component.kind === "custom" ? { ...component } : { ...component, ref: { ...component.ref } },
    ),
    tags: recipe.tags ? [...recipe.tags] : undefined,
    randomEligible: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function moveRewardPunishmentRecipeComponent(
  recipe: RewardPunishmentRecipe,
  fromIndex: number,
  toIndex: number,
) {
  if (
    fromIndex < 0 ||
    fromIndex >= recipe.components.length ||
    toIndex < 0 ||
    toIndex >= recipe.components.length ||
    fromIndex === toIndex
  ) {
    return recipe;
  }

  const components = recipe.components.slice();
  const [component] = components.splice(fromIndex, 1);
  components.splice(toIndex, 0, component);

  return {
    ...recipe,
    components,
  };
}

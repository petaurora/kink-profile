import {
  createEmptyRewardPunishmentRecipeState,
  type RewardPunishmentRecipe,
  type RewardPunishmentRecipeComponent,
  type RewardPunishmentRecipeState,
} from "./rewardPunishmentRecipes";
import type { RewardPunishmentPrimitiveRef } from "./rewardPunishmentLibrary";

export const REWARD_PUNISHMENT_RECIPE_STORAGE_KEY =
  "pet-profile-rewards-punishments-recipes-v1";

export type RewardPunishmentRecipeStorageLike = Pick<
  Storage,
  "getItem" | "setItem"
>;

function browserStorage(): RewardPunishmentRecipeStorageLike {
  return localStorage;
}

function parsePrimitiveRef(value: unknown): RewardPunishmentPrimitiveRef | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const ref = value as Record<string, unknown>;
  if (
    (ref.kind !== "catalog" && ref.kind !== "action") ||
    typeof ref.id !== "string" ||
    !ref.id.trim()
  ) {
    return null;
  }

  return {
    kind: ref.kind,
    id: ref.id,
  } as RewardPunishmentPrimitiveRef;
}

function parseComponent(value: unknown): RewardPunishmentRecipeComponent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const component = value as Record<string, unknown>;

  if (component.kind === "primitive") {
    const ref = parsePrimitiveRef(component.ref);
    return ref ? { kind: "primitive", ref } : null;
  }

  if (
    component.kind === "custom" &&
    typeof component.id === "string" &&
    typeof component.label === "string"
  ) {
    return {
      kind: "custom",
      id: component.id,
      label: component.label,
    };
  }

  return null;
}

function parseRecipe(value: unknown): RewardPunishmentRecipe | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const recipe = value as Record<string, unknown>;

  if (
    typeof recipe.id !== "string" ||
    (recipe.kind !== "reward" && recipe.kind !== "punishment") ||
    typeof recipe.name !== "string" ||
    !Array.isArray(recipe.components) ||
    typeof recipe.randomEligible !== "boolean" ||
    typeof recipe.createdAt !== "string" ||
    typeof recipe.updatedAt !== "string"
  ) {
    return null;
  }

  const components = recipe.components
    .map(parseComponent)
    .filter(
      (component): component is RewardPunishmentRecipeComponent =>
        component !== null,
    );

  if (components.length !== recipe.components.length) {
    return null;
  }

  const notes =
    typeof recipe.notes === "string" ? recipe.notes : undefined;
  const tags = Array.isArray(recipe.tags)
    ? recipe.tags.filter((tag): tag is string => typeof tag === "string")
    : undefined;

  return {
    id: recipe.id,
    kind: recipe.kind,
    name: recipe.name,
    components,
    ...(notes !== undefined ? { notes } : {}),
    ...(tags !== undefined ? { tags } : {}),
    randomEligible: recipe.randomEligible,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

export function loadRewardPunishmentRecipeState(
  storage: RewardPunishmentRecipeStorageLike = browserStorage(),
): RewardPunishmentRecipeState {
  const raw = storage.getItem(REWARD_PUNISHMENT_RECIPE_STORAGE_KEY);
  if (!raw) return createEmptyRewardPunishmentRecipeState();

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return createEmptyRewardPunishmentRecipeState();
    }

    const state = parsed as Record<string, unknown>;
    if (state.schemaVersion !== 1 || !Array.isArray(state.recipes)) {
      return createEmptyRewardPunishmentRecipeState();
    }

    const recipes = state.recipes
      .map(parseRecipe)
      .filter(
        (recipe): recipe is RewardPunishmentRecipe => recipe !== null,
      );

    return {
      schemaVersion: 1,
      recipes,
    };
  } catch {
    return createEmptyRewardPunishmentRecipeState();
  }
}

export function saveRewardPunishmentRecipeState(
  state: RewardPunishmentRecipeState,
  storage: RewardPunishmentRecipeStorageLike = browserStorage(),
) {
  storage.setItem(
    REWARD_PUNISHMENT_RECIPE_STORAGE_KEY,
    JSON.stringify(state),
  );
}

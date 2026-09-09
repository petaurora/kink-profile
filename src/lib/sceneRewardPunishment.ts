import {
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./rewardPunishmentLibrary";
import {
  buildRewardPunishmentRandomEntries,
  pickRewardPunishmentRandomEntry,
  rewardPunishmentRandomEntryKey,
  type RewardPunishmentRandomEntry,
} from "./rewardPunishmentRandomizer";
import type {
  RewardPunishmentContext,
  RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import type { RewardPunishmentRecipe } from "./rewardPunishmentRecipes";
import type {
  SceneRewardPunishmentSource,
} from "./sceneComposition";

export type SceneRewardPunishmentMode =
  | "none"
  | "reward"
  | "punishment"
  | "either";

export type SceneRewardPunishmentPick = {
  context: RewardPunishmentContext;
  entry: RewardPunishmentRandomEntry;
  source: SceneRewardPunishmentSource;
  key: string;
  label: string;
  kindLabel: "Item" | "Recipe";
};

function entryLabel(entry: RewardPunishmentRandomEntry) {
  return entry.kind === "primitive"
    ? entry.primitive.label
    : entry.recipe.name;
}

function toSource(
  context: RewardPunishmentContext,
  entry: RewardPunishmentRandomEntry,
): SceneRewardPunishmentSource {
  return entry.kind === "primitive"
    ? {
        kind: "reward_punishment",
        context,
        entry: {
          kind: "primitive",
          ref: { ...entry.primitive.ref },
        },
      }
    : {
        kind: "reward_punishment",
        context,
        entry: {
          kind: "recipe",
          recipeId: entry.recipe.id,
        },
      };
}

function contextPool(
  profile: RewardPunishmentProfileState,
  recipes: readonly RewardPunishmentRecipe[],
  context: RewardPunishmentContext,
  primitives: readonly RewardPunishmentPrimitive[] = rewardPunishmentPrimitives,
) {
  return buildRewardPunishmentRandomEntries(
    profile,
    primitives,
    recipes,
    context,
  );
}

function normalizeRng(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1 - Number.EPSILON;
  return value;
}

export function getSceneRewardPunishmentAvailability(
  profile: RewardPunishmentProfileState,
  recipes: readonly RewardPunishmentRecipe[],
  primitives: readonly RewardPunishmentPrimitive[] = rewardPunishmentPrimitives,
) {
  const reward = contextPool(
    profile,
    recipes,
    "reward",
    primitives,
  ).length;
  const punishment = contextPool(
    profile,
    recipes,
    "punishment",
    primitives,
  ).length;

  return {
    reward,
    punishment,
    either: reward + punishment,
  };
}

export function sceneRewardPunishmentPickKey(
  context: RewardPunishmentContext,
  entry: RewardPunishmentRandomEntry,
) {
  return `${context}:${rewardPunishmentRandomEntryKey(entry)}`;
}

export function pickSceneRewardPunishment(
  profile: RewardPunishmentProfileState,
  recipes: readonly RewardPunishmentRecipe[],
  mode: SceneRewardPunishmentMode,
  {
    previousKey,
    rng = Math.random,
    primitives = rewardPunishmentPrimitives,
  }: {
    previousKey?: string;
    rng?: () => number;
    primitives?: readonly RewardPunishmentPrimitive[];
  } = {},
): SceneRewardPunishmentPick | null {
  if (mode === "none") return null;

  const contexts: RewardPunishmentContext[] =
    mode === "either"
      ? ["reward", "punishment"]
      : [mode];

  const available = contexts
    .map((context) => ({
      context,
      pool: contextPool(profile, recipes, context, primitives),
    }))
    .filter((entry) => entry.pool.length > 0);

  if (available.length === 0) return null;

  // For Either, choose the context first so a larger reward pool does not
  // silently make rewards more likely than punishments (or vice versa).
  const contextIndex = Math.floor(
    normalizeRng(rng()) * available.length,
  );
  const selected =
    available[contextIndex] ?? available[0];

  const previousEntryKey = previousKey?.startsWith(
    selected.context + ":",
  )
    ? previousKey.slice(selected.context.length + 1)
    : undefined;

  const entry = pickRewardPunishmentRandomEntry(selected.pool, {
    previousEntryKey,
    rng,
  });
  if (!entry) return null;

  return {
    context: selected.context,
    entry,
    source: toSource(selected.context, entry),
    key: sceneRewardPunishmentPickKey(selected.context, entry),
    label: entryLabel(entry),
    kindLabel: entry.kind === "primitive" ? "Item" : "Recipe",
  };
}

export function resolveSceneRewardPunishmentSource(
  source: SceneRewardPunishmentSource,
  recipes: readonly RewardPunishmentRecipe[],
  primitives: readonly RewardPunishmentPrimitive[] = rewardPunishmentPrimitives,
) {
  if (source.entry.kind === "recipe") {
    const recipe = recipes.find(
      (candidate) => candidate.id === source.entry.recipeId,
    );
    return recipe
      ? {
          label: recipe.name,
          kindLabel: "Recipe" as const,
          exists: true,
        }
      : {
          label: "Missing recipe",
          kindLabel: "Recipe" as const,
          exists: false,
        };
  }

  const primitive = primitives.find(
    (candidate) =>
      candidate.ref.kind === source.entry.ref.kind &&
      candidate.ref.id === source.entry.ref.id,
  );

  return primitive
    ? {
        label: primitive.label,
        kindLabel: "Item" as const,
        exists: true,
      }
    : {
        label: "Missing item",
        kindLabel: "Item" as const,
        exists: false,
      };
}

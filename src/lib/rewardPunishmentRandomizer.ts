import {
  rewardPunishmentPrimitiveKey,
  type RewardPunishmentPrimitive,
} from "./rewardPunishmentLibrary";
import {
  canBeRandomEligible,
  getContextualUseState,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import {
  validateRewardPunishmentRecipe,
  type RewardPunishmentRecipe,
} from "./rewardPunishmentRecipes";

export type RewardPunishmentRandomizerRng = () => number;

export type RewardPunishmentRandomEntry =
  | {
      kind: "primitive";
      primitive: RewardPunishmentPrimitive;
    }
  | {
      kind: "recipe";
      recipe: RewardPunishmentRecipe;
    };

export function isRandomizerEligiblePrimitive(
  profile: RewardPunishmentProfileState,
  primitive: RewardPunishmentPrimitive,
  context: RewardPunishmentContext,
) {
  const state = getContextualUseState(profile, primitive.ref, context);
  return (
    state.randomEligible === true &&
    canBeRandomEligible(state.suitability)
  );
}

export function buildRewardPunishmentRandomPool(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  context: RewardPunishmentContext,
) {
  return primitives.filter((primitive) =>
    isRandomizerEligiblePrimitive(profile, primitive, context),
  );
}

export function isRandomizerEligibleRecipe(
  profile: RewardPunishmentProfileState,
  recipe: RewardPunishmentRecipe,
  context: RewardPunishmentContext,
) {
  return (
    recipe.kind === context &&
    validateRewardPunishmentRecipe(recipe, profile).canRandomize
  );
}

export function rewardPunishmentRandomEntryKey(
  entry: RewardPunishmentRandomEntry,
) {
  return entry.kind === "primitive"
    ? `primitive:${rewardPunishmentPrimitiveKey(entry.primitive.ref)}`
    : `recipe:${entry.recipe.id}`;
}

export function buildRewardPunishmentRandomEntries(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  recipes: readonly RewardPunishmentRecipe[],
  context: RewardPunishmentContext,
): RewardPunishmentRandomEntry[] {
  return [
    ...buildRewardPunishmentRandomPool(profile, primitives, context).map(
      (primitive) =>
        ({
          kind: "primitive",
          primitive,
        }) satisfies RewardPunishmentRandomEntry,
    ),
    ...recipes
      .filter((recipe) =>
        isRandomizerEligibleRecipe(profile, recipe, context),
      )
      .map(
        (recipe) =>
          ({
            kind: "recipe",
            recipe,
          }) satisfies RewardPunishmentRandomEntry,
      ),
  ];
}

function normalizeRng(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1 - Number.EPSILON;
  return value;
}

export function pickRewardPunishmentRandomEntry(
  pool: readonly RewardPunishmentRandomEntry[],
  {
    previousEntryKey,
    rng = Math.random,
  }: {
    previousEntryKey?: string;
    rng?: RewardPunishmentRandomizerRng;
  } = {},
): RewardPunishmentRandomEntry | null {
  if (pool.length === 0) return null;

  const candidates =
    pool.length > 1 && previousEntryKey
      ? pool.filter(
          (entry) =>
            rewardPunishmentRandomEntryKey(entry) !==
            previousEntryKey,
        )
      : pool;

  const usable = candidates.length > 0 ? candidates : pool;
  const index = Math.floor(normalizeRng(rng()) * usable.length);
  return usable[index] ?? usable[0] ?? null;
}

export function pickRewardPunishmentRandomPrimitive(
  pool: readonly RewardPunishmentPrimitive[],
  {
    previousPrimitiveKey,
    rng = Math.random,
  }: {
    previousPrimitiveKey?: string;
    rng?: RewardPunishmentRandomizerRng;
  } = {},
): RewardPunishmentPrimitive | null {
  const entry = pickRewardPunishmentRandomEntry(
    pool.map((primitive) => ({ kind: "primitive", primitive })),
    {
      previousEntryKey: previousPrimitiveKey
        ? `primitive:${previousPrimitiveKey}`
        : undefined,
      rng,
    },
  );

  return entry?.kind === "primitive" ? entry.primitive : null;
}

export function pickRewardPunishmentFromProfile(
  profile: RewardPunishmentProfileState,
  primitives: readonly RewardPunishmentPrimitive[],
  context: RewardPunishmentContext,
  options: {
    previousPrimitiveKey?: string;
    rng?: RewardPunishmentRandomizerRng;
  } = {},
) {
  return pickRewardPunishmentRandomPrimitive(
    buildRewardPunishmentRandomPool(profile, primitives, context),
    options,
  );
}

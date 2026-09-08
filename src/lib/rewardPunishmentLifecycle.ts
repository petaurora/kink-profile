import {
  getRewardPunishmentPrimitive,
  rewardPunishmentPrimitiveKey,
  type RewardPunishmentActionId,
  type RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";
import {
  canBeRandomEligible,
  createEmptyRewardPunishmentProfileState,
  isContextSuitability,
  type ContextualUseState,
  type RewardPunishmentPreference,
  type RewardPunishmentProfileState,
} from "./rewardPunishmentProfile";
import {
  createEmptyRewardPunishmentRankingState,
  loadRewardPunishmentRankingState,
  saveRewardPunishmentRankingState,
  type RewardPunishmentRankingState,
} from "./rewardPunishmentRankingStorage";
import {
  createEmptyRewardPunishmentRecipeState,
  type RewardPunishmentRecipe,
  type RewardPunishmentRecipeComponent,
  type RewardPunishmentRecipeState,
} from "./rewardPunishmentRecipes";
import {
  loadRewardPunishmentRecipeState,
  saveRewardPunishmentRecipeState,
} from "./rewardPunishmentRecipeStorage";
import {
  loadRewardPunishmentProfile,
  saveRewardPunishmentProfile,
} from "./rewardPunishmentProfileStorage";
import type { RewardPunishmentComparison } from "./rewardPunishmentRanking";

export const REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION = 1 as const;

export type RewardPunishmentAuthoritativeState = {
  schemaVersion: typeof REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION;
  profile: RewardPunishmentProfileState;
  ranking: RewardPunishmentRankingState;
  recipes: RewardPunishmentRecipeState;
};

export type RewardPunishmentLifecycleStorageLike = Pick<
  Storage,
  "getItem" | "setItem"
>;

function browserStorage(): RewardPunishmentLifecycleStorageLike {
  return localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parsePrimitiveRef(
  value: unknown,
  requireCurrent: boolean,
): RewardPunishmentPrimitiveRef | null {
  if (
    !isRecord(value) ||
    (value.kind !== "catalog" && value.kind !== "action") ||
    typeof value.id !== "string" ||
    value.id.length === 0
  ) {
    return null;
  }

  const ref: RewardPunishmentPrimitiveRef =
    value.kind === "catalog"
      ? { kind: "catalog", id: value.id }
      : {
          kind: "action",
          id: value.id as RewardPunishmentActionId,
        };

  if (requireCurrent && !getRewardPunishmentPrimitive(ref)) return null;
  return ref;
}

function parseContextualUseState(value: unknown): ContextualUseState | null {
  if (
    !isRecord(value) ||
    !isContextSuitability(value.suitability) ||
    typeof value.randomEligible !== "boolean"
  ) {
    return null;
  }

  if (
    value.randomEligible &&
    !canBeRandomEligible(value.suitability)
  ) {
    return null;
  }

  if (
    value.note !== undefined &&
    (typeof value.note !== "string" || value.note.trim().length === 0)
  ) {
    return null;
  }

  return {
    suitability: value.suitability,
    randomEligible: value.randomEligible,
    ...(typeof value.note === "string" ? { note: value.note } : {}),
  };
}

function parseDirectProfile(value: unknown): RewardPunishmentProfileState | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isRecord(value.preferences)
  ) {
    return null;
  }

  const preferences: Record<string, RewardPunishmentPreference> = {};

  for (const [storedKey, rawPreference] of Object.entries(value.preferences)) {
    if (
      !isRecord(rawPreference) ||
      !isValidDateString(rawPreference.updatedAt)
    ) {
      return null;
    }

    const ref = parsePrimitiveRef(rawPreference.ref, true);
    const reward = parseContextualUseState(rawPreference.reward);
    const punishment = parseContextualUseState(rawPreference.punishment);

    if (!ref || !reward || !punishment) return null;

    const canonicalKey = rewardPunishmentPrimitiveKey(ref);
    if (storedKey !== canonicalKey) return null;

    preferences[canonicalKey] = {
      ref,
      reward,
      punishment,
      updatedAt: rawPreference.updatedAt,
    };
  }

  return {
    schemaVersion: 1,
    preferences,
  };
}

function primitiveFromKey(key: unknown) {
  if (typeof key !== "string") return null;
  const splitAt = key.indexOf(":");
  if (splitAt <= 0) return null;
  const kind = key.slice(0, splitAt);
  const id = key.slice(splitAt + 1);
  if (kind !== "catalog" && kind !== "action" || !id) return null;

  const ref: RewardPunishmentPrimitiveRef =
    kind === "catalog"
      ? { kind: "catalog", id }
      : { kind: "action", id: id as RewardPunishmentActionId };
  const primitive = getRewardPunishmentPrimitive(ref);
  return primitive &&
    rewardPunishmentPrimitiveKey(primitive.ref) === key
    ? primitive
    : null;
}

function parseRankingComparison(
  value: unknown,
): RewardPunishmentComparison | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    (value.context !== "reward" && value.context !== "punishment") ||
    !primitiveFromKey(value.leftPrimitiveKey) ||
    !primitiveFromKey(value.rightPrimitiveKey) ||
    value.leftPrimitiveKey === value.rightPrimitiveKey ||
    (value.result !== "left" &&
      value.result !== "right" &&
      value.result !== "equal" &&
      value.result !== "skip") ||
    !isValidDateString(value.timestamp)
  ) {
    return null;
  }

  return {
    id: value.id,
    context: value.context,
    leftPrimitiveKey: value.leftPrimitiveKey as string,
    rightPrimitiveKey: value.rightPrimitiveKey as string,
    result: value.result,
    timestamp: value.timestamp,
  };
}

function parseRanking(value: unknown): RewardPunishmentRankingState | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.comparisons)
  ) {
    return null;
  }

  const comparisons: RewardPunishmentComparison[] = [];
  for (const rawComparison of value.comparisons) {
    const comparison = parseRankingComparison(rawComparison);
    if (!comparison) return null;
    comparisons.push(comparison);
  }

  return {
    schemaVersion: 1,
    comparisons,
  };
}

function parseRecipeComponent(
  value: unknown,
): RewardPunishmentRecipeComponent | null {
  if (!isRecord(value)) return null;

  if (value.kind === "primitive") {
    const ref = parsePrimitiveRef(value.ref, false);
    return ref ? { kind: "primitive", ref } : null;
  }

  if (
    value.kind === "custom" &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.label === "string" &&
    value.label.trim().length > 0
  ) {
    return {
      kind: "custom",
      id: value.id,
      label: value.label,
    };
  }

  return null;
}

function parseRecipe(value: unknown): RewardPunishmentRecipe | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    (value.kind !== "reward" && value.kind !== "punishment") ||
    typeof value.name !== "string" ||
    value.name.trim().length === 0 ||
    !Array.isArray(value.components) ||
    value.components.length === 0 ||
    typeof value.randomEligible !== "boolean" ||
    !isValidDateString(value.createdAt) ||
    !isValidDateString(value.updatedAt)
  ) {
    return null;
  }

  const components: RewardPunishmentRecipeComponent[] = [];
  for (const rawComponent of value.components) {
    const component = parseRecipeComponent(rawComponent);
    if (!component) return null;
    components.push(component);
  }

  if (
    value.notes !== undefined &&
    typeof value.notes !== "string"
  ) {
    return null;
  }

  if (
    value.tags !== undefined &&
    (!Array.isArray(value.tags) ||
      value.tags.some((tag) => typeof tag !== "string"))
  ) {
    return null;
  }

  return {
    id: value.id,
    kind: value.kind,
    name: value.name,
    components,
    ...(typeof value.notes === "string"
      ? { notes: value.notes }
      : {}),
    ...(Array.isArray(value.tags)
      ? { tags: value.tags as string[] }
      : {}),
    randomEligible: value.randomEligible,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function parseRecipes(value: unknown): RewardPunishmentRecipeState | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.recipes)
  ) {
    return null;
  }

  const recipes: RewardPunishmentRecipe[] = [];
  for (const rawRecipe of value.recipes) {
    const recipe = parseRecipe(rawRecipe);
    if (!recipe) return null;
    recipes.push(recipe);
  }

  return {
    schemaVersion: 1,
    recipes,
  };
}

export function createEmptyRewardPunishmentAuthoritativeState(): RewardPunishmentAuthoritativeState {
  return {
    schemaVersion: REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION,
    profile: createEmptyRewardPunishmentProfileState(),
    ranking: createEmptyRewardPunishmentRankingState(),
    recipes: createEmptyRewardPunishmentRecipeState(),
  };
}

export function loadRewardPunishmentAuthoritativeState(
  storage: RewardPunishmentLifecycleStorageLike = browserStorage(),
): RewardPunishmentAuthoritativeState {
  return {
    schemaVersion: REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION,
    profile: loadRewardPunishmentProfile(storage),
    ranking: loadRewardPunishmentRankingState(storage),
    recipes: loadRewardPunishmentRecipeState(storage),
  };
}

export function saveRewardPunishmentAuthoritativeState(
  state: RewardPunishmentAuthoritativeState,
  storage: RewardPunishmentLifecycleStorageLike = browserStorage(),
) {
  saveRewardPunishmentProfile(state.profile, storage);
  saveRewardPunishmentRankingState(state.ranking, storage);
  saveRewardPunishmentRecipeState(state.recipes, storage);
}

export function parseRewardPunishmentAuthoritativeState(
  value: unknown,
): RewardPunishmentAuthoritativeState | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION
  ) {
    return null;
  }

  const profile = parseDirectProfile(value.profile);
  const ranking = parseRanking(value.ranking);
  const recipes = parseRecipes(value.recipes);

  if (!profile || !ranking || !recipes) return null;

  return {
    schemaVersion: REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION,
    profile,
    ranking,
    recipes,
  };
}

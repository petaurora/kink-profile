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

export type RewardPunishmentRandomizerRng = () => number;

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

function normalizeRng(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1 - Number.EPSILON;
  return value;
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
  if (pool.length === 0) return null;

  const candidates =
    pool.length > 1 && previousPrimitiveKey
      ? pool.filter(
          (primitive) =>
            rewardPunishmentPrimitiveKey(primitive.ref) !==
            previousPrimitiveKey,
        )
      : pool;

  const usable = candidates.length > 0 ? candidates : pool;
  const index = Math.floor(normalizeRng(rng()) * usable.length);
  return usable[index] ?? usable[0] ?? null;
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

import {
  getRewardPunishmentPrimitive,
  rewardPunishmentPrimitiveKey,
} from "./rewardPunishmentLibrary";
import type { RewardPunishmentContext } from "./rewardPunishmentProfile";
import {
  type RewardPunishmentComparison,
  type RewardPunishmentComparisonResult,
} from "./rewardPunishmentRanking";

export const REWARD_PUNISHMENT_RANKING_STORAGE_KEY =
  "pet-profile-rewards-punishments-ranking-v1";

export type RewardPunishmentRankingState = {
  schemaVersion: 1;
  comparisons: RewardPunishmentComparison[];
};

export type RewardPunishmentRankingStorageLike = Pick<
  Storage,
  "getItem" | "setItem"
>;

function browserStorage(): RewardPunishmentRankingStorageLike {
  return localStorage;
}

export function createEmptyRewardPunishmentRankingState(): RewardPunishmentRankingState {
  return { schemaVersion: 1, comparisons: [] };
}

function validContext(value: unknown): value is RewardPunishmentContext {
  return value === "reward" || value === "punishment";
}

function validResult(
  value: unknown,
): value is RewardPunishmentComparisonResult {
  return (
    value === "left" ||
    value === "right" ||
    value === "equal" ||
    value === "skip"
  );
}

function validPrimitiveKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const splitAt = value.indexOf(":");
  if (splitAt <= 0) return false;
  const kind = value.slice(0, splitAt);
  const id = value.slice(splitAt + 1);
  if (kind !== "catalog" && kind !== "action") return false;
  const primitive = getRewardPunishmentPrimitive(
    kind === "catalog"
      ? { kind: "catalog", id }
      : { kind: "action", id: id as never },
  );
  return (
    primitive !== undefined &&
    rewardPunishmentPrimitiveKey(primitive.ref) === value
  );
}

function parseComparison(value: unknown): RewardPunishmentComparison | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    !validContext(item.context) ||
    !validPrimitiveKey(item.leftPrimitiveKey) ||
    !validPrimitiveKey(item.rightPrimitiveKey) ||
    item.leftPrimitiveKey === item.rightPrimitiveKey ||
    !validResult(item.result) ||
    typeof item.timestamp !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    context: item.context,
    leftPrimitiveKey: item.leftPrimitiveKey,
    rightPrimitiveKey: item.rightPrimitiveKey,
    result: item.result,
    timestamp: item.timestamp,
  };
}

export function loadRewardPunishmentRankingState(
  storage: RewardPunishmentRankingStorageLike = browserStorage(),
): RewardPunishmentRankingState {
  const raw = storage.getItem(REWARD_PUNISHMENT_RANKING_STORAGE_KEY);
  if (!raw) return createEmptyRewardPunishmentRankingState();

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      (parsed as { schemaVersion?: unknown }).schemaVersion !== 1
    ) {
      return createEmptyRewardPunishmentRankingState();
    }

    const rawComparisons = (
      parsed as { comparisons?: unknown }
    ).comparisons;
    if (!Array.isArray(rawComparisons)) {
      return createEmptyRewardPunishmentRankingState();
    }

    return {
      schemaVersion: 1,
      comparisons: rawComparisons
        .map(parseComparison)
        .filter(
          (
            comparison,
          ): comparison is RewardPunishmentComparison =>
            comparison !== null,
        ),
    };
  } catch {
    return createEmptyRewardPunishmentRankingState();
  }
}

export function saveRewardPunishmentRankingState(
  state: RewardPunishmentRankingState,
  storage: RewardPunishmentRankingStorageLike = browserStorage(),
) {
  storage.setItem(
    REWARD_PUNISHMENT_RANKING_STORAGE_KEY,
    JSON.stringify(state),
  );
}

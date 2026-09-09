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
import { getActiveProfileStorage } from "./profileRegistry";

export const REWARD_PUNISHMENT_PROFILE_STORAGE_KEY =
  "pet-profile-rewards-punishments-v1";

export type RewardPunishmentStorageLike = Pick<
  Storage,
  "getItem" | "setItem"
>;

function browserStorage(): RewardPunishmentStorageLike {
  return getActiveProfileStorage(localStorage);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePrimitiveRef(
  value: unknown,
): RewardPunishmentPrimitiveRef | null {
  if (
    !isRecord(value) ||
    typeof value.kind !== "string" ||
    typeof value.id !== "string"
  ) {
    return null;
  }

  const ref: RewardPunishmentPrimitiveRef | null =
    value.kind === "catalog"
      ? { kind: "catalog", id: value.id }
      : value.kind === "action"
        ? {
            kind: "action",
            id: value.id as RewardPunishmentActionId,
          }
        : null;

  if (!ref || !getRewardPunishmentPrimitive(ref)) return null;
  return ref;
}

function parseContextualUseState(
  value: unknown,
): ContextualUseState | null {
  if (
    !isRecord(value) ||
    !isContextSuitability(value.suitability) ||
    typeof value.randomEligible !== "boolean"
  ) {
    return null;
  }

  if (value.note !== undefined && typeof value.note !== "string") {
    return null;
  }

  return {
    suitability: value.suitability,
    randomEligible:
      canBeRandomEligible(value.suitability) && value.randomEligible,
    ...(typeof value.note === "string" && value.note.trim()
      ? { note: value.note }
      : {}),
  };
}

function parsePreference(
  value: unknown,
): RewardPunishmentPreference | null {
  if (!isRecord(value) || typeof value.updatedAt !== "string") return null;

  const ref = parsePrimitiveRef(value.ref);
  const reward = parseContextualUseState(value.reward);
  const punishment = parseContextualUseState(value.punishment);

  if (!ref || !reward || !punishment) return null;

  return {
    ref,
    reward,
    punishment,
    updatedAt: value.updatedAt,
  };
}

function parseProfile(raw: string): RewardPunishmentProfileState | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      !isRecord(parsed.preferences)
    ) {
      return null;
    }

    const preferences: RewardPunishmentProfileState["preferences"] = {};
    for (const rawPreference of Object.values(parsed.preferences)) {
      const preference = parsePreference(rawPreference);
      if (!preference) continue;
      preferences[rewardPunishmentPrimitiveKey(preference.ref)] = preference;
    }

    return {
      schemaVersion: 1,
      preferences,
    };
  } catch {
    return null;
  }
}

export function loadRewardPunishmentProfile(
  storage: RewardPunishmentStorageLike = browserStorage(),
): RewardPunishmentProfileState {
  const raw = storage.getItem(REWARD_PUNISHMENT_PROFILE_STORAGE_KEY);
  if (raw === null) return createEmptyRewardPunishmentProfileState();

  return parseProfile(raw) ?? createEmptyRewardPunishmentProfileState();
}

export function saveRewardPunishmentProfile(
  profile: RewardPunishmentProfileState,
  storage: RewardPunishmentStorageLike = browserStorage(),
) {
  storage.setItem(
    REWARD_PUNISHMENT_PROFILE_STORAGE_KEY,
    JSON.stringify(profile),
  );
}

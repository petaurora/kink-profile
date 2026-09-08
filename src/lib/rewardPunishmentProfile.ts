import {
  rewardPunishmentPrimitiveKey,
  type RewardPunishmentPrimitiveRef,
} from "./rewardPunishmentLibrary";

export const contextSuitabilities = [
  "strong",
  "works",
  "depends",
  "no",
  "never",
  "unset",
] as const;

export type ContextSuitability = (typeof contextSuitabilities)[number];
export type RewardPunishmentContext = "reward" | "punishment";

export type ContextualUseState = {
  suitability: ContextSuitability;
  randomEligible: boolean;
  note?: string;
};

export type RewardPunishmentPreference = {
  ref: RewardPunishmentPrimitiveRef;
  reward: ContextualUseState;
  punishment: ContextualUseState;
  updatedAt: string;
};

export type RewardPunishmentProfileState = {
  schemaVersion: 1;
  preferences: Record<string, RewardPunishmentPreference>;
};

export function createEmptyContextualUseState(): ContextualUseState {
  return {
    suitability: "unset",
    randomEligible: false,
  };
}

export function createEmptyRewardPunishmentProfileState(): RewardPunishmentProfileState {
  return {
    schemaVersion: 1,
    preferences: {},
  };
}

export function isContextSuitability(
  value: unknown,
): value is ContextSuitability {
  return (
    typeof value === "string" &&
    (contextSuitabilities as readonly string[]).includes(value)
  );
}

export function canBeRandomEligible(
  suitability: ContextSuitability,
): boolean {
  return suitability === "strong" || suitability === "works";
}

function normalizeContextualUseState(
  state: ContextualUseState,
): ContextualUseState {
  return {
    ...state,
    randomEligible:
      canBeRandomEligible(state.suitability) && state.randomEligible,
  };
}

function isEmptyContextualUseState(state: ContextualUseState) {
  return (
    state.suitability === "unset" &&
    state.randomEligible === false &&
    !state.note
  );
}

function createPreference(
  ref: RewardPunishmentPrimitiveRef,
  updatedAt: string,
): RewardPunishmentPreference {
  return {
    ref,
    reward: createEmptyContextualUseState(),
    punishment: createEmptyContextualUseState(),
    updatedAt,
  };
}

export function getRewardPunishmentPreference(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
): RewardPunishmentPreference | undefined {
  return profile.preferences[rewardPunishmentPrimitiveKey(ref)];
}

export function getContextualUseState(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  context: RewardPunishmentContext,
): ContextualUseState {
  return (
    getRewardPunishmentPreference(profile, ref)?.[context] ??
    createEmptyContextualUseState()
  );
}

function updateContextualUseState(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  context: RewardPunishmentContext,
  updater: (state: ContextualUseState) => ContextualUseState,
  updatedAt = new Date().toISOString(),
): RewardPunishmentProfileState {
  const key = rewardPunishmentPrimitiveKey(ref);
  const current =
    profile.preferences[key] ?? createPreference(ref, updatedAt);
  const nextContext = normalizeContextualUseState(updater(current[context]));
  const nextPreference: RewardPunishmentPreference = {
    ...current,
    ref,
    [context]: nextContext,
    updatedAt,
  };

  if (
    isEmptyContextualUseState(nextPreference.reward) &&
    isEmptyContextualUseState(nextPreference.punishment)
  ) {
    const preferences = { ...profile.preferences };
    delete preferences[key];
    return {
      ...profile,
      preferences,
    };
  }

  return {
    ...profile,
    preferences: {
      ...profile.preferences,
      [key]: nextPreference,
    },
  };
}

export function setContextSuitability(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  context: RewardPunishmentContext,
  suitability: ContextSuitability,
  updatedAt = new Date().toISOString(),
): RewardPunishmentProfileState {
  return updateContextualUseState(
    profile,
    ref,
    context,
    (state) => ({
      ...state,
      suitability,
      randomEligible:
        canBeRandomEligible(suitability) && state.randomEligible,
    }),
    updatedAt,
  );
}

export function setContextRandomEligible(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  context: RewardPunishmentContext,
  randomEligible: boolean,
  updatedAt = new Date().toISOString(),
): RewardPunishmentProfileState {
  return updateContextualUseState(
    profile,
    ref,
    context,
    (state) => ({
      ...state,
      randomEligible:
        canBeRandomEligible(state.suitability) && randomEligible,
    }),
    updatedAt,
  );
}

export function setContextNote(
  profile: RewardPunishmentProfileState,
  ref: RewardPunishmentPrimitiveRef,
  context: RewardPunishmentContext,
  note: string,
  updatedAt = new Date().toISOString(),
): RewardPunishmentProfileState {
  return updateContextualUseState(
    profile,
    ref,
    context,
    (state) => {
      const next = { ...state };
      if (note.trim()) next.note = note;
      else delete next.note;
      return next;
    },
    updatedAt,
  );
}

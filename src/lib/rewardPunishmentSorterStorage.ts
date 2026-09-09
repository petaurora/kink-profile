import { getActiveProfileStorage } from "./profileRegistry";

export const REWARD_PUNISHMENT_SORTER_UI_STORAGE_KEY =
  "pet-profile-rewards-punishments-sorter-ui-v1";

export type RewardPunishmentSorterUiState = {
  schemaVersion: 1;
  lastCelebratedCheckpoint: number;
};

export type RewardPunishmentSorterStorageLike = Pick<
  Storage,
  "getItem" | "setItem"
>;

function browserStorage(): RewardPunishmentSorterStorageLike {
  return getActiveProfileStorage(localStorage);
}

function baselineCheckpoint(classifiedCount: number) {
  return Math.floor(Math.max(0, classifiedCount) / 25) * 25;
}

export function loadRewardPunishmentSorterUiState(
  classifiedCount: number,
  storage: RewardPunishmentSorterStorageLike = browserStorage(),
): RewardPunishmentSorterUiState {
  const baseline = baselineCheckpoint(classifiedCount);
  const raw = storage.getItem(REWARD_PUNISHMENT_SORTER_UI_STORAGE_KEY);
  if (!raw) {
    return {
      schemaVersion: 1,
      lastCelebratedCheckpoint: baseline,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<RewardPunishmentSorterUiState>;
    if (
      parsed.schemaVersion !== 1 ||
      typeof parsed.lastCelebratedCheckpoint !== "number" ||
      !Number.isFinite(parsed.lastCelebratedCheckpoint)
    ) {
      throw new Error("invalid sorter UI state");
    }

    return {
      schemaVersion: 1,
      lastCelebratedCheckpoint: Math.max(
        baseline,
        Math.max(0, Math.floor(parsed.lastCelebratedCheckpoint / 25) * 25),
      ),
    };
  } catch {
    return {
      schemaVersion: 1,
      lastCelebratedCheckpoint: baseline,
    };
  }
}

export function saveRewardPunishmentSorterUiState(
  state: RewardPunishmentSorterUiState,
  storage: RewardPunishmentSorterStorageLike = browserStorage(),
) {
  storage.setItem(
    REWARD_PUNISHMENT_SORTER_UI_STORAGE_KEY,
    JSON.stringify(state),
  );
}

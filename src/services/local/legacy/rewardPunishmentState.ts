import { REWARD_PUNISHMENT_AUTHORITATIVE_SCHEMA_VERSION, type RewardPunishmentAuthoritativeState, type RewardPunishmentLifecycleStorageLike } from "../../../lib/rewardPunishmentLifecycle";
import { loadRewardPunishmentRankingState, saveRewardPunishmentRankingState } from "./rewardPunishmentRankingStorage";
import { loadRewardPunishmentRecipeState, saveRewardPunishmentRecipeState } from "./rewardPunishmentRecipeStorage";
import { loadRewardPunishmentProfile, saveRewardPunishmentProfile } from "./rewardPunishmentProfileStorage";
function browserStorage(): RewardPunishmentLifecycleStorageLike { return localStorage; }

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

import { loadCatalogProfile } from "../lib/catalogProfileStorage";
import { buildCatalogResultView } from "../lib/catalogResults";
import { buildCanonicalSignalProfile } from "../lib/overallProfileSignals";
import { loadProfile, type StorageLike } from "../lib/profileStorage";
import { loadRewardPunishmentProfile } from "../lib/rewardPunishmentProfileStorage";

/**
 * Hydrate the current local profile state needed by read-only aggregate views
 * such as Profile and Hub. Keep this focused on authoritative stored state;
 * presentation-specific summaries belong in their feature layer.
 */
export function loadCurrentProfileSnapshot(storage?: StorageLike) {
  const profile = loadProfile(storage);
  const catalogProfile = loadCatalogProfile(storage);
  const rewardPunishmentProfile = loadRewardPunishmentProfile(storage);

  return {
    profile,
    catalogProfile,
    rewardPunishmentProfile,
    catalogResultView: buildCatalogResultView(profile, catalogProfile),
    canonicalSignals: buildCanonicalSignalProfile(profile, catalogProfile),
  };
}

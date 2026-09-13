import { getCatalogPreference } from "../../lib/catalogProfile";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";

type Snapshot = ReturnType<typeof loadCurrentProfileSnapshot>;

export type HubMetrics = {
  catalogRatedCount: number;
  rankingChoiceCount: number;
  evidencedThemeCount: number;
  contextPreferenceCount: number;
  readyChoiceCount: number;
};

export function buildHubMetrics(snapshot: Snapshot): HubMetrics {
  const contextPreferences = Object.values(
    snapshot.rewardPunishmentProfile.preferences,
  );

  return {
    catalogRatedCount: Object.values(snapshot.catalogProfile.preferences).filter(
      (preference) => getCatalogPreference(preference, "overall") !== undefined,
    ).length,
    rankingChoiceCount: snapshot.catalogProfile.comparisons.length,
    evidencedThemeCount: snapshot.canonicalSignals.filter(
      (signal) => signal.overall.affinity !== null && signal.overall.coverage > 0,
    ).length,
    contextPreferenceCount: contextPreferences.length,
    readyChoiceCount: contextPreferences.reduce(
      (count, preference) =>
        count +
        Number(preference.reward.randomEligible) +
        Number(preference.punishment.randomEligible),
      0,
    ),
  };
}

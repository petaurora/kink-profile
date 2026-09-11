import { loadCatalogProfile } from "../lib/catalogProfileStorage";
import { buildCatalogResultView } from "../lib/catalogResults";
import { buildCanonicalSignalProfile } from "../lib/overallProfileSignals";
import { loadProfile } from "../lib/profileStorage";

export function loadCurrentProfileSnapshot() {
  const profile = loadProfile();
  const catalogProfile = loadCatalogProfile();

  return {
    profile,
    catalogProfile,
    catalogResultView: buildCatalogResultView(profile, catalogProfile),
    canonicalSignals: buildCanonicalSignalProfile(profile, catalogProfile),
  };
}

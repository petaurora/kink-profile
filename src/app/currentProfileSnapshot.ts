import { loadCatalogProfile } from "../lib/catalogProfileStorage";
import { buildCatalogResultView } from "../lib/catalogResults";
import { buildCanonicalSignalProfile } from "../lib/overallProfileSignals";
import { loadProfile, type StorageLike } from "../lib/profileStorage";

export function loadCurrentProfileSnapshot(storage?: StorageLike) {
  const profile = loadProfile(storage);
  const catalogProfile = loadCatalogProfile(storage);

  return {
    profile,
    catalogProfile,
    catalogResultView: buildCatalogResultView(profile, catalogProfile),
    canonicalSignals: buildCanonicalSignalProfile(profile, catalogProfile),
  };
}

import type { CatalogProfileState } from "./catalogProfile";
import { buildCatalogResultView } from "./catalogResults";
import type { ProfileBackup } from "./profileBackup";
import {
  buildCanonicalSignalProfile,
  type CanonicalSignalResult,
} from "./overallProfileSignals";
import type { StoredProfile } from "./profileStorage";
import {
  buildSharedProfileComparison,
  type SharedProfileComparison,
  type SharedProfileComparisonInput,
} from "./sharedProfileComparison";

export type ComparisonProfileSource = {
  displayName: string;
  profile: StoredProfile;
  catalogProfile: CatalogProfileState;
};

export type UploadedComparisonCandidate = {
  displayName: string;
  exportedAt: string;
  currentInput: SharedProfileComparisonInput;
  uploadedInput: SharedProfileComparisonInput;
  comparison: SharedProfileComparison;
};

export function buildSharedComparisonInput(
  source: Pick<ComparisonProfileSource, "profile" | "catalogProfile">,
): SharedProfileComparisonInput {
  const canonicalSignals: readonly CanonicalSignalResult[] =
    buildCanonicalSignalProfile(source.profile, source.catalogProfile);

  return {
    catalogResults: buildCatalogResultView(
      source.profile,
      source.catalogProfile,
    ),
    catalogProfile: source.catalogProfile,
    canonicalSignals,
  };
}

/**
 * Build a temporary comparison against a validated full-profile backup.
 *
 * The uploaded backup is consumed entirely in memory. Nothing is saved,
 * imported, merged, or written into the current profile.
 */
export function buildUploadedProfileComparison(
  current: ComparisonProfileSource,
  uploaded: ProfileBackup,
): UploadedComparisonCandidate {
  const currentInput = buildSharedComparisonInput(current);
  const uploadedInput = buildSharedComparisonInput({
    profile: uploaded.profile.quizzes,
    catalogProfile: uploaded.profile.catalog,
  });

  return {
    displayName: uploaded.profile.settings.displayName,
    exportedAt: uploaded.exportedAt,
    currentInput,
    uploadedInput,
    comparison: buildSharedProfileComparison(
      currentInput,
      uploadedInput,
    ),
  };
}

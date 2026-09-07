import type { CatalogProfileState } from "./catalogProfile";
import { buildCatalogResultView } from "./catalogResults";
import { buildOverallRadarModel, type OverallRadarAxisState } from "./overallRadar";
import { scoreOverallFacets } from "./overallProfileFacets";
import { buildCanonicalSignalProfile } from "./overallProfileSignals";
import { buildProfileHeaderModel } from "./profileHeader";
import { buildProfileRoleDetails, type ProfileRoleScoreState } from "./profileRoleDetails";
import { buildProfileTopInterests } from "./profileTopInterests";
import type { StoredProfile } from "./profileStorage";

export const PROFILE_SHARE_SUMMARY_VERSION = 1 as const;

export type ShareRadarAxis = {
  id: string;
  label: string;
  shortLabel: string;
  affinity: number | null;
  state: OverallRadarAxisState;
};

export type ShareScoredTrait = {
  id: string;
  label: string;
  affinity: number;
  state: ProfileRoleScoreState;
};

export type ShareInterest = {
  catalogId: string;
  label: string;
};

export type ProfileShareSummaryModel = {
  version: typeof PROFILE_SHARE_SUMMARY_VERSION;
  generatedAt: string;
  displayName: string;
  summary: string;
  orientation: string;
  strongestThemes: readonly string[];
  radarAxes: readonly ShareRadarAxis[];
  headspaces: readonly ShareScoredTrait[];
  dynamicModes: readonly ShareScoredTrait[];
  topInterests: readonly ShareInterest[];
  hardLimits: readonly ShareInterest[];
};

export function buildProfileShareSummary(
  displayName: string,
  storedProfile: StoredProfile,
  catalogProfile: CatalogProfileState,
  generatedAt = new Date().toISOString(),
): ProfileShareSummaryModel {
  const canonicalSignals = buildCanonicalSignalProfile(
    storedProfile,
    catalogProfile,
  );
  const facets = scoreOverallFacets(canonicalSignals);
  const header = buildProfileHeaderModel(canonicalSignals, facets);
  const radar = buildOverallRadarModel(facets, header.strongestFacetIds);
  const roles = buildProfileRoleDetails(canonicalSignals);
  const catalogResults = buildCatalogResultView(storedProfile, catalogProfile);
  const topInterests = buildProfileTopInterests(catalogResults, 10);

  return {
    version: PROFILE_SHARE_SUMMARY_VERSION,
    generatedAt,
    displayName,
    summary: header.summary,
    orientation: header.orientation.label,
    strongestThemes: radar.strongestThemes.map((theme) => theme.label),
    radarAxes: radar.axes.map((axis) => ({
      id: axis.facetId,
      label: axis.label,
      shortLabel: axis.shortLabel,
      affinity: axis.affinity,
      state: axis.state,
    })),
    headspaces: roles.featuredHeadspaces.map((trait) => ({
      id: trait.id,
      label: trait.label,
      affinity: trait.affinity,
      state: trait.state,
    })),
    dynamicModes: roles.featuredDynamicModes.map((trait) => ({
      id: trait.id,
      label: trait.label,
      affinity: trait.affinity,
      state: trait.state,
    })),
    topInterests: topInterests.map((interest) => ({
      catalogId: interest.catalogId,
      label: interest.label,
    })),
    hardLimits: catalogResults.exclusions.hardLimits
      .map((limit) => ({
        catalogId: limit.item.id,
        label: limit.item.label,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
  };
}

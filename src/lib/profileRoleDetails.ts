import {
  canonicalDynamicModes,
  canonicalRoleHeadspaces,
  type CanonicalComposedDefinition,
} from "../data/canonicalRoleCompositions";
import {
  resolveSignalChannel,
  signalResultById,
  type CanonicalSignalResult,
} from "./normalizedProfileSignals";

export type ProfileRoleScoreState = "known" | "limited";

export type ProfileRoleScore = {
  id: string;
  label: string;
  shortLabel: string;
  affinity: number;
  coverage: number;
  state: ProfileRoleScoreState;
};

export type ProfileRoleDetailsModel = {
  headspaces: readonly ProfileRoleScore[];
  dynamicModes: readonly ProfileRoleScore[];
  featuredHeadspaces: readonly ProfileRoleScore[];
  featuredDynamicModes: readonly ProfileRoleScore[];
};

const minimumDisplayCoverage = 20;
const limitedEvidenceCoverage = 40;
const featuredHeadspaceCount = 5;
const featuredDynamicModeCount = 5;

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function clampPercent(value: number) {
  return clamp01(value / 100) * 100;
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function scoreDefinitions(
  canonicalSignals: readonly CanonicalSignalResult[],
  definitions: readonly CanonicalComposedDefinition[],
): ProfileRoleScore[] {
  const bySignalId = signalResultById(canonicalSignals);

  return definitions
    .flatMap((definition): ProfileRoleScore[] => {
      let totalWeight = 0;
      let evidenceWeight = 0;
      let weightedAffinity = 0;

      for (const configured of definition.signals) {
        if (configured.weight <= 0) continue;

        totalWeight += configured.weight;
        const signal = resolveSignalChannel(
          bySignalId.get(configured.signalId),
          configured.channel ?? "overall",
        );
        if (!signal || signal.affinity === null || signal.coverage <= 0) continue;

        const coveredWeight =
          configured.weight * clamp01(signal.coverage / 100);
        evidenceWeight += coveredWeight;
        weightedAffinity += clampPercent(signal.affinity) * coveredWeight;
      }

      if (totalWeight <= 0 || evidenceWeight <= 0) return [];

      const coverage = round1((evidenceWeight / totalWeight) * 100);
      if (coverage < minimumDisplayCoverage) return [];

      return [
        {
          id: definition.id,
          label: definition.label,
          shortLabel: definition.shortLabel,
          affinity: round1(weightedAffinity / evidenceWeight),
          coverage,
          state:
            coverage < limitedEvidenceCoverage
              ? ("limited" as const)
              : ("known" as const),
        },
      ];
    })
    .sort((left, right) => {
      if (right.affinity !== left.affinity) {
        return right.affinity - left.affinity;
      }
      if (right.coverage !== left.coverage) {
        return right.coverage - left.coverage;
      }
      return left.label.localeCompare(right.label);
    });
}

export function buildProfileRoleDetails(
  canonicalSignals: readonly CanonicalSignalResult[],
): ProfileRoleDetailsModel {
  const headspaces = scoreDefinitions(
    canonicalSignals,
    canonicalRoleHeadspaces,
  );
  const scoredDynamicModes = scoreDefinitions(
    canonicalSignals,
    canonicalDynamicModes,
  );

  return {
    headspaces,
    dynamicModes: scoredDynamicModes,
    featuredHeadspaces: headspaces.slice(0, featuredHeadspaceCount),
    featuredDynamicModes: scoredDynamicModes.slice(0, featuredDynamicModeCount),
  };
}

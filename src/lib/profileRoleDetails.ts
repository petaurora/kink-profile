import {
  dynamicModes,
  roleHeadspaces,
  type ComposedDefinition,
} from "../data/headspacesQuiz";
import type { SignalId } from "../data/signals";
import type { CanonicalSignalResult } from "./overallProfileSignals";

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
  definitions: readonly ComposedDefinition[],
): ProfileRoleScore[] {
  const bySignalId = new Map(
    canonicalSignals.map((signal) => [signal.signalId, signal]),
  );

  return definitions
    .flatMap((definition): ProfileRoleScore[] => {
      let totalWeight = 0;
      let evidenceWeight = 0;
      let weightedAffinity = 0;

      for (const [signalId, configuredWeight] of Object.entries(
        definition.weights,
      )) {
        if (!configuredWeight || configuredWeight <= 0) continue;

        totalWeight += configuredWeight;
        const signal = bySignalId.get(signalId as SignalId);
        if (!signal || signal.coverage <= 0) continue;

        const coveredWeight =
          configuredWeight * clamp01(signal.coverage / 100);

        evidenceWeight += coveredWeight;
        weightedAffinity +=
          clampPercent(signal.affinity) * coveredWeight;
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
    roleHeadspaces,
  );
  const scoredDynamicModes = scoreDefinitions(
    canonicalSignals,
    dynamicModes,
  );

  return {
    headspaces,
    dynamicModes: scoredDynamicModes,
    featuredHeadspaces: headspaces.slice(
      0,
      featuredHeadspaceCount,
    ),
    featuredDynamicModes: scoredDynamicModes.slice(
      0,
      featuredDynamicModeCount,
    ),
  };
}

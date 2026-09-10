import { dynamicModes } from "../data/headspacesQuiz";
import type { ProfileRoleScore } from "./profileRoleDetails";

export type ProfileShapeRadarAxisState = "known" | "limited" | "unknown";

export type ProfileShapeRadarAxis = {
  modeId: string;
  label: string;
  shortLabel: string;
  affinity: number | null;
  coverage: number;
  state: ProfileShapeRadarAxisState;
};

export type ProfileShapeRadarMode = {
  modeId: string;
  label: string;
};

export type ProfileShapeRadarModel = {
  axes: readonly ProfileShapeRadarAxis[];
  strongestModes: readonly ProfileShapeRadarMode[];
  knownAxisCount: number;
  hasCompleteShape: boolean;
};

export function buildProfileShapeRadarModel(
  scoredModes: readonly ProfileRoleScore[],
): ProfileShapeRadarModel {
  const scoredById = new Map(scoredModes.map((mode) => [mode.id, mode]));

  const axes = dynamicModes.map((definition): ProfileShapeRadarAxis => {
    const score = scoredById.get(definition.id);

    if (!score) {
      return {
        modeId: definition.id,
        label: definition.label,
        shortLabel: definition.shortLabel,
        affinity: null,
        coverage: 0,
        state: "unknown",
      };
    }

    return {
      modeId: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      affinity: score.affinity,
      coverage: score.coverage,
      state: score.state,
    };
  });

  const strongestModes = scoredModes.slice(0, 3).map((mode) => ({
    modeId: mode.id,
    label: mode.label,
  }));
  const knownAxisCount = axes.filter((axis) => axis.state !== "unknown").length;

  return {
    axes,
    strongestModes,
    knownAxisCount,
    hasCompleteShape: axes.length > 0 && knownAxisCount === axes.length,
  };
}

export function getKnownProfileShapeRadarRuns(
  axes: readonly ProfileShapeRadarAxis[],
): readonly (readonly number[])[] {
  if (axes.length === 0) return [];

  const known = axes.map((axis) => axis.state !== "unknown");
  if (known.every(Boolean)) return [axes.map((_, index) => index)];
  if (!known.some(Boolean)) return [];

  const firstUnknown = known.findIndex((value) => !value);
  const rotatedIndexes = Array.from({ length: axes.length }, (_, offset) =>
    (firstUnknown + 1 + offset) % axes.length,
  );

  const runs: number[][] = [];
  let current: number[] = [];

  for (const index of rotatedIndexes) {
    if (known[index]) {
      current.push(index);
      continue;
    }

    if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }

  if (current.length > 0) runs.push(current);
  return runs;
}

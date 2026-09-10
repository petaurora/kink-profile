import { describe, expect, it } from "vitest";
import { dynamicModes } from "../data/headspacesQuiz";
import type { ProfileRoleScore } from "./profileRoleDetails";
import {
  buildProfileShapeRadarModel,
  getKnownProfileShapeRadarRuns,
  type ProfileShapeRadarAxis,
} from "./profileShapeRadar";

function scored(
  id: string,
  affinity: number,
  coverage: number,
  state: ProfileRoleScore["state"] = "known",
): ProfileRoleScore {
  const definition = dynamicModes.find((mode) => mode.id === id);
  if (!definition) throw new Error(`Unknown dynamic mode ${id}`);

  return {
    id,
    label: definition.label,
    shortLabel: definition.shortLabel,
    affinity,
    coverage,
    state,
  };
}

function axis(
  modeId: string,
  state: ProfileShapeRadarAxis["state"],
): ProfileShapeRadarAxis {
  const definition = dynamicModes.find((mode) => mode.id === modeId);
  if (!definition) throw new Error(`Unknown dynamic mode ${modeId}`);

  return {
    modeId,
    label: definition.label,
    shortLabel: definition.shortLabel,
    affinity: state === "unknown" ? null : 70,
    coverage: state === "unknown" ? 0 : state === "limited" ? 25 : 80,
    state,
  };
}

describe("dynamic-mode profile shape radar", () => {
  it("uses every dynamic mode as a stable axis in taxonomy order", () => {
    const model = buildProfileShapeRadarModel([]);

    expect(model.axes.map((entry) => entry.modeId)).toEqual(
      dynamicModes.map((mode) => mode.id),
    );
    expect(model.axes).toHaveLength(10);
  });

  it("keeps unexplored modes blank instead of plotting artificial zeroes", () => {
    const model = buildProfileShapeRadarModel([
      scored("devotion_mode", 88, 72),
    ]);

    expect(model.axes.find((entry) => entry.modeId === "devotion_mode")).toEqual(
      expect.objectContaining({ affinity: 88, coverage: 72, state: "known" }),
    );
    expect(model.axes.find((entry) => entry.modeId === "intensity_mode")).toEqual(
      expect.objectContaining({ affinity: null, coverage: 0, state: "unknown" }),
    );
    expect(model.hasCompleteShape).toBe(false);
  });

  it("preserves limited evidence and strongest-mode ordering from profile scoring", () => {
    const model = buildProfileShapeRadarModel([
      scored("care_mode", 94, 78),
      scored("power_exchange_mode", 90, 66),
      scored("intensity_mode", 86, 34, "limited"),
      scored("service_mode", 80, 62),
    ]);

    expect(model.strongestModes.map((mode) => mode.modeId)).toEqual([
      "care_mode",
      "power_exchange_mode",
      "intensity_mode",
    ]);
    expect(model.axes.find((entry) => entry.modeId === "intensity_mode")?.state).toBe(
      "limited",
    );
  });

  it("splits disconnected known regions without bridging unknown spokes", () => {
    const axes = dynamicModes.map((mode, index) =>
      axis(mode.id, index === 2 || index === 6 ? "unknown" : "known"),
    );

    expect(getKnownProfileShapeRadarRuns(axes)).toEqual([
      [3, 4, 5],
      [7, 8, 9, 0, 1],
    ]);
  });
});

import { describe, expect, it } from "vitest";
import {
  dynamicModes,
  partnerPositionedRoleHeadspaceIds,
  roleHeadspaces,
  selfPositionedRoleHeadspaceIds,
} from "./headspacesQuiz";
import {
  canonicalDynamicModes,
  canonicalRoleHeadspaces,
} from "./canonicalRoleCompositions";

describe("M3 v5 roles/headspaces and dynamic modes taxonomy", () => {
  it("keeps expressions and orientations out of the peer headspace layer", () => {
    const ids = roleHeadspaces.map((definition) => definition.id);

    expect(ids).not.toContain("service_submissive");
    expect(ids).not.toContain("devotional_submissive");
    expect(ids).not.toContain("trainer");

    expect(ids).toContain("owner_handler");
  });

  it("treats Object as a headspace without making Property a peer headspace", () => {
    const object = roleHeadspaces.find((definition) => definition.id === "object");
    const ids = roleHeadspaces.map((definition) => definition.id);

    expect(object?.label).toBe("Object");
    expect(object?.weights.objectification).toBe(1);
    expect(object?.weights.ownership_symbolism).toBeUndefined();
    expect(ids).not.toContain("property_object");
  });

  it("locks the revised 11-mode dynamic taxonomy", () => {
    expect(dynamicModes.map((definition) => definition.label)).toEqual([
      "Devotion",
      "Protocol",
      "Service",
      "Structure",
      "Care",
      "Playful Challenge",
      "Objectification",
      "Primal / Feral",
      "Authority",
      "Surrender",
      "Intensity",
    ]);

    const ids = dynamicModes.map((definition) => definition.id);
    expect(ids).toContain("care_mode");
    expect(ids).toContain("structure_mode");
    expect(ids).toContain("intensity_mode");
    expect(ids).not.toContain("nurtured_play");
    expect(ids).not.toContain("caretaking_mode");
    expect(ids).not.toContain("training_mode");
    expect(ids).not.toContain("claiming_mode");
  });

  it("keeps direction-neutral modes direction-neutral in canonical composition", () => {
    const care = canonicalDynamicModes.find((mode) => mode.id === "care_mode");
    const intensity = canonicalDynamicModes.find((mode) => mode.id === "intensity_mode");

    expect(care?.signals.filter((signal) => signal.signalId === "care")).toEqual([
      expect.objectContaining({ signalId: "care", channel: undefined, weight: 1 }),
    ]);
    expect(
      intensity?.signals.filter((signal) => signal.signalId === "physical_intensity"),
    ).toEqual([
      expect.objectContaining({
        signalId: "physical_intensity",
        channel: undefined,
        weight: 1,
      }),
    ]);
  });

  it("keeps display groups and canonical compositions aligned with the taxonomy", () => {
    const roleIds = roleHeadspaces.map((definition) => definition.id).sort();
    const displayIds = [
      ...selfPositionedRoleHeadspaceIds,
      ...partnerPositionedRoleHeadspaceIds,
    ].sort();
    const canonicalRoleIds = canonicalRoleHeadspaces
      .map((definition) => definition.id)
      .sort();
    const canonicalModeIds = canonicalDynamicModes
      .map((definition) => definition.id)
      .sort();

    expect(roleIds).toHaveLength(12);
    expect(dynamicModes).toHaveLength(11);
    expect(displayIds).toEqual(roleIds);
    expect(canonicalRoleIds).toEqual(roleIds);
    expect(canonicalModeIds).toEqual(
      dynamicModes.map((definition) => definition.id).sort(),
    );
  });
});
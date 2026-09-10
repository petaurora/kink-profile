import { describe, expect, it } from "vitest";
import {
  dynamicModes,
  partnerPositionedRoleHeadspaceIds,
  roleHeadspaces,
  selfPositionedRoleHeadspaceIds,
} from "./headspacesQuiz";
import { canonicalRoleHeadspaces } from "./canonicalRoleCompositions";

describe("M3 v4 role/headspace taxonomy", () => {
  it("keeps merged concepts as one role/headspace each", () => {
    const ids = roleHeadspaces.map((definition) => definition.id);

    expect(ids).toContain("devotional_submissive");
    expect(ids).not.toContain("service_submissive");

    expect(ids).toContain("owner_handler");
    expect(ids).not.toContain("trainer");
  });

  it("treats Object as a headspace without making Property a peer headspace", () => {
    const object = roleHeadspaces.find((definition) => definition.id === "object");
    const ids = roleHeadspaces.map((definition) => definition.id);

    expect(object?.label).toBe("Object");
    expect(object?.weights.objectification).toBe(1);
    expect(object?.weights.ownership_symbolism).toBeUndefined();
    expect(ids).not.toContain("property_object");
  });

  it("preserves Service and Training / Shaping as explanatory dynamic modes", () => {
    const ids = dynamicModes.map((definition) => definition.id);

    expect(ids).toContain("service_mode");
    expect(ids).toContain("training_mode");
  });

  it("keeps display groups and canonical compositions aligned with the taxonomy", () => {
    const roleIds = roleHeadspaces.map((definition) => definition.id).sort();
    const displayIds = [
      ...selfPositionedRoleHeadspaceIds,
      ...partnerPositionedRoleHeadspaceIds,
    ].sort();
    const canonicalIds = canonicalRoleHeadspaces
      .map((definition) => definition.id)
      .sort();

    expect(roleIds).toHaveLength(12);
    expect(displayIds).toEqual(roleIds);
    expect(canonicalIds).toEqual(roleIds);
  });
});

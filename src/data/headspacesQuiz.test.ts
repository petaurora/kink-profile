import { describe, expect, it } from "vitest";
import {
  dynamicModes,
  headspaceQuestionIds,
  headspaceQuestions,
  legacyHeadspaceQuestionIds,
  legacyHeadspaceQuestions,
  partnerPositionedRoleHeadspaceIds,
  roleHeadspaces,
  selfPositionedRoleHeadspaceIds,
} from "./headspacesQuiz";
import {
  canonicalDynamicModes,
  canonicalRoleHeadspaces,
} from "./canonicalRoleCompositions";
import { canonicalQuizSignalRef } from "./canonicalSignals";

describe("roles/headspaces and dynamic modes taxonomy", () => {
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

  it("locks the revised 10-mode direction-neutral taxonomy", () => {
    expect(dynamicModes.map((definition) => definition.label)).toEqual([
      "Devotion",
      "Protocol",
      "Service",
      "Structure",
      "Care",
      "Playful Challenge",
      "Objectification",
      "Primal / Feral",
      "Power Exchange",
      "Intensity",
    ]);

    const ids = dynamicModes.map((definition) => definition.id);
    expect(ids).toContain("power_exchange_mode");
    expect(ids).toContain("care_mode");
    expect(ids).toContain("structure_mode");
    expect(ids).toContain("intensity_mode");
    expect(ids).not.toContain("authority_mode");
    expect(ids).not.toContain("surrender_mode");
    expect(ids).not.toContain("nurtured_play");
    expect(ids).not.toContain("caretaking_mode");
    expect(ids).not.toContain("training_mode");
    expect(ids).not.toContain("claiming_mode");
  });

  it("keeps direction-neutral modes direction-neutral in canonical composition", () => {
    const care = canonicalDynamicModes.find((mode) => mode.id === "care_mode");
    const powerExchange = canonicalDynamicModes.find(
      (mode) => mode.id === "power_exchange_mode",
    );
    const intensity = canonicalDynamicModes.find((mode) => mode.id === "intensity_mode");

    expect(care?.signals.filter((signal) => signal.signalId === "care")).toEqual([
      expect.objectContaining({ signalId: "care", channel: undefined, weight: 1 }),
    ]);
    expect(
      powerExchange?.signals.filter((signal) => signal.signalId === "control"),
    ).toEqual([
      expect.objectContaining({ signalId: "control", channel: undefined, weight: 1 }),
    ]);
    expect(
      powerExchange?.signals.filter((signal) => signal.signalId === "responsibility"),
    ).toEqual([
      expect.objectContaining({
        signalId: "responsibility",
        channel: undefined,
        weight: 0.8,
      }),
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
    expect(dynamicModes).toHaveLength(10);
    expect(displayIds).toEqual(roleIds);
    expect(canonicalRoleIds).toEqual(roleIds);
    expect(canonicalModeIds).toEqual(
      dynamicModes.map((definition) => definition.id).sort(),
    );
  });
});

describe("Roles & Headspaces v6 question bank", () => {
  it("keeps 17 active questions and 15 hidden v5 compatibility questions", () => {
    expect(headspaceQuestionIds).toHaveLength(17);
    expect(legacyHeadspaceQuestionIds).toHaveLength(15);

    for (const retiredId of [
      "hs-006",
      "hs-007",
      "hs-008",
      "hs-009",
      "hs-010",
      "hs-014",
      "hs-015",
      "hs-016",
      "hs-017",
      "hs-018",
      "hs-019",
      "hs-021",
      "hs-022",
      "hs-023",
      "hs-024",
    ]) {
      expect(headspaceQuestionIds).not.toContain(retiredId);
      expect(legacyHeadspaceQuestionIds).toContain(retiredId);
    }

    expect(legacyHeadspaceQuestions).toHaveLength(15);
  });

  it("keeps every active question focused on one authored primitive", () => {
    for (const question of headspaceQuestions) {
      expect(Object.keys(question.weights)).toHaveLength(1);
      expect(Object.values(question.weights)).toEqual([1]);
    }
  });

  it("weights the three younger / less-adult headspace probes equally", () => {
    const byId = new Map(
      headspaceQuestions.map((question) => [question.id, question]),
    );

    for (const id of ["hs-025", "hs-026", "hs-027"]) {
      expect(byId.get(id)?.weights).toEqual({ younger_headspace: 1 });
    }

    expect(byId.get("hs-025")?.prompt).toContain("younger");
    expect(byId.get("hs-026")?.prompt).toContain("adult responsibilities");
    expect(byId.get("hs-027")?.prompt).toContain("independence");
  });

  it("keeps role-context praise directional without tying it to obedience or service", () => {
    const praise = headspaceQuestions.find((question) => question.id === "hs-005");

    expect(praise?.weights).toEqual({ praise_approval: 1 });
    expect(canonicalQuizSignalRef("hs-005", "praise_approval")).toEqual({
      signalId: "praise_approval",
      channel: "receiving",
    });
  });

  it("keeps objectification and pursuit evidence directional while primal remains broad", () => {
    expect(canonicalQuizSignalRef("hs-012", "objectification")).toEqual({
      signalId: "objectification",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("hs-020", "objectification")).toEqual({
      signalId: "objectification",
      channel: "giving",
    });
    expect(canonicalQuizSignalRef("hs-029", "pursuit_receiving")).toEqual({
      signalId: "pursuit",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("hs-031", "pursuit_giving")).toEqual({
      signalId: "pursuit",
      channel: "giving",
    });
    expect(canonicalQuizSignalRef("hs-028", "primal_embodiment")).toEqual({
      signalId: "primal_embodiment",
      channel: "overall",
    });
  });
});

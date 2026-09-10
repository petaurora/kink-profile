import { describe, expect, it } from "vitest";
import {
  getSharedInteractionCounterparts,
  sharedInteractionMappingVersion,
  sharedInteractionMappings,
  validateSharedInteractionMappings,
} from "./sharedInteractionMappings";

describe("sharedInteractionMappings", () => {
  it("uses stable unique ids and the current mapping version", () => {
    const ids = sharedInteractionMappings.map((mapping) => mapping.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(
      sharedInteractionMappings.every(
        (mapping) => mapping.version === sharedInteractionMappingVersion,
      ),
    ).toBe(true);
  });

  it("resolves every mapping endpoint against current semantic definitions", () => {
    expect(validateSharedInteractionMappings()).toEqual([]);
  });

  it("keeps mapping strength bounded", () => {
    for (const mapping of sharedInteractionMappings) {
      expect(mapping.strength).toBeGreaterThan(0);
      expect(mapping.strength).toBeLessThanOrEqual(1);
    }
  });

  it("marks every activity-side complement as non-authority evidence", () => {
    const activityMappings = sharedInteractionMappings.filter(
      (mapping) => mapping.relationshipKind === "activity_complement",
    );

    expect(activityMappings.length).toBeGreaterThan(0);
    expect(
      activityMappings.every(
        (mapping) => mapping.authoritySemantics === "activity_side_only",
      ),
    ).toBe(true);
  });

  it("contains the core giving/receiving activity complements", () => {
    const pairs = new Set(
      sharedInteractionMappings
        .filter((mapping) => mapping.relationshipKind === "activity_complement")
        .map(
          (mapping) =>
            `${mapping.source.kind}:${mapping.source.id}->${mapping.target.kind}:${mapping.target.id}`,
        ),
    );

    expect(pairs).toContain("signal:pain_giving->signal:pain_receiving");
    expect(pairs).toContain(
      "signal:giving_restraint->signal:receiving_restraint",
    );
    expect(pairs).toContain(
      "signal:giving_positioning->signal:receiving_positioning",
    );
    expect(pairs).toContain(
      "signal:giving_discipline->signal:receiving_discipline",
    );
    expect(pairs).toContain("signal:care_giving->signal:care_receiving");
    expect(pairs).toContain("signal:pursuit_giving->signal:pursuit_receiving");
    expect(pairs).toContain("signal:giving_control->signal:receiving_control");
  });

  it("keeps neutral dynamic modes out of complement mappings", () => {
    const ids = new Set(sharedInteractionMappings.map((mapping) => mapping.id));

    expect(ids).not.toContain("mode-authority-surrender");
    expect(ids).not.toContain("mode-caretaking-nurtured-play");
    expect(
      sharedInteractionMappings.some(
        (mapping) => mapping.relationshipKind === "dynamic_mode_complement",
      ),
    ).toBe(false);
  });

  it("contains the core role relationships from the M14 contract", () => {
    const ids = new Set(sharedInteractionMappings.map((mapping) => mapping.id));

    expect(ids).toContain("headspace-predator-prey");
    expect(ids).toContain("headspace-owner-handler-pet");
    expect(ids).toContain("headspace-caregiver-little");
    expect(ids).toContain("headspace-master-mistress-slave");
  });

  it("supports reverse lookup for bidirectional relationships", () => {
    const counterparts = getSharedInteractionCounterparts({
      kind: "headspace",
      id: "prey",
    });

    expect(counterparts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          counterpart: { kind: "headspace", id: "predator" },
          mapping: expect.objectContaining({
            id: "headspace-predator-prey",
          }),
        }),
      ]),
    );
  });

  it("does not use contextual role complements as implicit authority assignments", () => {
    const contextualMappings = sharedInteractionMappings.filter(
      (mapping) => mapping.authoritySemantics === "contextual_role",
    );

    expect(contextualMappings.length).toBeGreaterThan(0);
    expect(
      contextualMappings.some(
        (mapping) =>
          mapping.id === "headspace-predator-prey" ||
          mapping.id === "headspace-caregiver-little",
      ),
    ).toBe(true);
  });
});

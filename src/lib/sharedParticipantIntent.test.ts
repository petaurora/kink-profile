import { describe, expect, it } from "vitest";
import {
  buildSharedParticipantIntentPairings,
  createEmptySharedParticipantIntent,
  getSharedParticipantIntentOptions,
  hasSharedParticipantIntentConcept,
  toggleSharedParticipantIntentConcept,
} from "./sharedParticipantIntent";
import { dynamicModes } from "../data/headspacesQuiz";

describe("shared participant intent", () => {
  it("offers mapped complements plus every neutral dynamic mode", () => {
    const options = getSharedParticipantIntentOptions();

    expect(options.some((option) => option.key === "headspace:predator")).toBe(true);
    expect(options.some((option) => option.key === "headspace:prey")).toBe(true);
    expect(options.some((option) => option.key === "dynamic_mode:power_exchange_mode")).toBe(true);
    expect(options.some((option) => option.key === "signal:pain_giving")).toBe(true);
    expect(options.some((option) => option.key === "signal:pain_receiving")).toBe(true);

    const optionModeIds = options
      .filter((option) => option.kind === "dynamic_mode")
      .map((option) => option.concept.id)
      .sort();
    expect(optionModeIds).toEqual(
      dynamicModes.map((mode) => mode.id).sort(),
    );
    expect(new Set(options.map((option) => option.key)).size).toBe(options.length);
  });

  it("toggles current intent without mutating the previous value", () => {
    const initial = createEmptySharedParticipantIntent();
    const predator = { kind: "headspace", id: "predator" } as const;

    const selected = toggleSharedParticipantIntentConcept(initial, predator);

    expect(initial.selectedConcepts).toHaveLength(0);
    expect(selected.selectedConcepts).toHaveLength(1);
    expect(hasSharedParticipantIntentConcept(selected, predator)).toBe(true);

    const cleared = toggleSharedParticipantIntentConcept(selected, predator);

    expect(selected.selectedConcepts).toHaveLength(1);
    expect(cleared.selectedConcepts).toHaveLength(0);
  });

  it("finds Predator and Prey as a current contextual-role pairing", () => {
    const profileA = {
      selectedConcepts: [{ kind: "headspace", id: "predator" } as const],
    };
    const profileB = {
      selectedConcepts: [{ kind: "headspace", id: "prey" } as const],
    };

    const pairings = buildSharedParticipantIntentPairings(profileA, profileB);

    expect(pairings).toHaveLength(1);
    expect(pairings[0].mapping.id).toBe("headspace-predator-prey");
    expect(pairings[0].mapping.authoritySemantics).toBe("contextual_role");
    expect(pairings[0].profileALabel).toBe("Predator");
    expect(pairings[0].profileBLabel).toBe("Prey");
  });

  it("finds activity-side complements without converting them to authority evidence", () => {
    const profileA = {
      selectedConcepts: [{ kind: "signal", id: "pain_giving" } as const],
    };
    const profileB = {
      selectedConcepts: [{ kind: "signal", id: "pain_receiving" } as const],
    };

    const pairings = buildSharedParticipantIntentPairings(profileA, profileB);

    expect(pairings).toHaveLength(1);
    expect(pairings[0].mapping.id).toBe("signal-pain-give-receive");
    expect(pairings[0].mapping.authoritySemantics).toBe("activity_side_only");
  });

  it("treats Power Exchange as shared context rather than a complement pair", () => {
    const profileA = {
      selectedConcepts: [
        { kind: "dynamic_mode", id: "power_exchange_mode" } as const,
      ],
    };
    const profileB = {
      selectedConcepts: [
        { kind: "dynamic_mode", id: "power_exchange_mode" } as const,
      ],
    };

    expect(buildSharedParticipantIntentPairings(profileA, profileB)).toEqual([]);
  });

  it("does not invent a pairing for two unrelated current choices", () => {
    const profileA = {
      selectedConcepts: [{ kind: "headspace", id: "predator" } as const],
    };
    const profileB = {
      selectedConcepts: [{ kind: "headspace", id: "pet" } as const],
    };

    expect(buildSharedParticipantIntentPairings(profileA, profileB)).toEqual([]);
  });
});

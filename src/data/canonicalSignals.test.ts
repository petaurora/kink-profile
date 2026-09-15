import { describe, expect, it } from "vitest";
import {
  canonicalQuizSignalRef,
  canonicalSignalDefinitions,
  legacySignalConceptTargets,
  signalSupportsChannel,
} from "./canonicalSignals";
import { signalDefinitions } from "./signals";

describe("M16.4 canonical Signal vocabulary", () => {
  it("classifies every legacy runtime Signal ID", () => {
    const legacyIds = signalDefinitions.map((signal) => signal.id).sort();
    expect(Object.keys(legacySignalConceptTargets).sort()).toEqual(legacyIds);
  });

  it("keeps all canonical Signal IDs unique", () => {
    const ids = canonicalSignalDefinitions.map((signal) => signal.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps Overall-only concepts free of fake directional channels", () => {
    for (const signalId of [
      "autonomy",
      "belonging",
      "role_embodiment",
      "playfulness",
      "ritual_significance",
      "younger_headspace",
      "primal_embodiment",
      "anticipation",
      "emotional_intensity",
      "exhibitionism",
      "voyeurism",
    ] as const) {
      expect(signalSupportsChannel(signalId, "receiving")).toBe(false);
      expect(signalSupportsChannel(signalId, "giving")).toBe(false);
    }
  });

  it("models movement restriction with meaningful receiving and giving channels", () => {
    expect(signalSupportsChannel("movement_restriction", "receiving")).toBe(true);
    expect(signalSupportsChannel("movement_restriction", "giving")).toBe(true);

    expect(canonicalQuizSignalRef("bd-002", "movement_restriction")).toEqual({
      signalId: "movement_restriction",
      channel: "receiving",
    });
    expect(canonicalQuizSignalRef("bd-010", "movement_restriction")).toEqual({
      signalId: "movement_restriction",
      channel: "giving",
    });
  });

  it("keeps the aesthetic bondage context broad rather than inventing a receiving preference", () => {
    expect(canonicalQuizSignalRef("bd-029", "receiving_positioning")).toEqual({
      signalId: "positioning",
      channel: "overall",
    });
    expect(canonicalQuizSignalRef("bd-029", "receiving_restraint")).toEqual({
      signalId: "restraint",
      channel: "overall",
    });
  });
});

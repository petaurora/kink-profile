import { describe, expect, it } from "vitest";
import {
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
      "movement_restriction",
      "exhibitionism",
      "voyeurism",
    ] as const) {
      expect(signalSupportsChannel(signalId, "receiving")).toBe(false);
      expect(signalSupportsChannel(signalId, "giving")).toBe(false);
    }
  });
});

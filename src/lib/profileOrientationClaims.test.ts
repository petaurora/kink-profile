import { describe, expect, it } from "vitest";
import type { CanonicalSignalFixture } from "./testCanonicalSignalFixtures";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";
import { deriveProfileOrientation } from "./profileHeader";

function ds(
  signalId: CanonicalSignalFixture["signalId"],
  affinity: number,
  coverage = 100,
  channel?: CanonicalSignalFixture["channel"],
): CanonicalSignalFixture {
  return {
    signalId,
    affinity,
    coverage,
    channel,
    sourceType: "quiz",
    sourceId: "dominance-submission",
  };
}

function orientation(fixtures: readonly CanonicalSignalFixture[]) {
  return deriveProfileOrientation(buildCanonicalSignalFixtures(fixtures));
}

describe("profile orientation personal-claim semantics", () => {
  it("keeps missing authority evidence unknown", () => {
    const result = deriveProfileOrientation([]);

    expect(result.key).toBe("insufficient");
    expect(result.claim.state).toBe("unknown");
    expect(result.claim.source).toBe("none");
  });

  it("distinguishes measured low match from unknown", () => {
    const result = orientation([
      ds("receiving_control", 25),
      ds("responsibility_transfer", 20),
      ds("obedience", 20, 100, "giving"),
      ds("giving_control", 30),
    ]);

    expect(result.key).toBe("low_match");
    expect(result.label).toBe("No strong D/s match");
    expect(result.claim.state).toBe("low_match");
  });

  it("distinguishes meaningful balanced evidence from low match", () => {
    const result = orientation([
      ds("receiving_control", 58),
      ds("responsibility_transfer", 58),
      ds("obedience", 58, 100, "giving"),
      ds("giving_control", 56),
    ]);

    expect(result.key).toBe("balanced");
    expect(result.label).toBe("Balanced / no clear lean");
    expect(result.claim.state).toBe("balanced");
  });

  it("preserves strong evidence on both sides as a calculated match", () => {
    const result = orientation([
      ds("receiving_control", 88),
      ds("responsibility_transfer", 80),
      ds("obedience", 75, 100, "giving"),
      ds("giving_control", 84),
    ]);

    expect(result.key).toBe("bidirectional");
    expect(result.claim.state).toBe("calculated_match");
  });

  it("lets self-identification wrap but not rewrite calculated orientation", () => {
    const canonical = buildCanonicalSignalFixtures([
      ds("receiving_control", 92),
      ds("responsibility_transfer", 88),
      ds("obedience", 84, 100, "giving"),
      ds("giving_control", 20),
    ]);
    const result = deriveProfileOrientation(canonical, {
      kind: "self_identified",
      label: "Switch",
    });

    expect(result.key).toBe("submissive");
    expect(result.label).toBe("Switch");
    expect(result.claim.state).toBe("self_identified");
    expect(result.claim.calculatedLabel).toBe("Submissive");
  });

  it("lets explicit none wrap but preserves the calculated state for explainability", () => {
    const canonical = buildCanonicalSignalFixtures([
      ds("receiving_control", 58),
      ds("responsibility_transfer", 58),
      ds("obedience", 58, 100, "giving"),
      ds("giving_control", 56),
    ]);
    const result = deriveProfileOrientation(canonical, {
      kind: "explicit_none",
    });

    expect(result.key).toBe("balanced");
    expect(result.claim.state).toBe("explicit_none");
    expect(result.claim.calculatedState).toBe("balanced");
  });
});

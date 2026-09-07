import { describe, expect, it } from "vitest";
import type { SignalId } from "../data/signals";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import { buildProfileRoleDetails } from "./profileRoleDetails";

function signal(
  signalId: SignalId,
  affinity: number,
  coverage = 100,
): CanonicalSignalResult {
  return {
    signalId,
    affinity,
    coverage,
    channels: [],
    sourceEvidenceIds: [`test:${signalId}`],
  };
}

describe("M7.5 profile role details", () => {
  it("keeps overlapping headspaces independently scored without authority bucketing", () => {
    const model = buildProfileRoleDetails([
      signal("belonging", 95),
      signal("role_embodiment", 90),
      signal("playfulness", 88),
      signal("care_receiving", 92),
      signal("ownership_symbolism", 90),
      signal("praise_approval", 85),
      signal("devotion", 90),
      signal("service", 88),
      signal("obedience", 84),
      signal("receiving_control", 82),
      signal("ritual_significance", 80),
      signal("responsibility_transfer", 78),
      signal("structure", 75),
    ]);

    const ids = model.headspaces.map((item) => item.id);

    expect(ids).toContain("pet");
    expect(ids).toContain("service_submissive");
    expect(ids).toContain("devotional_submissive");
    expect(model.headspaces[0].affinity).toBeGreaterThan(0);
  });

  it("sorts displayed rows by affinity while using coverage as the tie-breaker", () => {
    const model = buildProfileRoleDetails([
      signal("playful_resistance", 95),
      signal("playfulness", 95),
      signal("autonomy", 95),
      signal("receiving_control", 90),
      signal("praise_approval", 90),
      signal("younger_headspace", 70),
      signal("care_receiving", 70),
      signal("role_embodiment", 70),
      signal("responsibility_transfer", 70),
    ]);

    const affinities = model.headspaces.map((item) => item.affinity);
    expect(affinities).toEqual([...affinities].sort((a, b) => b - a));
  });

  it("suppresses barely evidenced composed results instead of promoting sparse 100% labels", () => {
    const model = buildProfileRoleDetails([
      signal("younger_headspace", 100, 8),
      signal("care_receiving", 100, 8),
    ]);

    expect(model.headspaces).toEqual([]);
  });

  it("keeps limited-but-usable evidence visible and qualified", () => {
    const model = buildProfileRoleDetails([
      signal("pursuit_receiving", 90, 35),
      signal("primal_embodiment", 88, 35),
      signal("role_embodiment", 80, 35),
      signal("receiving_control", 75, 35),
      signal("playful_resistance", 70, 35),
    ]);

    const prey = model.headspaces.find((item) => item.id === "prey");

    expect(prey).toEqual(
      expect.objectContaining({
        state: "limited",
      }),
    );
    expect(prey?.coverage).toBeGreaterThanOrEqual(20);
    expect(prey?.coverage).toBeLessThan(40);
  });

  it("returns a compact featured headspace set while preserving the full ranked list", () => {
    const model = buildProfileRoleDetails([
      signal("belonging", 90),
      signal("role_embodiment", 88),
      signal("playfulness", 86),
      signal("care_receiving", 84),
      signal("ownership_symbolism", 82),
      signal("praise_approval", 80),
      signal("responsibility_transfer", 78),
      signal("obedience", 76),
      signal("service", 74),
      signal("structure", 72),
      signal("devotion", 70),
      signal("younger_headspace", 68),
      signal("autonomy", 66),
      signal("playful_resistance", 64),
      signal("objectification", 62),
      signal("pursuit_receiving", 60),
      signal("primal_embodiment", 58),
    ]);

    expect(model.headspaces.length).toBeGreaterThan(5);
    expect(model.featuredHeadspaces).toEqual(
      model.headspaces.slice(0, 5),
    );
  });

  it("allows caregiver or trainer-style headspaces to surface without classifying them as dominant", () => {
    const model = buildProfileRoleDetails([
      signal("care_giving", 96),
      signal("responsibility_holding", 92),
      signal("guidance_shaping", 94),
      signal("structure", 82),
      signal("service", 90),
      signal("devotion", 88),
      signal("obedience", 86),
      signal("receiving_control", 90),
    ]);

    const ids = model.headspaces.map((item) => item.id);

    expect(ids).toContain("caregiver");
    expect(ids).toContain("trainer");
    expect(model.featuredHeadspaces.length).toBeLessThanOrEqual(5);
  });

  it("scores dynamic modes from the same canonical signals without forcing exclusivity", () => {
    const model = buildProfileRoleDetails([
      signal("devotion", 92),
      signal("belonging", 90),
      signal("ritual_significance", 88),
      signal("service", 86),
      signal("ownership_symbolism", 84),
      signal("structure", 82),
      signal("obedience", 80),
      signal("role_embodiment", 78),
      signal("praise_approval", 76),
    ]);

    const ids = model.dynamicModes.map((item) => item.id);

    expect(ids).toContain("devotion_mode");
    expect(ids).toContain("service_mode");
    expect(ids).toContain("protocol_mode");
  });

  it("limits the compact dynamic-mode set to five strongest known modes", () => {
    const model = buildProfileRoleDetails([
      signal("devotion", 90),
      signal("belonging", 88),
      signal("ritual_significance", 86),
      signal("service", 84),
      signal("ownership_symbolism", 82),
      signal("structure", 80),
      signal("obedience", 78),
      signal("role_embodiment", 76),
      signal("playfulness", 74),
      signal("care_receiving", 72),
      signal("praise_approval", 70),
      signal("responsibility_transfer", 68),
      signal("receiving_control", 66),
      signal("playful_resistance", 64),
      signal("autonomy", 62),
      signal("objectification", 60),
      signal("primal_embodiment", 58),
    ]);

    expect(model.featuredDynamicModes).toEqual(
      model.dynamicModes.slice(0, 5),
    );
    expect(model.featuredDynamicModes.length).toBeLessThanOrEqual(5);
  });
});

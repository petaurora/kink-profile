import { describe, expect, it } from "vitest";
import type { CanonicalSignalFixture } from "./testCanonicalSignalFixtures";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";
import { buildProfileRoleDetails } from "./profileRoleDetails";

function signals(fixtures: readonly CanonicalSignalFixture[]) {
  return buildCanonicalSignalFixtures(fixtures);
}

describe("M7.5 profile role details", () => {
  it("keeps overlapping headspaces independently scored without authority bucketing", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "belonging", affinity: 95 },
        { signalId: "role_embodiment", affinity: 90 },
        { signalId: "playfulness", affinity: 88 },
        { signalId: "care_receiving", affinity: 92 },
        { signalId: "ownership_symbolism", channel: "receiving", affinity: 90 },
        { signalId: "praise_approval", channel: "receiving", affinity: 85 },
        { signalId: "devotion", channel: "giving", affinity: 90 },
        { signalId: "service", channel: "giving", affinity: 88 },
        { signalId: "obedience", channel: "giving", affinity: 84 },
        { signalId: "receiving_control", affinity: 82 },
        { signalId: "ritual_significance", affinity: 80 },
        { signalId: "responsibility_transfer", affinity: 78 },
        { signalId: "structure", channel: "receiving", affinity: 75 },
      ]),
    );

    const ids = model.headspaces.map((item) => item.id);
    expect(ids).toContain("pet");
    expect(ids).toContain("service_submissive");
    expect(ids).toContain("devotional_submissive");
    expect(model.headspaces[0].affinity).toBeGreaterThan(0);
  });

  it("sorts displayed rows by affinity while using coverage as the tie-breaker", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "playful_resistance", channel: "giving", affinity: 95 },
        { signalId: "playfulness", affinity: 95 },
        { signalId: "autonomy", affinity: 95 },
        { signalId: "receiving_control", affinity: 90 },
        { signalId: "praise_approval", channel: "receiving", affinity: 90 },
        { signalId: "younger_headspace", affinity: 70 },
        { signalId: "care_receiving", affinity: 70 },
        { signalId: "role_embodiment", affinity: 70 },
        { signalId: "responsibility_transfer", affinity: 70 },
      ]),
    );

    const affinities = model.headspaces.map((item) => item.affinity);
    expect(affinities).toEqual([...affinities].sort((a, b) => b - a));
  });

  it("suppresses barely evidenced composed results instead of promoting sparse 100% labels", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "younger_headspace", affinity: 100, coverage: 8 },
        { signalId: "care_receiving", affinity: 100, coverage: 8 },
      ]),
    );
    expect(model.headspaces).toEqual([]);
  });

  it("keeps limited-but-usable evidence visible and qualified", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "pursuit_receiving", affinity: 90, coverage: 35 },
        { signalId: "primal_embodiment", affinity: 88, coverage: 35 },
        { signalId: "role_embodiment", affinity: 80, coverage: 35 },
        { signalId: "receiving_control", affinity: 75, coverage: 35 },
        { signalId: "playful_resistance", channel: "giving", affinity: 70, coverage: 35 },
      ]),
    );

    const prey = model.headspaces.find((item) => item.id === "prey");
    expect(prey).toEqual(expect.objectContaining({ state: "limited" }));
    expect(prey?.coverage).toBeGreaterThanOrEqual(20);
    expect(prey?.coverage).toBeLessThan(40);
  });

  it("returns a compact featured headspace set while preserving the full ranked list", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "belonging", affinity: 90 },
        { signalId: "role_embodiment", affinity: 88 },
        { signalId: "playfulness", affinity: 86 },
        { signalId: "care_receiving", affinity: 84 },
        { signalId: "ownership_symbolism", channel: "receiving", affinity: 82 },
        { signalId: "praise_approval", channel: "receiving", affinity: 80 },
        { signalId: "responsibility_transfer", affinity: 78 },
        { signalId: "obedience", channel: "giving", affinity: 76 },
        { signalId: "service", channel: "giving", affinity: 74 },
        { signalId: "structure", channel: "receiving", affinity: 72 },
        { signalId: "devotion", channel: "giving", affinity: 70 },
        { signalId: "younger_headspace", affinity: 68 },
        { signalId: "autonomy", affinity: 66 },
        { signalId: "playful_resistance", channel: "giving", affinity: 64 },
        { signalId: "objectification", channel: "receiving", affinity: 62 },
        { signalId: "pursuit_receiving", affinity: 60 },
        { signalId: "primal_embodiment", affinity: 58 },
      ]),
    );

    expect(model.headspaces.length).toBeGreaterThan(5);
    expect(model.featuredHeadspaces).toEqual(model.headspaces.slice(0, 5));
  });

  it("allows caregiver or trainer-style headspaces to surface without classifying them as dominant", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "care_giving", affinity: 96 },
        { signalId: "responsibility_holding", affinity: 92 },
        { signalId: "guidance_shaping", channel: "giving", affinity: 94 },
        { signalId: "structure", channel: "giving", affinity: 82 },
        { signalId: "service", channel: "giving", affinity: 90 },
        { signalId: "devotion", channel: "giving", affinity: 88 },
        { signalId: "obedience", channel: "giving", affinity: 86 },
        { signalId: "receiving_control", affinity: 90 },
      ]),
    );

    const ids = model.headspaces.map((item) => item.id);
    expect(ids).toContain("caregiver");
    expect(ids).toContain("trainer");
    expect(model.featuredHeadspaces.length).toBeLessThanOrEqual(5);
  });

  it("scores dynamic modes from the same canonical Signals without forcing exclusivity", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "devotion", affinity: 92 },
        { signalId: "belonging", affinity: 90 },
        { signalId: "ritual_significance", affinity: 88 },
        { signalId: "service", channel: "giving", affinity: 86 },
        { signalId: "ownership_symbolism", affinity: 84 },
        { signalId: "structure", affinity: 82 },
        { signalId: "obedience", channel: "giving", affinity: 80 },
        { signalId: "role_embodiment", affinity: 78 },
        { signalId: "praise_approval", channel: "receiving", affinity: 76 },
      ]),
    );

    const ids = model.dynamicModes.map((item) => item.id);
    expect(ids).toContain("devotion_mode");
    expect(ids).toContain("service_mode");
    expect(ids).toContain("protocol_mode");
  });

  it("limits the compact dynamic-mode set to five strongest known modes", () => {
    const model = buildProfileRoleDetails(
      signals([
        { signalId: "devotion", affinity: 90 },
        { signalId: "belonging", affinity: 88 },
        { signalId: "ritual_significance", affinity: 86 },
        { signalId: "service", channel: "giving", affinity: 84 },
        { signalId: "ownership_symbolism", affinity: 82 },
        { signalId: "structure", affinity: 80 },
        { signalId: "obedience", channel: "giving", affinity: 78 },
        { signalId: "role_embodiment", affinity: 76 },
        { signalId: "playfulness", affinity: 74 },
        { signalId: "care_receiving", affinity: 72 },
        { signalId: "praise_approval", channel: "receiving", affinity: 70 },
        { signalId: "responsibility_transfer", affinity: 68 },
        { signalId: "receiving_control", affinity: 66 },
        { signalId: "playful_resistance", channel: "giving", affinity: 64 },
        { signalId: "autonomy", affinity: 62 },
        { signalId: "objectification", channel: "receiving", affinity: 60 },
        { signalId: "primal_embodiment", affinity: 58 },
      ]),
    );

    expect(model.featuredDynamicModes).toEqual(model.dynamicModes.slice(0, 5));
    expect(model.featuredDynamicModes.length).toBeLessThanOrEqual(5);
  });
});

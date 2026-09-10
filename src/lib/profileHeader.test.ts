import { describe, expect, it } from "vitest";
import type {
  CanonicalSignalFixture,
} from "./testCanonicalSignalFixtures";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";
import { scoreOverallFacets } from "./overallProfileFacets";
import {
  buildProfileHeaderModel,
  deriveProfileOrientation,
} from "./profileHeader";
import { buildProfileRoleDetails } from "./profileRoleDetails";

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

function hs(
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
    sourceId: "roles-headspaces",
  };
}

function signals(fixtures: readonly CanonicalSignalFixture[]) {
  return buildCanonicalSignalFixtures(fixtures);
}

describe("M7.3 profile orientation", () => {
  it("stays emerging when D/s authority evidence is too sparse", () => {
    expect(
      deriveProfileOrientation(
        signals([ds("receiving_control", 100, 10)]),
      ).key,
    ).toBe("insufficient");
  });

  it("identifies a clear submissive lean from authority-specific D/s evidence", () => {
    const orientation = deriveProfileOrientation(
      signals([
        ds("receiving_control", 92),
        ds("responsibility_transfer", 88),
        ds("obedience", 82, 100, "giving"),
        ds("giving_control", 20),
      ]),
    );

    expect(orientation.key).toBe("submissive");
    expect(orientation.submissiveAffinity).toBeGreaterThan(
      orientation.dominantAffinity ?? 0,
    );
  });

  it("identifies a clear dominant lean from negotiated authority evidence", () => {
    expect(
      deriveProfileOrientation(
        signals([
          ds("receiving_control", 20),
          ds("responsibility_transfer", 25),
          ds("obedience", 20, 100, "giving"),
          ds("giving_control", 92),
        ]),
      ).key,
    ).toBe("dominant");
  });

  it("identifies genuinely strong authority evidence on both sides", () => {
    expect(
      deriveProfileOrientation(
        signals([
          ds("receiving_control", 88),
          ds("responsibility_transfer", 80),
          ds("obedience", 75, 100, "giving"),
          ds("giving_control", 84),
        ]),
      ).key,
    ).toBe("bidirectional");
  });

  it("does not turn unrelated activity direction into authority orientation", () => {
    const orientation = deriveProfileOrientation(
      signals([
        ds("receiving_control", 100),
        ds("responsibility_transfer", 100),
        ds("obedience", 100, 100, "giving"),
        ds("giving_control", 68),
        hs("care_giving", 100),
        hs("pain_giving", 100),
        hs("giving_intensity", 100),
        hs("giving_restraint", 100),
        hs("giving_discipline", 100),
        hs("pursuit_giving", 100),
      ]),
    );

    expect(orientation.key).toBe("submissive");
    expect(orientation.label).toBe("Submissive");
  });

  it("does not treat delegated responsibility-holding as dominant authority", () => {
    const orientation = deriveProfileOrientation(
      signals([
        ds("receiving_control", 95),
        ds("responsibility_transfer", 95),
        ds("obedience", 95, 100, "giving"),
        ds("giving_control", 35),
        hs("responsibility_holding", 100),
      ]),
    );

    expect(orientation.key).toBe("submissive");
  });

  it("ignores authority-like Signals from non-D/s quiz sources", () => {
    const orientation = deriveProfileOrientation(
      signals([
        hs("giving_control", 100),
        hs("responsibility_holding", 100),
      ]),
    );

    expect(orientation.key).toBe("insufficient");
    expect(orientation.label).toBe("Still emerging");
  });
});

describe("M7.3 profile header model", () => {
  it("uses a truthful empty-state summary rather than completion mechanics", () => {
    const model = buildProfileHeaderModel([], scoreOverallFacets([]));

    expect(model.summary).toBe(
      "There is not enough evidence yet to describe the overall shape of this profile.",
    );
    expect(model.orientation.label).toBe("Still emerging");
    expect(model.headspaces).toEqual([]);
    expect(model.dynamicModes).toEqual([]);
  });

  it("does not let a nearly-unexplored 100% facet outrank a well-evidenced strong theme", () => {
    const canonical = signals([
      hs("ownership_symbolism", 100, 10, "receiving"),
      hs("service", 75, 100, "giving"),
      hs("devotion", 72),
      hs("obedience", 70, 100, "giving"),
      hs("ritual_significance", 65),
      hs("praise_approval", 65, 100, "receiving"),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.strongestFacetIds[0]).toBe("service_devotion");
    expect(model.summary).toContain("service and devotion");
  });

  it("derives recognizable headspaces without assigning an authority direction", () => {
    const canonical = signals([
      hs("belonging", 92),
      hs("role_embodiment", 90),
      hs("playfulness", 88),
      hs("care_receiving", 90),
      hs("ownership_symbolism", 82, 100, "receiving"),
      hs("praise_approval", 86, 100, "receiving"),
      hs("receiving_control", 75),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.headspaces).toContainEqual(
      expect.objectContaining({ id: "pet", label: "Pet" }),
    );
    expect(
      model.headspaces.every((headspace) => !("direction" in headspace)),
    ).toBe(true);
    expect(model.headspaces.length).toBeLessThanOrEqual(3);
  });

  it("keeps header headspace and dynamic-mode chips aligned with the detailed role section", () => {
    const canonical = signals([
      hs("younger_headspace", 95, 30),
      hs("care_receiving", 95, 30),
      hs("role_embodiment", 95, 30),
      hs("responsibility_transfer", 95, 30),
      hs("playfulness", 95, 30),
      hs("praise_approval", 95, 30, "receiving"),
      hs("devotion", 90),
      hs("belonging", 90),
      hs("service", 90, 100, "giving"),
      hs("ownership_symbolism", 90, 100, "receiving"),
      hs("receiving_control", 90),
      hs("ritual_significance", 90),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );
    const details = buildProfileRoleDetails(canonical);

    expect(details.headspaces[0]?.id).toBe("little");
    expect(model.headspaces.map((trait) => trait.id)).toEqual(
      details.headspaces.slice(0, 3).map((trait) => trait.id),
    );
    expect(model.dynamicModes.map((trait) => trait.id)).toEqual(
      details.dynamicModes.slice(0, 3).map((trait) => trait.id),
    );
  });

  it("derives compact dynamic modes without exposing percentages in the summary sentence", () => {
    const canonical = signals([
      hs("devotion", 92),
      hs("belonging", 90),
      hs("ritual_significance", 85),
      hs("service", 88, 100, "giving"),
      hs("ownership_symbolism", 80),
      hs("role_embodiment", 78),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.dynamicModes.some((mode) => mode.id === "devotion_mode")).toBe(true);
    expect(model.dynamicModes.length).toBeLessThanOrEqual(3);
    expect(model.summary).not.toMatch(/\d+%/);
  });

  it("filters weakly evidenced composed labels instead of overclaiming a role/headspace", () => {
    const canonical = signals([
      hs("ownership_symbolism", 100, 8, "receiving"),
      hs("objectification", 100, 8, "receiving"),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.headspaces).toEqual([]);
    expect(model.dynamicModes).toEqual([]);
  });

  it("writes a submissive-oriented summary from real aggregated facets", () => {
    const canonical = signals([
      ds("receiving_control", 92),
      ds("responsibility_transfer", 88),
      ds("obedience", 84, 100, "giving"),
      ds("giving_control", 20),
      hs("responsibility_holding", 25),
      hs("service", 90, 100, "giving"),
      hs("devotion", 92),
      hs("belonging", 88),
      hs("ownership_symbolism", 85, 100, "receiving"),
      hs("ritual_significance", 80),
      hs("praise_approval", 75, 100, "receiving"),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.orientation.key).toBe("submissive");
    expect(model.orientation.label).toBe("Submissive");
    expect(model.summary).toMatch(/^The profile leans submissive/);
    expect(model.summary).toContain("strongest themes");
    expect(model.summary).not.toMatch(/giving|receiving/i);
  });

  it("keeps a submissive headline when non-power facets are strong on both activity sides", () => {
    const canonical = signals([
      ds("receiving_control", 100),
      ds("responsibility_transfer", 100),
      ds("obedience", 100, 100, "giving"),
      ds("giving_control", 68),
      hs("pain_receiving", 100),
      hs("pain_giving", 100),
      hs("receiving_intensity", 100),
      hs("giving_intensity", 100),
      hs("care_receiving", 90),
      hs("care_giving", 95),
      hs("service", 100, 100, "giving"),
      hs("devotion", 95),
    ]);
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.orientation.label).toBe("Submissive");
    expect(model.summary).toMatch(/^The profile leans submissive/);
    expect(model.summary).not.toMatch(/giving|receiving/i);
  });
});

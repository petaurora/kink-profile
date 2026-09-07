import { describe, expect, it } from "vitest";
import type { SignalId } from "../data/signals";
import { scoreOverallFacets } from "./overallProfileFacets";
import type { CanonicalSignalResult } from "./overallProfileSignals";
import {
  buildProfileHeaderModel,
  deriveProfileOrientation,
} from "./profileHeader";

function signal(
  signalId: SignalId,
  affinity: number,
  coverage = 100,
  quizId = "dominance-submission",
): CanonicalSignalResult {
  return {
    signalId,
    affinity,
    coverage,
    channels: [
      {
        sourceType: "quiz",
        affinity,
        coverage,
        reliability: 0.8,
        effectiveWeight: 0.8 * (coverage / 100),
        contributions: [
          {
            sourceType: "quiz",
            sourceId: quizId,
            signalId,
            affinity,
            coverage,
            sourceEvidenceIds: [`test:${quizId}:${signalId}`],
          },
        ],
      },
    ],
    sourceEvidenceIds: [`test:${quizId}:${signalId}`],
  };
}

describe("M7.3 profile orientation", () => {
  it("stays emerging when D/s authority evidence is too sparse", () => {
    expect(
      deriveProfileOrientation([
        signal("receiving_control", 100, 10),
      ]).key,
    ).toBe("insufficient");
  });

  it("identifies a clear submissive lean from authority-specific D/s evidence", () => {
    const orientation = deriveProfileOrientation([
      signal("receiving_control", 92),
      signal("responsibility_transfer", 88),
      signal("obedience", 82),
      signal("giving_control", 20),
    ]);

    expect(orientation.key).toBe("submissive");
    expect(orientation.submissiveAffinity).toBeGreaterThan(
      orientation.dominantAffinity ?? 0,
    );
  });

  it("identifies a clear dominant lean from negotiated authority evidence", () => {
    expect(
      deriveProfileOrientation([
        signal("receiving_control", 20),
        signal("responsibility_transfer", 25),
        signal("obedience", 20),
        signal("giving_control", 92),
      ]).key,
    ).toBe("dominant");
  });

  it("identifies genuinely strong authority evidence on both sides", () => {
    expect(
      deriveProfileOrientation([
        signal("receiving_control", 88),
        signal("responsibility_transfer", 80),
        signal("obedience", 75),
        signal("giving_control", 84),
      ]).key,
    ).toBe("bidirectional");
  });

  it("does not turn activity direction into authority orientation", () => {
    const orientation = deriveProfileOrientation([
      signal("receiving_control", 100),
      signal("responsibility_transfer", 100),
      signal("obedience", 100),
      signal("giving_control", 68),
      signal("care_giving", 100),
      signal("pain_giving", 100),
      signal("giving_intensity", 100),
      signal("giving_restraint", 100),
      signal("giving_discipline", 100),
      signal("pursuit_giving", 100),
    ]);

    expect(orientation.key).toBe("submissive");
    expect(orientation.label).toBe("Submissive");
  });

  it("does not treat delegated responsibility-holding as dominant authority", () => {
    const orientation = deriveProfileOrientation([
      signal("receiving_control", 95),
      signal("responsibility_transfer", 95),
      signal("obedience", 95),
      signal("giving_control", 35),
      signal("responsibility_holding", 100),
    ]);

    expect(orientation.key).toBe("submissive");
  });

  it("ignores authority-like signals from non-D/s quiz sources", () => {
    const orientation = deriveProfileOrientation([
      signal("giving_control", 100, 100, "roles-headspaces"),
      signal("responsibility_holding", 100, 100, "roles-headspaces"),
    ]);

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
    const canonical = [
      signal("ownership_symbolism", 100, 10),
      signal("service", 75),
      signal("devotion", 72),
      signal("obedience", 70),
      signal("ritual_significance", 65),
      signal("praise_approval", 65),
    ];
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.strongestFacetIds[0]).toBe("service_devotion");
    expect(model.strongestFacetIds).not.toContain("ownership_belonging");
    expect(model.summary).toContain("service and devotion");
  });

  it("derives recognizable headspaces without assigning an authority direction", () => {
    const canonical = [
      signal("belonging", 92),
      signal("role_embodiment", 90),
      signal("playfulness", 88),
      signal("care_receiving", 90),
      signal("ownership_symbolism", 82),
      signal("praise_approval", 86),
      signal("receiving_control", 75),
    ];
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.headspaces[0]).toEqual(
      expect.objectContaining({
        id: "pet",
        label: "Pet",
      }),
    );
    expect(model.headspaces[0]).not.toHaveProperty("direction");
    expect(model.headspaces.length).toBeLessThanOrEqual(3);
  });

  it("derives compact dynamic modes without exposing percentages in the summary sentence", () => {
    const canonical = [
      signal("devotion", 92),
      signal("belonging", 90),
      signal("ritual_significance", 85),
      signal("service", 88),
      signal("ownership_symbolism", 80),
      signal("role_embodiment", 78),
    ];
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.dynamicModes.some((mode) => mode.id === "devotion_mode")).toBe(
      true,
    );
    expect(model.dynamicModes.length).toBeLessThanOrEqual(3);
    expect(model.summary).not.toMatch(/\d+%/);
  });

  it("filters weakly evidenced composed labels instead of overclaiming a role/headspace", () => {
    const canonical = [
      signal("ownership_symbolism", 100, 8),
      signal("objectification", 100, 8),
    ];
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.headspaces).toEqual([]);
    expect(model.dynamicModes).toEqual([]);
  });

  it("writes a receiving-oriented summary from real aggregated facets", () => {
    const canonical = [
      signal("receiving_control", 92),
      signal("responsibility_transfer", 88),
      signal("obedience", 84),
      signal("giving_control", 20),
      signal("responsibility_holding", 25),
      signal("service", 90),
      signal("devotion", 92),
      signal("belonging", 88),
      signal("ownership_symbolism", 85),
      signal("ritual_significance", 80),
      signal("praise_approval", 75),
    ];
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
    const canonical = [
      signal("receiving_control", 100),
      signal("responsibility_transfer", 100),
      signal("obedience", 100),
      signal("giving_control", 68),
      signal("pain_receiving", 100),
      signal("pain_giving", 100),
      signal("receiving_intensity", 100),
      signal("giving_intensity", 100),
      signal("care_receiving", 90),
      signal("care_giving", 95),
      signal("service", 100),
      signal("devotion", 95),
    ];
    const model = buildProfileHeaderModel(
      canonical,
      scoreOverallFacets(canonical),
    );

    expect(model.orientation.label).toBe("Submissive");
    expect(model.summary).toMatch(/^The profile leans submissive/);
    expect(model.summary).not.toMatch(/giving|receiving/i);
  });
});

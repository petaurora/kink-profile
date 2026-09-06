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
): CanonicalSignalResult {
  return {
    signalId,
    affinity,
    coverage,
    channels: [],
    sourceEvidenceIds: [`test:${signalId}`],
  };
}

describe("M7.3 profile orientation", () => {
  it("stays emerging when directional evidence is too sparse", () => {
    const facets = scoreOverallFacets([
      signal("receiving_control", 100, 10),
    ]);

    expect(deriveProfileOrientation(facets).key).toBe("insufficient");
  });

  it("identifies a clear receiving/submissive lean", () => {
    const facets = scoreOverallFacets([
      signal("receiving_control", 92),
      signal("responsibility_transfer", 88),
      signal("obedience", 82),
      signal("giving_control", 20),
      signal("responsibility_holding", 25),
      signal("care_receiving", 90),
      signal("care_giving", 30),
      signal("pursuit_receiving", 85),
      signal("pursuit_giving", 20),
    ]);

    const orientation = deriveProfileOrientation(facets);

    expect(orientation.key).toBe("receiving");
    expect(orientation.receivingAffinity).toBeGreaterThan(
      orientation.givingAffinity ?? 0,
    );
  });

  it("identifies a clear giving/dominant lean", () => {
    const facets = scoreOverallFacets([
      signal("receiving_control", 20),
      signal("responsibility_transfer", 25),
      signal("obedience", 20),
      signal("giving_control", 92),
      signal("responsibility_holding", 88),
      signal("care_receiving", 25),
      signal("care_giving", 90),
      signal("pursuit_receiving", 20),
      signal("pursuit_giving", 85),
    ]);

    expect(deriveProfileOrientation(facets).key).toBe("giving");
  });

  it("identifies genuinely strong bidirectional evidence without forcing a switch identity", () => {
    const facets = scoreOverallFacets([
      signal("receiving_control", 88),
      signal("responsibility_transfer", 80),
      signal("obedience", 75),
      signal("giving_control", 84),
      signal("responsibility_holding", 82),
      signal("care_receiving", 86),
      signal("care_giving", 88),
      signal("pursuit_receiving", 78),
      signal("pursuit_giving", 80),
    ]);

    expect(deriveProfileOrientation(facets).key).toBe("bidirectional");
  });

  it("uses mixed/context-dependent when different facets lean in opposite directions", () => {
    const facets = scoreOverallFacets([
      // Power exchange strongly receiving.
      signal("receiving_control", 95),
      signal("responsibility_transfer", 90),
      signal("obedience", 85),
      signal("giving_control", 15),
      signal("responsibility_holding", 20),
      // Care strongly giving.
      signal("care_receiving", 15),
      signal("care_giving", 95),
      signal("guidance_shaping", 90),
    ]);

    expect(deriveProfileOrientation(facets).key).toBe("mixed");
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

  it("derives recognizable headspaces from canonical signals and preserves their direction", () => {
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
        direction: "receiving",
      }),
    );
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

    expect(model.orientation.key).toBe("receiving");
    expect(model.summary).toMatch(/^Receiving\/submissive energy/);
    expect(model.summary).toContain("strongest themes");
  });
});

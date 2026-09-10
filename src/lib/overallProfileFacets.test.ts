import { describe, expect, it } from "vitest";
import { overallFacetDefinitions } from "../data/overallFacets";
import {
  scoreOverallFacets,
  type OverallFacetResult,
} from "./overallProfileFacets";
import { buildCanonicalSignalFixtures } from "./testCanonicalSignalFixtures";

function facet(
  results: readonly OverallFacetResult[],
  facetId: OverallFacetResult["facetId"],
) {
  const result = results.find((item) => item.facetId === facetId);
  if (!result) throw new Error(`Missing facet ${facetId}`);
  return result;
}

describe("M7.2 overall facet definitions", () => {
  it("locks nine distinct broad facets without adding sensation before the evidence model supports it", () => {
    expect(overallFacetDefinitions.map((item) => item.id)).toEqual([
      "power_exchange",
      "structure_protocol",
      "ownership_belonging",
      "service_devotion",
      "care_nurture",
      "play_resistance",
      "primal_instinctive",
      "restraint_physical_control",
      "intensity_pain",
    ]);
  });

  it("uses only valid positive canonical Signal weights", () => {
    for (const definition of overallFacetDefinitions) {
      expect(definition.signals.length).toBeGreaterThan(0);
      expect(
        new Set(
          definition.signals.map(
            (item) => `${item.signalId}:${item.channel ?? "overall"}`,
          ),
        ).size,
      ).toBe(definition.signals.length);

      for (const signal of definition.signals) {
        expect(signal.weight).toBeGreaterThan(0);
        expect(signal.weight).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("M7.2 overall facet scoring", () => {
  it("returns every facet as unknown when no canonical Signal evidence exists", () => {
    const results = scoreOverallFacets([]);

    expect(results).toHaveLength(9);
    for (const result of results) {
      expect(result.affinity).toBeNull();
      expect(result.coverage).toBe(0);
      expect(result.components).toEqual([]);
    }
  });

  it("does not turn missing component Signals into zero affinity", () => {
    const result = facet(
      scoreOverallFacets(
        buildCanonicalSignalFixtures([
          { signalId: "structure", affinity: 80 },
        ]),
      ),
      "structure_protocol",
    );

    expect(result.affinity).toBe(80);
    const configuredTotal = overallFacetDefinitions
      .find((item) => item.id === "structure_protocol")!
      .signals.reduce((sum, item) => sum + item.weight, 0);
    expect(result.coverage).toBeCloseTo((1 / configuredTotal) * 100, 1);
    expect(result.components.map((item) => item.signalId)).toEqual([
      "structure",
    ]);
  });

  it("keeps strong sparse evidence high-affinity while lowering coverage", () => {
    const result = facet(
      scoreOverallFacets(
        buildCanonicalSignalFixtures([
          { signalId: "ownership_symbolism", affinity: 100, coverage: 25 },
        ]),
      ),
      "ownership_belonging",
    );

    expect(result.affinity).toBe(100);
    const configuredTotal = overallFacetDefinitions
      .find((item) => item.id === "ownership_belonging")!
      .signals.reduce((sum, item) => sum + item.weight, 0);
    expect(result.coverage).toBeCloseTo((0.25 / configuredTotal) * 100, 1);
  });

  it("weights affinity by both semantic composition weight and canonical evidence coverage", () => {
    const result = facet(
      scoreOverallFacets(
        buildCanonicalSignalFixtures([
          { signalId: "service", affinity: 100, coverage: 100 },
          { signalId: "devotion", affinity: 0, coverage: 50 },
        ]),
      ),
      "service_devotion",
    );

    // service contributes effective weight 1.0; devotion contributes 0.5.
    expect(result.affinity).toBe(66.7);
    const configuredTotal = overallFacetDefinitions
      .find((item) => item.id === "service_devotion")!
      .signals.reduce((sum, item) => sum + item.weight, 0);
    expect(result.coverage).toBeCloseTo((1.5 / configuredTotal) * 100, 1);
  });

  it("rolls receiving and giving evidence into the same broad canonical theme", () => {
    const result = facet(
      scoreOverallFacets(
        buildCanonicalSignalFixtures([
          { signalId: "care_receiving", affinity: 95 },
          { signalId: "care_giving", affinity: 65 },
        ]),
      ),
      "care_nurture",
    );

    expect(result.affinity).toBe(80);
    expect(result.components).toHaveLength(1);
    expect(result.components[0]).toEqual(
      expect.objectContaining({
        signalId: "care",
        signalChannel: "overall",
      }),
    );
    expect(result.components[0]?.relationship).toBe("supports");
  });

  it("lets opposing Signals reduce a known theme without treating their absence as positive evidence", () => {
    const definition = {
      id: "power_exchange" as const,
      label: "Power Exchange",
      shortLabel: "Power",
      description: "Test theme",
      signals: [
        { signalId: "control" as const, weight: 1 },
        {
          signalId: "autonomy" as const,
          weight: 0.5,
          relationship: "opposes" as const,
        },
      ],
    };

    const opposed = scoreOverallFacets(
      buildCanonicalSignalFixtures([
        { signalId: "receiving_control", affinity: 80 },
        { signalId: "autonomy", affinity: 100 },
      ]),
      [definition],
    )[0];
    expect(opposed.affinity).toBe(30);

    const noOpposition = scoreOverallFacets(
      buildCanonicalSignalFixtures([
        { signalId: "receiving_control", affinity: 80 },
        { signalId: "autonomy", affinity: 0 },
      ]),
      [definition],
    )[0];
    expect(noOpposition.affinity).toBe(80);
  });

  it("retains source provenance from every canonical Signal used by the facet", () => {
    const result = facet(
      scoreOverallFacets(
        buildCanonicalSignalFixtures([
          {
            signalId: "primal_embodiment",
            affinity: 90,
            coverage: 80,
            sourceEvidenceIds: ["quiz:roles-headspaces:primal_embodiment"],
          },
          {
            signalId: "pursuit_receiving",
            affinity: 80,
            coverage: 60,
            sourceEvidenceIds: [
              "catalog-explicit:chase:receiving",
              "catalog-pairwise:cmp-7",
            ],
          },
        ]),
      ),
      "primal_instinctive",
    );

    expect(result.sourceEvidenceIds).toEqual([
      "catalog-explicit:chase:receiving",
      "catalog-pairwise:cmp-7",
      "quiz:roles-headspaces:primal_embodiment",
    ]);
    expect(result.components).toHaveLength(2);
  });

  it("allows low affinity to be a known result rather than treating zero as unexplored", () => {
    const result = facet(
      scoreOverallFacets(
        buildCanonicalSignalFixtures([
          { signalId: "pain_receiving", affinity: 0, coverage: 100 },
          { signalId: "pain_giving", affinity: 0, coverage: 100 },
        ]),
      ),
      "intensity_pain",
    );

    expect(result.affinity).toBe(0);
    expect(result.coverage).toBeGreaterThan(0);
  });
});

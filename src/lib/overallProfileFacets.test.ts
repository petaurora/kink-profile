import { describe, expect, it } from "vitest";
import { overallFacetDefinitions } from "../data/overallFacets";
import type { SignalId } from "../data/signals";
import {
  scoreOverallFacets,
  type OverallFacetResult,
} from "./overallProfileFacets";
import type { CanonicalSignalResult } from "./overallProfileSignals";

function canonicalSignal(
  signalId: SignalId,
  affinity: number,
  coverage = 100,
  sourceEvidenceIds: readonly string[] = [`test:${signalId}`],
): CanonicalSignalResult {
  return {
    signalId,
    affinity,
    coverage,
    channels: [],
    sourceEvidenceIds,
  };
}

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

  it("uses only valid positive primitive-signal weights", () => {
    for (const definition of overallFacetDefinitions) {
      expect(definition.signals.length).toBeGreaterThan(0);
      expect(new Set(definition.signals.map((item) => item.signalId)).size).toBe(
        definition.signals.length,
      );

      for (const signal of definition.signals) {
        expect(signal.weight).toBeGreaterThan(0);
        expect(signal.weight).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("M7.2 overall facet scoring", () => {
  it("returns every facet as unknown when no canonical signal evidence exists", () => {
    const results = scoreOverallFacets([]);

    expect(results).toHaveLength(9);
    for (const result of results) {
      expect(result.affinity).toBeNull();
      expect(result.coverage).toBe(0);
      expect(result.components).toEqual([]);
    }
  });

  it("does not turn missing component signals into zero affinity", () => {
    const result = facet(
      scoreOverallFacets([canonicalSignal("structure", 80)]),
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
      scoreOverallFacets([
        canonicalSignal("ownership_symbolism", 100, 25),
      ]),
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
      scoreOverallFacets([
        canonicalSignal("service", 100, 100),
        canonicalSignal("devotion", 0, 50),
      ]),
      "service_devotion",
    );

    // service contributes effective weight 1.0; devotion contributes 0.5.
    expect(result.affinity).toBe(66.7);
    const configuredTotal = overallFacetDefinitions
      .find((item) => item.id === "service_devotion")!
      .signals.reduce((sum, item) => sum + item.weight, 0);
    expect(result.coverage).toBeCloseTo((1.5 / configuredTotal) * 100, 1);
  });

  it("keeps giving and receiving Signals inside the same broad theme", () => {
    const result = facet(
      scoreOverallFacets([
        canonicalSignal("care_receiving", 95),
        canonicalSignal("care_giving", 65),
      ]),
      "care_nurture",
    );

    expect(result.affinity).toBe(80);
    expect(result.components.map((component) => component.signalId)).toEqual(
      expect.arrayContaining(["care_receiving", "care_giving"]),
    );
    expect(
      result.components.every(
        (component) => component.relationship === "supports",
      ),
    ).toBe(true);
  });

  it("lets opposing Signals reduce a known theme without treating their absence as positive evidence", () => {
    const definition = {
      id: "power_exchange" as const,
      label: "Power Exchange",
      shortLabel: "Power",
      description: "Test theme",
      signals: [
        { signalId: "receiving_control" as const, weight: 1 },
        {
          signalId: "autonomy" as const,
          weight: 0.5,
          relationship: "opposes" as const,
        },
      ],
    };

    const opposed = scoreOverallFacets(
      [
        canonicalSignal("receiving_control", 80),
        canonicalSignal("autonomy", 100),
      ],
      [definition],
    )[0];
    expect(opposed.affinity).toBe(30);

    const noOpposition = scoreOverallFacets(
      [
        canonicalSignal("receiving_control", 80),
        canonicalSignal("autonomy", 0),
      ],
      [definition],
    )[0];
    expect(noOpposition.affinity).toBe(80);
  });

  it("retains source provenance from every canonical signal used by the facet", () => {
    const result = facet(
      scoreOverallFacets([
        canonicalSignal("primal_embodiment", 90, 80, [
          "quiz:roles-headspaces:primal_embodiment",
        ]),
        canonicalSignal("pursuit_receiving", 80, 60, [
          "catalog-explicit:chase:receiving",
          "catalog-pairwise:cmp-7",
        ]),
      ]),
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
      scoreOverallFacets([
        canonicalSignal("pain_receiving", 0, 100),
        canonicalSignal("pain_giving", 0, 100),
      ]),
      "intensity_pain",
    );

    expect(result.affinity).toBe(0);
    expect(result.coverage).toBeGreaterThan(0);
  });
});

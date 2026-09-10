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
    expect(result.coverage).toBe(22.2);
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
    expect(result.coverage).toBe(10.6);
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
    // total configured facet weight is 3.15.
    expect(result.coverage).toBe(47.6);
  });

  it("keeps delegated responsibility neutral in the power-exchange side breakdown", () => {
    const result = facet(
      scoreOverallFacets([
        canonicalSignal("receiving_control", 90),
        canonicalSignal("responsibility_transfer", 80),
        canonicalSignal("obedience", 70),
        canonicalSignal("giving_control", 20),
        canonicalSignal("responsibility_holding", 30),
      ]),
      "power_exchange",
    );

    expect(result.affinity).toBe(57.8);
    expect(result.coverage).toBe(100);
    expect(result.direction?.receiving.affinity).toBe(81.4);
    expect(result.direction?.receiving.coverage).toBe(100);
    expect(result.direction?.giving.affinity).toBe(20);
    expect(result.direction?.giving.coverage).toBe(100);
  });

  it("keeps directional metadata unknown on only the unexplored side", () => {
    const result = facet(
      scoreOverallFacets([
        canonicalSignal("care_receiving", 95),
      ]),
      "care_nurture",
    );

    expect(result.direction?.receiving.affinity).toBe(95);
    expect(result.direction?.receiving.coverage).toBe(100);
    expect(result.direction?.giving.affinity).toBeNull();
    expect(result.direction?.giving.coverage).toBe(0);
  });

  it("does not invent directional metadata for facets whose semantics are shared/non-directional", () => {
    const result = facet(
      scoreOverallFacets([
        canonicalSignal("structure", 80),
        canonicalSignal("receiving_discipline", 90),
        canonicalSignal("giving_discipline", 60),
      ]),
      "structure_protocol",
    );

    expect(result.direction).toBeUndefined();
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
